import { db } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;

    try {
        // 1. Obtener datos del complejo
        const { data: complejo, error: errorComplejo } = await db
            .from("complejo")
            .select(
                "id_complejo, nombre_complejo, direccion, telefono, ciudad, descripcion, latitud, longitud"
            )
            .eq("id_complejo", id)
            .single();

        if (errorComplejo || !complejo) {
            return NextResponse.json(
                { Status: "Complejo no encontrado" },
                { status: 404 }
            );
        }

        // 2. Obtener canchas del complejo
        const { data: canchas, error: errorCanchas } = await db
            .from("cancha")
            .select(
                "id_cancha, nombre_cancha, precio_turno, imagen, cant_jugador, techo"
            )
            .eq("id_complejo", id);

        if (errorCanchas) {
            return NextResponse.json(
                { Status: "Error al obtener canchas" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            Status: "Respuesta ok",
            complejo,
            canchas: canchas,
        });
    } catch (err) {
        console.error("Error inesperado:", err);
        return NextResponse.json(
            { Status: "Error del servidor" },
            { status: 500 }
        );
    }
}
