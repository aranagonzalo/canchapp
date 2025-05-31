import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const { id, tipo } = data;

        if (!id || !tipo) {
            return NextResponse.json(
                { message: "Faltan datos obligatorios" },
                { status: 400 }
            );
        }

        if (tipo === "administrador") {
            const { data: complejoData, error: complejoError } = await db
                .from("complejo")
                .select("*")
                .eq("id_admin", id)
                .single();

            const { data: adminData, error: adminError } = await db
                .from("administrador")
                .select("contrasena")
                .eq("id_admin", id)
                .single();

            if (complejoError || adminError || !complejoData || !adminData) {
                return NextResponse.json(
                    {
                        message:
                            "No se pudo obtener el perfil del administrador",
                    },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                nombre: complejoData.nombre_complejo,
                direccion: complejoData.direccion,
                telefono: complejoData.telefono,
                contrasena: adminData.contrasena,
            });
        }

        if (tipo === "jugador") {
            const { data: jugadorData, error } = await db
                .from("jugador")
                .select(
                    "nombre, apellido, telefono, pierna_habil, posicion, mail, sexo"
                )
                .eq("id_jug", id)
                .single();

            if (error || !jugadorData) {
                return NextResponse.json(
                    { message: "No se pudo obtener el perfil del jugador" },
                    { status: 500 }
                );
            }

            return NextResponse.json(jugadorData);
        }

        return NextResponse.json({ message: "Tipo inválido" }, { status: 400 });
    } catch (error) {
        console.error("Error en perfil:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
