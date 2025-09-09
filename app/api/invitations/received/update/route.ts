import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase"; // tu server client

export async function POST(req: NextRequest) {
    try {
        const { invitacion_id, action } = await req.json();

        if (!invitacion_id || !["accept", "reject"].includes(action)) {
            return NextResponse.json(
                { message: "Parámetros inválidos." },
                { status: 400 }
            );
        }

        // 1) Obtener la invitación para conocer ids
        const { data: invitacion, error: invErr } = await db
            .from("invitaciones")
            .select(
                "id_invitacion,id_capitan,id_jugador_invitado,id_equipo,estado"
            )
            .eq("id_invitacion", invitacion_id)
            .single();

        if (invErr || !invitacion) {
            return NextResponse.json(
                { message: "Invitación no encontrada." },
                { status: 404 }
            );
        }

        // Si ya fue procesada, idempotencia básica
        if (invitacion.estado !== "Pendiente") {
            return NextResponse.json(
                { message: `La invitación ya está ${invitacion.estado}.` },
                { status: 200 }
            );
        }

        if (action === "reject") {
            const { error: updErr } = await db
                .from("invitaciones")
                .update({ estado: "Rechazada" })
                .eq("id_invitacion", invitacion_id);

            if (updErr) {
                return NextResponse.json(
                    { message: "No se pudo rechazar la invitación." },
                    { status: 500 }
                );
            }

            return NextResponse.json({ ok: true });
        }

        // action === 'accept'
        // 2) Obtener equipo
        const { data: equipo, error: eqErr } = await db
            .from("equipo")
            .select("id_jugadores,cant_max")
            .eq("id_equipo", invitacion.id_equipo)
            .single();

        if (eqErr || !equipo) {
            return NextResponse.json(
                { message: "Equipo no encontrado." },
                { status: 404 }
            );
        }

        const jugadores: number[] = Array.isArray(equipo.id_jugadores)
            ? equipo.id_jugadores.map((x: any) => Number(x))
            : [];

        const cantMax: number = Number(equipo.cant_max ?? 0);
        const jugadorId = Number(invitacion.id_jugador_invitado);

        // 3) Verificar capacidad
        const yaEsta = jugadores.includes(jugadorId);
        const futuros = yaEsta ? jugadores : [...jugadores, jugadorId];

        if (futuros.length > cantMax) {
            return NextResponse.json(
                { message: "El equipo alcanzó el límite de jugadores." },
                { status: 400 }
            );
        }

        // 4) Actualizar equipo
        const { error: updEqErr } = await db
            .from("equipo")
            .update({ id_jugadores: futuros })
            .eq("id_equipo", invitacion.id_equipo);

        if (updEqErr) {
            return NextResponse.json(
                { message: "No se pudo actualizar el equipo." },
                { status: 500 }
            );
        }

        // 5) Marcar invitación como Aceptada
        const { error: updInvErr } = await db
            .from("invitaciones")
            .update({ estado: "Aceptada" })
            .eq("id_invitacion", invitacion_id);

        if (updInvErr) {
            // rollback básico opcional: quitar jugador si se agregó
            // (omito por simplicidad; si lo quieres, avísame y te paso una función RPC transaccional)
            return NextResponse.json(
                {
                    message:
                        "No se pudo actualizar el estado de la invitación.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json(
            { message: "Error inesperado." },
            { status: 500 }
        );
    }
}
