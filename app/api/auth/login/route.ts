import { NextResponse } from "next/server";
import { db } from "@/lib/supabase"; // tu instancia global de supabase
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
    try {
        const { mail, pass } = await req.json();

        const { data: loginData } = await db
            .from("login")
            .select("*")
            .eq("mail", mail)
            .single();

        if (!loginData) {
            return NextResponse.json(
                { message: "Correo no registrado" },
                { status: 401 }
            );
        }

        const isValid = bcrypt.compareSync(pass, loginData.contrasena);
        if (!isValid) {
            return NextResponse.json(
                { message: "Credenciales incorrectas" },
                { status: 401 }
            );
        }

        const tipo = loginData.tipo;
        const { data: userData, error: userError } = await db
            .from(tipo)
            .select("*")
            .eq("mail", mail)
            .single();

        if (userError || !userData) {
            return NextResponse.json(
                { message: "No se pudo obtener el usuario" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                nombre: userData.nombre,
                apellido: userData.apellido,
                tipo,
                id: tipo === "jugador" ? userData.id_jug : userData.id_admin,
                mail,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error en login:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
