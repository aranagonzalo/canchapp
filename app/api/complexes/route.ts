import { db } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        // 1. Obtener datos del complejo
        const { data: complejo, error: errorComplejo } = await db
            .from("complejo")
            .select(
                "id_complejo, nombre_complejo, direccion, telefono, ciudad, descripcion, latitud, longitud"
            );

        if (errorComplejo || !complejo) {
            return NextResponse.json(
                { Status: "Complejo no encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json(complejo);
    } catch (err) {
        console.error("Error inesperado:", err);
        return NextResponse.json(
            { Status: "Error del servidor" },
            { status: 500 }
        );
    }
}
