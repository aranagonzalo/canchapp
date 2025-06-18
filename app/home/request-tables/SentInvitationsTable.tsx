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

export default function SentInvitationsTable() {
    const { user } = useUser();
    const id = user?.id;
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/invitations/sent?id=${id}`);
            const json = await res.json();
            setData(json);
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
                Has invitado a jugadores a tu equipo
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
                                ].map((col) => (
                                    <TableCell key={col} className="text-white">
                                        {entry[col] ?? "-"}
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
