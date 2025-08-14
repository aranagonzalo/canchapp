import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const id_capitan = searchParams.get("id_capitan");

        if (!id_capitan) {
            return NextResponse.json(
                { error: "Falta el parámetro 'id_capitan'" },
                { status: 400 }
            );
        }

        // Buscar los equipos donde el usuario es capitán
        const { data: equipos, error: equiposError } = await db
            .from("equipo")
            .select("id_equipo")
            .eq("capitan", id_capitan);

        if (equiposError) {
            return NextResponse.json(
                { error: "Error al buscar equipos del capitán" },
                { status: 500 }
            );
        }

        if (!equipos || equipos.length === 0) {
            return NextResponse.json({ invitaciones: [] });
        }

        const ids_equipos = equipos.map((e) => e.id_equipo);

        // Obtener todas las invitaciones hechas por esos equipos
        const { data: invitaciones, error: invitacionesError } = await db
            .from("invitacion_partido")
            .select("*")
            .in("id_equipo_invitador", ids_equipos);

        if (invitacionesError) {
            return NextResponse.json(
                { error: "Error al obtener invitaciones" },
                { status: 500 }
            );
        }

        const resultados = [];

        for (const inv of invitaciones) {
            // Obtener la reserva
            const { data: reserva, error: errorReserva } = await db
                .from("reservas")
                .select("fecha, horas, id_cancha, id_complejo")
                .eq("id", inv.id_reserva)
                .single();

            if (errorReserva) continue;

            // Obtener nombre del complejo
            const { data: complejo, error: errorComplejo } = await db
                .from("complejo")
                .select("nombre_complejo")
                .eq("id_complejo", reserva.id_complejo)
                .single();

            if (errorComplejo) continue;

            // Obtener nombre de la cancha
            const { data: cancha, error: errorCancha } = await db
                .from("cancha")
                .select("nombre_cancha")
                .eq("id_cancha", reserva.id_cancha)
                .single();

            if (errorCancha) continue;

            // Obtener nombre del equipo invitador
            const { data: equipoInvitador } = await db
                .from("equipo")
                .select("nombre_equipo")
                .eq("id_equipo", inv.id_equipo_invitador)
                .single();

            // Obtener nombre del equipo destinatario
            const { data: equipoDestinatario } = await db
                .from("equipo")
                .select("nombre_equipo")
                .eq("id_equipo", inv.id_equipo_destinatario)
                .single();

            resultados.push({
                id: inv.id,
                created_at: inv.created_at,
                reserva: {
                    nombre_cancha: cancha?.nombre_cancha ?? "-",
                    nombre_complejo: complejo?.nombre_complejo ?? "-",
                    horas: reserva?.horas ?? [],
                    fecha: reserva?.fecha ?? "-",
                },
                nombre_equipo_invitador: equipoInvitador?.nombre_equipo ?? "-",
                nombre_equipo_destinatario:
                    equipoDestinatario?.nombre_equipo ?? "-",
                estado: inv.estado,
                comentarios: inv.comentarios,
            });
        }

        return NextResponse.json({ invitaciones: resultados });
    } catch (error) {
        console.error("Error en GET:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
