import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

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
        // 1. Equipos donde el jugador participa
        const { data: equiposData, error: equiposError } = await db
            .from("equipo")
            .select("id_equipo, nombre_equipo")
            .contains("id_jugadores", [jugadorId]);

        if (equiposError) throw equiposError;

        const id_equipos = equiposData.map((e) => e.id_equipo);

        // Guard por si el jugador no pertenece a equipos
        if (!id_equipos.length) {
            return NextResponse.json([]);
        }

        /** 2A) Reservas donde participa el jugador (con datos de complejo/cancha) */
        const { data: reJugador, error: reJugadorError } = await db
            .from("reserva_equipo")
            .select(
                `
                id_reserva,
                es_creador,
                equipo:equipo ( id_equipo, nombre_equipo ),
                reservas:reservas (
                id,
                fecha,
                horas,
                is_active,
                id_cancha,
                id_complejo,
                complejo:complejo (
                    id_admin,
                    id_complejo,
                    nombre_complejo,
                    direccion,
                    telefono,
                    administrador:administrador ( mail )
                ),
                cancha:cancha (
                    id_cancha,
                    nombre_cancha
                )
                )
                `
            )
            .in("id_equipo", id_equipos);

        if (reJugadorError) throw reJugadorError;

        const toOne = <T>(x: T | T[] | null | undefined): T | null =>
            Array.isArray(x) ? x[0] ?? null : x ?? null;

        const reservaIds = [
            ...new Set(
                (reJugador ?? [])
                    .map((r) => toOne(r.reservas)?.id)
                    .filter((id): id is number => typeof id === "number")
            ),
        ];

        if (!reservaIds.length) return NextResponse.json([]);

        /** 2B) Todos los equipos por cada reserva (para hallar creador/invitado) */
        const { data: reTodos, error: reTodosError } = await db
            .from("reserva_equipo")
            .select(
                `
                    id_reserva,
                    es_creador,
                    equipo:equipo ( id_equipo, nombre_equipo )
                `
            )
            .in("id_reserva", reservaIds);

        if (reTodosError) throw reTodosError;

        /** 3) Indexar equipos por id_reserva */
        const equiposPorReserva = new Map<
            number,
            { creador?: any; invitado?: any }
        >();

        for (const row of reTodos ?? []) {
            const bucket = equiposPorReserva.get(row.id_reserva) || {};
            if (row.es_creador) bucket.creador = row.equipo;
            else bucket.invitado = row.equipo; // si no hay invitado, quedará undefined
            equiposPorReserva.set(row.id_reserva, bucket);
        }

        /** 4) Armar respuesta final */
        const reservasEnriquecidas = (reJugador ?? []).map((re) => {
            const res = toOne(re.reservas);
            if (!res) return null; // seguridad por si viniera vacío

            const complejo = toOne(res.complejo);
            const cancha = toOne(res.cancha);

            const equipos = equiposPorReserva.get(res.id) || {};

            return {
                // campos solicitados
                id: res.id,
                id_admin: complejo?.id_admin ?? null,
                direccion_complejo: complejo?.direccion ?? "",
                fecha: res.fecha,
                horas: res.horas,
                is_active: res.is_active,
                mail_admin: complejo?.administrador?.mail ?? null,
                nombre_cancha: cancha?.nombre_cancha ?? "",
                nombre_complejo: complejo?.nombre_complejo ?? "",
                telefono_complejo: complejo?.telefono ?? "",

                // equipos
                equipoCreador: equipos.creador ?? null,
                equipoInvitado: equipos.invitado ?? null,
            };
        });

        return NextResponse.json(reservasEnriquecidas);
    } catch (err) {
        console.error("Error al obtener reservas hechas:", err);
        return NextResponse.json(
            { error: "Error al obtener las reservas hechas" },
            { status: 500 }
        );
    }
}
