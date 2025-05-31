import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

function isAValidMail(mail: string) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(mail);
}

function isValidPhone(phone: string) {
    return /^\+?[1-9][0-9]{7,14}$/.test(phone);
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;
        const data = await req.json();

        // Validación de correo
        if (!isAValidMail(data.mail)) {
            return NextResponse.json(
                { message: "El correo no es válido." },
                { status: 400 }
            );
        }

        // Validación de teléfono
        if (!isValidPhone(data.telefono)) {
            return NextResponse.json(
                { message: "El teléfono no es válido." },
                { status: 400 }
            );
        }

        // Verificar si el nuevo mail ya está en uso
        if (data.mail !== data.mailViejo) {
            const { data: existingUser } = await db
                .from("login")
                .select("mail")
                .eq("mail", data.mail)
                .single();

            if (existingUser) {
                return NextResponse.json(
                    {
                        message:
                            "El correo ya está registrado por otro usuario.",
                    },
                    { status: 400 }
                );
            }
        }

        // Actualizar tabla jugador
        await db
            .from("jugador")
            .update({
                nombre: data.nombre,
                apellido: data.apellido,
                telefono: data.telefono,
                pierna_habil: data.pierna_habil,
                posicion: data.posicion,
                mail: data.mail,
                sexo: data.sexo,
            })
            .eq("id_jug", id);

        // Actualizar mail en tabla login si cambió
        if (data.mail !== data.mailViejo) {
            await db
                .from("login")
                .update({ mail: data.mail })
                .eq("mail", data.mailViejo);
        }

        return NextResponse.json({
            message: "Perfil actualizado correctamente",
        });
    } catch (error) {
        console.error("Error al actualizar perfil:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
