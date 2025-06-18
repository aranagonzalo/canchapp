import { useUser } from "@/context/userContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface Notificacion {
    id: number;
    mensaje: string;
    url: string;
    titulo: string;
    leido: boolean;
    created_at: string;
}

export function useNotifications() {
    const { user } = useUser();

    const userId = user?.id;
    const tipo = user?.tipo;

    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        if (!userId) return;
        const res = await fetch(
            `/api/notificaciones?id=${userId}&tipo=${tipo}`
        );
        const data = await res.json();
        setNotificaciones(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 8000);
        return () => clearInterval(interval);
    }, [userId]);

    const hayNoLeidas = notificaciones.some((n) => !n.leido);

    const marcarComoVisto = async (id: number) => {
        await fetch(`/api/notificaciones/marcar-visto?id=${id}`, {
            method: "PATCH",
        });
        fetchNotifications();
    };

    const esperarUser = () =>
        new Promise<{ id: number; tipo: string }>((resolve, reject) => {
            let intentos = 0;
            const maxIntentos = 20;
            const intervalo = setInterval(() => {
                if (user?.id && user?.tipo) {
                    clearInterval(intervalo);
                    resolve({ id: user.id, tipo: user.tipo });
                } else if (++intentos >= maxIntentos) {
                    clearInterval(intervalo);
                    reject("Timeout esperando user");
                }
            }, 200); // intenta cada 200ms (máximo 4s)
        });

    const crearNotificacion = async ({
        titulo,
        mensaje,
        url,
    }: {
        titulo: string;
        mensaje: string;
        url?: string;
    }) => {
        try {
            const { id, tipo } = await esperarUser();

            const res = await fetch(`/api/notificaciones/crear`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_usuario: id,
                    tipo,
                    titulo,
                    mensaje,
                    url: url || null,
                }),
            });

            if (!res.ok) {
                toast.error("Error al crear la notificación");
            } else {
                fetchNotifications();
                toast.success(titulo, {
                    description: mensaje,
                });
            }
        } catch (error) {
            toast.error("No se pudo crear la notificación: " + error);
        }
    };

    return {
        notificaciones,
        hayNoLeidas,
        loading,
        marcarComoVisto,
        notificar: crearNotificacion,
    };
}
