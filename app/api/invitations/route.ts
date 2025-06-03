import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id_jugador, id_equipo, id_capitan } = body;

        // Verifica si ya hay una invitación pendiente
        const { data: existingInv } = await db
            .from("invitaciones")
            .select("*")
            .eq("id_jugador_invitado", id_jugador)
            .eq("id_equipo", id_equipo);

        if (existingInv && existingInv.length > 0) {
            return NextResponse.json({
                message: "Ya enviaste una invitación a este jugador",
            });
        }

        // Verifica si ya está en el equipo
        const { data: equipoRes } = await db
            .from("equipo")
            .select("id_jugadores")
            .eq("id_equipo", id_equipo)
            .single();

        if (equipoRes?.id_jugadores.includes(id_jugador)) {
            return NextResponse.json({
                message: "El jugador ya pertenece a este equipo.",
            });
        }

        // Verifica si hay solicitud previa
        const { data: solicitudRes } = await db
            .from("solicitudes")
            .select("estado")
            .eq("id_jugador", id_jugador)
            .eq("id_equipo", id_equipo);

        const tieneSolicitud =
            solicitudRes!.length &&
            ["Pendiente", "Confirmado"].includes(solicitudRes![0]?.estado);

        if (tieneSolicitud) {
            return NextResponse.json({
                message:
                    "El jugador envió una solicitud para unirse a tu equipo.",
            });
        }

        // Crea la invitación
        await db.from("invitaciones").upsert([
            {
                id_jugador_invitado: parseInt(id_jugador),
                id_equipo: parseInt(id_equipo),
                id_capitan: parseInt(id_capitan),
                estado: "Pendiente",
            },
        ]);

        return NextResponse.json({ message: "Invitación enviada" });
    } catch (error) {
        console.error("Error al crear invitación:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
