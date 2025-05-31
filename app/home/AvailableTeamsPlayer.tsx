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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Eye } from "lucide-react";
import PlayerListModal from "./PlayerListModal";

type Equipo = {
    id_equipo: number;
    nombre_equipo: string;
    cant_max: number;
    cant_jugadores: number;
    ubicacion: string;
    estado: string;
    solicitud: string;
};

export default function EquiposDisponibles({
    id_jugador,
}: {
    id_jugador: number;
}) {
    const [filtroNombre, setFiltroNombre] = useState("");
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [loading, setLoading] = useState(true);
    const [jugadores, setJugadores] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [equipoSeleccionado, setEquipoSeleccionado] = useState<string | null>(
        null
    );
    const [loadingSolicitudId, setLoadingSolicitudId] = useState<number | null>(
        null
    );

    const equiposFiltrados = equipos.filter((equipo) =>
        equipo.nombre_equipo.toLowerCase().includes(filtroNombre.toLowerCase())
    );

    const fetchJugadores = async (id_equipo: number) => {
        try {
            const res = await fetch(`/api/teams/players/${id_equipo}`);
            if (!res.ok) throw new Error("Error al obtener jugadores");
            const data = await res.json();
            setJugadores(data);
            setShowModal(true);
        } catch (error) {
            toast.error("No se pudieron obtener los jugadores del equipo");
            console.error(error);
        }
    };

    const enviarSolicitud = async (equipoId: number) => {
        setLoadingSolicitudId(equipoId);
        try {
            const res = await fetch("/api/requests/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_jugador, id_equipo: equipoId }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success(data.message || "Solicitud enviada");
                setEquipos((prev) =>
                    prev.map((eq) =>
                        eq.id_equipo === equipoId
                            ? {
                                  ...eq,
                                  estado: "Pendiente",
                                  solicitud: "Pendiente",
                              }
                            : eq
                    )
                );
            } else {
                toast.error(data.message || "No se pudo enviar la solicitud");
            }
        } catch (error) {
            console.error("Error al enviar solicitud:", error);
            toast.error("Error de red al enviar solicitud");
        } finally {
            setLoadingSolicitudId(null); // desactiva spinner
        }
    };

    const cancelarSolicitud = async (equipoId: number) => {
        try {
            const res = await fetch(
                `/api/requests/delete/${id_jugador}/${equipoId}`,
                {
                    method: "DELETE",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Error al cancelar solicitud.");
                return;
            }

            toast.success("Solicitud cancelada");
            setEquipos((prev) =>
                prev.map((eq) =>
                    eq.id_equipo === equipoId
                        ? {
                              ...eq,
                              estado: "No enviado",
                              solicitud: "No enviado",
                          }
                        : eq
                )
            );
        } catch (error) {
            console.error(error);
            toast.error("Error de red al cancelar solicitud");
        }
    };

    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const res = await fetch(`/api/teams/lookup/${id_jugador}`);
                if (!res.ok) throw new Error("Error al obtener equipos");
                const data = await res.json();
                setEquipos(data);
            } catch (err) {
                toast.error("No se pudo cargar los equipos");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id_jugador) fetchEquipos();
    }, [id_jugador]);

    if (loading)
        return (
            <div className="text-center text-sm text-white flex gap-2">
                <LoadingSpinner /> Cargando equipos...
            </div>
        );

    return (
        <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">Equipos disponibles</h2>
            <Input
                type="text"
                placeholder="Buscar por nombre de equipo"
                className="mb-4 w-full md:w-1/2 border-slate-600 text-white !placeholder-gray-700"
                value={filtroNombre}
                onChange={(e) => setFiltroNombre(e.target.value)}
            />
            <Table className="max-h-[200px] overflow-y-auto">
                <TableHeader className="bg-[#1a1f2b] text-white font-semibold">
                    <TableRow className="text-white h-12 border-b border-gray-800 hover:bg-[#1a1f2b]">
                        <TableHead className="text-white font-semibold">
                            Nombre
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                            Ubicación
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                            Jugadores
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                            Estado
                        </TableHead>
                        <TableHead className="text-white font-semibold">
                            Solicitud
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="max-h-[200px] overflow-y-auto">
                    {equiposFiltrados.map((equipo) => (
                        <TableRow
                            key={equipo.id_equipo}
                            className="h-12 border-b border-gray-800 hover:bg-gray-900"
                        >
                            <TableCell>{equipo.nombre_equipo}</TableCell>
                            <TableCell>{equipo.ubicacion}</TableCell>
                            <TableCell>
                                <button
                                    onClick={() => {
                                        setEquipoSeleccionado(
                                            equipo.nombre_equipo
                                        );
                                        fetchJugadores(equipo.id_equipo);
                                    }}
                                    className="hover:scale-105 hover:bg-slate-100 cursor-pointer transition-all flex gap-1 text-slate-900 items-center bg-white rounded-full py-0.5 px-1.5 text-xs"
                                >
                                    <Eye className="text-slate-700 w-3.5 h-3.5" />{" "}
                                    {equipo.cant_jugadores} / {equipo.cant_max}
                                </button>
                            </TableCell>
                            <TableCell>
                                {equipo.estado ===
                                "Ya perteneces a este equipo" ? (
                                    <span>Ya perteneces a este equipo</span>
                                ) : equipo.estado === "Pendiente" ? (
                                    <button
                                        onClick={() =>
                                            cancelarSolicitud(equipo.id_equipo)
                                        }
                                        className="text-white bg-gradient-to-r from-rose-600 to-rose-500 px-2 py-1 rounded font-medium text-xs cursor-pointer hover:from-rose-700 hover:to-rose-600"
                                    >
                                        Cancelar solicitud
                                    </button>
                                ) : equipo.estado === "No enviado" ||
                                  equipo.estado === "Rechazado" ? (
                                    <>
                                        {loadingSolicitudId ===
                                        equipo.id_equipo ? (
                                            <LoadingSpinner />
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    enviarSolicitud(
                                                        equipo.id_equipo
                                                    )
                                                }
                                                className="text-white bg-gradient-to-r from-custom-dark-green to-custom-green px-2 py-1 rounded font-medium text-xs cursor-pointer hover:from-emerald-700 hover:to-emerald-600"
                                            >
                                                Enviar solicitud
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <span>{equipo.estado}</span>
                                )}
                            </TableCell>

                            <TableCell>
                                {equipo.solicitud === "Pendiente" ? (
                                    <p className="font-medium text-amber-400">
                                        {equipo.solicitud}
                                    </p>
                                ) : (
                                    equipo.solicitud
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <PlayerListModal
                jugadores={jugadores}
                equipoNombre={equipoSeleccionado}
                open={showModal}
                onClose={() => setShowModal(false)}
            />
        </div>
    );
}
