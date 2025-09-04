import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase"; // Asegúrate de que 'db' esté correctamente configurado

type Admin = { mail: string };

interface ComplejoRaw {
    id_admin: number;
    id_complejo: number;
    nombre_complejo: string;
    direccion: string;
    telefono: string;
    administrador: Admin[]; // llega como array
}

interface Complejo {
    id_admin: number;
    id_complejo: number;
    nombre_complejo: string;
    direccion: string;
    telefono: string;
    administrador: Admin | null; // lo usamos aplanado
}

interface ReservaEquipo {
    es_creador: boolean;
    equipo: {
        id_equipo: number;
        nombre_equipo: string;
    };
    reserva: {
        id: number;
        fecha: string;
        horas: string[];
        estado: string;
        is_active: boolean;
        id_cancha: number;
        id_complejo: number;
    };
}

const toOne = <T>(x: T | T[] | null | undefined): T | null =>
    Array.isArray(x) ? x[0] ?? null : x ?? null;

// Zona horaria base (Perú no tiene DST)
const TZ = "America/Lima";
const PERU_OFFSET = "-05:00";

function getNextHourCutoffLima(): Date {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: TZ,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    })
        .formatToParts(now)
        .reduce<Record<string, string>>((acc, p) => {
            if (p.type !== "literal") acc[p.type] = p.value;
            return acc;
        }, {});
    const ymd = `${parts.year}-${parts.month}-${parts.day}`;
    // base en la hora actual (00 minutos), con offset de Perú
    const base = new Date(`${ymd}T${parts.hour}:00:00${PERU_OFFSET}`);
    // si hay minutos > 0, saltamos a la siguiente hora
    if (parseInt(parts.minute, 10) > 0)
        base.setUTCHours(base.getUTCHours() + 1);
    return base;
}

