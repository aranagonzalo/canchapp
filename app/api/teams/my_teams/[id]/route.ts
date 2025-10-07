import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const { data: equipos, error } = await db
        .from("equipo")
        .select("*")
        .contains("id_jugadores", [parseInt(id)]);

    if (error) {
        console.error("Error al obtener mis equipos:", error.message);
        return NextResponse.json(
            { message: "Error al obtener los equipos" },
            { status: 500 }
        );
    }

    const equiposTransformados = equipos.map((equipo) => ({
        ...equipo,
        cant_jugadores: equipo.id_jugadores.length,
    }));

    return NextResponse.json(equiposTransformados, { status: 200 });
}
