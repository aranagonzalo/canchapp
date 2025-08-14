"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useNotifications } from "@/hooks";
import { sendEmail } from "@/hooks/sendEmail";
import { useUser } from "@/context/userContext";
import {
    formatHourRange,
    formatPhoneForWhatsApp,
    getReservaEmailTemplate,
    reservaExpirada,
} from "@/lib/utils";

interface Props {
    show: boolean;
    onHide: () => void;
    nuevaReserva: Reserva;
    onCancel: () => void;
}

interface EquipoRef {
    id_equipo: number;
    nombre_equipo: string;
}

interface Reserva {
    id: number;
    id_admin: number | null;

    nombre_complejo: string;
    direccion_complejo: string;
    telefono_complejo: string;
    nombre_cancha: string;

    // ya NO hay id_admin ni id
    mail_admin: string | null;

    fecha: string;
    horas: string[];
    is_active: boolean;

    // nuevo formato
    equipoCreador: EquipoRef | null;
    equipoInvitado: EquipoRef | null;
}

export default function ReservationModal({
    show,
    onHide,
    nuevaReserva,
    onCancel,
}: Props) {
    const [loading, setLoading] = useState(false);
    const { notificar } = useNotifications();
    const { user } = useUser();

    const cancelarReserva = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reservations/delete`, {
                method: "DELETE",
                body: JSON.stringify({ id: nuevaReserva.id }),
            });

            if (!res.ok) throw new Error("Falló la cancelación");
            // notificar al administrador
            try {
                notificar({
                    titulo: "Reserva Cancelada",
                    mensaje: `${user?.nombre} ha cancelado una reserva en ${
                        nuevaReserva?.nombre_cancha
                    } el ${nuevaReserva?.fecha} a las ${formatHourRange(
                        nuevaReserva?.horas!
                    )}`,
                    url: "/admin/reservas",
                    destinatarios: [
                        { id: nuevaReserva.id_admin!, tipo: "administrador" },
                    ],
                });
            } catch (err) {
                console.log(err);
            }
            // enviar notificacion por correo
            const html = getReservaEmailTemplate({
                titulo: "Reserva Cancelada",
                mensaje: `¡Hola! Te saludamos desde CanchApp para notificarte que ${
                    user?.nombre
                } ha cancelado una reserva en ${
                    nuevaReserva?.nombre_cancha
                } el ${nuevaReserva?.fecha} a las ${formatHourRange(
                    nuevaReserva?.horas!
                )}.`,
                url: `https://canchapp.vercel.app/admin/reservas`,
            });

            try {
                await sendEmail({
                    to: nuevaReserva?.mail_admin!,
                    subject: "CanchApp - Reserva Cancelada",
                    html: html,
                });
            } catch (err) {
                console.log(err);
            }
            toast.success("Reserva cancelada");
            onCancel();
            onHide();
        } catch (err) {
            toast.error("No se pudo cancelar la reserva.");
        } finally {
            setLoading(false);
        }
    };

    if (!nuevaReserva) return null;

    return (
        <Dialog open={show} onOpenChange={onHide}>
            <DialogContent className="bg-[#1a1f2b] border border-slate-700 text-white">
                <DialogHeader>
                    <DialogTitle>Detalles de la Reserva</DialogTitle>
                </DialogHeader>

                <div className="space-y-2 text-sm">
                    <p>
                        <strong>Predio:</strong> {nuevaReserva.nombre_complejo}
                    </p>
                    <p>
                        <strong>Cancha:</strong> {nuevaReserva.nombre_cancha}
                    </p>
                    <p>
                        <strong>Dirección:</strong>{" "}
                        {nuevaReserva.direccion_complejo}
                    </p>
                    <p>
                        <strong>Teléfono:</strong>{" "}
                        {nuevaReserva.telefono_complejo}
                    </p>
                    <p>
                        <strong>Fecha:</strong> {nuevaReserva.fecha}
                    </p>
                    <p>
                        <strong>Horas:</strong>{" "}
                        {nuevaReserva.horas.map((h: string, i: number) => {
                            const start = h.padStart(2, "0") + ":00";
                            const end =
                                (parseInt(h) + 1).toString().padStart(2, "0") +
                                ":00";
                            return `${start} - ${end}${
                                i < nuevaReserva.horas.length - 1 ? ", " : ""
                            }`;
                        })}
                    </p>
                    <p className="mt-4 bg-custom-dark-green text-white p-2 rounded">
                        <strong>Equipo que reservó: </strong>
                        {nuevaReserva.equipoCreador?.nombre_equipo}
                    </p>
                    {nuevaReserva.equipoInvitado && (
                        <>
                            <p className="w-full text-center text-xs font-bold text-gray-400">
                                VS
                            </p>
                            <p className="bg-custom-green text-white p-2 rounded">
                                <strong>Equipo invitado: </strong>
                                {nuevaReserva.equipoInvitado?.nombre_equipo}
                            </p>
                        </>
                    )}
                </div>

                <DialogFooter className="mt-4 items-center flex gap-3">
                    {nuevaReserva.is_active &&
                        !reservaExpirada(nuevaReserva) && (
                            <a
                                href={`https://wa.me/${formatPhoneForWhatsApp(
                                    nuevaReserva.telefono_complejo
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-fit font-medium flex gap-2 bg-[#1b8d4a] hover:bg-[#007933] justify-center items-center text-white px-2.5 py-2 rounded-md text-[13px] tracking-normal transition"
                            >
                                <img src="/whatsapp.png" className="w-5 h-5" />{" "}
                                Contactar predio por WhatsApp
                            </a>
                        )}
                    {nuevaReserva.is_active &&
                        !reservaExpirada(nuevaReserva) && (
                            <Button
                                onClick={cancelarReserva}
                                className="cursor-pointer bg-red-600 hover:bg-red-700 text-white"
                                disabled={loading}
                            >
                                {loading ? "Cancelando..." : "Cancelar Reserva"}
                            </Button>
                        )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
