import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function PUT(req: NextRequest) {
    const body = await req.json();
    const { id_solicitud, estado } = body;

    if (!id_solicitud || !estado) {
        return NextResponse.json(
            { error: "Faltan parámetros" },
            { status: 400 }
        );
    }

    try {
        // Obtener solicitud
        const { data: solicitud, error: solicitudError } = await db
            .from("solicitudes")
            .select("*")
            .eq("id_solicitud", id_solicitud)
            .single();

        if (solicitudError || !solicitud) throw solicitudError;

        // Obtener equipo vinculado
        const { data: equipo, error: equipoError } = await db
            .from("equipo")
            .select("*")
            .eq("id_equipo", solicitud.id_equipo)
            .single();

        if (equipoError || !equipo) throw equipoError;

        // Actualizar estado de la solicitud
        await db
            .from("solicitudes")
            .update({ estado })
            .eq("id_solicitud", id_solicitud);

        // Si se acepta, agregar jugador al equipo
        if (estado === "Aceptado") {
            const nuevosJugadores = [
                ...(equipo.id_jugadores || []),
                solicitud.id_jugador,
            ];

            await db
                .from("equipo")
                .update({ id_jugadores: nuevosJugadores })
                .eq("id_equipo", equipo.id_equipo);
        }

        return NextResponse.json({
            message: "Solicitud actualizada correctamente",
        });
    } catch (error) {
        console.error("Error actualizando solicitud:", error);
        return NextResponse.json(
            { error: "No se pudo actualizar la solicitud" },
            { status: 500 }
        );
    }
}
