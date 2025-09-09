// app/api/admin/blocks/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

function hoursRange(start: string, end: string): string[] {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    if ((sm ?? 0) !== 0 || (em ?? 0) !== 0)
        throw new Error("Usa horas en punto (HH:00)");
    if (!Number.isFinite(sh) || !Number.isFinite(eh) || eh <= sh)
        throw new Error("Rango horario inválido");
    const out: string[] = [];
    for (let h = sh; h < eh; h++) out.push(String(h).padStart(2, "0")); // <-- "HH"
    return out;
}

const toISO = (d: Date) => d.toISOString().slice(0, 10);
const union2 = (a: string[], b: string[]) =>
    Array.from(new Set([...(a ?? []), ...(b ?? [])])).sort();
const subtract = (a: string[], b: string[]) => {
    const setB = new Set(b ?? []);
    return (a ?? []).filter((x) => !setB.has(x));
};

type BlocksBody = {
    canchaIds: Array<number | string>;
    dateFrom: string; // "YYYY-MM-DD"
    dateTo: string; // "YYYY-MM-DD"
    timeStart: string; // "HH:MM" (en punto)
    timeEnd: string; // "HH:MM" (en punto)
    daysOfWeek: Array<number | string>; // 0=Dom ... 6=Sáb
    allowConflicts?: boolean | "true" | "false";
};

