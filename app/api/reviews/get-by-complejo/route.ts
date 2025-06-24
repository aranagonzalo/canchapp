import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id_complejo = searchParams.get("id_complejo");

    if (!id_complejo) {
        return NextResponse.json(
            { error: "ID de complejo requerido" },
            { status: 400 }
        );
    }

    const { data, error } = await db
        .from("reviews_complejo")
        .select(
            `
            id,
            puntuacion,
            comentario,
            created_at,
            jugador:id_jugador (
                id_jug,
                nombre,
                apellido
            )
        `
        )
        .eq("id_complejo", id_complejo)
        .order("created_at", { ascending: false });

    if (error) {
        return NextResponse.json(
            { error: "Error al obtener reseñas" },
            { status: 500 }
        );
    }

    return NextResponse.json({ reviews: data });
}
