import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

function calcularEdad(fechaNacimiento: string): number {
    const fechaActual = new Date();
    const fechaNac = new Date(fechaNacimiento);

    let edad = fechaActual.getFullYear() - fechaNac.getFullYear();
    const mesActual = fechaActual.getMonth();
    const mesNac = fechaNac.getMonth();

    if (
        mesActual < mesNac ||
        (mesActual === mesNac && fechaActual.getDate() < fechaNac.getDate())
    ) {
        edad--;
    }

    return edad;
}

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
        // 1. Obtener todas las invitaciones enviadas por el capitán
        const { data: invitacionesData, error: invitacionesError } = await db
            .from("invitaciones")
            .select("*")
            .eq("id_capitan", jugadorId);

        if (invitacionesError) throw invitacionesError;

        // 2. Obtener IDs únicos de equipos y jugadores invitados
        const idEquipos = [
            ...new Set(
                invitacionesData
                    .filter((i) => i.id_equipo !== null)
                    .map((i) => i.id_equipo)
            ),
        ];
        const idJugadores = [
            ...new Set(
                invitacionesData
                    .filter((i) => i.id_jugador_invitado !== null)
                    .map((i) => i.id_jugador_invitado)
            ),
        ];

        // 3. Obtener datos de equipos y jugadores
        const { data: equipoData, error: equipoError } = await db
            .from("equipo")
            .select("*")
            .in("id_equipo", idEquipos);

        if (equipoError) throw equipoError;

        const { data: jugadoresData, error: jugadoresError } = await db
            .from("jugador")
            .select("*")
            .in("id_jug", idJugadores);

        if (jugadoresError) throw jugadoresError;

        // 4. Enriquecer las invitaciones
        const enriquecidas = invitacionesData.map((inv) => {
            const jugador = jugadoresData.find(
                (j) => j.id_jug === inv.id_jugador_invitado
            );
            const equipo = equipoData.find(
                (e) => e.id_equipo === inv.id_equipo
            );

            return {
                ...inv,
                nombre: jugador?.nombre,
                apellido: jugador?.apellido,
                telefono: jugador?.telefono,
                posicion: jugador?.posicion,
                pierna_habil: jugador?.pierna_habil,
                sexo: jugador?.sexo,
                edad: jugador?.fecha_nac
                    ? calcularEdad(jugador.fecha_nac)
                    : null,
                nombre_equipo: equipo?.nombre_equipo ?? "Equipo no encontrado",
            };
        });

        // 5. Filtrar solo pendientes
        const pendientes = enriquecidas.filter((i) => i.estado === "Pendiente");

        return NextResponse.json(pendientes);
    } catch (error) {
        console.error("Error en /api/invitaciones/enviadas:", error);
        return NextResponse.json(
            { error: "Error interno al obtener invitaciones enviadas" },
            { status: 500 }
        );
    }
}
