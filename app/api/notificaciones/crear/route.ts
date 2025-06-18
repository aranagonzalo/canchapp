import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { id_usuario, tipo, titulo, mensaje, url } = body;

    if (!id_usuario || !tipo || !titulo || !mensaje) {
        return NextResponse.json(
            { error: "Faltan campos obligatorios" },
            { status: 400 }
        );
    }

    const campoDestino = tipo === "jugador" ? "id_jugador" : "id_administrador";

    const { error } = await db.from("notificaciones").insert([
        {
            [campoDestino]: id_usuario,
            titulo,
            mensaje,
            url: url || null,
            leido: false,
        },
    ]);

    if (error) {
        console.error("Error insertando notificación:", error);
        return NextResponse.json(
            { error: "Error al insertar notificación" },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
