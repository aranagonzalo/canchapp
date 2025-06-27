"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import ReservationModal from "./ReservationsModal";
import { reservaExpirada } from "@/lib/utils";

interface Reserva {
    nombre_complejo: string;
    direccion_complejo: string;
    telefono_complejo: string;
    nombre_cancha: string;
    id_admin: number;
    mail_admin: string;
    fecha: string;
    horas: string[];
    nombre_equipo?: string;
    id: number;
    is_active: boolean;
}

export default function MisReservas() {
    const { user } = useUser();

    const id_jugador = user?.id;

    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [reservaActiva, setReservaActiva] = useState<Reserva | null>(null);

    const fetchReservas = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reservations?id=${id_jugador}`);
            const data = await res.json();
            setReservas(data);
        } catch (err) {
            toast.error("Error al obtener reservas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id_jugador) fetchReservas();
    }, [id_jugador]);

    return (
        <div className="py-6">
            {showModal && (
                <ReservationModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    nuevaReserva={reservaActiva!}
                    onCancel={fetchReservas}
                />
            )}

            <div className="">
                {loading ? (
                    <div className="text-white flex justify-center py-10">
                        <LoadingSpinner />
                        <span className="ml-2">Cargando...</span>
                    </div>
                ) : reservas.length === 0 ? (
                    <p className="text-gray-400">
                        No hay reservas disponibles.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {reservas.map((reserva, index) => {
                            const inactiva = reserva.is_active === false;

                            return (
                                <div
                                    key={index}
                                    onClick={() => {
                                        if (!inactiva) {
                                            setReservaActiva(reserva);
                                            setShowModal(true);
                                        }
                                    }}
                                    className={`relative p-4 rounded-lg border border-gray-800 bg-[#1a1f2b] transition ${
                                        inactiva
                                            ? "opacity-50 cursor-not-allowed"
                                            : "hover:border-custom-dark-green/40 cursor-pointer hover:bg-gradient-to-br hover:from-[#1a1f2b] hover:via-[#1a1f2b] hover:to-custom-dark-green/20"
                                    }`}
                                >
                                    <div
                                        className={`self-end px-3 py-1 rounded-full text-xs font-medium text-white absolute top-3 right-3
                                        ${
                                            reserva.is_active
                                                ? reservaExpirada(reserva)
                                                    ? "bg-yellow-600"
                                                    : "bg-custom-dark-green"
                                                : "bg-gray-500"
                                        }`}
                                    >
                                        {reserva.is_active
                                            ? reservaExpirada(reserva)
                                                ? "Finalizada"
                                                : "Activa"
                                            : "Cancelada"}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                        {reserva.nombre_complejo}
                                    </h3>
                                    <p className="text-sm text-gray-300 mb-1">
                                        {reserva.nombre_cancha}
                                    </p>
                                    <p className="text-sm text-gray-300 mb-1">
                                        {formatDistanceToNow(
                                            parseISO(reserva.fecha),
                                            {
                                                addSuffix: true,
                                                locale: es,
                                            }
                                        )}
                                    </p>
                                    <p className="text-sm text-gray-300">
                                        {reserva.horas.map(
                                            (h: string, i: number) => {
                                                const start =
                                                    h.padStart(2, "0") + ":00";
                                                const end =
                                                    (parseInt(h) + 1)
                                                        .toString()
                                                        .padStart(2, "0") +
                                                    ":00";
                                                return `${start} - ${end}${
                                                    i < reserva.horas.length - 1
                                                        ? ", "
                                                        : ""
                                                }`;
                                            }
                                        )}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
