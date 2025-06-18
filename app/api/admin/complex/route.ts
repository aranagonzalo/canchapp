import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    try {
        const idAdminParam = req.nextUrl.searchParams.get("id_admin");

        if (!idAdminParam) {
            return NextResponse.json(
                { message: "Falta el parámetro id_admin" },
                { status: 400 }
            );
        }

        const id_admin = parseInt(idAdminParam);
        if (isNaN(id_admin)) {
            return NextResponse.json(
                { message: "El id_admin no es válido" },
                { status: 400 }
            );
        }

        // Obtener complejo
        const { data: complejo, error: complejoError } = await db
            .from("complejo")
            .select("*")
            .eq("id_admin", id_admin)
            .single();

        if (complejoError || !complejo) {
            return NextResponse.json(
                { message: "No se encontró el complejo" },
                { status: 404 }
            );
        }

        // Obtener horarios
        const { data: horarios, error: horariosError } = await db
            .from("horarios_complejo")
            .select("*")
            .eq("id_complejo", complejo.id_complejo);

        if (horariosError) {
            console.error("Error al obtener horarios:", horariosError);
            return NextResponse.json(
                { message: "Error al obtener horarios" },
                { status: 500 }
            );
        }

        return NextResponse.json({ complejo, horarios });
    } catch (err) {
        console.error("Error al obtener complejo:", err);
        return NextResponse.json(
            { message: "Error del servidor" },
            { status: 500 }
        );
    }
}
