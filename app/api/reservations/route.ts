import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
        return NextResponse.json(
            { error: "Falta el parámetro 'id'" },
            { status: 400 }
        );
    }

    const jugadorId = parseInt(id);

    try {
        // Equipos donde el jugador participa
        const { data: equiposData, error: equiposError } = await db
            .from("equipo")
            .select("id_equipo, nombre_equipo")
            .contains("id_jugadores", [jugadorId]);

        if (equiposError) throw equiposError;

        const id_equipos = equiposData.map((e) => e.id_equipo);

        const { data: reservasData, error: reservasError } = await db
            .from("reservas")
            .select("*")
            .in("id_equipo", id_equipos);

        if (reservasError) throw reservasError;

        const id_agendas = [
            ...new Set(
                reservasData
                    .filter((r) => r.id_agenda !== null)
                    .map((r) => r.id_agenda)
            ),
        ];

        const { data: agendaData, error: agendaError } = await db
            .from("agenda")
            .select("*")
            .in("id_agenda", id_agendas);

        if (agendaError) throw agendaError;

        const id_complejos = [
            ...new Set(
                agendaData
                    .filter((a) => a.id_complejo !== null)
                    .map((a) => a.id_complejo)
            ),
        ];
        const id_canchas = [
            ...new Set(
                agendaData
                    .filter((a) => a.id_cancha !== null)
                    .map((a) => a.id_cancha)
            ),
        ];

        const { data: complejoData } = await db
            .from("complejo")
            .select("*")
            .in("id_complejo", id_complejos);

        const { data: canchaData } = await db
            .from("cancha")
            .select("*")
            .in("id_cancha", id_canchas);

        const agendaEnriquecida = agendaData.map((item) => {
            const equipo = equiposData.find(
                (e) => e.id_equipo === item.id_equipo
            );
            const complejo = complejoData!.find(
                (c) => c.id_complejo === item.id_complejo
            );
            const cancha = canchaData!.find(
                (c) => c.id_cancha === item.id_cancha
            );

            return {
                fecha: item.fecha,
                hora: item.hora,
                estado: item.disponibilidad,
                nombre_equipo: equipo?.nombre_equipo || "Sin equipo",
                nombre_complejo: complejo?.nombre_complejo || "",
                direccion_complejo: complejo?.direccion || "",
                telefono_complejo: complejo?.telefono || "",
                nombre_cancha: cancha?.nombre_cancha || "",
            };
        });

        return NextResponse.json(agendaEnriquecida);
    } catch (err) {
        console.error("Error al obtener reservas hechas:", err);
        return NextResponse.json(
            { error: "Error al obtener las reservas hechas" },
            { status: 500 }
        );
    }
}
