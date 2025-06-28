export const sendEmail = async ({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) => {
    try {
        const res = await fetch(`/api/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to, subject, html }),
        });

        if (!res.ok) throw new Error("Error al enviar correo");

        return { success: true };
    } catch (error) {
        console.error("Error en useEmail:", error);
        return { success: false };
    }
};
