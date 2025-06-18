import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

function isValidString(str: string) {
    return typeof str === "string" && str.length >= 2 && str.length <= 50;
}

function isValidPhone(str: string) {
    return typeof str === "string" && /^\+?[1-9][0-9]{7,14}$/.test(str);
}

function isValidCUIT(str: string) {
    return typeof str === "string" && /^[0-9]{8,13}$/.test(str);
}

function isValidHourFormat(hour: string) {
    return /^([01]\d|2[0-3]):00$/.test(hour);
}

export async function PUT(req: NextRequest) {
    try {
        const data = await req.json();
        const {
            id_complejo,
            nombre_complejo,
            telefono,
            direccion,
            cant_canchas,
            ciudad,
            cuit,
            descripcion,
            horarios,
        } = data;

        if (!id_complejo || isNaN(Number(id_complejo))) {
            return NextResponse.json(
                { message: "ID de complejo inválido" },
                { status: 400 }
            );
        }

        const errores: Record<string, string> = {};

        if (!isValidString(nombre_complejo))
            errores.nombre_complejo = "Nombre no válido";
        if (!isValidPhone(telefono)) errores.telefono = "Teléfono no válido";
        if (!isValidString(direccion))
            errores.direccion = "Dirección no válida";
        if (!isValidString(ciudad)) errores.ciudad = "Ciudad no válida";
        if (!isValidCUIT(cuit)) errores.cuit = "CUIT no válido";

        if (Object.keys(errores).length > 0) {
            return NextResponse.json(
                { message: "Errores de validación", errores },
                { status: 400 }
            );
        }

        // 1. Actualizar datos del complejo
        const { error: updateError } = await db
            .from("complejo")
            .update({
                nombre_complejo,
                telefono,
                direccion,
                cant_canchas,
                ciudad,
                cuit,
                descripcion: descripcion ?? "",
            })
            .eq("id_complejo", id_complejo);

        if (updateError) {
            console.error("Error al actualizar complejo:", updateError);
            return NextResponse.json(
                { message: "Error al actualizar el complejo" },
                { status: 500 }
            );
        }

        // 2. Reemplazar horarios si vienen
        if (Array.isArray(horarios)) {
            // Eliminar anteriores
            const { error: deleteError } = await db
                .from("horarios_complejo")
                .delete()
                .eq("id_complejo", id_complejo);

            if (deleteError) {
                console.error("Error al eliminar horarios:", deleteError);
                return NextResponse.json(
                    { message: "Error al eliminar horarios anteriores" },
                    { status: 500 }
                );
            }

            // Validar y preparar nuevos
            const nuevosHorarios = horarios
                .filter(
                    (h: any) =>
                        h.dia_semana !== undefined &&
                        isValidHourFormat(h.hora_apertura) &&
                        isValidHourFormat(h.hora_cierre)
                )
                .map((h: any) => ({
                    id_complejo,
                    dia_semana: h.dia_semana,
                    hora_apertura: h.hora_apertura,
                    hora_cierre: h.hora_cierre,
                }));

            if (nuevosHorarios.length > 0) {
                const { error: insertError } = await db
                    .from("horarios_complejo")
                    .insert(nuevosHorarios);

                if (insertError) {
                    console.error("Error al insertar horarios:", insertError);
                    return NextResponse.json(
                        { message: "Error al insertar horarios" },
                        { status: 500 }
                    );
                }
            }
        }

        return NextResponse.json(
            { message: "Complejo y horarios actualizados correctamente" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error PUT complejo:", err);
        return NextResponse.json(
            { message: "Error del servidor" },
            { status: 500 }
        );
    }
}
