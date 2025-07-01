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
    return /^[a-zA-Z0-9\s#.,\-ºª/áéíóúÁÉÍÓÚñÑ]{5,100}$/.test(str.trim());
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

        const { nombre, apellido, mail, contrasena } = administrador;

        const errores: Record<string, string> = {};

        const mensajes: string[] = [];

        if (!isValidString(nombreComplejo)) {
            const msg =
                "El nombre del complejo debe tener al menos 3 caracteres y solo letras.";
            errores.nombreComplejo = msg;
            mensajes.push(msg);
        }

        if (!isValidPhone(cuit)) {
            const msg = "El CUIT ingresado no es válido.";
            errores.cuit = msg;
            mensajes.push(msg);
        }

        if (!isValidString(ciudad)) {
            const msg =
                "La ciudad debe tener al menos 3 caracteres y solo letras.";
            errores.ciudad = msg;
            mensajes.push(msg);
        }

        if (!isValidDirection(direccion)) {
            const msg =
                "La dirección debe tener mínimo 2 caracteres y puede incluir letras y números.";
            errores.direccion = msg;
            mensajes.push(msg);
        }

        if (!isValidPhone(telefonoComplejo)) {
            const msg =
                "El teléfono del complejo debe tener entre 8 y 14 dígitos, incluye código de país si aplica.";
            errores.telefonoComplejo = msg;
            mensajes.push(msg);
        }

        // Validación de campos de usuario
        if (!isValidString(nombre)) {
            const msg =
                "El nombre debe contener al menos 3 caracteres y solo letras.";
            errores.nombre = msg;
            mensajes.push(msg);
        }

        if (!isValidString(apellido)) {
            const msg =
                "El apellido debe contener al menos 3 caracteres y solo letras.";
            errores.apellido = msg;
            mensajes.push(msg);
        }

        if (!isValidEmail(mail)) {
            const msg = "El correo electrónico ingresado no es válido.";
            errores.mail = msg;
            mensajes.push(msg);
        }

        if (!isValidPass(contrasena)) {
            const msg =
                "La contraseña debe tener entre 8 y 20 caracteres, incluir una mayúscula, una minúscula y un número.";
            errores.contrasena = msg;
            mensajes.push(msg);
        }

        // Si hay errores
        if (mensajes.length > 0) {
            let mensajeFinal = "";

            if (mensajes.length === 1) {
                mensajeFinal = mensajes[0];
            } else {
                const todasMenosUltima = mensajes.slice(0, -1).join(", ");
                const ultima = mensajes[mensajes.length - 1];
                mensajeFinal = `${todasMenosUltima} y ${ultima}`;
            }

            return NextResponse.json(
                {
                    message: mensajeFinal,
                    errores,
                },
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
