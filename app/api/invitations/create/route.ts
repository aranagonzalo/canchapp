import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            id_reserva,
            id_equipo_invitador,
            id_equipo_destinatario,
            mensaje,
        } = body ?? {};

        // Validación básica
        const reservaId = Number(id_reserva);
        const invitadorId = Number(id_equipo_invitador);
        const destinatarioId = Number(id_equipo_destinatario);

        if (!reservaId || !invitadorId || !destinatarioId) {
            return NextResponse.json(
                { error: "Faltan parámetros necesarios en la solicitud" },
                { status: 400 }
            );
        }

        // 1) Verificar duplicado (misma reserva, mismo invitador y destinatario)
        const { data: existingInv, error: existingErr } = await db
            .from("invitacion_partido")
            .select("id")
            .eq("id_reserva", reservaId)
            .eq("id_equipo_invitador", invitadorId)
            .eq("id_equipo_destinatario", destinatarioId)
            .maybeSingle(); // no lanza error si no hay fila

        if (existingErr && existingErr.code !== "PGRST116") {
            // Cualquier error real diferente a "no rows"
            return NextResponse.json(
                { error: "Error verificando invitación existente" },
                { status: 500 }
            );
        }

        if (existingInv) {
            return NextResponse.json(
                {
                    message:
                        "Ya has enviado una invitación a este equipo para esta reserva.",
                },
                { status: 409 }
            );
        }

        // 2) Insertar y pedir la fila creada (si no haces .select(), 'data' será null)
        const { data, error } = await db
            .from("invitacion_partido")
            .insert({
                id_reserva: reservaId,
                id_equipo_invitador: invitadorId,
                id_equipo_destinatario: destinatarioId,
                comentarios: mensaje ?? "",
                estado: "pendiente",
            })
            .select(
                "id, id_reserva, id_equipo_invitador, id_equipo_destinatario, estado, comentarios, created_at"
            )
            .single();

        if (error) {
            console.error("Error al insertar invitación:", error);
            return NextResponse.json(
                { error: "Error al insertar la invitación" },
                { status: 500 }
            );
        }

        // Éxito
        return NextResponse.json(
            {
                message: "Invitación enviada con éxito",
                invitacion: data, // contiene la fila creada
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error al crear la invitación:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
