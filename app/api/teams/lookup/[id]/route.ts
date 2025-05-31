import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const id_jugador = parseInt(params.id);

    try {
        const { data: equipos, error: errorEquipos } = await db
            .from("equipo")
            .select("*");

        if (errorEquipos || !equipos) {
            return NextResponse.json(
                { message: "Error obteniendo equipos" },
                { status: 500 }
            );
        }

        const equiposCapitan = equipos.filter(
            (equipo) => equipo.capitan !== id_jugador
        );

        const equiposTransformados = await Promise.all(
            equiposCapitan.map(async (equipo) => {
                const { data: solicitud } = await db
                    .from("solicitudes")
                    .select("*")
                    .eq("id_jugador", id_jugador)
                    .eq("id_equipo", equipo.id_equipo)
                    .single();

                return {
                    ...equipo,
                    cant_jugadores: equipo.id_jugadores?.length || 0,
                    estado: estadoJugadorAEquipo(id_jugador, equipo, solicitud),
                    solicitud: solicitudJugadorAEquipo(
                        id_jugador,
                        equipo,
                        solicitud
                    ),
                };
            })
        );

        return NextResponse.json(equiposTransformados);
    } catch (err) {
        console.error("Error inesperado:", err);
        return NextResponse.json(
            { message: "Error del servidor" },
            { status: 500 }
        );
    }
}

// Funciones auxiliares
function solicitudJugadorAEquipo(
    id_jugador: number,
    equipo: any,
    solicitud: any
) {
    if (equipo.id_jugadores?.includes(id_jugador)) {
        return "No puedes solicitar unirte";
    }

    if (!solicitud?.estado || solicitud.estado.trim() === "") {
        return "No enviado";
    }

    return solicitud.estado;
}

function estadoJugadorAEquipo(id_jugador: number, equipo: any, solicitud: any) {
    if (solicitud?.estado === "Aceptado") {
        return "Aceptado";
    }

    if (equipo.id_jugadores?.includes(id_jugador)) {
        return "Ya perteneces a este equipo";
    }

    return !(!solicitud?.estado || solicitud.estado.trim() === "")
        ? solicitud.estado
        : "No enviado";
}
