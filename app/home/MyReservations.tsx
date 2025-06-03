"use client";

import { useEffect, useState } from "react";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import ReservationsModal from "./ReservationsModal";

interface Reserva {
    nombre_complejo: string;
    direccion_complejo: string;
    telefono_complejo: string;
    nombre_cancha: string;
    fecha: string;
    hora: string;
    nombre_equipo?: string;
    estado: string;
}

export default function MisReservas() {
    const { user } = useUser();
    const id_jugador = user?.id;

    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [loading, setLoading] = useState(true);
    const [estadoFiltro, setEstadoFiltro] = useState("todas");

    const [showModal, setShowModal] = useState(false);
    const [reservaActiva, setReservaActiva] = useState(null);

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

    const eliminarReserva = async (fecha: string, hora: string) => {
        try {
            await fetch(`/api/reservas/eliminar`, {
                method: "DELETE",
                body: JSON.stringify({ id_jugador, fecha, hora }),
            });
            toast.success("Reserva eliminada");
            fetchReservas();
        } catch (err) {
            toast.error("No se pudo eliminar la reserva.");
        }
    };

    const handleContinuar = (reserva: any) => {
        setReservaActiva(reserva);
        setShowModal(true);
    };

    const columnas = [
        "Complejo",
        "Dirección",
        "Teléfono",
        "Cancha",
        "Fecha",
        "Hora",
        "Equipo",
        "Estado",
        "Acciones",
    ];

    const renderFila = (reserva: any) => (
        <TableRow key={`${reserva.fecha}-${reserva.hora}`}>
            <TableCell>{reserva.nombre_complejo}</TableCell>
            <TableCell>{reserva.direccion_complejo}</TableCell>
            <TableCell>{reserva.telefono_complejo}</TableCell>
            <TableCell>{reserva.nombre_cancha}</TableCell>
            <TableCell>{reserva.fecha}</TableCell>
            <TableCell>{reserva.hora}</TableCell>
            <TableCell>{reserva.nombre_equipo || "No asignado"}</TableCell>
            <TableCell>{reserva.estado}</TableCell>
            <TableCell>
                {reserva.estado === "pendiente" ? (
                    <>
                        <Button
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs mr-2"
                            onClick={() => handleContinuar(reserva)}
                        >
                            Continuar
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white text-xs"
                            onClick={() =>
                                eliminarReserva(reserva.fecha, reserva.hora)
                            }
                        >
                            Eliminar
                        </Button>
                    </>
                ) : (
                    <span className="text-green-400 text-xs">Completada</span>
                )}
            </TableCell>
        </TableRow>
    );

    useEffect(() => {
        if (id_jugador) fetchReservas();
    }, [id_jugador]);

    const reservasFiltradas = reservas.filter((r) =>
        estadoFiltro === "todas"
            ? true
            : r.estado?.toLowerCase() === estadoFiltro
    );

    return (
        <div className="p-6">
            {showModal && (
                <ReservationsModal
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    nuevaReserva={reservaActiva!}
                    origen="reservas"
                />
            )}

            <Tabs
                defaultValue="todas"
                onValueChange={setEstadoFiltro}
                className="mb-6"
            >
                <TabsList className="w-full flex justify-start bg-slate-900 border border-slate-800">
                    <TabsTrigger value="todas">Todas</TabsTrigger>
                    <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
                    <TabsTrigger value="confirmado">Confirmadas</TabsTrigger>
                </TabsList>
            </Tabs>

            <div className="bg-[#0b1120] p-4 rounded-lg border border-slate-800">
                {loading ? (
                    <div className="text-white flex justify-center py-10">
                        <LoadingSpinner />
                        <span className="ml-2">Cargando...</span>
                    </div>
                ) : reservasFiltradas.length === 0 ? (
                    <p className="text-gray-400">
                        No hay reservas en esta categoría.
                    </p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columnas.map((col, i) => (
                                    <TableHead key={i} className="text-white">
                                        {col}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reservasFiltradas.map((r) => renderFila(r))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
