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
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const id_jugador = parseInt(id);

    if (isNaN(id_jugador)) {
        return NextResponse.json({ message: "ID inválido" }, { status: 400 });
    }

    const { data: jugadores, error } = await db
        .from("jugador")
        .select(
            "id_jug, nombre, apellido, fecha_nac, telefono,mail, posicion, pierna_habil, sexo"
        );

    if (error) {
        console.error("Error al obtener jugadores:", error.message);
        return NextResponse.json(
            { message: "Error al obtener jugadores" },
            { status: 500 }
        );
    }

    const jugadoresConEdad = jugadores.map((jugador) => ({
        ...jugador,
        edad: calcularEdad(jugador.fecha_nac),
    }));

    const jugadoresTotales = jugadoresConEdad.filter(
        (jugador) => jugador.id_jug !== id_jugador
    );

    return NextResponse.json(jugadoresTotales);
}
