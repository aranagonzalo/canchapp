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

export async function DELETE(req: NextRequest) {
    try {
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json(
                { error: "Falta nombre del archivo" },
                { status: 400 }
            );
        }

        console.log(name);

        await bucket.file(name).delete();

        return NextResponse.json({ status: "Eliminada" });
    } catch (error) {
        console.error("Error al eliminar imagen:", error);
        return NextResponse.json(
            { error: "No se pudo eliminar" },
            { status: 500 }
        );
    }
}
