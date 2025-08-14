"use client";

import FullCalendar from "@fullcalendar/react";
import esLocale from "@fullcalendar/core/locales/es";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser } from "@/context/userContext";
import { formatPhoneForWhatsApp } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";

interface Reserva {
    id: number;
    title: string;
    start: string;
    end: string;
    id_equipo: number;
    capitan: string;
    telefono: string;
    is_active: boolean;
}

interface Cancha {
    id_cancha: number;
    nombre_cancha: string;
    cant_jugador: number;
    techo: boolean;
    imagen?: string;
    precio_turno: number;
    horarios_disponibles: string[];
}

export default function CalendarioReservas() {
    const { user } = useUser();
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Reserva | null>(null);
    const [canchaSeleccionada, setCanchaSeleccionada] = useState<string | null>(
        null
    );
    const [deleting, setDeleting] = useState(false);

    const fetchCanchas = async () => {
        if (!user?.id) return;
        setLoading(true);
        const res = await fetch(`/api/admin/canchas?id_admin=${user.id}`);
        const data = await res.json();
        const canchasData = data?.canchas || [];
        setCanchas(canchasData);

        if (canchasData.length > 0) {
            setCanchaSeleccionada(canchasData[0].id_cancha.toString());
        }
    };

    useEffect(() => {
        fetchCanchas();
    }, [user]);

    const fetchReservas = async () => {
        if (!user?.id || !canchaSeleccionada) return;
        setLoading(true);
        try {
            const res = await fetch(
                `/api/admin/reservas?id_admin=${user.id}&id_cancha=${canchaSeleccionada}`
            );
            const data = await res.json();
            if (Array.isArray(data)) setReservas(data);
        } catch (err) {
            console.error("Error cargando reservas:", err);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReservas();
    }, [user?.id, canchaSeleccionada]);

    const handleDeleteReserva = async () => {
        if (!selected) return;

        setDeleting(true);

        try {
            const res = await fetch("/api/reservations/delete", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: selected.id }),
            });

            if (!res.ok) throw new Error("Error al cancelar la reserva");

            toast.success("Reserva cancelada correctamente");

            // Cerrar modal y refrescar reservas
            setSelected(null);
            fetchReservas(); // reutiliza tu función ya declarada
        } catch (err) {
            console.error(err);
            toast.error("No se pudo cancelar la reserva. Intenta nuevamente.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b to-[#0b1120] from-[#030712] text-white pt-24 px-6 pb-16">
            <Toaster richColors position="top-right" />
            <div className=" text-white max-w-[1200px] mx-auto mt-6">
                <h2 className="text-3xl font-bold mb-2">
                    Calendario de Reservas
                </h2>

                <p className="mb-8 text-gray-500 font-light">
                    Haz click en los eventos del calendario para acceder a más
                    información y acciones.
                </p>

                {canchas.length > 0 && (
                    <div className="mb-6 w-full max-w-sm">
                        <Select
                            onValueChange={(value) =>
                                setCanchaSeleccionada(value)
                            }
                            value={canchaSeleccionada || ""}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecciona una cancha" />
                            </SelectTrigger>
                            <SelectContent>
                                {canchas.map((c) => (
                                    <SelectItem
                                        key={c.id_cancha}
                                        value={c.id_cancha.toString()}
                                    >
                                        {c.nombre_cancha}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {canchas.length === 0 ? (
                    <p className="text-gray-500 mt-6">
                        No hay canchas registradas en tu predio.
                    </p>
                ) : !canchaSeleccionada ? (
                    <p className="text-gray-500 mt-6">
                        Selecciona una cancha para ver sus reservas.
                    </p>
                ) : loading ? (
                    <div className="flex justify-center items-center gap-2 mt-6">
                        <LoadingSpinner /> Cargando calendario...
                    </div>
                ) : (
                    <FullCalendar
                        plugins={[timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: "prev,next today",
                            center: "title",
                            right: "timeGridDay,timeGridWeek",
                        }}
                        height="auto"
                        events={reservas.map((r) => ({
                            id: r.id.toString(),
                            title: r.title,
                            start: r.start,
                            end: r.end,
                        }))}
                        eventContent={(arg) => {
                            const reserva = reservas.find(
                                (r) => r.id.toString() === arg.event.id
                            );
                            const isActive = reserva?.is_active;

                            const baseColor = isActive ? "#009669" : "#6b7280";
                            const hoverColor = isActive ? "#00664d" : "#4b5563"; // shade más oscuro

                            const textColor = isActive ? "white" : "#ccd";

                            const startHour = arg.event.start
                                ? arg.event.start.toLocaleTimeString("es-PE", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                  })
                                : "";
                            const endHour = arg.event.end
                                ? arg.event.end.toLocaleTimeString("es-PE", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                  })
                                : "";

                            const status = !isActive ? " (Cancelada)" : "";

                            return {
                                html: `
                                <div 
                                    style="
                                        height: 100%;
                                        cursor: pointer;
                                        background-color: ${baseColor};
                                        color: ${textColor};
                                        padding: 4px 6px;
                                        border-radius: 4px;
                                        font-size: 12px;
                                        line-height: 1.2;
                                        display: flex;
                                        flex-direction: column;
                                        justify-content: center;
                                        transition: background-color 0.2s ease;
                                    "
                                    onmouseover="this.style.backgroundColor='${hoverColor}'"
                                    onmouseout="this.style.backgroundColor='${baseColor}'"
                                >
                                    <span>${status}</span>
                                    <strong style="font-size: 11px;">${startHour} - ${endHour}</strong>
                                    <span>${arg.event.title}</span>
                                </div>
                                `,
                            };
                        }}
                        eventBorderColor="#1e2939"
                        eventClick={(info) => {
                            const reserva = reservas.find(
                                (r) => r.id.toString() === info.event.id
                            );
                            if (reserva) setSelected(reserva);
                        }}
                        locale="es"
                        locales={[esLocale]}
                        allDaySlot={false}
                        slotMinTime="05:00:00"
                        slotLabelFormat={{
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                        }}
                    />
                )}

                {/* Modal de detalles */}
                {selected && (
                    <Dialog
                        open={!!selected}
                        onOpenChange={() => setSelected(null)}
                    >
                        <DialogContent className="bg-[#1a1f2b] text-gray-400 border border-gray-800">
                            <DialogTitle className="text-white mb-4">
                                Detalle de Reserva{" "}
                                {!selected.is_active && (
                                    <span className="ml-2 bg-white text-black text-[11px] py-1 px-2 rounded-full">
                                        Cancelada
                                    </span>
                                )}
                            </DialogTitle>

                            <p className="text-sm">
                                <span className="text-white text-sm font-medium">
                                    Equipo:
                                </span>{" "}
                                {selected.title}
                            </p>
                            <p className="text-sm">
                                <span className="text-white text-sm font-medium">
                                    Capitán:
                                </span>{" "}
                                {selected.capitan}
                            </p>

                            <p className="text-sm">
                                <span className="text-white text-sm font-medium">
                                    Desde:
                                </span>{" "}
                                {new Date(selected.start).toLocaleString()}
                            </p>
                            <p className="text-sm">
                                <span className="text-white text-sm font-medium">
                                    Hasta:
                                </span>{" "}
                                {new Date(selected.end).toLocaleString()}
                            </p>
                            <a
                                href={`https://wa.me/${formatPhoneForWhatsApp(
                                    selected.telefono
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full font-medium flex gap-2 bg-[#1b8d4a] hover:bg-[#007933] justify-center items-center text-white px-2.5 py-2 rounded-md text-sm transition"
                            >
                                <img src="/whatsapp.png" className="w-5 h-5" />{" "}
                                Contactar por WhatsApp
                            </a>
                            {selected.is_active && (
                                <Button
                                    variant="destructive"
                                    className="cursor-pointer"
                                    disabled={deleting}
                                    onClick={handleDeleteReserva}
                                >
                                    {deleting ? (
                                        <LoadingSpinner />
                                    ) : (
                                        "Cancelar Reserva"
                                    )}
                                </Button>
                            )}
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}
