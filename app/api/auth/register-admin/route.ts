import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import bcrypt from "bcrypt";

function isValidString(str: string) {
    return (
        typeof str === "string" && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]{3,30}$/.test(str)
    );
}

function isValidEmail(mail: string) {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mail);
}

function isValidPass(pass: string) {
    return (
        typeof pass === "string" &&
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

function isValidDirection(str: string) {
    return /^[a-zA-Z0-9 ]{2,50}$/.test(str);
}

async function existeUsuario(mail: string) {
    const { data } = await db.from("login").select("mail").eq("mail", mail);
    return !!data && data.length > 0;
}

export async function POST(req: Request) {
    try {
        const { complejo, administrador } = await req.json();

        // Validaciones
        const {
            nombreComplejo,
            cuit,
            ciudad,
            direccion,
            telefonoComplejo,
            horarios,
        } = complejo;

        const { nombre, apellido, mail, contrasena, telefono } = administrador;

        const errores: Record<string, string> = {};

        if (!isValidString(nombreComplejo)) {
            errores.nombreComplejo = "Nombre del complejo no válido";
        }
        if (!isValidPhone(cuit)) {
            errores.cuit = "CUIT no válido";
        }
        if (!isValidString(ciudad)) {
            errores.ciudad = "Ciudad no válida";
        }
        if (!isValidDirection(direccion)) {
            errores.direccion = "Dirección no válida";
        }
        if (!isValidPhone(telefonoComplejo)) {
            errores.telefonoComplejo = "Teléfono del complejo no válido";
        }

        if (Object.keys(errores).length > 0) {
            return NextResponse.json(
                { message: "Errores de validación", errores },
                { status: 400 }
            );
        }

        if (
            !isValidString(nombre) ||
            !isValidString(apellido) ||
            !isValidEmail(mail) ||
            !isValidPass(contrasena) ||
            !isValidPhone(telefono)
        ) {
            return NextResponse.json(
                { message: "Datos del administrador no válidos" },
                { status: 400 }
            );
        }

        const yaExiste = await existeUsuario(mail);
        if (yaExiste) {
            return NextResponse.json(
                {
                    message:
                        "Un administrador con ese correo ya está registrado",
                },
                { status: 400 }
            );
        }

        const hash = await bcrypt.hash(contrasena, 5);

        // Insertar en administrador
        const { data: adminData, error: adminError } = await db
            .from("administrador")
            .upsert([
                {
                    nombre,
                    apellido,
                    telefono,
                    mail,
                    contrasena: hash,
                },
            ])
            .select()
            .single();

        if (adminError) {
            console.error("Error administrador:", adminError);
            return NextResponse.json(
                { message: "Error al crear administrador" },
                { status: 500 }
            );
        }

        // Insertar en login
        const { error: loginError } = await db.from("login").upsert([
            {
                mail,
                contrasena: hash,
                tipo: "administrador",
            },
        ]);

        if (loginError) {
            console.error("Error login:", loginError);
            return NextResponse.json(
                { message: "Error al crear login" },
                { status: 500 }
            );
        }

        // Insertar en complejo
        const { data: complejoData, error: complejoError } = await db
            .from("complejo")
            .upsert([
                {
                    nombre_complejo: nombreComplejo,
                    telefono: telefonoComplejo,
                    direccion,
                    cant_canchas: null,
                    ciudad,
                    cuit,
                    id_admin: adminData.id_admin,
                },
            ])
            .select()
            .single();

        if (complejoError) {
            console.error("Error complejo:", complejoError);
            return NextResponse.json(
                { message: "Error al crear complejo" },
                { status: 500 }
            );
        }

        // ✅ Insertar horarios
        if (horarios?.length) {
            const horariosFormateados = horarios.map((h: any) => ({
                id_complejo: complejoData.id_complejo,
                dia_semana: h.dia,
                hora_apertura: h.apertura,
                hora_cierre: h.cierre,
            }));

            const { error: horariosError } = await db
                .from("horarios_complejo")
                .insert(horariosFormateados);

            if (horariosError) {
                console.error("Error horarios:", horariosError);
                return NextResponse.json(
                    { message: "Error al registrar los horarios" },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json(
            { message: "Administrador y complejo creados correctamente" },
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
