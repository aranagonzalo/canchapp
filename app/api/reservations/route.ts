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
        // 1. Equipos donde el jugador participa
        const { data: equiposData, error: equiposError } = await db
            .from("equipo")
            .select("id_equipo, nombre_equipo")
            .contains("id_jugadores", [jugadorId]);

        if (equiposError) throw equiposError;

        const id_equipos = equiposData.map((e) => e.id_equipo);

        // 2. Reservas hechas por esos equipos
        const { data: reservasData, error: reservasError } = await db
            .from("reservas")
            .select("*")
            .in("id_equipo", id_equipos);

        if (reservasError) throw reservasError;

        const id_complejos = [
            ...new Set(reservasData.map((r) => r.id_complejo)),
        ];
        const id_canchas = [...new Set(reservasData.map((r) => r.id_cancha))];

        // 3. Obtener información de complejo y cancha
        const { data: complejoData } = await db
            .from("complejo")
            .select("id_complejo, nombre_complejo, direccion, telefono")
            .in("id_complejo", id_complejos);

        const { data: canchaData } = await db
            .from("cancha")
            .select("id_cancha, nombre_cancha")
            .in("id_cancha", id_canchas);

        // 4. Formatear respuesta
        const reservasEnriquecidas = reservasData.map((res) => {
            const equipo = equiposData.find(
                (e) => e.id_equipo === res.id_equipo
            );
            const complejo = complejoData?.find(
                (c) => c.id_complejo === res.id_complejo
            );
            const cancha = canchaData?.find(
                (c) => c.id_cancha === res.id_cancha
            );

            return {
                fecha: res.fecha,
                horas: res.horas, // array de strings: ["08", "09"]
                estado: res.estado, // string o boolean
                nombre_equipo: equipo?.nombre_equipo || "Sin equipo",
                nombre_complejo: complejo?.nombre_complejo || "",
                direccion_complejo: complejo?.direccion || "",
                telefono_complejo: complejo?.telefono || "",
                nombre_cancha: cancha?.nombre_cancha || "",
            };
        });

        return NextResponse.json(reservasEnriquecidas);
    } catch (err) {
        console.error("Error al obtener reservas hechas:", err);
        return NextResponse.json(
            { error: "Error al obtener las reservas hechas" },
            { status: 500 }
        );
    }
}