function getReservaStartUTC(
    fecha: string,
    horas: string[] | null | undefined
): Date | null {
    if (!fecha || !horas?.length) return null;
    const h0 = parseInt(horas[0], 10);
    if (Number.isNaN(h0)) return null;
    const iso = `${fecha}T${String(h0).padStart(2, "0")}:00:00${PERU_OFFSET}`;
    return new Date(iso); // objeto Date en UTC
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Falta el parámetro 'id'" },
            { status: 400 }
        );
    }

    const jugadorId = parseInt(id);

    try {
        // 1) Equipos donde el jugador es el capitán
        const { data: equiposData, error: equiposError } = await db
            .from("equipo")
            .select("id_equipo, nombre_equipo")
            .eq("capitan", jugadorId); // importante: sin array

        if (equiposError) {
            return NextResponse.json(
                { error: equiposError.message },
                { status: 500 }
            );
        }

        const id_equipos = (equiposData ?? []).map((e) => e.id_equipo);
        if (!id_equipos.length) {
            return NextResponse.json([]);
        }

        // 2) Reservas de esos equipos donde el equipo ES CREADOR y la reserva está ACTIVA
        const { data: reservaEquipos, error: reservasError } = (await db
            .from("reserva_equipo")
            .select(
                `
          es_creador,
          equipo ( id_equipo, nombre_equipo ),
          reserva:reservas (
            id,
            fecha,
            horas,
            is_active,
            id_cancha,
            id_complejo
          )
        `
            )
            .in("id_equipo", id_equipos)
            .eq("es_creador", true) // solo reservas creadas por tu equipo
            .eq("reservas.is_active", true)) as {
            // filtra en BD por reservas activas
            data: ReservaEquipo[] | null;
            error: any;
        };

        if (reservasError) {
            return NextResponse.json(
                { error: reservasError.message },
                { status: 500 }
            );
        }

        if (!reservaEquipos?.length) {
            return NextResponse.json([]);
        }

        // 2.b) Tomar ids de reserva (ya activas por filtro anterior)
        const reservaIds = [
            ...new Set(
                (reservaEquipos ?? [])
                    .map((r) => r.reserva?.id)
                    .filter((x): x is number => typeof x === "number")
            ),
        ];

        if (!reservaIds.length) {
            return NextResponse.json([]);
        }

        // 2.c) Traer TODAS las filas de reserva_equipo para esos ids y contar
        const { data: reTodos, error: reTodosError } = await db
            .from("reserva_equipo")
            .select("id_reserva")
            .in("id_reserva", reservaIds);

        if (reTodosError) {
            return NextResponse.json(
                { error: reTodosError.message },
                { status: 500 }
            );
        }

        // Conteo por id_reserva
        const counts = new Map<number, number>();
        for (const row of reTodos ?? []) {
            const rid = row.id_reserva as number;
            counts.set(rid, (counts.get(rid) ?? 0) + 1);
        }

        // Conjunto de reservas abiertas (sin rival): exactamente 1 fila en reserva_equipo
        const abiertas = new Set(
            Array.from(counts.entries())
                .filter(([, c]) => c === 1)
                .map(([rid]) => rid)
        );

        // 2.d) Filtrar en memoria: activas + sin rival
        const reservaEquiposFiltradas = (reservaEquipos ?? []).filter(
            (r) =>
                r.reserva?.is_active === true &&
                r.reserva?.id &&
                abiertas.has(r.reserva.id)
        );

        // ⬇️ NUEVO: filtrar por “empiezan desde la próxima hora (Perú)”
        const cutoff = getNextHourCutoffLima();
        const reservaEquiposDesdeProximaHora = reservaEquiposFiltradas.filter(
            (r) => {
                const start = getReservaStartUTC(
                    r.reserva?.fecha as string,
                    r.reserva?.horas as string[]
                );
                return !!start && start.getTime() >= cutoff.getTime();
            }
        );

        if (!reservaEquiposDesdeProximaHora.length) {
            return NextResponse.json([]);
        }

        // 3) Obtener información de complejo y cancha, solo para las reservas filtradas
        const id_complejos = [
            ...new Set(
                reservaEquiposFiltradas
                    .map((r) => r.reserva?.id_complejo)
                    .filter((x): x is number => typeof x === "number")
            ),
        ];

        const id_canchas = [
            ...new Set(
                reservaEquiposFiltradas
                    .map((r) => r.reserva?.id_cancha)
                    .filter((x): x is number => typeof x === "number")
            ),
        ];

        // Complejos
        let complejoData: Complejo[] = [];
        if (id_complejos.length) {
            const { data, error } = await db
                .from("complejo")
                .select(
                    `
            id_admin,
            id_complejo,
            nombre_complejo,
            direccion,
            telefono,
            administrador:administrador ( mail )
          `
                )
                .in("id_complejo", id_complejos);

            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }

            const raw = (data ?? []) as unknown as ComplejoRaw[];

            // aplanar administrador[] -> administrador | null
            complejoData = raw.map((c) => ({
                ...c,
                administrador: toOne(c.administrador),
            }));
        }

        // Canchas
        let canchaData: { id_cancha: number; nombre_cancha: string }[] = [];
        if (id_canchas.length) {
            const { data, error } = await db
                .from("cancha")
                .select("id_cancha, nombre_cancha")
                .in("id_cancha", id_canchas);
            if (error) {
                return NextResponse.json(
                    { error: error.message },
                    { status: 500 }
                );
            }
            canchaData = data ?? [];
        }

        // 4) Formatear respuesta solo con reservas activas, sin rival y desde la próxima hora
        const reservasEnriquecidas = reservaEquiposDesdeProximaHora.map(
            (res) => {
                const r = res.reserva;
                const complejo = complejoData.find(
                    (c) => c.id_complejo === r?.id_complejo
                );
                const cancha = canchaData.find(
                    (c) => c.id_cancha === r?.id_cancha
                );
                return {
                    id_reserva: r?.id,
                    fecha: r?.fecha,
                    horas: r?.horas,
                    is_active: r?.is_active,
                    nombre_equipo: res.equipo?.nombre_equipo ?? "Sin equipo",
                    id_equipo: res.equipo?.id_equipo,
                    id_admin: complejo?.id_admin ?? null,
                    mail_admin: complejo?.administrador?.mail ?? null,
                    nombre_complejo: complejo?.nombre_complejo ?? "",
                    direccion_complejo: complejo?.direccion ?? "",
                    telefono_complejo: complejo?.telefono ?? "",
                    nombre_cancha: cancha?.nombre_cancha ?? "",
                    es_creador: res.es_creador,
                };
            }
        );

        return NextResponse.json(reservasEnriquecidas);
    } catch (err) {
        console.error("Error al obtener reservas activas sin rival:", err);
        return NextResponse.json(
            { error: "Error al obtener las reservas" },
            { status: 500 }
        );
    }
}
