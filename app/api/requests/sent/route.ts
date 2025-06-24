import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Falta el parámetro 'id'" },
            { status: 400 }
        );
    }

    const jugadorId = parseInt(id);

    try {
        const { data: solicitudesData, error: solicitudesError } = await db
            .from("solicitudes")
            .select("*, equipo(nombre_equipo)")
            .eq("id_jugador", jugadorId);

        if (solicitudesError) throw solicitudesError;

        const pendientes = solicitudesData
            .filter((s) => s.estado === "Pendiente")
            .map((s) => ({
                ...s,
                nombre_equipo:
                    s.equipo?.nombre_equipo || "Equipo no encontrado",
            }));

        return NextResponse.json(pendientes);
    } catch (error) {
        console.error("Error en /api/solicitudes/enviadas:", error);
        return NextResponse.json(
            { error: "Error interno al obtener solicitudes enviadas" },
            { status: 500 }
        );
    }
}
