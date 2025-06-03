import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Falta el parámetro 'id'" },
            { status: 400 }
        );
    }

    const jugadorId = parseInt(id);

    try {
        // 1. Obtener solicitudes enviadas por el jugador
        const { data: solicitudesData, error: solicitudesError } = await db
            .from("solicitudes")
            .select("*")
            .eq("id_jugador", jugadorId);

        if (solicitudesError) throw solicitudesError;

        // 2. Obtener los equipos donde participa el jugador
        const { data: equiposData, error: equiposError } = await db
            .from("equipo")
            .select("id_equipo, nombre_equipo")
            .contains("id_jugadores", [jugadorId]);

        if (equiposError) throw equiposError;

        // 3. Enriquecer solicitudes con nombre del equipo
        const enriched = solicitudesData.map((solicitud) => {
            const equipo = equiposData.find(
                (e) => e.id_equipo === solicitud.id_equipo
            );
            return {
                ...solicitud,
                nombre_equipo: equipo
                    ? equipo.nombre_equipo
                    : "Equipo no encontrado",
            };
        });

        // 4. Filtrar por estado pendiente
        const pendientes = enriched.filter((s) => s.estado === "Pendiente");

        return NextResponse.json(pendientes);
    } catch (error) {
        console.error("Error en /api/solicitudes/enviadas:", error);
        return NextResponse.json(
            { error: "Error interno al obtener solicitudes enviadas" },
            { status: 500 }
        );
    }
}
