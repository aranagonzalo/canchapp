import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

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
    req: NextRequest,
    context: { params: { id_equipo: string; id_jugador: string } }
) {
    const { id_equipo } = context.params;

    const { data: jugadores, error } = await db
        .from("equipo")
        .select("id_jugadores")
        .eq("id_equipo", id_equipo)
        .single();

    if (error || !jugadores?.id_jugadores) {
        console.error("Error al obtener jugadores:", error);
        return NextResponse.json([], { status: 200 });
    }

    const idList = jugadores.id_jugadores.flat();

    const { data: jugadoresDatos, error: err2 } = await db
        .from("jugador")
        .select("*")
        .in("id_jug", idList);

    if (err2) {
        console.error("Error al obtener datos de jugadores:", err2);
        return NextResponse.json([], { status: 200 });
    }

    const jugadoresConEdad = jugadoresDatos.map((jugador) => ({
        ...jugador,
        edad: calcularEdad(jugador.fecha_nac),
    }));

    return NextResponse.json(jugadoresConEdad);
}
