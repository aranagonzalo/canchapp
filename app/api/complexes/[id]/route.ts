import { db } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;

    try {
        // 1. Obtener datos del complejo
        const { data: complejo, error: errorComplejo } = await db
            .from("complejo")
            .select(
                `
                id_admin,
                id_complejo,
                nombre_complejo,
                direccion,
                telefono,
                ciudad,
                descripcion,
                latitud,
                longitud,
                administrador:administrador (
                    mail
                )
                `
            )
            .eq("id_complejo", id)
            .single();

        if (errorComplejo || !complejo) {
            return NextResponse.json(
                { Status: "Complejo no encontrado" },
                { status: 404 }
            );
        }

        // 2. Obtener canchas del complejo
        const { data: canchas, error: errorCanchas } = await db
            .from("cancha")
            .select(
                "id_cancha, nombre_cancha, precio_turno, imagen, cant_jugador, techo"
            )
            .eq("id_complejo", id);

        if (errorCanchas) {
            return NextResponse.json(
                { Status: "Error al obtener canchas" },
                { status: 500 }
            );
        }

        // 3. Obtener promedio y cantidad de reseñas (más eficiente)
        const { data: reviewStats, error: errorReviews } = await db
            .from("reviews_complejo")
            .select("puntuacion")
            .eq("id_complejo", id);

        if (errorReviews) {
            return NextResponse.json({ Status: errorReviews }, { status: 500 });
        }

        const total_reviews = reviewStats.length;
        const avg_rating = total_reviews
            ? Number(
                  (
                      reviewStats.reduce(
                          (sum: number, r: any) => sum + (r.puntuacion || 0),
                          0
                      ) / total_reviews
                  ).toFixed(1)
              )
            : 0.0;

        // 4. Obtener horarios del complejo
        const { data: horarios, error: errorHorarios } = await db
            .from("horarios_complejo")
            .select("id_horario")
            .eq("id_complejo", id);

        if (errorHorarios) {
            return NextResponse.json(
                { Status: "Error al obtener horarios" },
                { status: 500 }
            );
        }

        const tiene_horario_operativo = horarios.length > 0;

        return NextResponse.json({
            Status: "Respuesta ok",
            complejo,
            canchas,
            tiene_horario_operativo,
            reviews_stats: {
                total_reviews,
                avg_rating,
            },
            reviewStats,
        });
    } catch (err) {
        console.error("Error inesperado:", err);
        return NextResponse.json(
            { Status: "Error del servidor" },
            { status: 500 }
        );
    }
}
