import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
    credentials: {
        client_email: process.env.GCP_CLIENT_EMAIL,
        private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
});

const bucket = storage.bucket(process.env.GCP_BUCKET_NAME!);

export async function GET(req: NextRequest) {
    // Complejos por número de reservas
    const { data: complejos, error: complejosError } = await db
        .rpc("complejos_recomendados")
        .limit(4);

    if (complejosError)
        return NextResponse.json({ error: complejosError }, { status: 500 });

    // Obtener una imagen destacada por cada complejo recomendado
    const complejosConImagenes = await Promise.all(
        complejos.map(async (c: any) => {
            try {
                const [files] = await bucket.getFiles({
                    prefix: `complejos/${c.id_complejo}/`,
                    maxResults: 1,
                });

                const imagen =
                    files.length > 0
                        ? `https://storage.googleapis.com/${bucket.name}/${files[0].name}`
                        : null;

                return {
                    ...c,
                    imagen_destacada: imagen,
                };
            } catch (e) {
                console.error(
                    `Error obteniendo imagen para complejo ${c.id_complejo}`,
                    e
                );
                return { ...c, imagen_destacada: null };
            }
        })
    );

    return NextResponse.json(complejosConImagenes);
}
