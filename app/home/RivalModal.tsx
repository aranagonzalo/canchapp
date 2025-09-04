import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useReservations } from "@/hooks/reservations";
import { Card } from "@/components/ui/card"; // Ajusta si tienes un componente de Card
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, Toaster } from "sonner";
import { useNotifications } from "@/hooks";
import { sendEmail } from "@/hooks/sendEmail";
import {
    formatHourRange,
    getInvitacionPartidoEmailTemplate,
} from "@/lib/utils";

interface RivalModalProps {
    equipo: Equipo;
    open: boolean;
    onClose: () => void;
}

export interface Equipo {
    id_equipo: number;
    nombre_equipo: string;
    cant_jugadores: number;
    mail_capitan: { mail: string };
    estado: string;
    solicitud: string;
    capitan: number;
}

export default function RivalModal({ equipo, open, onClose }: RivalModalProps) {
    const { notificar } = useNotifications();
    const { data, error, isLoading, refetch } = useReservations();
    const [mensajes, setMensajes] = useState<Record<number, string>>({});
    const [sendingByReserva, setSendingByReserva] = useState<
        Record<number, boolean>
    >({});
    const router = useRouter();

    // Redirige al usuario al tab de equipos si no hay reservas
    const handleRedirect = () => {
        router.push("/complexes");
    };

    const onMensajeChange = (id_reserva: number, value: string) => {
        setMensajes((prev) => ({ ...prev, [id_reserva]: value }));
    };

    // Función para manejar la invitación
    const handleInvite = async (res: any) => {
        const { id_reserva, id_equipo } = res;
        const msg = mensajes[id_reserva] ?? "";

        setSendingByReserva((prev) => ({ ...prev, [id_reserva]: true }));
        try {
            const invitationData = {
                id_reserva,
                id_equipo_invitador: id_equipo,
                id_equipo_destinatario: equipo.id_equipo,
                mensaje: msg,
            };

            const response = await fetch(`/api/invitations/create`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(invitationData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Invitación enviada con éxito");
                // limpia solo el mensaje de ESTA card
                setMensajes((prev) => ({ ...prev, [id_reserva]: "" }));
                refetch();

                // notificar al capitan del equipo invitado
                try {
                    notificar({
                        titulo: "Nueva invitación de partido",
                        mensaje: `El equipo: '${
                            res.nombre_equipo
                        }' ha invitado a tu equipo '${
                            equipo.nombre_equipo
                        }' a que jueguen un partido en ${
                            res.nombre_cancha
                        } el ${res.fecha} a las ${formatHourRange(res.horas)}`,
                        url: "/home?tab=solicitudes",
                        destinatarios: [
                            { id: equipo.capitan, tipo: "jugador" },
                        ],
                    });
                } catch (err) {
                    console.log(err);
                }

                // enviar notificacion por correo
                const html = getInvitacionPartidoEmailTemplate({
                    titulo: "Nueva Invitación de Partido",
                    mensaje: `¡Hola! Te saludamos desde CanchApp para notificarte que el equipo '${
                        res.nombre_equipo
                    }' ha invitado a tu equipo '${
                        equipo.nombre_equipo
                    }' a que jueguen un partido en ${res.nombre_cancha} el ${
                        res.fecha
                    } a las ${formatHourRange(res.horas)}.`,
                    url: `https://canchapp.vercel.app/home?tab=solicitudes`,
                });

                try {
                    await sendEmail({
                        to: equipo.mail_capitan.mail,
                        subject: "CanchApp - ¡Nueva Invitación de Partido!",
                        html: html,
                    });
                    toast.success("¡Email de notificación enviado!");
                } catch (err) {
                    console.log(err);
                }
                onClose();
            } else {
                toast.info(data.message || "Error al enviar la invitación");
            }
        } catch (error) {
            console.error("Error al enviar la invitación:", error);
            toast.error("Error al enviar la invitación");
        } finally {
            setSendingByReserva((prev) => ({ ...prev, [id_reserva]: false }));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <Toaster richColors position="top-right" />
            <DialogContent className="bg-[#0b1120] rounded-lg shadow-lg !max-w-4xl max-h-[90vh] w-full border border-gray-800">
                <DialogClose className="absolute top-4 right-4 text-white cursor-pointer z-30 hover:text-gray-300">
                    <X className="z-20 h-5 w-5 text-white" />
                </DialogClose>
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Invitar a un Equipo Rival
                    </DialogTitle>
                    <DialogDescription className="text-gray-400 w-[60%]">
                        Invita al equipo:{" "}
                        <span className="font-bold text-custom-green">
                            {equipo.nombre_equipo} ({equipo.cant_jugadores}{" "}
                            jugadores)
                        </span>{" "}
                        a jugar en una cancha que haya reservado alguno de los
                        equipos de los que eres capitán.
                    </DialogDescription>
                </DialogHeader>

                {/* Condicional para mostrar el estado de la carga */}
                <div className="mt-0 border-t border-gray-800">
                    {isLoading && <p className="text-gray-300">Cargando...</p>}

                    {error && (
                        <p className="text-red-500">
                            Error al cargar las reservas
                        </p>
                    )}

                    {!isLoading && !error && (!data || data.length === 0) && (
                        <p className="text-gray-300 text-center text-sm">
                            Parece que no tienes reservas. ¿Te gustaría crear
                            una?
                        </p>
                    )}

                    {/* Mostrar las reservas como tarjetas si hay datos */}
                    {data && data.length > 0 && (
                        <div>
                            <h3 className="text-sm text-gray-400 mt-2 mb-4">
                                Reservas hechas por equipos donde soy capitán:
                            </h3>
                            <div className="overflow-auto max-h-[50vh] pb-4 grid grid-cols-2 gap-4">
                                {data.map((res: any) => (
                                    <Card
                                        key={res.id_reserva}
                                        className="gap-2 mb-4 p-4 bg-gradient-to-br from-[#1a1f2b] via-[#1a1f2b] to-custom-dark-green/20 border-custom-dark-green/20 rounded-lg text-gray-300 text-sm"
                                    >
                                        <p>
                                            <strong>Mi Equipo:</strong>{" "}
                                            {res.nombre_equipo}
                                        </p>
                                        <p className="text-custom-green">
                                            <strong>Rival a invitar:</strong>{" "}
                                            {equipo.nombre_equipo}{" "}
                                        </p>
                                        <p>
                                            <strong>Cancha:</strong>{" "}
                                            {res.nombre_cancha}
                                        </p>
                                        <p>
                                            <strong>Fecha:</strong> {res.fecha}
                                        </p>
                                        <p>
                                            <strong>Hora:</strong>{" "}
                                            {formatHourRange(res.horas)}
                                        </p>
                                        <p>
                                            <strong>Estado:</strong>{" "}
                                            {res.is_active
                                                ? "Activa"
                                                : "Inactiva"}
                                        </p>
                                        <p>
                                            <strong>Dirección:</strong>{" "}
                                            {res.direccion_complejo}
                                        </p>
                                        <Label>Mensaje: </Label>
                                        <Input
                                            className="border border-gray-600 bg-black/[0.1]"
                                            value={
                                                mensajes[res.id_reserva] ?? ""
                                            }
                                            onChange={(e) =>
                                                onMensajeChange(
                                                    res.id_reserva,
                                                    e.target.value
                                                )
                                            }
                                            disabled={
                                                !!sendingByReserva[
                                                    res.id_reserva
                                                ]
                                            }
                                        />

                                        <Button
                                            onClick={() => handleInvite(res)}
                                            disabled={
                                                !!sendingByReserva[
                                                    res.id_reserva
                                                ]
                                            }
                                            variant="secondary"
                                            className="mt-4 cursor-pointer"
                                        >
                                            {sendingByReserva[res.id_reserva]
                                                ? "Enviando..."
                                                : "Invitar Rival a mi Reserva"}
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Si no hay reservas, mostrar un botón para crear una */}
                {!isLoading && !error && !data?.length && (
                    <div className="text-center">
                        <Button
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={handleRedirect}
                        >
                            Crear Reserva
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
