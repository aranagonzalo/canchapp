// archivo: app/api/notificaciones/marcar-leida/route.ts
import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Falta el parámetro 'id'" },
            { status: 400 }
        );
    }

    try {
        const { error } = await db
            .from("notificaciones")
            .update({ leido: true })
            .eq("id", id);

        if (error) {
            console.error("Error al marcar notificación como leída:", error);
            return NextResponse.json(
                { error: "Error en la base de datos" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "Notificación marcada como leída",
        });
    } catch (err) {
        console.error("Error del servidor:", err);
        return NextResponse.json(
            { error: "Error del servidor" },
            { status: 500 }
        );
    }
}
