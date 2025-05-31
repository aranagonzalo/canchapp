import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase"; // Instancia global de Supabase

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { id_jugador, id_equipo } = data;

        const hasInvitationPending = await checkInvitation(
            id_jugador,
            id_equipo
        );
        const isPlayerInCurrentTeam = await checkPlayer(id_jugador, id_equipo);
        const hasSolicitud = await checkPlayerSolicitud(id_jugador, id_equipo);

        if (!hasInvitationPending && !isPlayerInCurrentTeam && !hasSolicitud) {
            await db.from("solicitudes").upsert([
                {
                    id_jugador,
                    id_equipo,
                },
            ]);
            return NextResponse.json(
                { message: "Solicitud enviada" },
                { status: 200 }
            );
        } else {
            if (hasInvitationPending) {
                return NextResponse.json(
                    {
                        message:
                            "El jugador tiene una invitación pendiente de este equipo.",
                    },
                    { status: 200 }
                );
            }

            if (isPlayerInCurrentTeam) {
                return NextResponse.json(
                    { message: "El jugador ya pertenece a este equipo." },
                    { status: 200 }
                );
            }

            if (hasSolicitud) {
                return NextResponse.json(
                    {
                        message:
                            "El jugador ya envió solicitud para unirse a este equipo.",
                    },
                    { status: 200 }
                );
            }
        }
    } catch (err) {
        console.error("Error en la conexión:", err);
        return NextResponse.json(
            { message: "Error del servidor" },
            { status: 500 }
        );
    }
}

async function checkInvitation(id_jugador: number, id_equipo: number) {
    const { data } = await db
        .from("invitaciones")
        .select("*")
        .eq("id_jugador_invitado", id_jugador)
        .eq("id_equipo", id_equipo)
        .maybeSingle();

    return !!data;
}

async function checkPlayer(id_jugador: number, id_equipo: number) {
    const { data, error } = await db
        .from("equipo")
        .select("id_jugadores")
        .eq("id_equipo", id_equipo)
        .maybeSingle();

    if (error || !data) return false;

    return data.id_jugadores.includes(id_jugador);
}

async function checkPlayerSolicitud(id_jugador: number, id_equipo: number) {
    const { data } = await db
        .from("solicitudes")
        .select("estado")
        .eq("id_jugador", id_jugador)
        .eq("id_equipo", id_equipo);

    if (!data || data.length === 0) return false;

    const estado = data[0].estado;
    return estado === "Pendiente" || estado === "Confirmado";
}
