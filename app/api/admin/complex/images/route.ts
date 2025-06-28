import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    },
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id_complejo = searchParams.get("id_complejo");

        if (!id_complejo) {
            return NextResponse.json({ error: "Falta ID" }, { status: 400 });
        }

        const [files] = await bucket.getFiles({
            prefix: `complejos/${id_complejo}/`,
        });

        const urls = files.map((file) => ({
            name: file.name,
            url: `https://storage.googleapis.com/${bucket.name}/${file.name}`,
        }));

        return NextResponse.json({ images: urls });
    } catch (error) {
        console.error("Error al listar imágenes:", error);
        return NextResponse.json(
            { error: "Error al obtener imágenes" },
            { status: 500 }
        );
    }
}
