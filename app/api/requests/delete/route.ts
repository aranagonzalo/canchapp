import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ playerId: string; teamId: string }> }
) {
    const searchParams = _req.nextUrl.searchParams;
    const id_jugador = searchParams.get("id_jugador");
    const id_equipo = searchParams.get("id_equipo");

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
