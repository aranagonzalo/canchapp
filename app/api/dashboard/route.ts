import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const id_jugador = req.nextUrl.searchParams.get("id_jugador");

    if (!id_jugador) {
        return NextResponse.json(
            { error: "Falta id_jugador" },
            { status: 400 }
        );
    }

    const fechaLimite = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // 1. Equipos del jugador
    const { data: equipos, error: equiposError } = await db
        .from("equipo")
        .select("*")
        .contains("id_jugadores", [id_jugador]);

    if (equiposError)
        return NextResponse.json(
            { error: "Error al cargar equipos" },
            { status: 500 }
        );

    const idsEquipos = equipos.map((e: any) => e.id_equipo);

    // 2. Reservas de esos equipos
    const { data: reservas, error: reservasError } = await db
        .from("reservas")
        .select(
            "id, fecha, horas, estado, complejo(nombre_complejo, direccion), id_equipo"
        )
        .in("id_equipo", idsEquipos);

    if (reservasError)
        return NextResponse.json(
            { error: "Error al cargar reservas" },
            { status: 500 }
        );

    const totalReservas = reservas.length;
    const reservasUltimos30 = reservas.filter(
        (r) => r.fecha >= fechaLimite
    ).length;

    // 3. Complejos por número de reservas
    const { data: complejos, error: complejosError } = await db
        .rpc("complejos_mas_reservados") // RPC o vista que ordene por count(*) y nombre
        .limit(4);

    if (complejosError)
        return NextResponse.json(
            { error: "Error al cargar complejos" },
            { status: 500 }
        );

    return NextResponse.json({
        reservas: {
            listado: reservas,
            total: totalReservas,
            ultimos_30_dias: reservasUltimos30,
        },
        equipos,
        complejos_recomendados: complejos,
    });
}
