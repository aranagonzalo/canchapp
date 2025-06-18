import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

// POST /api/reservas/create
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { id_equipo, id_complejo, id_cancha, fecha, horas } = body;

        if (
            !id_equipo ||
            !id_complejo ||
            !id_cancha ||
            !fecha ||
            !Array.isArray(horas) ||
            horas.length === 0
        ) {
            return NextResponse.json(
                { error: "Faltan datos obligatorios o son inválidos." },
                { status: 400 }
            );
        }

        // 1. Validar que el equipo exista
        const { data: equipo, error: errorEquipo } = await db
            .from("equipo")
            .select("capitan")
            .eq("id_equipo", id_equipo)
            .single();

        if (errorEquipo || !equipo) {
            return NextResponse.json(
                { error: "Equipo no encontrado" },
                { status: 404 }
            );
        }

        // 2. Validar que la cancha pertenezca al complejo
        const { data: cancha, error: errorCancha } = await db
            .from("cancha")
            .select("id_complejo")
            .eq("id_cancha", id_cancha)
            .single();

        if (errorCancha || cancha.id_complejo !== id_complejo) {
            return NextResponse.json(
                { error: "Cancha no corresponde al complejo" },
                { status: 400 }
            );
        }

        // 3. Verificar conflictos con reservas existentes
        const { data: reservasExistentes, error: errorReservas } = await db
            .from("reservas")
            .select("horas")
            .eq("id_cancha", id_cancha)
            .eq("fecha", fecha);

        if (errorReservas) {
            return NextResponse.json(
                { error: "Error al verificar disponibilidad" },
                { status: 500 }
            );
        }

        const horasOcupadas = reservasExistentes
            .flatMap((r) => r.horas)
            .map((h) => h.toString());

        const conflicto = horas.some((h) => horasOcupadas.includes(h));
        if (conflicto) {
            return NextResponse.json(
                { error: "Una o más horas ya están ocupadas" },
                { status: 409 }
            );
        }

        // 4. Insertar la reserva
        const { error: insertError } = await db.from("reservas").insert({
            id_equipo,
            id_cancha,
            id_complejo,
            fecha,
            horas,
            estado: true, // booleano 'Confirmado'
        });

        if (insertError) {
            return NextResponse.json(
                { error: "Error al registrar la reserva" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (err) {
        console.error("Error en POST /reservas/create:", err);
        return NextResponse.json(
            { error: "Error inesperado del servidor" },
            { status: 500 }
        );
    }
}
