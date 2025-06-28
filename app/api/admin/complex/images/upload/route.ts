import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll("imagenes") as File[];
        const id_complejo = formData.get("id_complejo");

        if (!files || files.length === 0 || !id_complejo) {
            return NextResponse.json(
                { error: "Faltan archivos o ID" },
                { status: 400 }
            );
        }

        const urls: string[] = [];

        for (const file of files) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const ext = path.extname(file.name) || ".jpg";
            const filename = `complejos/${id_complejo}/${uuidv4()}${ext}`;
            const blob = bucket.file(filename);

            await blob.save(buffer, {
                contentType: file.type,
                resumable: false,
                metadata: {
                    cacheControl: "public, max-age=31536000",
                },
            });

            urls.push(
                `https://storage.googleapis.com/${bucket.name}/${filename}`
            );
        }

        return NextResponse.json({ urls });
    } catch (err) {
        console.error("Error al subir imagen:", err);
        return NextResponse.json({ error: "Error al subir" }, { status: 500 });
    }
}