export async function POST(req: NextRequest) {
    try {
        const raw = (await req.json()) as Partial<BlocksBody>;
        console.log("[blocks] raw body:", raw);

        // Normalizaciones
        const canchaIds = Array.isArray(raw.canchaIds)
            ? raw.canchaIds
                  .map((x) => Number(x))
                  .filter((n) => Number.isFinite(n))
            : [];
        const dateFrom = raw.dateFrom ?? "";
        const dateTo = raw.dateTo ?? "";
        const timeStart = raw.timeStart ?? "";
        const timeEnd = raw.timeEnd ?? "";
        const daysOfWeek = Array.isArray(raw.daysOfWeek)
            ? raw.daysOfWeek
                  .map((x) => Number(x))
                  .filter((n) => Number.isFinite(n))
            : [];
        const allowConflicts =
            raw.allowConflicts === true || raw.allowConflicts === "true";

        console.log("[blocks] normalized:", {
            canchaIds,
            dateFrom,
            dateTo,
            timeStart,
            timeEnd,
            daysOfWeek,
            allowConflicts,
        });

        if (
            canchaIds.length === 0 ||
            !dateFrom ||
            !dateTo ||
            !timeStart ||
            !timeEnd ||
            daysOfWeek.length === 0
        ) {
            console.warn("[blocks] Parámetros incompletos");
            return NextResponse.json(
                { message: "Parámetros incompletos" },
                { status: 400 }
            );
        }

        const horas = hoursRange(timeStart, timeEnd);
        console.log("[blocks] horas a bloquear:", horas);

        const start = new Date(`${dateFrom}T00:00:00`);
        const end = new Date(`${dateTo}T00:00:00`);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            console.warn("[blocks] Rango de fechas inválido", { start, end });
            return NextResponse.json(
                { message: "Rango de fechas inválido" },
                { status: 400 }
            );
        }

        // Fechas del rango + filtro por días de semana
        const allDates: string[] = [];
        const matchedDates: string[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const iso = toISO(d);
            allDates.push(iso);
            const dow = d.getDay(); // 0..6 (Dom..Sáb)
            if (daysOfWeek.includes(dow)) matchedDates.push(iso);
        }
        console.log("[blocks] fechas en rango:", allDates.length, allDates);
        console.log(
            "[blocks] fechas que coinciden con daysOfWeek:",
            matchedDates.length,
            matchedDates
        );
        if (matchedDates.length === 0) {
            console.warn(
                "[blocks] Ninguna fecha del rango coincide con daysOfWeek. 'results' quedará vacío."
            );
        }

        // Trae id_complejo de las canchas
        const { data: canchas, error: canchasErr } = await db
            .from("cancha")
            .select("id_cancha,id_complejo")
            .in("id_cancha", canchaIds);

        if (canchasErr || !canchas?.length) {
            console.warn("[blocks] No se encontraron canchas", canchasErr);
            return NextResponse.json(
                { message: "No se encontraron canchas" },
                { status: 404 }
            );
        }

        const complejoByCancha = new Map<number, number>(
            canchas.map((c) => [Number(c.id_cancha), Number(c.id_complejo)])
        );
        console.log("[blocks] complejoByCancha size:", complejoByCancha.size);

        const results: any[] = [];

        for (const fecha of matchedDates) {
            for (const id_cancha of canchaIds) {
                const id_complejo = complejoByCancha.get(Number(id_cancha));
                if (!id_complejo) {
                    console.warn(
                        `[blocks] cancha ${id_cancha} sin id_complejo. Se omite.`
                    );
                    continue;
                }

                // Trae TODAS las filas de reservas de ese día/cancha
                const { data: rows, error: exErr } = await db
                    .from("reservas")
                    .select("id, horas, reserva_equipo(id)")
                    .eq("id_cancha", id_cancha)
                    .eq("fecha", fecha);

                if (exErr) {
                    console.error(
                        `[blocks] Error consultando reservas (cancha=${id_cancha}, fecha=${fecha}):`,
                        exErr
                    );
                    continue;
                }

                const teamRows = (rows ?? []).filter(
                    (r: any) =>
                        Array.isArray(r?.reserva_equipo) &&
                        r.reserva_equipo.length > 0
                );
                const blockRows = (rows ?? []).filter(
                    (r: any) =>
                        !Array.isArray(r?.reserva_equipo) ||
                        r.reserva_equipo.length === 0
                );

                console.log(
                    `[blocks] ${fecha} cancha ${id_cancha}: rows=${
                        rows?.length ?? 0
                    }, teamRows=${teamRows.length}, blockRows=${
                        blockRows.length
                    }`
                );

                // Horas ya tomadas por equipos (para conflictos)
                const teamTaken = Array.from(
                    new Set(
                        teamRows.flatMap(
                            (r: any) => (r?.horas ?? []) as string[]
                        )
                    )
                ).sort();

                const conflicts = horas.filter((h) => teamTaken.includes(h));
                const toBlock = allowConflicts
                    ? horas
                    : subtract(horas, conflicts);

                console.log(
                    `[blocks] ${fecha} cancha ${id_cancha}: allowConflicts=${allowConflicts} teamTaken=${teamTaken} conflicts=${conflicts} toBlock=${toBlock}`
                );

                if (toBlock.length === 0) {
                    results.push({
                        id_cancha,
                        fecha,
                        created: 0,
                        merged: 0,
                        conflicts,
                    });
                    continue;
                }

                // Usamos UNA fila "bloqueo admin" por (cancha, fecha) = fila sin reserva_equipo
                const existingBlock = (blockRows[0] as any) || undefined;

                if (existingBlock) {
                    const newHoras = union2(existingBlock.horas ?? [], toBlock);
                    await db
                        .from("reservas")
                        .update({ horas: newHoras })
                        .eq("id", existingBlock.id);
                    console.log(
                        `[blocks] ${fecha} cancha ${id_cancha}: update bloqueo -> horas=${newHoras}`
                    );
                    results.push({
                        id_cancha,
                        fecha,
                        created: 0,
                        merged: toBlock.length,
                        conflicts,
                    });
                } else {
                    await db.from("reservas").insert({
                        id_equipo: null, // la distinción real será "sin reserva_equipo"
                        id_complejo,
                        id_cancha,
                        fecha,
                        horas: toBlock,
                        is_active: true,
                    });
                    console.log(
                        `[blocks] ${fecha} cancha ${id_cancha}: insert bloqueo -> horas=${toBlock}`
                    );
                    results.push({
                        id_cancha,
                        fecha,
                        created: toBlock.length,
                        merged: 0,
                        conflicts,
                    });
                }
            }
        }

        console.log("[blocks] results len:", results.length);
        return NextResponse.json({ ok: true, results });
    } catch (e: any) {
        console.error("[blocks] Error inesperado:", e);
        return NextResponse.json(
            { message: e.message || "Error inesperado" },
            { status: 500 }
        );
    }
}
