import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET() {
    try {
        const { data, error } = await db
            .from("complejo")
            .select(
                "id_complejo, nombre_complejo, direccion, telefono, latitud, longitud"
            );

        if (error) {
            console.error("Error al obtener complejos:", error);
            return NextResponse.json(
                { message: "Error al obtener complejos" },
                { status: 500 }
            );
        }

        return NextResponse.json(data);
    } catch (err) {
        console.error("Error inesperado:", err);
        return NextResponse.json(
            { message: "Error del servidor" },
            { status: 500 }
        );
    }
}
