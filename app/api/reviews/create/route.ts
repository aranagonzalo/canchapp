import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: Request) {
    const body = await req.json();
    const { id_jugador, id_complejo, puntuacion, comentario } = body;

    if (!id_jugador || !id_complejo || !puntuacion) {
        return NextResponse.json(
            { error: "Faltan campos obligatorios" },
            { status: 400 }
        );
    }

    if (puntuacion < 1 || puntuacion > 5) {
        return NextResponse.json(
            { error: "Puntuación inválida" },
            { status: 400 }
        );
    }

    // Verificar si es capitán
    const { data: equiposCapitan } = await db
        .from("equipo")
        .select("id_equipo")
        .eq("capitan", id_jugador);

    if (!equiposCapitan || equiposCapitan.length === 0) {
        return NextResponse.json(
            { error: "Solo pueden calificar capitanes de equipo." },
            { status: 403 }
        );
    }

    const idsEquipos = equiposCapitan.map((e) => e.id_equipo);

    console.log(idsEquipos);

    // Buscar reservas válidas (activas y pasadas)
    const hoy = new Date();
    const { data: reservas } = await db
        .from("reservas")
        .select("fecha, horas, id_complejo, is_active")
        .in("id_equipo", idsEquipos)
        .eq("id_complejo", id_complejo)
        .eq("is_active", true);

    console.log(reservas);

    const tieneReservaPasada = reservas?.some((res) => {
        const horaFinal = (res.horas.at(-1) ?? "23") + ":00";
        const fechaReserva = new Date(`${res.fecha}T${horaFinal}`);
        return fechaReserva < hoy;
    });

    if (!tieneReservaPasada) {
        return NextResponse.json(
            { error: "No hay reservas activas pasadas en este complejo" },
            { status: 403 }
        );
    }

    // Guardar la reseña
    const { error } = await db.from("reviews_complejo").insert([
        {
            id_jugador,
            id_complejo,
            puntuacion,
            comentario: comentario || null,
        },
    ]);

    if (error) {
        return NextResponse.json(
            { error: "Error al guardar la reseña" },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        message: "Reseña registrada correctamente",
    });
}
