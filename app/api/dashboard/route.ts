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
            "id, fecha, horas, is_active, complejo(nombre_complejo, direccion), id_equipo"
        )
        .in("id_equipo", idsEquipos);

    if (reservasError)
        return NextResponse.json({ error: reservasError }, { status: 500 });

    const totalReservas = reservas.length;
    const reservasUltimos30 = reservas.filter(
        (r) => r.fecha >= fechaLimite
    ).length;

    // Hora actual redondeada hacia la siguiente hora (por ejemplo, 17:32 -> 18)
    const ahora = new Date();
    const hoyISO = ahora.toISOString().split("T")[0];
    const horaActual = ahora.getHours() + (ahora.getMinutes() > 0 ? 1 : 0);

    // Próximas reservas
    const reservasProximas = reservas.filter((r) => {
        if (r.fecha > hoyISO) return true;
        if (r.fecha === hoyISO) {
            const primeraHora = parseInt(r.horas[0], 10);
            return primeraHora >= horaActual;
        }
        return false;
    });

    // 3. Complejos por número de reservas
    const { data: complejos, error: complejosError } = await db
        .rpc("complejos_recomendados") // RPC o vista que ordene por count(*) y nombre
        .limit(4);

    if (complejosError)
        return NextResponse.json(
            { error: "Error al cargar complejos" },
            { status: 500 }
        );

    return NextResponse.json({
        reservas: {
            listado: reservasProximas,
            total: totalReservas,
            ultimos_30_dias: reservasUltimos30,
        },
        equipos,
        complejos_recomendados: complejos,
    });
}
