import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id_agenda, id_equipo } = body;

        if (!id_agenda || !id_equipo) {
            return NextResponse.json(
                { error: "Faltan datos obligatorios (id_agenda o id_equipo)" },
                { status: 400 }
            );
        }

        // 1. Insertar reserva
        const { error: reservaError } = await db.from("reservas").upsert([
            {
                id_agenda,
                id_equipo,
                estado: "Pendiente",
            },
        ]);

        if (reservaError) {
            return NextResponse.json(
                { error: "No se pudo crear la reserva" },
                { status: 500 }
            );
        }

        // 2. Actualizar estado de la agenda
        const { error: agendaError } = await db
            .from("agenda")
            .update({ disponibilidad: "pendiente", id_equipo })
            .eq("id_agenda", id_agenda);

        if (agendaError) {
            return NextResponse.json(
                { error: "Error al actualizar agenda" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Reserva creada con éxito" });
    } catch (error) {
        console.error("Error en /api/reservar:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
