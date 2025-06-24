"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser } from "@/context/userContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import EquiposDisponiblesModal, { Equipo } from "./EquiposDisponiblesModal";

interface Jugador {
    id_jug: number;
    nombre: string;
    apellido: string;
    edad: number;
    telefono: string;
    posicion: string;
    pierna_habil: string;
    sexo: string;
}

export default function Players() {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        nombre: "",
        edad: "",
        sexo: "",
        pierna_habil: "",
        posicion: "",
    });
    const edadOptions = [
        { label: "5 - 13", value: "5-13" },
        { label: "14 - 18", value: "14-18" },
        { label: "18+", value: "18+" },
    ];
    const [modalOpen, setModalOpen] = useState(false);
    const [jugadorIdActivo, setJugadorIdActivo] = useState<number | null>(null);
    const [modalEquipos, setModalEquipos] = useState<Equipo[]>([]);
    const [loadingJugadorId, setLoadingJugadorId] = useState<number | null>(
        null
    );

    const { user } = useUser();

    const userId = user?.id;

    const fetchJugadores = async () => {
        try {
            const res = await fetch(`/api/players/${userId}`);
            const data = await res.json();
            setJugadores(data);
        } catch (err) {
            toast.error("Error al obtener jugadores");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJugadores();
    }, []);

    const filteredJugadores = useMemo(() => {
        return jugadores.filter((j) => {
            const fullName = `${j.nombre} ${j.apellido}`.toLowerCase();

            return (
                fullName.includes(filters.nombre.toLowerCase()) &&
                (filters.edad
                    ? (filters.edad === "5-13" &&
                          j.edad >= 5 &&
                          j.edad <= 13) ||
                      (filters.edad === "14-18" &&
                          j.edad >= 14 &&
                          j.edad <= 18) ||
                      (filters.edad === "18+" && j.edad > 18)
                    : true) &&
                (filters.sexo
                    ? j.sexo?.toLowerCase?.() === filters.sexo.toLowerCase()
                    : true) &&
                (filters.pierna_habil
                    ? j.pierna_habil?.toLowerCase?.() ===
                      filters.pierna_habil.toLowerCase()
                    : true) &&
                (filters.posicion
                    ? j.posicion?.toLowerCase?.() ===
                      filters.posicion.toLowerCase()
                    : true)
            );
        });
    }, [jugadores, filters]);

    const uniqueValues = (key: keyof Jugador) => [
        ...new Set(jugadores.map((j) => j[key]).filter(Boolean)),
    ];

    const handleVerSolicitud = async (idJugador: number) => {
        if (!userId) return;
        setLoadingJugadorId(idJugador);
        try {
            const res = await fetch(
                `/api/teams-invite?id_jugador=${idJugador}&id_capitan=${userId}`
            );
            const data = await res.json();

            if (!data || data.length === 0) {
                toast.warning(
                    "No tienes equipos disponibles para invitar a este jugador."
                );
                return;
            }

            setModalEquipos(data);
            setJugadorIdActivo(idJugador);
            setModalOpen(true);
        } catch (err) {
            toast.error("Error al consultar equipos.");
        } finally {
            setLoadingJugadorId(null);
        }
    };

    return (
        <div>
            <Toaster richColors position="top-right" />
            {modalOpen && jugadorIdActivo !== null && (
                <EquiposDisponiblesModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    equipos={modalEquipos}
                    id_jugador={jugadorIdActivo}
                    id_capitan={userId!}
                    refetchEquipos={() => handleVerSolicitud(jugadorIdActivo)}
                />
            )}

            <div className="flex flex-wrap gap-3 mb-6 items-center">
                <Input
                    placeholder="Búsqueda por nombre"
                    value={filters.nombre}
                    onChange={(e) =>
                        setFilters((prev) => ({
                            ...prev,
                            nombre: e.target.value,
                        }))
                    }
                    className="w-60 bg-[#1a1f2b] border border-gray-800 text-white !placeholder-gray-700"
                />

                <Select
                    value={filters.edad}
                    onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, edad: value }))
                    }
                >
                    <SelectTrigger className="w-32 bg-[#1a1f2b] text-white border border-gray-800">
                        <SelectValue placeholder="Edad" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2b] text-white border-gray-800">
                        {edadOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.sexo}
                    onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, sexo: value }))
                    }
                >
                    <SelectTrigger className="w-32 bg-[#1a1f2b] text-white border border-gray-800 !data-[placeholder]:gray-700">
                        <SelectValue
                            placeholder="Sexo"
                            className="!data-[placeholder]:gray-700"
                        />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2b] border-gray-800 text-white">
                        <SelectItem value="Hombre">Hombre</SelectItem>
                        <SelectItem value="Mujer">Mujer</SelectItem>
                        <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.pierna_habil}
                    onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, pierna_habil: value }))
                    }
                >
                    <SelectTrigger className="w-36 bg-[#1a1f2b] text-white border border-gray-800 !placeholder-gray-700">
                        <SelectValue placeholder="Píe hábil" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2b] border-gray-800 text-white">
                        {uniqueValues("pierna_habil").map((p) => (
                            <SelectItem key={p} value={p.toString()}>
                                {p}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.posicion}
                    onValueChange={(value) =>
                        setFilters((prev) => ({ ...prev, posicion: value }))
                    }
                >
                    <SelectTrigger className="w-36 bg-[#1a1f2b] text-white border border-gray-800 !placeholder-gray-700">
                        <SelectValue placeholder="Posición" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2b] border-gray-800 text-white">
                        {uniqueValues("posicion").map((pos) => (
                            <SelectItem key={pos} value={pos.toString()}>
                                {pos}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <button
                    onClick={() =>
                        setFilters({
                            nombre: "",
                            edad: "",
                            sexo: "",
                            pierna_habil: "",
                            posicion: "",
                        })
                    }
                    className="text-white cursor-pointer hover:underline text-sm"
                >
                    Eliminar Filtros
                </button>
            </div>

            <h2 className="text-white text-xl font-semibold mb-4">
                Jugadores disponibles
            </h2>
            {loading ? (
                <div className="text-white flex justify-center py-10">
                    <LoadingSpinner />
                    <span className="ml-2">Cargando jugadores...</span>
                </div>
            ) : (
                <Table>
                    <TableHeader className="bg-[#1a1f2b] text-white ">
                        <TableRow className="border-b border-gray-800 h-12 hover:bg-[#1a1f2b]">
                            <TableHead className="text-white">
                                Nombre y Apellido
                            </TableHead>
                            <TableHead className="text-white">Edad</TableHead>
                            <TableHead className="text-white">
                                Píe Hábil
                            </TableHead>
                            <TableHead className="text-white">Sexo</TableHead>
                            <TableHead className="text-white">
                                Teléfono
                            </TableHead>
                            <TableHead className="text-white">
                                Posición
                            </TableHead>
                            <TableHead className="text-white">
                                Solicitud
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredJugadores.map((jugador) => (
                            <TableRow
                                key={jugador.id_jug}
                                className="border-b border-gray-800 hover:bg-gray-900 h-12"
                            >
                                <TableCell className="flex gap-3 items-center">
                                    <Avatar className="h-7 w-7">
                                        <AvatarFallback className="bg-gradient-to-r font-medium text-xs from-custom-dark-green to-custom-green">
                                            {jugador.nombre
                                                .slice(0, 1)
                                                .toUpperCase()}
                                            {jugador.apellido
                                                .slice(0, 1)
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {`${jugador.nombre} ${jugador.apellido}`}
                                </TableCell>
                                <TableCell>{jugador.edad}</TableCell>
                                <TableCell>
                                    {" "}
                                    {jugador?.pierna_habil
                                        ? jugador?.pierna_habil
                                        : "Información privada"}
                                </TableCell>
                                <TableCell>{jugador.sexo}</TableCell>
                                <TableCell>
                                    {" "}
                                    {jugador?.telefono
                                        ? jugador?.telefono
                                        : "Información privada"}
                                </TableCell>
                                <TableCell>
                                    {jugador?.posicion
                                        ? jugador?.posicion
                                        : "Información privada"}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 font-medium rounded cursor-pointer text-xs"
                                        onClick={() =>
                                            handleVerSolicitud(jugador.id_jug)
                                        }
                                        disabled={
                                            loadingJugadorId === jugador.id_jug
                                        }
                                    >
                                        {loadingJugadorId === jugador.id_jug ? (
                                            <div className="flex items-center gap-2">
                                                <LoadingSpinner />
                                            </div>
                                        ) : (
                                            "Ver solicitud"
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
        </div>
    );
}
