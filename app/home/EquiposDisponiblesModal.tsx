"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Jugador } from "./Players";
import { getSolicitudEmailTemplate } from "@/lib/utils";
import { useNotifications } from "@/hooks";
import { sendEmail } from "@/hooks/sendEmail";

export interface Equipo {
    id_equipo: number;
    nombre_equipo: string;
    cant_jugadores: number;
    estado: string;
    solicitud: string;
    capitan: number;
}

interface EquiposDisponiblesModalProps {
    open: boolean;
    onClose: () => void;
    equipos: Equipo[];
    jugador: Jugador;
    id_capitan: number;
    refetchEquipos: () => void;
}

export default function EquiposDisponiblesModal({
    open,
    onClose,
    equipos,
    jugador,
    id_capitan,
    refetchEquipos,
}: EquiposDisponiblesModalProps) {
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const { notificar } = useNotifications();

    const handleEnviarInvitacion = async (equipo: Equipo) => {
        setLoadingId(equipo.id_equipo);

        try {
            if (equipo.estado === "Pendiente") {
                // Lógica de CANCELAR invitación
                const res = await fetch(
                    `/api/invitations/delete?id_jugador=${jugador.id_jug}&id_equipo=${equipo.id_equipo}`,
                    { method: "DELETE" }
                );

                const result = await res.json();
                if (res.ok) {
                    // notificar al jugador que se le ha cancelado una invitacion
                    try {
                        notificar({
                            titulo: "Cancelación de invitación",
                            mensaje: `El capitán del equipo: "${equipo.nombre_equipo}" ha cancelado la invitación para que te sumes a su equipo.`,
                            url: "/home?tab=solicitudes",
                            destinatarios: [
                                { id: jugador.id_jug, tipo: "jugador" },
                            ],
                        });
                    } catch (err) {
                        console.log(err);
                    }

                    // enviar notificacion por correo
                    const html = getSolicitudEmailTemplate({
                        titulo: "Cancelación de invitación",
                        mensaje: `¡Hola! Te saludamos desde CanchApp para notificarte que el capitán del equipo: "${equipo.nombre_equipo}" ha cancelado la invitación para que te sumes a su equipo.`,
                        url: `https://canchapp.vercel.app/home?tab=solicitudes`,
                    });

                    try {
                        await sendEmail({
                            to: jugador.mail,
                            subject:
                                "CanchApp - Cancelación de invitación a equipo",
                            html: html,
                        });
                    } catch (err) {
                        console.log(err);
                    }
                }
                toast.success(result.message || "Invitación cancelada");
            } else {
                // Lógica de ENVIAR invitación
                const res = await fetch("/api/invitations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id_jugador: jugador.id_jug,
                        id_equipo: equipo.id_equipo,
                        id_capitan,
                    }),
                });

                const result = await res.json();
                if (res.ok) {
                    // notificar al jugador que se le ha invitado a unirse a un equipo
                    try {
                        notificar({
                            titulo: "Nueva invitación a equipo",
                            mensaje: `El capitán del equipo: "${equipo.nombre_equipo}" te ha invitado a que te sumes a su equipo.`,
                            url: "/home?tab=solicitudes",
                            destinatarios: [
                                { id: jugador.id_jug, tipo: "jugador" },
                            ],
                        });
                    } catch (err) {
                        console.log(err);
                    }

                    // enviar notificacion por correo
                    const html = getSolicitudEmailTemplate({
                        titulo: "Nueva invitación a equipo",
                        mensaje: `¡Hola! Te saludamos desde CanchApp para notificarte que el capitán del equipo: "${equipo.nombre_equipo}" te ha invitado a que te sumes a su equipo.`,
                        url: `https://canchapp.vercel.app/home?tab=solicitudes`,
                    });

                    try {
                        await sendEmail({
                            to: jugador.mail,
                            subject: "CanchApp - Nueva invitación a equipo",
                            html: html,
                        });
                    } catch (err) {
                        console.log(err);
                    }
                }
                toast.success(result.message || "Invitación enviada");
            }

            await refetchEquipos();
        } catch (error) {
            toast.error("Error al procesar la solicitud.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-[#0b1120] rounded-lg shadow-lg !max-w-4xl max-h-[90vh] w-full border border-slate-800">
                <DialogClose className="absolute top-4 right-4 text-white cursor-pointer z-30 hover:text-gray-300">
                    <X className="z-20 h-5 w-5 text-white" />
                </DialogClose>
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Equipos Disponibles
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Elige alguno de tus equipos para invitar al jugador
                        seleccionado.
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-800 text-white sticky top-0 z-10">
                            <TableRow className="hover:bg-slate-800 transition-colors border-b border-slate-700 h-12">
                                <TableHead className="text-white">
                                    Nombre del Equipo
                                </TableHead>
                                <TableHead className="text-white">
                                    Cantidad de Jugadores
                                </TableHead>
                                <TableHead className="text-white">
                                    Solicitud
                                </TableHead>
                                <TableHead className="text-white">
                                    Estado
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipos.map((equipo) => (
                                <TableRow
                                    key={equipo.id_equipo}
                                    className="hover:bg-[#0b1120] transition-colors border-b border-slate-700"
                                >
                                    <TableCell className="text-white">
                                        {equipo.nombre_equipo}
                                    </TableCell>
                                    <TableCell className="text-white">
                                        {equipo.cant_jugadores}/14
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            className={
                                                equipo.estado === "Pendiente"
                                                    ? "bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 cursor-pointer"
                                                    : "bg-gradient-to-r from-custom-dark-green to-custom-green cursor-pointer hover:from-emerald-700 hover:to-emerald-600 text-white text-xs px-3 py-1"
                                            }
                                            onClick={() =>
                                                handleEnviarInvitacion(equipo)
                                            }
                                            disabled={
                                                loadingId === equipo.id_equipo
                                            }
                                        >
                                            {loadingId === equipo.id_equipo ? (
                                                <LoadingSpinner />
                                            ) : equipo.estado ===
                                              "Pendiente" ? (
                                                "Cancelar invitación"
                                            ) : (
                                                "Enviar invitación"
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="text-white">
                                        {equipo.estado}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
