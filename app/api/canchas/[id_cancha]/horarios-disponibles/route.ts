import { db } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id_cancha: string }> }
) {
    const id_cancha = Number((await params).id_cancha);
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get("fecha");

    if (!fecha || isNaN(id_cancha)) {
        return NextResponse.json(
            { error: "Parámetros inválidos" },
            { status: 400 }
        );
    }

    try {
        // 1. Obtener la cancha
        const { data: cancha, error: canchaError } = await db
            .from("cancha")
            .select("id_complejo")
            .eq("id_cancha", id_cancha)
            .single();

        if (canchaError || !cancha) {
            return NextResponse.json(
                { error: "Cancha no encontrada" },
                { status: 404 }
            );
        }

        const id_complejo = cancha.id_complejo;

        const diaSemana = new Date(fecha).getDay(); // 0 = domingo, 6 = sábado

        // 2. Obtener las horas habilitadas para ese día
        const { data: horarios, error: errorHorario } = await db
            .from("horarios_complejo")
            .select("hora_apertura, hora_cierre")
            .eq("id_complejo", id_complejo)
            .eq("dia_semana", diaSemana);

        if (errorHorario || !horarios || horarios.length === 0) {
            return NextResponse.json({
                id_cancha,
                fecha,
                horas_disponibles: [],
                mensaje: "No hay horario habilitado este día",
            });
        }

        const horasHabilitadas = horarios.flatMap((h) =>
            generarHorasDesdeRango(h.hora_apertura, h.hora_cierre)
        );

        // 3. Obtener las horas ya reservadas para esa cancha y fecha
        const { data: reserva, error: errorAgenda } = await db
            .from("reservas")
            .select("horas")
            .eq("id_cancha", id_cancha)
            .eq("fecha", fecha);

        if (errorAgenda) {
            return NextResponse.json(
                { error: "Error al cargar agenda" },
                { status: 500 }
            );
        }

        const horasOcupadas = reserva.flatMap((r) => r.horas);

        const horasDisponibles = horasHabilitadas.filter(
            (h) => !horasOcupadas.includes(h)
        );

        return NextResponse.json({
            id_cancha,
            fecha,
            horas_disponibles: horasDisponibles,
            horasOcupadas,
        });
    } catch (err) {
        console.error("Error en horas-disponibles:", err);
        return NextResponse.json(
            { error: "Error del servidor" },
            { status: 500 }
        );
    }
}

function generarHorasDesdeRango(apertura: string, cierre: string): string[] {
    const horas: string[] = [];

    const aperturaHora = parseInt(apertura.slice(0, 2));
    const cierreHora = parseInt(cierre.slice(0, 2));

    for (let h = aperturaHora; h < cierreHora; h++) {
        horas.push(h.toString().padStart(2, "0")); // ["08", "09", ...]
    }

    return horas;
}
