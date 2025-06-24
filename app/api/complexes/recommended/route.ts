import { db } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Complejos por número de reservas
    const { data: complejos, error: complejosError } = await db.rpc(
        "complejos_recomendados"
    ); // RPC o vista que ordene por count(*) y nombre

    if (complejosError)
        return NextResponse.json({ error: complejosError }, { status: 500 });

    return NextResponse.json(complejos);
}
