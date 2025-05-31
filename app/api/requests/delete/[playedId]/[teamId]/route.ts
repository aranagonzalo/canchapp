import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id_jugador: string; id_equipo: string }> }
) {
    const id_jugador = parseInt((await params).id_jugador);
    const id_equipo = parseInt((await params).id_equipo);

    if (isNaN(id_jugador) || isNaN(id_equipo)) {
        return NextResponse.json(
            { message: "Parámetros inválidos" },
            { status: 400 }
        );
    }

    try {
        const { error } = await db
            .from("solicitudes")
            .delete()
            .eq("id_jugador", id_jugador)
            .eq("id_equipo", id_equipo)
            .single();

        if (error) {
            console.error("Error al eliminar solicitud:", error);
            return NextResponse.json(
                { message: "No se pudo eliminar la solicitud" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Solicitud eliminada" });
    } catch (error) {
        console.error("Error inesperado:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
