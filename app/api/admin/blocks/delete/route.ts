// app/api/admin/blocks/delete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

const toISO = (d: Date) => d.toISOString().slice(0, 10);
const subtract = (a: string[], b: string[]) =>
    a.filter((x) => !new Set(b).has(x));

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

export async function POST(req: NextRequest) {
    try {
        const q = req.nextUrl.searchParams;
        const body = (await req.json().catch(() => ({}))) as any;

        const canchaIds: number[] =
            body.canchaIds ?? q.getAll("canchaIds").map(Number);
        const dateFrom: string = body.dateFrom ?? q.get("dateFrom") ?? "";
        const dateTo: string = body.dateTo ?? q.get("dateTo") ?? "";
        const timeStart: string = body.timeStart ?? q.get("timeStart") ?? "";
        const timeEnd: string = body.timeEnd ?? q.get("timeEnd") ?? "";
        const daysOfWeek: number[] =
            body.daysOfWeek ??
            q.get("daysOfWeek")?.split(",").map(Number) ??
            [];

        if (
            !canchaIds?.length ||
            !dateFrom ||
            !dateTo ||
            !timeStart ||
            !timeEnd ||
            !daysOfWeek?.length
        ) {
            return NextResponse.json(
                { message: "Parámetros incompletos" },
                { status: 400 }
            );
        }

        const horasToRemove = hoursRange(timeStart, timeEnd);
        const start = new Date(`${dateFrom}T00:00:00`);
        const end = new Date(`${dateTo}T00:00:00`);
        if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
            return NextResponse.json(
                { message: "Rango de fechas inválido" },
                { status: 400 }
            );
        }

        const results: any[] = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dow = d.getDay();
            if (!daysOfWeek.includes(dow)) continue;
            const fecha = toISO(d);

            for (const id_cancha of canchaIds) {
                // Trae SOLO filas de bloqueo (sin equipos)
                const { data: blocks, error } = await db
                    .from("reservas")
                    .select("id, horas, reserva_equipo(id)")
                    .eq("id_cancha", id_cancha)
                    .eq("fecha", fecha);

                if (error) continue;

                const blockRows = (blocks ?? []).filter(
                    (r) => !(r as any).reserva_equipo?.length
                );
                let removed = 0,
                    deleted = 0;

                for (const br of blockRows as any[]) {
                    const remaining = subtract(br.horas ?? [], horasToRemove);
                    const toRemoveCount =
                        (br.horas ?? []).length - remaining.length;
                    if (toRemoveCount <= 0) continue;

                    removed += toRemoveCount;

                    if (remaining.length === 0) {
                        await db.from("reservas").delete().eq("id", br.id);
                        deleted += 1;
                    } else {
                        await db
                            .from("reservas")
                            .update({ horas: remaining })
                            .eq("id", br.id);
                    }
                }

                results.push({ id_cancha, fecha, removed, deleted });
            }
        }

        return NextResponse.json({ ok: true, results });
    } catch (e: any) {
        return NextResponse.json(
            { message: e.message || "Error inesperado" },
            { status: 500 }
        );
    }
}
