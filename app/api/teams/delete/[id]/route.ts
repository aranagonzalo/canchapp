import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;

    try {
        await db.from("reservas").delete().eq("id_equipo", id);
        await db.from("solicitudes").delete().eq("id_equipo", id);
        await db.from("invitaciones").delete().eq("id_equipo", id);
        await db.from("equipo").delete().eq("id_equipo", id);

        return NextResponse.json(
            { message: "Equipo eliminado" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error al eliminar equipo:", error);
        return NextResponse.json(
            { error: "Error al eliminar equipo" },
            { status: 500 }
        );
    }
}
