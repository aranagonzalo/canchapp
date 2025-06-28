import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    const { token, password } = await req.json();

    if (!token || !password) {
        return NextResponse.json(
            { message: "Datos faltantes" },
            { status: 400 }
        );
    }

    // Busca token válido
    const { data: tokenRow } = await db
        .from("reset_tokens")
        .select("*")
        .eq("token", token)
        .single();

    if (!tokenRow) {
        return NextResponse.json(
            { message: "Token no válido" },
            { status: 400 }
        );
    }

    // Valida expiración
    if (new Date(tokenRow.expires) < new Date()) {
        return NextResponse.json(
            { message: "Token expirado" },
            { status: 400 }
        );
    }

    // Hashea la nueva contraseña
    const hashed = await bcrypt.hash(password, 10);

    // 1) Actualiza en `login`
    await db
        .from("login")
        .update({ contrasena: hashed })
        .eq("mail", tokenRow.mail);

    // 2) Actualiza en tabla específica
    if (tokenRow.tipo === "jugador") {
        await db
            .from("jugador")
            .update({ contrasena: hashed })
            .eq("mail", tokenRow.mail);
    } else if (tokenRow.tipo === "admin") {
        await db
            .from("administrador")
            .update({ contrasena: hashed })
            .eq("mail", tokenRow.mail);
    }

    // 3) Borra token
    await db.from("reset_tokens").delete().eq("token", token);

    return NextResponse.json({ message: "Contraseña actualizada" });
}
