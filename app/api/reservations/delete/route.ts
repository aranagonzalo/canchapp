import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/reservas/delete
export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json(
                { error: "ID de reserva requerido" },
                { status: 400 }
            );
        }

        const { error } = await db
            .from("reservas")
            .update({ is_active: false })
            .eq("id", id);

        if (error) {
            return NextResponse.json(
                { error: "No se pudo actualizar la reserva" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (err) {
        console.error("Error en DELETE /reservas/delete:", err);
        return NextResponse.json(
            { error: "Error inesperado del servidor" },
            { status: 500 }
        );
    }
}
