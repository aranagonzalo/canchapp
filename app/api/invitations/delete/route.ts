import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function DELETE(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const id_jugador = searchParams.get("id_jugador");
    const id_equipo = searchParams.get("id_equipo");

    if (!id_jugador || !id_equipo) {
        return NextResponse.json(
            { error: "Faltan parámetros obligatorios" },
            { status: 400 }
        );
    }

    try {
        const { error } = await db
            .from("invitaciones")
            .delete()
            .eq("id_jugador_invitado", parseInt(id_jugador))
            .eq("id_equipo", parseInt(id_equipo))
            .single();

        if (error) {
            return NextResponse.json(
                { error: "No se pudo eliminar la invitación" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Invitación cancelada correctamente",
        });
    } catch (err) {
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
