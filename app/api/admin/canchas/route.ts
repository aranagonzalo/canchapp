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
                { message: "id_admin inválido" },
                { status: 400 }
            );
        }

        const { data: complejo, error: complejoError } = await db
            .from("complejo")
            .select("id_complejo")
            .eq("id_admin", id_admin)
            .single();

        if (complejoError || !complejo) {
            return NextResponse.json(
                {
                    message:
                        "No se encontró un complejo para este administrador",
                },
                { status: 404 }
            );
        }

        const { data: canchas, error: canchasError } = await db
            .from("cancha")
            .select("*")
            .eq("id_complejo", complejo.id_complejo);

        if (canchasError) {
            return NextResponse.json(
                { message: "Error al obtener canchas" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            Status: "Respuesta ok",
            id_complejo: complejo.id_complejo,
            canchas: canchas || [],
        });
    } catch (error) {
        console.error("Error al obtener canchas por admin:", error);
        return NextResponse.json(
            { message: "Error del servidor" },
            { status: 500 }
        );
    }
}
