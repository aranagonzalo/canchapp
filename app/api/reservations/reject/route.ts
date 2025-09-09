// app/api/invitaciones/rechazar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const invitacion_id = req.nextUrl.searchParams.get("invitacion_id");
        const motivo = req.nextUrl.searchParams.get("motivo") ?? null;

        if (!invitacion_id) {
            return NextResponse.json(
                { error: "Falta el ID de la invitación" },
                { status: 400 }
            );
        }

        // 1) Obtener la invitación
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

        // 2) Marcar como rechazada (opcional: guardar motivo y fecha de respuesta)
        const { error: errorUpdate } = await db
            .from("invitacion_partido")
            .update({
                estado: "rechazada",
            })
            .eq("id", invitacion_id);

        if (errorUpdate) {
            return NextResponse.json(
                { error: "Error al actualizar el estado de la invitación" },
                { status: 500 }
            );
        }

        // 3) No se asocia el equipo a la reserva (nada que hacer aquí)
        return NextResponse.json({
            message: "Invitación rechazada correctamente",
        });
    } catch (error) {
        console.error("Error en POST /invitaciones/rechazar:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
