"use client";

import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Props {
    equipoId: number;
    jugadorId: number;
    modalOpen: boolean;
    setModalOpen: (value: boolean) => void;
}

interface Jugador {
    id_jug: number;
    nombre: string;
    apellido: string;
    edad: number;
    posicion: string | null;
    pierna_habil: string | null;
    sexo: string | null;
}

export default function InvitePlayerModal({
    equipoId,
    jugadorId,
    modalOpen,
    setModalOpen,
}: Props) {
    const [jugadores, setJugadores] = useState<Jugador[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!modalOpen) return;
        const fetchData = async () => {
            try {
                const res = await fetch(
                    `http://localhost:3001/teams/lookup/${equipoId}/${jugadorId}`
                );
                const data = await res.json();
                setJugadores(data);
            } catch (err) {
                console.error("Error al cargar jugadores:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [modalOpen]);

    return (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogContent className="bg-[#0b1120] rounded-lg shadow-lg max-h-[90vh] w-full border border-slate-800 overflow-y-auto">
                <DialogClose className="absolute top-4 right-4 text-white cursor-pointer z-30 hover:text-gray-300">
                    <X className="z-20 h-5 w-5 text-white" />
                </DialogClose>
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Jugadores del Equipo
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Lista de integrantes actuales
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center items-center text-white py-10">
                        <LoadingSpinner />
                        <span className="ml-3">Cargando jugadores...</span>
                    </div>
                ) : (
                    <ul className="text-white space-y-2 text-sm mt-2">
                        {jugadores.map((j) => (
                            <li
                                key={j.id_jug}
                                className="border border-slate-700 rounded px-3 py-2 bg-[#131a2b]"
                            >
                                <p className="font-semibold">
                                    {j.nombre} {j.apellido}
                                </p>
                                <p className="text-gray-400 text-xs">
                                    Edad: {j.edad} • Posición:{" "}
                                    {j.posicion ?? "N/D"} • Pie hábil:{" "}
                                    {j.pierna_habil ?? "N/D"}
                                </p>
                            </li>
                        ))}
                    </ul>
                )}
            </DialogContent>
        </Dialog>
    );
}
