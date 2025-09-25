"use client";

import FullCalendar from "@fullcalendar/react";
import esLocale from "@fullcalendar/core/locales/es";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState, useMemo } from "react";
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
import BlockCourtModal from "./BlockCourtModal";

interface Reserva {
    id: number;
    title: string;
    start: string;
    end: string;
    id_equipo: number;
    capitan: string;
    telefono: string;
    is_active: boolean;
    is_block?: boolean; // <-- nuevo
    estado?: string;
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
    const [modalOpen, setModalOpen] = useState(false);
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Reserva | null>(null);
    const [canchaSeleccionada, setCanchaSeleccionada] = useState<string | null>(
        null
    );
    const [deleting, setDeleting] = useState(false);

    // Id numérico y nombre de la cancha seleccionada
    const selectedCanchaId = canchaSeleccionada
        ? Number(canchaSeleccionada)
        : null;

    const selectedCanchaName = useMemo(() => {
        const c = canchas.find(
            (x) => x.id_cancha.toString() === canchaSeleccionada
        );
        return c?.nombre_cancha;
    }, [canchas, canchaSeleccionada]);

    // Opciones para multi-selección en el modal
    const misCanchasDelAdmin = useMemo(
        () =>
            canchas.map((c) => ({
                id_cancha: c.id_cancha,
                nombre_cancha: c.nombre_cancha,
            })),
        [canchas]
    );

    // Fechas por defecto: hoy → fin de año (ajusta si quieres)
    const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const endOfYearISO = useMemo(
        () =>
            new Date(new Date().getFullYear(), 11, 31)
                .toISOString()
                .slice(0, 10),
        []
    );

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

    const isPastReserva = (reserva: Reserva) => {
        const now = new Date();
        const endDate = new Date(reserva.end);
        return endDate < now; // ya terminó
    };

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
                    <>
                        <p className="mb-1 text-gray-300 font-normal text-sm">
                            Cancha:
                        </p>
                        <div className="mb-6 w-full max-w-sm flex gap-2">
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
                            <div className="flex items-center gap-2">
                                {/* tu Select de cancha aquí */}
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        setModalOpen(true);
                                    }}
                                >
                                    Bloquear Horarios
                                </Button>
                            </div>
                        </div>
                    </>
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
                            id: `${r.id}-${r.start}`, // <- id único por hora
                            title: r.title,
                            start: r.start,
                            end: r.end,
                            extendedProps: { reserva: r }, // <- te evita buscar luego
                        }))}
                        eventContent={(arg) => {
                            const reserva = (arg.event.extendedProps as any)
                                ?.reserva as Reserva | undefined;
                            if (!reserva) return;

                            const isActive = reserva.is_active;
                            const isBlock = reserva.is_block;
                            const isPast = isPastReserva(reserva);

                            // Colores base
                            let baseColor = isBlock
                                ? "#f59e0b"
                                : isActive
                                ? "#009669"
                                : "#6b7280";
                            let hoverColor = isBlock
                                ? "#d97706"
                                : isActive
                                ? "#00664d"
                                : "#4b5563";
                            let textColor = isBlock
                                ? "#1f2937"
                                : isActive
                                ? "white"
                                : "#ccd";

                            // Si ya pasó, forzamos gris
                            if (isPast) {
                                baseColor = "#6b7280"; // gris
                                hoverColor = "#4b5563";
                                textColor = "#d1d5db"; // gris claro
                            }

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

                            const status = isBlock
                                ? " (Bloqueado)"
                                : !isActive
                                ? " (Cancelada)"
                                : isPast
                                ? " (Finalizada)"
                                : "";

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
                            const reserva = (info.event.extendedProps as any)
                                ?.reserva as Reserva | undefined;
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
                                {selected.is_block ? (
                                    <span className="ml-2 bg-amber-500/20 text-amber-400 text-[11px] py-1 px-2 rounded-full">
                                        Bloqueo (Admin)
                                    </span>
                                ) : (
                                    !selected.is_active && (
                                        <span className="ml-2 bg-white text-black text-[11px] py-1 px-2 rounded-full">
                                            Cancelada
                                        </span>
                                    )
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

                            {/* SOLO para reservas de equipo (no bloqueos) */}
                            {!selected.is_block && selected.telefono && (
                                <a
                                    href={`https://wa.me/${formatPhoneForWhatsApp(
                                        selected.telefono
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full font-medium flex gap-2 bg-[#1b8d4a] hover:bg-[#007933] justify-center items-center text-white px-2.5 py-2 rounded-md text-sm transition"
                                >
                                    <img
                                        src="/whatsapp.png"
                                        className="w-5 h-5"
                                    />{" "}
                                    Contactar por WhatsApp
                                </a>
                            )}

                            {!selected.is_block &&
                                selected.is_active &&
                                !isPastReserva(selected) && (
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

                <BlockCourtModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    selectedCanchaId={selectedCanchaId}
                    selectedCanchaName={selectedCanchaName}
                    canchasOptions={misCanchasDelAdmin}
                    defaultDateFrom={todayISO}
                    defaultDateTo={endOfYearISO}
                    onApplied={fetchReservas}
                />
            </div>
        </div>
    );
}
