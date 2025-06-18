import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    try {
        const idParam = req.nextUrl.searchParams.get("id_complejo");

        if (!idParam) {
            return NextResponse.json(
                { message: "Falta el parámetro id_complejo" },
                { status: 400 }
            );
        }

        const id_complejo = parseInt(idParam);
        if (isNaN(id_complejo)) {
            return NextResponse.json(
                { message: "id_complejo no válido" },
                { status: 400 }
            );
        }

        const { data, error } = await db
            .from("cierres_temporales")
            .select("*")
            .eq("id_complejo", id_complejo)
            .order("fecha_inicio", { ascending: true });

        if (error) {
            console.error("Error al obtener cierres:", error);
            return NextResponse.json(
                { message: "Error al obtener cierres temporales" },
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
