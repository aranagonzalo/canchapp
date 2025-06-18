// archivo: app/api/notificaciones/route.ts
import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const id = req.nextUrl.searchParams.get("id");
    const tipo = req.nextUrl.searchParams.get("tipo");

    if (!id || !tipo) {
        return NextResponse.json(
            { error: "Faltan parámetros 'id' o 'tipo'" },
            { status: 400 }
        );
    }

    try {
        let columna;

        if (tipo === "jugador") {
            const { data: jugador, error: errorJugador } = await db
                .from("jugador")
                .select("id_jug")
                .eq("id_jug", id)
                .single();

            if (errorJugador || !jugador) {
                return NextResponse.json(
                    { error: "Jugador no encontrado" },
                    { status: 404 }
                );
            }

            columna = "id_jugador";
        } else if (tipo === "administrador") {
            const { data: admin, error: errorAdmin } = await db
                .from("administrador")
                .select("id_admin")
                .eq("id_admin", id)
                .single();

            if (errorAdmin || !admin) {
                return NextResponse.json(
                    { error: "Administrador no encontrado" },
                    { status: 404 }
                );
            }

            columna = "id_administrador";
        } else {
            return NextResponse.json(
                { error: "Tipo de usuario inválido" },
                { status: 400 }
            );
        }

        const { data: notificaciones, error } = await db
            .from("notificaciones")
            .select("*")
            .eq(columna, id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error al obtener notificaciones:", error);
            return NextResponse.json(
                { error: "Error en la base de datos" },
                { status: 500 }
            );
        }

        return NextResponse.json(notificaciones);
    } catch (err) {
        console.error("Error en el servidor:", err);
        return NextResponse.json(
            { error: "Error del servidor" },
            { status: 500 }
        );
    }
}
