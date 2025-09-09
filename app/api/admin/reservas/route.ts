import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    const id_admin = req.nextUrl.searchParams.get("id_admin");
    const id_cancha = req.nextUrl.searchParams.get("id_cancha");

    if (!id_admin) {
        return NextResponse.json({ error: "Falta id_admin" }, { status: 400 });
    }

    const { data: complejo, error: complejoError } = await db
        .from("complejo")
        .select("*")
        .eq("id_admin", id_admin)
        .single();

    if (complejoError || !complejo) {
        return NextResponse.json(
            { error: "No se encontró el complejo del administrador" },
            { status: 404 }
        );
    }

    let reservasQuery = db
        .from("reservas")
        .select(
            `
        id,
        is_active,
        fecha,
        horas, 
        id_complejo,
        id_cancha,
        reserva_equipo (
            es_creador,
            equipo (
                id_equipo,
                nombre_equipo,
                capitan,
                jugador:capitan (
                    nombre,
                    telefono
                )
            )
        )
    `
        )
        .eq("id_complejo", complejo.id_complejo);

    if (id_cancha) {
        reservasQuery = reservasQuery.eq("id_cancha", id_cancha);
    }

    const { data: reservas, error: reservasError } = await reservasQuery;

    if (reservasError) {
        console.error("Error cargando reservas:", reservasError);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }

    // key: cancha-fecha-hora  -> evitamos duplicados (si hay bloqueos forzados)
    const bySlot = new Map<string, any>();

    for (const res of reservas as any[]) {
        const isBlock =
            !Array.isArray(res.reserva_equipo) ||
            res.reserva_equipo.length === 0;
        const creador = !isBlock
            ? res.reserva_equipo.find((e: any) => e.es_creador)
            : null;

        for (const hora of (res.horas ?? []) as string[]) {
            const start = `${res.fecha}T${hora}:00:00`;
            const endHour = String(parseInt(hora, 10) + 1).padStart(2, "0");
            const end = `${res.fecha}T${endHour}:00:00`;

            const key = `${res.id_cancha}__${res.fecha}__${hora}`;

            const event = {
                id: res.id,
                title: isBlock
                    ? "Bloqueo (Admin)"
                    : creador?.equipo?.nombre_equipo ?? "Sin nombre",
                start,
                end,
                id_equipo: isBlock ? null : creador?.equipo?.id_equipo,
                is_active: res.is_active,
                capitan: isBlock
                    ? ""
                    : creador?.equipo?.jugador?.nombre ?? "Sin nombre",
                telefono: isBlock
                    ? ""
                    : creador?.equipo?.jugador?.telefono ?? "Sin número",
                estado: isBlock ? "Bloqueado" : res.estado, // res.estado puede no existir; no es crítico
                is_block: isBlock, // <- BANDERA PARA EL FRONT
            };

            // Si ya existe algo en ese slot, prioriza reserva de equipo sobre bloqueo
            if (bySlot.has(key)) {
                const existing = bySlot.get(key);
                if (existing.is_block && !event.is_block) {
                    bySlot.set(key, event); // equipo reemplaza bloqueo
                }
            } else {
                bySlot.set(key, event);
            }
        }
    }

    const eventos = Array.from(bySlot.values());
    return NextResponse.json(eventos);
}
