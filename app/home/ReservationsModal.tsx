"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";
import { useState } from "react";
import { useNotifications } from "@/hooks";
import { useUser } from "@/context/userContext";
import { formatHourRange } from "@/lib/utils";

interface Props {
    show: boolean;
    onHide: () => void;
    nuevaReserva: Reserva;
    onCancel: () => void;
}

interface Reserva {
    nombre_complejo: string;
    direccion_complejo: string;
    telefono_complejo: string;
    nombre_cancha: string;
    id_admin: number;
    fecha: string;
    horas: string[];
    nombre_equipo?: string;
    id: number;
    is_active: boolean;
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
                    titulo: "Reserva cancelada",
                    mensaje: `${user?.nombre} ha cancelado una reserva en ${
                        nuevaReserva?.nombre_cancha
                    } el ${nuevaReserva?.fecha} a las ${formatHourRange(
                        nuevaReserva?.horas!
                    )}`,
                    url: "/admin/reservas",
                    destinatarios: [
                        { id: nuevaReserva.id_admin, tipo: "administrador" },
                    ],
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
                        <strong>Complejo:</strong>{" "}
                        {nuevaReserva.nombre_complejo}
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
                        <strong>Fecha:</strong>{" "}
                        {formatDistanceToNow(parseISO(nuevaReserva.fecha), {
                            addSuffix: true,
                            locale: es,
                        })}
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
                    <p>
                        <strong>Equipo:</strong>{" "}
                        {nuevaReserva.nombre_equipo || "No asignado"}
                    </p>
                </div>

                <DialogFooter className="mt-4">
                    {!nuevaReserva.is_active ? null : (
                        <Button
                            onClick={cancelarReserva}
                            className="bg-red-600 hover:bg-red-700 text-white"
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
