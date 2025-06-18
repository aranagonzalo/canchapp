import { db } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const capitanId = searchParams.get("capitan_id");

    if (!capitanId) {
        return NextResponse.json(
            { error: "Falta id del capitán" },
            { status: 400 }
        );
    }

    const { data, error } = await db
        .from("equipo")
        .select("id_equipo, nombre_equipo")
        .eq("capitan", capitanId);

    if (error) {
        return NextResponse.json(
            { error: "Error al obtener equipos" },
            { status: 500 }
        );
    }

    return NextResponse.json({ equipos: data });
}
