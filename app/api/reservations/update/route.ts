import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const invitacion_id = req.nextUrl.searchParams.get("invitacion_id");

        if (!invitacion_id) {
            return NextResponse.json(
                { error: "Falta el ID de la invitación" },
                { status: 400 }
            );
        }

        // 1. Obtener la invitación
        const { data: invitacion, error: errorInv } = await db
            .from("invitacion_partido")
            .select("*")
            .eq("id", invitacion_id)
            .single();

        if (errorInv || !invitacion) {
            return NextResponse.json(
                { error: "Invitación no encontrada" },
                { status: 404 }
            );
        }

        if (invitacion.estado !== "pendiente") {
            return NextResponse.json(
                { error: "La invitación ya fue procesada" },
                { status: 400 }
            );
        }

        // 2. Marcar como aceptada
        const { error: errorUpdate } = await db
            .from("invitacion_partido")
            .update({ estado: "aceptado" })
            .eq("id", invitacion_id);

        if (errorUpdate) {
            return NextResponse.json(
                { error: "Error al actualizar el estado de la invitación" },
                { status: 500 }
            );
        }

        // 3. Asociar el equipo destinatario a la reserva
        const { error: errorInsert } = await db.from("reserva_equipo").insert([
            {
                id_reserva: invitacion.id_reserva,
                id_equipo: invitacion.id_equipo_destinatario,
                es_creador: false,
            },
        ]);

        if (errorInsert) {
            return NextResponse.json(
                { error: "Error al asociar el equipo a la reserva" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Invitación aceptada y reserva actualizada",
        });
    } catch (error) {
        console.error("Error en POST /reservations/update:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
