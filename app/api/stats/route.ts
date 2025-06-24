import { db } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const [
            { count: complejos },
            { count: canchas },
            { count: usuarios },
            { count: reservas },
        ] = await Promise.all([
            db.from("complejo").select("*", { count: "exact", head: true }),
            db.from("cancha").select("*", { count: "exact", head: true }),
            db.from("login").select("*", { count: "exact", head: true }),
            db.from("reservas").select("*", { count: "exact", head: true }),
        ]);

        return NextResponse.json({
            complejos,
            canchas,
            usuarios,
            reservas,
        });
    } catch (err) {
        console.error("Error al obtener estadísticas:", err);
        return NextResponse.json(
            { error: "Error al obtener estadísticas" },
            { status: 500 }
        );
    }
}
