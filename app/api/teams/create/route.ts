import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const { error } = await db.from("equipo").upsert([
            {
                nombre_equipo: data.nombre_equipo,
                cant_max: data.cant_max,
                capitan: data.capitan,
                id_jugadores: data.id_jugadores,
                publico: data.publico,
                ubicacion: data.ubicacion,
            },
        ]);

        if (error) {
            console.error("Error al crear equipo:", error.message);
            return NextResponse.json(
                { message: "Error al crear el equipo" },
                { status: 500 }
            );
        }

        return NextResponse.json({ message: "Equipo creado" }, { status: 200 });
    } catch (err) {
        console.error("Error inesperado:", err);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
