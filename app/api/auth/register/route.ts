import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import bcrypt from "bcrypt";

// Helpers
function isValidString(str: string) {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/;
    return (
        typeof str === "string" &&
        str.length >= 3 &&
        str.length <= 20 &&
        regex.test(str)
    );
}

function isValidEmail(mail: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(mail);
}

function isValidPass(pass: string) {
    return (
        pass.length >= 8 &&
        pass.length <= 20 &&
        /[A-Z]/.test(pass) &&
        /[a-z]/.test(pass) &&
        /[0-9]/.test(pass)
    );
}

function isValidPhone(phone: string) {
    return /^\+?[1-9][0-9]{7,14}$/.test(phone);
}

async function jugadorExiste(mail: string) {
    const { data } = await db.from("login").select("mail").eq("mail", mail);
    return !!data && data.length > 0;
}

export async function POST(req: Request) {
    try {
        const data = await req.json();

        const {
            nombre,
            apellido,
            fecha_nac,
            telefono,
            mail,
            contrasena,
            posicion,
            pierna_habil,
            sexo,
            email,
            email2,
            password,
            password2,
        } = data;

        // Validaciones básicas
        if (email !== email2) {
            return NextResponse.json(
                { message: "Los correos no coinciden" },
                { status: 400 }
            );
        }
        if (password !== password2) {
            return NextResponse.json(
                { message: "Las contraseñas no coinciden" },
                { status: 400 }
            );
        }
        if (!isValidString(nombre)) {
            return NextResponse.json(
                { message: "Nombre no válido" },
                { status: 400 }
            );
        }
        if (!isValidString(apellido)) {
            return NextResponse.json(
                { message: "Apellido no válido" },
                { status: 400 }
            );
        }
        if (!isValidEmail(mail)) {
            return NextResponse.json(
                { message: "Correo no válido" },
                { status: 400 }
            );
        }
        if (!isValidPass(contrasena)) {
            return NextResponse.json(
                { message: "Contraseña débil" },
                { status: 400 }
            );
        }
        if (!isValidPhone(telefono)) {
            return NextResponse.json(
                { message: "Teléfono no válido" },
                { status: 400 }
            );
        }

        // Revisar si ya existe
        const exists = await jugadorExiste(mail);
        if (exists) {
            return NextResponse.json(
                { message: "El jugador ya está registrado" },
                { status: 400 }
            );
        }

        const hashed = await bcrypt.hash(contrasena, 5);

        // Insertar jugador
        const { error: jugadorError } = await db.from("jugador").insert([
            {
                nombre,
                apellido,
                fecha_nac,
                telefono,
                mail,
                contrasena: hashed,
                posicion,
                pierna_habil,
                sexo,
            },
        ]);

        if (jugadorError) {
            console.error("Error al crear jugador:", jugadorError);
            return NextResponse.json(
                { message: "Error al crear jugador" },
                { status: 500 }
            );
        }

        // Insertar login
        const { error: loginError } = await db.from("login").insert([
            {
                mail,
                contrasena: hashed,
                tipo: "jugador",
            },
        ]);

        if (loginError) {
            console.error("Error al crear login:", loginError);
            return NextResponse.json(
                { message: "Error al crear login" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Usuario creado correctamente" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error inesperado:", err);
        return NextResponse.json(
            { message: "Error del servidor" },
            { status: 500 }
        );
    }
}
