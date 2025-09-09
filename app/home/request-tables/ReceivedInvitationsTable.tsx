"use client";

import { useEffect, useState, useMemo } from "react";
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
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser } from "@/context/userContext";

type Invitation = {
    id_invitacion: number;
    id_capitan: number;
    id_jugador_invitado: number;
    id_equipo: number;
    estado: "Pendiente" | "Rechazada" | "Aceptada";
    nombre_equipo: string;
};

export default function ReceivedInvitationsTable() {
    const { user } = useUser();
    const id = user?.id;
    const [data, setData] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const estadoClass = (estado: Invitation["estado"]) => {
        switch (estado) {
            case "Pendiente":
                return "text-amber-500";
            case "Rechazada":
                return "text-red-500";
            case "Aceptada":
                return "text-green-500";
            default:
                return "text-white";
        }
    };

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/invitations/received?id=${id}`);
            const json = await res.json();
            setData(json);
        } catch {
            toast.error("Error al cargar las invitaciones recibidas.");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (
        invitacionId: number,
        action: "accept" | "reject"
    ) => {
        try {
            setUpdatingId(invitacionId);
            const res = await fetch("/api/invitations/received/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ invitacion_id: invitacionId, action }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(
                    err?.message || "Error al actualizar la invitación."
                );
            }

            toast.success(
                action === "accept"
                    ? "Invitación aceptada."
                    : "Invitación rechazada."
            );
            await fetchData(); // recarga tabla
        } catch (e: any) {
            toast.error(e.message || "No se pudo procesar la acción.");
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
                Equipos que quieren que te unas a ellos
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
                            {["nombre_equipo", "estado"].map((col) => (
                                <TableHead
                                    key={col}
                                    className="text-white capitalize"
                                >
                                    {col.replace("_", " ")}
                                </TableHead>
                            ))}
                            {/* NUEVA COLUMNA */}
                            <TableHead className="text-white">Acción</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {data.map((entry) => (
                            <TableRow
                                key={entry.id_invitacion}
                                className="hover:bg-gray-900"
                            >
                                {/* nombre_equipo */}
                                <TableCell className="text-white">
                                    {entry.nombre_equipo ?? "-"}
                                </TableCell>

                                {/* estado con color */}
                                <TableCell
                                    className={estadoClass(entry.estado)}
                                >
                                    {entry.estado ?? "-"}
                                </TableCell>

                                {/* ACCIÓN solo si está Pendiente */}
                                <TableCell className="text-white">
                                    {entry.estado === "Pendiente" ? (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                disabled={
                                                    updatingId ===
                                                    entry.id_invitacion
                                                }
                                                onClick={() =>
                                                    handleAction(
                                                        entry.id_invitacion,
                                                        "accept"
                                                    )
                                                }
                                            >
                                                Aceptar
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                disabled={
                                                    updatingId ===
                                                    entry.id_invitacion
                                                }
                                                onClick={() =>
                                                    handleAction(
                                                        entry.id_invitacion,
                                                        "reject"
                                                    )
                                                }
                                            >
                                                Rechazar
                                            </Button>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </Card>
    );
}
