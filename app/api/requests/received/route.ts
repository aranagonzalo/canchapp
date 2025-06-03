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
        // 1. Obtener equipos donde participa el jugador
        const { data: equiposData, error: equiposError } = await db
            .from("equipo")
            .select("id_equipo, nombre_equipo")
            .contains("id_jugadores", [jugadorId]);

        if (equiposError) throw equiposError;

        const id_equipos = equiposData.map((e) => e.id_equipo);

        // 2. Obtener solicitudes asociadas a esos equipos
        const { data: solicitudesData, error: solicitudesError } = await db
            .from("solicitudes")
            .select("*")
            .in("id_equipo", id_equipos);

        if (solicitudesError) throw solicitudesError;

        // 3. Filtrar las solicitudes que no sean del jugador mismo
        const solicitudesDeOtros = solicitudesData.filter(
            (s) => s.id_jugador !== jugadorId
        );

        const idJugadores = [
            ...new Set(
                solicitudesDeOtros
                    .filter((s) => s.id_jugador !== null)
                    .map((s) => s.id_jugador)
            ),
        ];

        // 4. Obtener datos de los jugadores solicitantes
        const { data: jugadoresData, error: jugadoresError } = await db
            .from("jugador")
            .select("*")
            .in("id_jug", idJugadores);

        if (jugadoresError) throw jugadoresError;

        // 5. Construir estructura enriquecida
        const solicitudesFinal = solicitudesDeOtros.map((s) => {
            const jugador = jugadoresData.find(
                (j) => j.id_jug === s.id_jugador
            );
            const equipo = equiposData.find((e) => e.id_equipo === s.id_equipo);

            return {
                ...s,
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

        // 6. Filtrar por estado pendiente
        const pendientes = solicitudesFinal.filter(
            (s) => s.estado === "Pendiente"
        );

        return NextResponse.json(pendientes);
    } catch (error) {
        console.error("Error en /api/solicitudes/recibidas:", error);
        return NextResponse.json(
            { error: "Error interno al obtener solicitudes recibidas" },
            { status: 500 }
        );
    }
}
