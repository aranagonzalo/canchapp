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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MyRequests() {
    const { user } = useUser();
    const id = user?.id;

    const [data, setData] = useState({
        recibidas: [],
        invitacionesRecibidas: [],
        invitacionesEnviadas: [],
        solicitudesEnviadas: [],
    });

    const [loading, setLoading] = useState(true);

    const fetchAll = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [recibidas, invRecibidas, invEnviadas, solEnviadas] =
                await Promise.all([
                    fetch(`/api/requests/received?id=${id}`).then((r) =>
                        r.json()
                    ),
                    fetch(`/api/invitations/received?id=${id}`).then((r) =>
                        r.json()
                    ),
                    fetch(`/api/invitations/sent?id=${id}`).then((r) =>
                        r.json()
                    ),
                    fetch(`/api/requests/sent?id=${id}`).then((r) => r.json()),
                ]);

            setData({
                recibidas,
                invitacionesRecibidas: invRecibidas,
                invitacionesEnviadas: invEnviadas,
                solicitudesEnviadas: solEnviadas,
            });
        } catch (err) {
            toast.error("Error al cargar las solicitudes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, [id]);

    const updateSolicitud = async (id_solicitud: number, estado: string) => {
        try {
            const res = await fetch("/api/solicitudes/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_solicitud, estado }),
            });
            const result = await res.json();
            toast.success(result.message);
            fetchAll();
        } catch (err) {
            toast.error("Error actualizando solicitud.");
        }
    };

    const renderAcciones = (entry: any, tipo: string) => {
        if (tipo === "recibidas") {
            return (
                <>
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white text-xs mr-2"
                        onClick={() =>
                            updateSolicitud(entry.id_solicitud, "Aceptado")
                        }
                    >
                        Aceptar
                    </Button>
                    <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white text-xs"
                        onClick={() =>
                            updateSolicitud(entry.id_solicitud, "Rechazado")
                        }
                    >
                        Rechazar
                    </Button>
                </>
            );
        } else if (
            tipo === "solicitudesEnviadas" &&
            entry.estado === "Pendiente"
        ) {
            return (
                <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                    onClick={() =>
                        updateSolicitud(entry.id_solicitud, "Cancelado")
                    }
                >
                    Cancelar solicitud
                </Button>
            );
        }
        return null;
    };

    const renderTable = (entries: any[], columns: string[], tipo: string) => {
        if (loading) {
            return (
                <div className="flex justify-center py-8 text-white">
                    <LoadingSpinner />
                    <span className="ml-3">Cargando datos...</span>
                </div>
            );
        }

        if (entries.length === 0) {
            return (
                <p className="text-gray-400 px-4 py-6">
                    No hay datos disponibles.
                </p>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead
                                key={col}
                                className="text-white capitalize"
                            >
                                {col === "acciones"
                                    ? "Acciones"
                                    : col.replace("_", " ")}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {entries.map((entry, i) => (
                        <TableRow key={i}>
                            {columns.map((col) => (
                                <TableCell key={col} className="text-white">
                                    {col === "acciones"
                                        ? renderAcciones(entry, tipo)
                                        : entry[col] ?? "-"}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    return (
        <div className="">
            <h2 className="text-white text-xl font-semibold mb-4">
                Mis Solicitudes
            </h2>

            <div className="space-y-8">
                <Card className="bg-[#1a1f2b] p-5 border border-gray-800">
                    <h3 className="text-sm text-gray-400">
                        Jugadores que quieren unirse a tu equipo
                    </h3>
                    {renderTable(
                        data.recibidas,
                        [
                            "nombre",
                            "apellido",
                            "edad",
                            "sexo",
                            "telefono",
                            "nombre_equipo",
                            "estado",
                            "acciones",
                        ],
                        "recibidas"
                    )}
                </Card>

                <Card className="bg-[#1a1f2b] p-5 border border-gray-800">
                    <h3 className="text-sm text-gray-400">
                        Equipos que quieren que te unas a ellos
                    </h3>
                    {renderTable(
                        data.invitacionesRecibidas,
                        ["nombre_equipo", "estado"],
                        "invitacionesRecibidas"
                    )}
                </Card>

                <Card className="bg-[#1a1f2b] p-5 border border-gray-800">
                    <h3 className="text-sm text-gray-400">
                        Has invitado a jugadores a tu equipo
                    </h3>
                    {renderTable(
                        data.invitacionesEnviadas,
                        [
                            "nombre",
                            "apellido",
                            "edad",
                            "sexo",
                            "telefono",
                            "nombre_equipo",
                            "estado",
                        ],
                        "invitacionesEnviadas"
                    )}
                </Card>

                <Card className="bg-[#1a1f2b] p-5 border border-gray-800">
                    <h3 className="text-sm text-gray-400">
                        Equipos a los que has solicitado unirte
                    </h3>
                    {renderTable(
                        data.solicitudesEnviadas,
                        ["nombre_equipo", "estado", "acciones"],
                        "solicitudesEnviadas"
                    )}
                </Card>
            </div>
        </div>
    );
}
