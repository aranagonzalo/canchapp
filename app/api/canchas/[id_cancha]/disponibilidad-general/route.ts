import { db } from "@/lib/supabase";
import { NextResponse } from "next/server";

// Función auxiliar para obtener los próximos 30 días
const getNext30Days = (): string[] => {
    const fechas: string[] = [];
    const hoy = new Date();

    for (let i = 0; i < 30; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(hoy.getDate() + i);
        fechas.push(fecha.toISOString().split("T")[0]);
    }

    return fechas;
};

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id_cancha: string }> }
) {
    const id_cancha = Number((await params).id_cancha);
    if (isNaN(id_cancha)) {
        return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    try {
        // 1. Obtener la cancha
        const { data: cancha, error: canchaError } = await db
            .from("cancha")
            .select("id_cancha, nombre_cancha, id_complejo")
            .eq("id_cancha", id_cancha)
            .single();

        if (canchaError || !cancha) {
            return NextResponse.json(
                { error: "Cancha no encontrada" },
                { status: 404 }
            );
        }

        const { id_complejo, nombre_cancha } = cancha;

        // 2. Obtener los horarios del complejo
        const { data: horarios, error: errorHorarios } = await db
            .from("horarios_complejo")
            .select("dia_semana")
            .eq("id_complejo", id_complejo);

        if (errorHorarios || !horarios) {
            return NextResponse.json(
                { error: "Error cargando horarios" },
                { status: 500 }
            );
        }

        const diasDisponibles = horarios.map((h) => h.dia_semana); // ej: [1,2,3,4,5,6]

        // 3. Obtener los cierres del complejo
        const { data: cierres, error: errorCierres } = await db
            .from("cierres_temporales")
            .select("fecha_inicio, fecha_fin, motivo")
            .eq("id_complejo", id_complejo);

        if (errorCierres || !cierres) {
            return NextResponse.json(
                { error: "Error cargando cierres" },
                { status: 500 }
            );
        }

        const fechasNoDisponibles: { fecha: string; motivo: string }[] = [];
        const fechas = getNext30Days();

        for (const fechaStr of fechas) {
            const date = new Date(fechaStr);
            const diaSemana = date.getDay(); // 0 = domingo, 6 = sábado

            // A. Verifica si está en un cierre temporal
            const cierre = cierres.find(
                (c) =>
                    new Date(c.fecha_inicio) <= date &&
                    new Date(c.fecha_fin) >= date
            );

            if (cierre) {
                fechasNoDisponibles.push({
                    fecha: fechaStr,
                    motivo: cierre.motivo || "Cierre del complejo",
                });
                continue; // ya se descarta este día
            }

            // B. Verifica si ese día no tiene horario asignado
            if (!diasDisponibles.includes(diaSemana)) {
                fechasNoDisponibles.push({
                    fecha: fechaStr,
                    motivo: "No disponible por horario",
                });
            }
        }

        return NextResponse.json({
            id_cancha,
            nombre_cancha,
            fechas_no_disponibles: fechasNoDisponibles,
            diasDisponibles,
        });
    } catch (err) {
        console.error("Error en disponibilidad-general:", err);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
