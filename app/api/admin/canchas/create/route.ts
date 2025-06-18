import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            id_complejo,
            cant_jugador,
            techo,
            nombre_cancha,
            precio_turno,
        } = body;

        const techoBoolean = techo === "si" || techo === true;

        const { error: insertError } = await db.from("cancha").upsert([
            {
                id_complejo,
                cant_jugador: Number(cant_jugador),
                techo: techoBoolean,
                nombre_cancha,
                precio_turno: Number(precio_turno),
            },
        ]);

        if (insertError) {
            console.error("Error al insertar cancha:", insertError);
            return NextResponse.json(
                { message: "Error al crear la cancha" },
                { status: 500 }
            );
        }

        // Obtener ID de la cancha recién creada
        const { data: cancha, error: queryError } = await db
            .from("cancha")
            .select("id_cancha")
            .eq("id_complejo", id_complejo)
            .eq("nombre_cancha", nombre_cancha)
            .single();

        const idCancha = cancha?.id_cancha ?? null;

        return NextResponse.json({
            Status: "Respuesta ok",
            idCancha,
        });
    } catch (error) {
        console.error("Error en POST /api/cancha:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
