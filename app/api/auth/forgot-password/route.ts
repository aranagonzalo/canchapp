// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/hooks/sendEmail"; // tu helper de correos
import { getResetTemplate } from "@/lib/utils";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    const { email } = await req.json();
    if (!email) {
        return NextResponse.json(
            { message: "Email requerido" },
            { status: 400 }
        );
    }

    // Busca usuario
    // Busca el registro en login (no en usuarios)
    const { data: loginRow, error: loginError } = await db
        .from("login")
        .select("mail, tipo")
        .eq("mail", email)
        .single();

    if (!loginRow) {
        // Nunca confirmes si existe o no
        return NextResponse.json({ message: "OK" });
    }

    // Ahora identifica si es jugador o admin para usar su id
    let userId = null;

    if (loginRow.tipo === "jugador") {
        const { data: jugador } = await db
            .from("jugador")
            .select("id_jug")
            .eq("mail", email)
            .single();
        userId = jugador?.id_jug;
    } else if (loginRow.tipo === "admin") {
        const { data: admin } = await db
            .from("administrador")
            .select("id_admin")
            .eq("mail", email)
            .single();
        userId = admin?.id_admin;
    }

    if (!userId) {
        return NextResponse.json({ message: "OK" });
    }

    // Continúa igual:
    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await db.from("reset_tokens").upsert({
        mail: loginRow.mail,
        tipo: loginRow.tipo, // opcional, si manejas admins y jugadores
        token,
        expires,
    });

    const resetUrl = `https://canchapp.vercel.app/reset-password?token=${token}`;

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: `"CanchApp" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Recupera tu contraseña",
            html: getResetTemplate({
                titulo: "Recupera tu contraseña",
                mensaje: "Haz click para restablecer tu contraseña.",
                url: resetUrl,
            }),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error al enviar correo:", error);
        return NextResponse.json(
            { error: "Error al enviar el correo" },
            { status: 500 }
        );
    }
}
