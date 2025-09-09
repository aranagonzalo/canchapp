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
        // 1. Obtener invitaciones donde el jugador fue invitado
        const { data: invitacionesData, error: invitacionesError } = await db
            .from("invitaciones")
            .select("*")
            .eq("id_jugador_invitado", jugadorId);

        if (invitacionesError) throw invitacionesError;

        // 2. Extraer IDs de equipos únicos
        const idEquipos = [
            ...new Set(
                invitacionesData
                    .filter((i) => i.id_equipo !== null)
                    .map((i) => i.id_equipo)
            ),
        ];

        // 3. Obtener datos de los equipos
        const { data: equipoData, error: equipoError } = await db
            .from("equipo")
            .select("id_equipo, nombre_equipo")
            .in("id_equipo", idEquipos);

        if (equipoError) throw equipoError;

        // 4. Enriquecer con nombre del equipo
        const enriquecidas = invitacionesData.map((inv) => {
            const equipo = equipoData.find(
                (e) => e.id_equipo === inv.id_equipo
            );
            return {
                ...inv,
                nombre_equipo: equipo?.nombre_equipo ?? "Equipo no encontrado",
            };
        });

        return NextResponse.json(enriquecidas);
    } catch (error) {
        console.error("Error en /api/invitaciones/recibidas:", error);
        return NextResponse.json(
            { error: "Error interno al obtener invitaciones recibidas" },
            { status: 500 }
        );
    }
}
