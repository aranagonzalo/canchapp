import { NextResponse } from "next/server";
import { db } from "@/lib/supabase"; // Instancia global de Supabase

// Función para calcular edad a partir de la fecha de nacimiento
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

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { data: equipoData, error: equipoError } = await db
            .from("equipo")
            .select("id_jugadores")
            .eq("id_equipo", params.id)
            .single();

        if (equipoError || !equipoData?.id_jugadores) {
            return NextResponse.json(
                { message: "No se encontraron jugadores." },
                { status: 404 }
            );
        }

        const ids = equipoData.id_jugadores;
        const { data: jugadores, error: jugadoresError } = await db
            .from("jugador")
            .select("*")
            .in("id_jug", ids);

        if (jugadoresError) {
            return NextResponse.json(
                { message: "Error al obtener jugadores." },
                { status: 500 }
            );
        }

        const jugadoresConEdad = jugadores.map((jugador) => ({
            ...jugador,
            edad: calcularEdad(jugador.fecha_nac),
        }));

        return NextResponse.json(jugadoresConEdad);
    } catch (error) {
        console.error("Error en jugadores equipo:", error);
        return NextResponse.json(
            { message: "Error interno del servidor." },
            { status: 500 }
        );
    }
}
