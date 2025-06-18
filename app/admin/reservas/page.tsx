"use client";

import FullCalendar from "@fullcalendar/react";
import esLocale from "@fullcalendar/core/locales/es";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser } from "@/context/userContext";

interface Reserva {
    id: number;
    title: string;
    start: string;
    end: string;
    id_equipo: number;
    capitan: string;
    telefono: string;
}

export default function CalendarioReservas() {
    const { user } = useUser();
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Reserva | null>(null);

    useEffect(() => {
        if (!user?.id) return;

        const fetchReservas = async () => {
            try {
                const res = await fetch(
                    `/api/admin/reservas?id_admin=${user?.id}`
                );
                const data = await res.json();
                if (Array.isArray(data)) setReservas(data);
            } catch (err) {
                console.error("Error cargando reservas:", err);
            }
            setLoading(false);
        };

        fetchReservas();
    }, [user?.id]);

    return (
        <div className="min-h-screen bg-gradient-to-b to-[#0b1120] from-[#030712] text-white pt-24 px-6 pb-16">
            <div className=" text-white max-w-[1200px] mx-auto mt-6">
                <h2 className="text-3xl font-bold mb-2">
                    Calendario de Reservas
                </h2>

                <p className="mb-8 text-gray-500 font-light">
                    Haz click en los eventos del calendario para acceder a más
                    información y acciones.
                </p>

                {loading ? (
                    <div className="flex justify-center items-center gap-2">
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
                        eventColor="#009669"
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
                                Detalle de Reserva
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
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
}

function formatPhoneForWhatsApp(raw: string): string {
    const cleaned = raw.replace(/\D/g, "");

    // Diccionario de códigos por país (los primeros dígitos)
    const codigos = {
        pe: "51",
        ar: "54",
        cl: "56",
        co: "57",
    };

    // Si empieza con alguno de los códigos
    if (cleaned.startsWith(codigos.pe)) {
        return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }
    if (cleaned.startsWith(codigos.ar)) {
        return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }
    if (cleaned.startsWith(codigos.cl)) {
        return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }
    if (cleaned.startsWith(codigos.co)) {
        return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }

    // Si no tiene código de país, asumimos por heurística según longitud
    if (cleaned.length === 9 && cleaned.startsWith("9")) {
        return `+51${cleaned}`; // Perú
    }
    if (cleaned.length === 10 && cleaned.startsWith("15")) {
        return `+54${cleaned}`; // Argentina móvil
    }

    // Por defecto, se asume Argentina
    return `+54${cleaned}`;
}
