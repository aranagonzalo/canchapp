import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Configura tu bucket
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
});
const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const nombre_cancha = formData.get("nombre_cancha") as string;
        const techo = formData.get("techo") === "true";
        const precio_turno = Number(formData.get("precio_turno"));
        const cant_jugador = Number(formData.get("cant_jugador"));
        const id_complejo = Number(formData.get("id_complejo"));
        const file = formData.get("imagen") as File | null;

        let imageUrl: string | null = null;

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = path.extname(file.name) || ".jpg";
            const filename = `canchas/${uuidv4()}${ext}`;
            const blob = bucket.file(filename);

            await blob.save(buffer, {
                contentType: file.type,
                resumable: false,
                metadata: {
                    cacheControl: "public, max-age=31536000",
                },
            });

            imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        }

        // Insertar en Supabase
        const { error: insertError } = await db.from("cancha").insert({
            id_complejo,
            cant_jugador,
            techo,
            nombre_cancha,
            precio_turno,
            imagen: imageUrl,
        });

        if (insertError) {
            console.error("Error al insertar cancha:", insertError);
            return NextResponse.json(
                { message: "Error al crear la cancha" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            Status: "Respuesta ok",
        });
    } catch (error) {
        console.error("Error en POST /api/cancha:", error);
        return NextResponse.json(
            { message: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
