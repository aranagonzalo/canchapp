import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { Storage } from "@google-cloud/storage";

// Configura tu instancia de Storage
const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
});
const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const { id_cancha } = body;

        if (!id_cancha) {
            return NextResponse.json(
                { error: "Falta id_cancha" },
                { status: 400 }
            );
        }

        // 1. Obtener la cancha y su imagen
        const { data: cancha, error: canchaError } = await db
            .from("cancha")
            .select("imagen")
            .eq("id_cancha", id_cancha)
            .single();

        if (canchaError || !cancha) {
            return NextResponse.json(
                { error: "Cancha no encontrada" },
                { status: 404 }
            );
        }

        // 2. Eliminar reservas relacionadas
        const { error: errorReservas } = await db
            .from("reservas")
            .delete()
            .eq("id_cancha", id_cancha);

        if (errorReservas) {
            console.error("Error al eliminar reservas:", errorReservas);
            return NextResponse.json(
                { error: "No se pudieron eliminar las reservas" },
                { status: 500 }
            );
        }

        // 3. Eliminar la imagen del bucket si existe
        if (cancha.imagen) {
            const urlParts = cancha.imagen.split("/");
            const filename = urlParts.slice(4).join("/"); // eliminar: https://storage.googleapis.com/[bucket_name]/
            const file = bucket.file(filename);
            try {
                await file.delete();
            } catch (err) {
                console.warn("No se pudo eliminar la imagen del bucket:", err);
                // No detenemos el flujo por esto, solo lo registramos
            }
        }

        // 4. Eliminar la cancha
        const { error: errorCancha } = await db
            .from("cancha")
            .delete()
            .eq("id_cancha", id_cancha);

        if (errorCancha) {
            return NextResponse.json(
                { error: "No se pudo eliminar la cancha" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            status: "Cancha, reservas e imagen eliminadas",
        });
    } catch (error) {
        console.error("Error en DELETE /api/admin/canchas/delete:", error);
        return NextResponse.json(
            { error: "Error interno del servidor" },
            { status: 500 }
        );
    }
}
