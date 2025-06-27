import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    const body = await req.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
        return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
    }

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
            to,
            subject,
            html,
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
