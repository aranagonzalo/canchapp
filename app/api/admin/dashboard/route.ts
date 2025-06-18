// app/api/dashboard-admin/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const id_admin = searchParams.get("id_administrador");

    if (!id_admin) {
        return NextResponse.json(
            { error: "ID de administrador requerido" },
            { status: 400 }
        );
    }

    // Obtener el id_complejo asociado al administrador
    const { data: complejo, error: errorComplejo } = await db
        .from("complejo")
        .select("id_complejo")
        .eq("id_admin", id_admin)
        .single();

    if (!complejo || errorComplejo) {
        return NextResponse.json(
            {
                error: "No se encontró un complejo asociado a este administrador",
            },
            { status: 404 }
        );
    }

    const id_complejo = complejo.id_complejo;

    // Fetch reservas
    const hoy = new Date();
    const hace7 = new Date(hoy.getTime() - 7 * 86400000);
    const hace30 = new Date(hoy.getTime() - 30 * 86400000);

    const { data: reservas } = await db
        .from("reserva")
        .select("fecha")
        .eq("id_complejo", id_complejo);

    const reservas_ultimos_7 =
        reservas?.filter((r) => new Date(r.fecha) >= hace7).length || 0;
    const reservas_ultimos_30 =
        reservas?.filter((r) => new Date(r.fecha) >= hace30).length || 0;

    // Fetch canchas
    const { count: total_canchas } = await db
        .from("cancha")
        .select("*", { count: "exact", head: true })
        .eq("id_complejo", id_complejo);

    // Fetch reseñas
    const { data: resenasRaw } = await db
        .from("resena")
        .select("puntuacion")
        .eq("id_complejo", id_complejo);

    const resenas = resenasRaw ?? [];

    const total_resenas = resenas.length;
    const promedio_puntuacion =
        total_resenas > 0
            ? Number(
                  (
                      resenas.reduce((sum, r) => sum + r.puntuacion, 0) /
                      total_resenas
                  ).toFixed(2)
              )
            : 0;

    return NextResponse.json({
        reservas_ultimos_7,
        reservas_ultimos_30,
        total_canchas: total_canchas || 0,
        total_resenas,
        promedio_puntuacion,
    });
}
