import { db } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        // 1. Obtener datos del complejo
        const { data: complejos, error: errorComplejo } = await db.from(
            "complejo"
        ).select(`
                id_complejo,
                nombre_complejo,
                direccion,
                telefono,
                ciudad,
                descripcion,
                latitud,
                longitud,
                reviews_complejo (
                    puntuacion
                )
            `);

        if (errorComplejo || !complejos) {
            return NextResponse.json(
                { Status: "Complejos no encontrados" },
                { status: 404 }
            );
        }

        // Procesar reviews (agrupar por complejo)
        const complejosConReviews = complejos.map((c: any) => {
            const total_reviews = c.reviews_complejo.length;
            const avg_puntuacion = total_reviews
                ? Number(
                      (
                          c.reviews_complejo.reduce(
                              (sum: number, r: any) =>
                                  sum + (r.puntuacion || 0),
                              0
                          ) / total_reviews
                      ).toFixed(1)
                  )
                : 0.0;

            return {
                ...c,
                total_reviews,
                avg_puntuacion,
            };
        });

        return NextResponse.json(complejosConReviews);
    } catch (err) {
        console.error("Error inesperado:", err);
        return NextResponse.json(
            { Status: "Error del servidor" },
            { status: 500 }
        );
    }
}
