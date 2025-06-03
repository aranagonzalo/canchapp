import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase"; // Ajusta según tu setup

function solicitudJugadorAEquipo(
    id_jugador: number,
    equipo: any,
    solicitud: any
): string {
    if (equipo.id_jugadores?.includes(id_jugador)) {
        return "No puedes solicitar unirte";
    }

    if (!solicitud?.estado || solicitud?.estado.trim() === "") {
        return "No enviado";
    }

    return solicitud.estado;
}

function estadoJugadorAEquipo(
    id_jugador: number,
    equipo: any,
    solicitud: any
): string {
    if (equipo.id_jugadores?.includes(id_jugador)) {
        return "Ya perteneces a este equipo";
    }

    return !solicitud?.estado || solicitud.estado.trim() === ""
        ? "No enviado"
        : solicitud.estado;
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const id_jugador = parseInt(searchParams.get("id_jugador") || "");
    const id_capitan = parseInt(searchParams.get("id_capitan") || "");

    if (isNaN(id_jugador) || isNaN(id_capitan)) {
        return NextResponse.json(
            { error: "Parámetros inválidos" },
            { status: 400 }
        );
    }

    const { data: equipos, error: equiposError } = await db
        .from("equipo")
        .select("*");

    if (equiposError) {
        return NextResponse.json(
            { error: equiposError.message },
            { status: 500 }
        );
    }

    const solicitudesPromises = equipos.map(async (equipo: any) => {
        const { data: solicitud } = await db
            .from("invitaciones")
            .select("*")
            .eq("id_capitan", id_capitan)
            .eq("id_jugador_invitado", id_jugador)
            .eq("id_equipo", equipo.id_equipo)
            .single();

        return {
            ...equipo,
            cant_jugadores: equipo.id_jugadores?.length || 0,
            estado: estadoJugadorAEquipo(id_jugador, equipo, solicitud),
            solicitud: solicitudJugadorAEquipo(id_jugador, equipo, solicitud),
        };
    });

    const equiposTransformados = await Promise.all(solicitudesPromises);
    const equiposCapitan = equiposTransformados.filter(
        (equipo) => equipo.capitan === id_capitan
    );

    return NextResponse.json(equiposCapitan);
}
