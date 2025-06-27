import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Configuración del bucket
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
});
const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

export async function PUT(req: NextRequest) {
    try {
        const form = await req.formData();

        const id = Number(form.get("id"));
        const nombre_cancha = form.get("nombre_cancha") as string;
        const techo = form.get("techo") === "true";
        const precio_turno = Number(form.get("precio_turno"));
        const cant_jugador = Number(form.get("cant_jugador"));
        const imagenFile = form.get("imagen") as File | null;

        if (
            !id ||
            typeof nombre_cancha !== "string" ||
            isNaN(precio_turno) ||
            isNaN(cant_jugador)
        ) {
            return NextResponse.json(
                { error: "Datos inválidos" },
                { status: 400 }
            );
        }

        let imageUrl: string | null = null;

        // Buscar imagen previa
        const { data: canchaActual, error: fetchError } = await db
            .from("cancha")
            .select("imagen")
            .eq("id_cancha", id)
            .single();

        if (fetchError) {
            console.error(fetchError);
            return NextResponse.json(
                { error: "Error al buscar cancha" },
                { status: 500 }
            );
        }

        if (imagenFile) {
            // Si había imagen previa, borrarla
            if (canchaActual?.imagen) {
                const publicUrl = canchaActual.imagen;
                const parts = publicUrl.split("/");
                const filePath = parts.slice(4).join("/"); // salta https://storage.googleapis.com/bucket-name/
                const oldFile = bucket.file(filePath);
                await oldFile.delete().catch(() => {
                    console.warn(
                        "No se pudo borrar la imagen anterior:",
                        filePath
                    );
                });
            }

            // Subir nueva imagen
            const buffer = Buffer.from(await imagenFile.arrayBuffer());
            const ext = path.extname(imagenFile.name) || ".jpg";
            const filename = `canchas/${uuidv4()}${ext}`;
            const blob = bucket.file(filename);

            await blob.save(buffer, {
                contentType: imagenFile.type,
                resumable: false,
                metadata: {
                    cacheControl: "public, max-age=31536000",
                },
            });

            imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        }

        const fieldsToUpdate: any = {
            nombre_cancha,
            techo,
            precio_turno,
            cant_jugador,
        };

        if (imageUrl) {
            fieldsToUpdate.imagen = imageUrl;
        }

        const { error } = await db
            .from("cancha")
            .update(fieldsToUpdate)
            .eq("id_cancha", id);

        if (error) {
            console.error(error);
            return NextResponse.json(
                { error: "Error al actualizar la cancha" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            status: "Cancha actualizada correctamente",
        });
    } catch (error) {
        console.error("Error en PUT /api/cancha/[id]:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
