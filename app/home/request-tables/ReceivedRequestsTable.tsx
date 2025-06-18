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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser } from "@/context/userContext";

export default function ReceivedRequestsTable() {
    const { user } = useUser();
    const id = user?.id;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/requests/received?id=${id}`);
            const json = await res.json();
            setData(json);
        } catch {
            toast.error("Error al cargar las solicitudes recibidas.");
        } finally {
            setLoading(false);
        }
    };

    const updateSolicitud = async (id_solicitud: number, estado: string) => {
        setUpdatingId(id_solicitud);
        try {
            const res = await fetch("/api/requests/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_solicitud, estado }),
            });
            const result = await res.json();
            toast.success(result.message);
            fetchData();
        } catch {
            toast.error("Error actualizando solicitud.");
        } finally {
            setUpdatingId(null);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    return (
        <Card className="bg-[#1a1f2b] p-5 border border-gray-800">
            <h3 className="text-sm text-gray-400">
                Jugadores que quieren unirse a tu equipo
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
                        <TableRow>
                            {[
                                "nombre",
                                "apellido",
                                "edad",
                                "sexo",
                                "telefono",
                                "nombre_equipo",
                                "estado",
                                "acciones",
                            ].map((col) => (
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
                        {data.map((entry: any, i: number) => (
                            <TableRow key={i}>
                                {[
                                    "nombre",
                                    "apellido",
                                    "edad",
                                    "sexo",
                                    "telefono",
                                    "nombre_equipo",
                                    "estado",
                                    "acciones",
                                ].map((col) => (
                                    <TableCell key={col} className="text-white">
                                        {col === "acciones" ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white text-xs mr-2"
                                                    onClick={() =>
                                                        updateSolicitud(
                                                            entry.id_solicitud,
                                                            "Aceptado"
                                                        )
                                                    }
                                                >
                                                    Aceptar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs"
                                                    onClick={() =>
                                                        updateSolicitud(
                                                            entry.id_solicitud,
                                                            "Rechazado"
                                                        )
                                                    }
                                                >
                                                    Rechazar
                                                </Button>
                                            </>
                                        ) : (
                                            entry[col] ?? "-"
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Card>
    );
}
