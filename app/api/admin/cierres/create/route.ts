import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const { id_complejo, fecha_inicio, fecha_fin, motivo } =
            await req.json();

        if (
            !id_complejo ||
            !fecha_inicio ||
            !fecha_fin ||
            isNaN(Date.parse(fecha_inicio)) ||
            isNaN(Date.parse(fecha_fin))
        ) {
            return NextResponse.json(
                { message: "Datos inválidos o incompletos" },
                { status: 400 }
            );
        }

        const { error } = await db.from("cierres_temporales").insert([
            {
                id_complejo,
                fecha_inicio,
                fecha_fin,
                motivo: motivo ?? null,
            },
        ]);

        if (error) {
            console.error("Error al crear cierre:", error);
            return NextResponse.json(
                { message: "Error al registrar el cierre" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Cierre temporal registrado correctamente" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error inesperado:", err);
        return NextResponse.json(
            { message: "Error del servidor" },
            { status: 500 }
        );
    }
}
