import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function GET(req: NextRequest) {
    const id_admin = req.nextUrl.searchParams.get("id_admin");
    const id_cancha = req.nextUrl.searchParams.get("id_cancha");

    if (!id_admin) {
        return NextResponse.json({ error: "Falta id_admin" }, { status: 400 });
    }

    const { data: complejo, error: complejoError } = await db
        .from("complejo")
        .select("*")
        .eq("id_admin", id_admin)
        .single();

    if (complejoError || !complejo) {
        return NextResponse.json(
            { error: "No se encontró el complejo del administrador" },
            { status: 404 }
        );
    }

    let reservasQuery = db
        .from("reservas")
        .select(
            `
        id,
        is_active,
        fecha,
        horas,
        id_complejo,
        id_cancha,
        equipo (
            id_equipo,
            nombre_equipo,
            capitan,
            jugador:capitan (
                nombre,
                telefono
            )
        )
    `
        )
        .eq("id_complejo", complejo.id_complejo);

    if (id_cancha) {
        reservasQuery = reservasQuery.eq("id_cancha", id_cancha);
    }

    const { data: reservas, error: reservasError } = await reservasQuery;

    if (reservasError) {
        console.error("Error cargando reservas:", reservasError);
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }

    const eventos = reservas.flatMap((res: any) => {
        return res.horas.map((hora: string, index: number) => {
            const start = `${res.fecha}T${hora}:00:00`;
            const endHour = (parseInt(hora) + 1).toString().padStart(2, "0");
            const end = `${res.fecha}T${endHour}:00:00`;

            return {
                id: res.id,
                title: res.equipo?.nombre_equipo ?? "Sin nombre",
                start,
                end,
                id_equipo: res.equipo?.id_equipo,
                is_active: res.is_active,
                capitan: res.equipo?.jugador?.nombre ?? "Sin nombre",
                telefono: res.equipo?.jugador?.telefono ?? "Sin número",
                estado: res.estado,
            };
        });
    });

    return NextResponse.json(eventos);
}
