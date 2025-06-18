import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function DELETE(req: NextRequest) {
    try {
        const idParam = req.nextUrl.searchParams.get("id_cierre");

        if (!idParam) {
            return NextResponse.json(
                { message: "Falta el parámetro id_cierre" },
                { status: 400 }
            );
        }

        const id_cierre = parseInt(idParam);
        if (isNaN(id_cierre)) {
            return NextResponse.json(
                { message: "id_cierre no válido" },
                { status: 400 }
            );
        }

        const { error } = await db
            .from("cierres_temporales")
            .delete()
            .eq("id_cierre", id_cierre);

        if (error) {
            console.error("Error al eliminar cierre:", error);
            return NextResponse.json(
                { message: "Error al eliminar cierre temporal" },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: "Cierre eliminado correctamente" },
            { status: 200 }
        );
    } catch (err) {
        console.error("Error inesperado:", err);
        return NextResponse.json(
            { message: "Error del servidor" },
            { status: 500 }
        );
    }
}
