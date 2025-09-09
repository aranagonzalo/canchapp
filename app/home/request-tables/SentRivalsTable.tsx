"use client";

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
import { formatHourRange } from "@/lib/utils";

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
    estado: string;
    comentarios: string;
}

export default function ReceivedInvitationsTable() {
    const { user } = useUser();
    const id = user?.id;
    const [data, setData] = useState<Invitations[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(
                `/api/invitations/rivals/sent?id_capitan=${id}`
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
                Has invitado a estos equipos a compartir reserva (como rivales)
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
                                "estado",
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
                                                {formatHourRange(
                                                    entry.reserva.horas
                                                )}
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
                                    <TableCell className="text-amber-500">
                                        Pendiente
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
        </Card>
    );
}
