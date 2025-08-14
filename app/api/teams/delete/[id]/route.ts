import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;

    try {
        // 1. Eliminar relaciones en reserva_equipo
        await db.from("reserva_equipo").delete().eq("id_equipo", id);

        // 2. Eliminar solicitudes e invitaciones
        await db.from("solicitudes").delete().eq("id_equipo", id);
        await db.from("invitaciones").delete().eq("id_equipo", id);

        // 3. Eliminar el equipo
        await db.from("equipo").delete().eq("id_equipo", id);

        // 4. Eliminar reservas huérfanas (sin equipos asociados)
        const { data: reservasHuérfanas, error: errorHuérfanas } = await db
            .from("reservas")
            .select("id")
            .not("id", "in", db.from("reserva_equipo").select("id_reserva"));

        if (errorHuérfanas) {
            console.warn(
                "Error buscando reservas huérfanas:",
                errorHuérfanas.message
            );
        } else if (reservasHuérfanas && reservasHuérfanas.length > 0) {
            const ids = reservasHuérfanas.map((r) => r.id);
            await db.from("reservas").delete().in("id", ids);
        }

        return NextResponse.json(
            { message: "Equipo eliminado correctamente" },
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
