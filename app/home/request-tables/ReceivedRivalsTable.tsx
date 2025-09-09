"use client";

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser } from "@/context/userContext";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { sendEmail } from "@/hooks/sendEmail";
import {
    formatHourRange,
    getInvitacionPartidoEmailTemplate,
} from "@/lib/utils";
import { useNotifications } from "@/hooks";

interface Invitations {
    id: number;
    created_at: string;
    reserva: {
        nombre_cancha: string;
        nombre_complejo: string;
        horas: string[];
        fecha: string;
    };
    nombre_equipo_invitador: string;
    nombre_equipo_destinatario: string;
    id_capitan_invitador: number;
    mail_capitan_invitador: string;
    estado: string;
    comentarios: string;
}

export default function ReceivedInvitationsTable() {
    const { notificar } = useNotifications();
    const { user } = useUser();
    const id = user?.id;
    const [data, setData] = useState<Invitations[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedInvitation, setSelectedInvitation] =
        useState<Invitations | null>(null);
    const [loadingAction, setLoadingAction] = useState(false);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(
                `/api/invitations/rivals/received?id_capitan=${id}`
            );
            const json = await res.json();
            setData(json.invitaciones);
        } catch {
            toast.error("Error al cargar las invitaciones enviadas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    return (
        <Card className="bg-[#1a1f2b] p-5 border border-gray-800">
            <h3 className="text-sm text-gray-400">
                Estos equipos te han invitado a compartir reserva (como rivales)
            </h3>
            {loading ? (
                <div className="flex justify-center py-8 text-white">
                    <LoadingSpinner />
                    <span className="ml-3">Cargando datos...</span>
                </div>
            ) : data.length === 0 ? (
                <p className="text-gray-400 px-4 py-6">
                    No hay datos disponibles.
                </p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-[#1a1f2b]">
                            {[
                                "reserva",
                                "equipo_destinatario",
                                "equipo_invitador",
                                "acción",
                                "fecha_invitacion",
                                "comentarios",
                            ].map((col) => (
                                <TableHead
                                    key={col}
                                    className="text-white capitalize"
                                >
                                    {col.replace("_", " ")}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((entry, i) => (
                            <TableRow key={i} className="hover:bg-gray-900">
                                {/* Columna RESERVA con Popover */}
                                <TableCell className="text-white">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <span className="underline cursor-pointer">
                                                {entry.reserva.nombre_cancha}
                                            </span>
                                        </PopoverTrigger>
                                        <PopoverContent className="bg-[#1f2937] text-white border border-gray-700 text-sm w-64">
                                            <p>
                                                <strong>Predio:</strong>{" "}
                                                {entry.reserva.nombre_complejo}
                                            </p>
                                            <p>
                                                <strong>Cancha:</strong>{" "}
                                                {entry.reserva.nombre_cancha}
                                            </p>
                                            <p>
                                                <strong>Fecha:</strong>{" "}
                                                {entry.reserva.fecha}
                                            </p>
                                            <p>
                                                <strong>Horas:</strong>{" "}
                                                {entry.reserva.horas.join(", ")}
                                            </p>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>

                                {/* Otras columnas */}
                                <TableCell className="text-white">
                                    {entry.nombre_equipo_destinatario}
                                </TableCell>
                                <TableCell className="text-white">
                                    {entry.nombre_equipo_invitador}
                                </TableCell>
                                {entry.estado === "pendiente" ? (
                                    <TableCell className="gap-1 text-white">
                                        <Button
                                            variant="secondary"
                                            className="cursor-pointer"
                                            onClick={() => {
                                                setSelectedInvitation(entry);
                                                setModalOpen(true);
                                            }}
                                        >
                                            Aceptar
                                        </Button>
                                        <Button
                                            variant="link"
                                            className="cursor-pointer text-white"
                                            onClick={() => {
                                                setSelectedInvitation(entry);
                                                setRejectModalOpen(true);
                                            }}
                                        >
                                            Rechazar
                                        </Button>
                                    </TableCell>
                                ) : entry.estado === "rechazada" ? (
                                    <TableCell className="text-red-500">
                                        Rechazada
                                    </TableCell>
                                ) : (
                                    <TableCell className="text-custom-green">
                                        Aceptada
                                    </TableCell>
                                )}
                                <TableCell className="text-white">
                                    {entry.created_at.slice(0, 10)}
                                </TableCell>
                                <TableCell className="text-white">
                                    {entry.comentarios || "-"}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
            {/*modal de aceptacion*/}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="bg-[#1f2937] border border-gray-700 text-white">
                    <DialogHeader>
                        <DialogTitle>¿Aceptar invitación?</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-300">
                        Estás por aceptar la invitación del equipo{" "}
                        <strong>
                            {selectedInvitation?.nombre_equipo_invitador}
                        </strong>
                        .
                        <br />
                        Al aceptar esta solicitud, se te agendará la reserva
                        hecha por el capitán del otro equipo.
                    </div>
                    <DialogFooter className="pt-4 flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setModalOpen(false)}
                            disabled={loadingAction}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="default"
                            onClick={async () => {
                                if (!selectedInvitation) return;
                                console.log(selectedInvitation);
                                setLoadingAction(true);
                                try {
                                    const res = await fetch(
                                        `/api/reservations/update?invitacion_id=${selectedInvitation.id}`,
                                        { method: "POST" }
                                    );
                                    if (!res.ok) throw new Error();
                                    toast.success(
                                        "Invitación aceptada con éxito"
                                    );
                                    // notificar al capitan que invitó que se ha aceptado su invitación.
                                    try {
                                        notificar({
                                            titulo: "¡Invitación de partido aceptada!",
                                            mensaje: `El equipo: '${
                                                selectedInvitation.nombre_equipo_destinatario
                                            }' ha aceptado tu invitación para jugar un partido en ${
                                                selectedInvitation.reserva
                                                    .nombre_complejo
                                            } en la cancha '${
                                                selectedInvitation.reserva
                                                    .nombre_cancha
                                            }' el ${
                                                selectedInvitation.reserva.fecha
                                            } a las ${formatHourRange(
                                                selectedInvitation.reserva.horas
                                            )}`,
                                            url: "/home?tab=solicitudes",
                                            destinatarios: [
                                                {
                                                    id: selectedInvitation.id_capitan_invitador,
                                                    tipo: "jugador",
                                                },
                                            ],
                                        });
                                    } catch (err) {
                                        console.log(err);
                                    }

                                    // enviar notificacion por correo
                                    const html =
                                        getInvitacionPartidoEmailTemplate({
                                            titulo: "¡Invitación de partido aceptada!",
                                            mensaje: `¡Hola! Te saludamos desde CanchApp para notificarte que El equipo: '${
                                                selectedInvitation.nombre_equipo_destinatario
                                            }' ha aceptado tu invitación para jugar un partido en ${
                                                selectedInvitation.reserva
                                                    .nombre_complejo
                                            } en la cancha '${
                                                selectedInvitation.reserva
                                                    .nombre_cancha
                                            }' el ${
                                                selectedInvitation.reserva.fecha
                                            } a las ${formatHourRange(
                                                selectedInvitation.reserva.horas
                                            )}.`,
                                            url: `https://canchapp.vercel.app/home?tab=solicitudes`,
                                        });

                                    try {
                                        await sendEmail({
                                            to: selectedInvitation.mail_capitan_invitador,
                                            subject:
                                                "CanchApp - ¡Invitación de partido aceptada!",
                                            html: html,
                                        });
                                        toast.info(
                                            "Email de notificación enviado."
                                        );
                                    } catch (err) {
                                        console.log(err);
                                    }
                                    fetchData(); // refresca la tabla
                                } catch {
                                    toast.error(
                                        "Error al aceptar la invitación"
                                    );
                                } finally {
                                    setModalOpen(false);
                                    setLoadingAction(false);
                                    setSelectedInvitation(null);
                                }
                            }}
                            disabled={loadingAction}
                        >
                            {loadingAction ? "Aceptando..." : "Aceptar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/*modal de rechazo*/}
            <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
                <DialogContent className="bg-[#1f2937] border border-gray-700 text-white">
                    <DialogHeader>
                        <DialogTitle>¿Rechazar invitación?</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-gray-300">
                        Estás por rechazar la invitación del equipo{" "}
                        <strong>
                            {selectedInvitation?.nombre_equipo_invitador}
                        </strong>
                        .
                        <br />
                        Esta acción no puede ser revertida.
                    </div>
                    <DialogFooter className="pt-4 flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            onClick={() => setModalOpen(false)}
                            disabled={loadingAction}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="default"
                            onClick={async () => {
                                if (!selectedInvitation) return;
                                console.log(selectedInvitation);
                                setLoadingAction(true);
                                try {
                                    const res = await fetch(
                                        `/api/reservations/reject?invitacion_id=${selectedInvitation.id}`,
                                        { method: "POST" }
                                    );
                                    if (!res.ok) throw new Error();
                                    toast.info(
                                        "Invitación rechazada con éxito"
                                    );
                                    // notificar al capitan que invitó que se ha aceptado su invitación.
                                    try {
                                        notificar({
                                            titulo: "Invitación de partido rechazada",
                                            mensaje: `El equipo: '${
                                                selectedInvitation.nombre_equipo_destinatario
                                            }' ha rechazado tu invitación para jugar un partido en ${
                                                selectedInvitation.reserva
                                                    .nombre_complejo
                                            } en la cancha '${
                                                selectedInvitation.reserva
                                                    .nombre_cancha
                                            }' el ${
                                                selectedInvitation.reserva.fecha
                                            } a las ${formatHourRange(
                                                selectedInvitation.reserva.horas
                                            )}`,
                                            url: "/home?tab=solicitudes",
                                            destinatarios: [
                                                {
                                                    id: selectedInvitation.id_capitan_invitador,
                                                    tipo: "jugador",
                                                },
                                            ],
                                        });
                                    } catch (err) {
                                        console.log(err);
                                    }

                                    // enviar notificacion por correo
                                    const html =
                                        getInvitacionPartidoEmailTemplate({
                                            titulo: "Invitación de partido rechazada",
                                            mensaje: `¡Hola! Te saludamos desde CanchApp para notificarte que El equipo: '${
                                                selectedInvitation.nombre_equipo_destinatario
                                            }' ha rechazado tu invitación para jugar un partido en ${
                                                selectedInvitation.reserva
                                                    .nombre_complejo
                                            } en la cancha '${
                                                selectedInvitation.reserva
                                                    .nombre_cancha
                                            }' el ${
                                                selectedInvitation.reserva.fecha
                                            } a las ${formatHourRange(
                                                selectedInvitation.reserva.horas
                                            )}.`,
                                            url: `https://canchapp.vercel.app/home?tab=solicitudes`,
                                        });

                                    try {
                                        await sendEmail({
                                            to: selectedInvitation.mail_capitan_invitador,
                                            subject:
                                                "CanchApp - Invitación de partido rechazada",
                                            html: html,
                                        });
                                        toast.info(
                                            "Email de notificación enviado."
                                        );
                                    } catch (err) {
                                        console.log(err);
                                    }
                                    fetchData(); // refresca la tabla
                                } catch {
                                    toast.error(
                                        "Error al aceptar la invitación"
                                    );
                                } finally {
                                    setRejectModalOpen(false);
                                    setLoadingAction(false);
                                    setSelectedInvitation(null);
                                }
                            }}
                            disabled={loadingAction}
                        >
                            {loadingAction ? "Aceptando..." : "Aceptar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
