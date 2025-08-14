import { db } from "@/lib/supabase";
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
    const id_jugador = req.nextUrl.searchParams.get("id_jugador");

    if (!id_jugador) {
        return NextResponse.json(
            { error: "Falta id_jugador" },
            { status: 400 }
        );
    }

    const fechaLimite = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

    // 1. Equipos del jugador
    const { data: equipos, error: equiposError } = await db
        .from("equipo")
        .select("*")
        .contains("id_jugadores", [id_jugador]);

    if (equiposError)
        return NextResponse.json(
            { error: "Error al cargar equipos" },
            { status: 500 }
        );

    const idsEquipos = equipos.map((e: any) => e.id_equipo);

    // 2. Reservas de esos equipos
    const { data: reservas, error: reservasError } = await db
        .from("reserva_equipo")
        .select(
            `
        reservas:reservas (
            id,
            fecha,
            horas,
            is_active,
            complejo (
                nombre_complejo,
                direccion
            )
        )
    `
        )
        .in("id_equipo", idsEquipos);

    if (reservasError)
        return NextResponse.json({ error: reservasError }, { status: 500 });

    const reservasPlanas = reservas.map((r: any) => r.reservas);
    const totalReservas = reservasPlanas.length;

    const reservasUltimos30 = reservasPlanas.filter(
        (r) => r.fecha >= fechaLimite
    ).length;

    // Hora actual redondeada hacia la siguiente hora (por ejemplo, 17:32 -> 18)
    const ahora = new Date();
    const hoyISO = ahora.toISOString().split("T")[0];
    const horaActual = ahora.getHours() + (ahora.getMinutes() > 0 ? 1 : 0);

    // Próximas reservas
    const reservasProximas = reservasPlanas.filter((r) => {
        if (r.fecha > hoyISO) return true;
        if (r.fecha === hoyISO) {
            const primeraHora = parseInt(r.horas[0], 10);
            return primeraHora >= horaActual;
        }
        return false;
    });

    // 3. Complejos por número de reservas
    const { data: complejos, error: complejosError } = await db
        .rpc("complejos_recomendados") // RPC o vista que ordene por count(*) y nombre
        .limit(4);

    if (complejosError)
        return NextResponse.json(
            { error: "Error al cargar complejos" },
            { status: 500 }
        );

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

    // 4. Reseñas del jugador
    const { data: reseñas, error: reseñasError } = await db
        .from("reviews_complejo")
        .select("puntuacion")
        .eq("id_jugador", id_jugador);

    if (reseñasError)
        return NextResponse.json(
            { error: "Error al cargar reseñas" },
            { status: 500 }
        );

    const totalReseñas = reseñas.length;
    const promedioPuntaje =
        totalReseñas > 0
            ? Number(
                  (
                      reseñas.reduce((sum, r) => sum + r.puntuacion, 0) /
                      totalReseñas
                  ).toFixed(1)
              )
            : 0.0;

    return NextResponse.json({
        reservas: {
            listado: reservasProximas,
            total: totalReservas,
            ultimos_30_dias: reservasUltimos30,
        },
        equipos,
        complejos_recomendados: complejosConImagenes,
        reviews: {
            cantidad: totalReseñas,
            promedio_puntaje: promedioPuntaje,
        },
    });
}
