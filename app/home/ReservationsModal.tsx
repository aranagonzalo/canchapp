"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface Equipo {
    id_equipo: number;
    nombre_equipo: string;
}

export interface ReservaData {
    nombre_complejo: string;
    direccion_complejo: string;
    telefono_complejo: string;
    nombre_cancha: string;
    fecha: string;
    hora: string;
    id_agenda: number;
}

interface Props {
    show: boolean;
    onHide: () => void;
    nuevaReserva: ReservaData;
    origen: "reservas" | "complejo";
}

export default function ReservationsModal({
    show,
    onHide,
    nuevaReserva,
    origen,
}: Props) {
    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [selectedEquipo, setSelectedEquipo] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchEquipos = async () => {
        try {
            const res = await fetch(
                `/api/teams/my_teams?id=${nuevaReserva?.id_agenda}`
            );
            const data = await res.json();
            setEquipos(data);
        } catch (err) {
            toast.error("No se pudieron cargar tus equipos.");
        }
    };

    useEffect(() => {
        if (show) {
            fetchEquipos();
            setSelectedEquipo(null);
        }
    }, [show]);

    const handleReservar = async () => {
        if (!selectedEquipo) {
            toast.warning("Selecciona un equipo para continuar.");
            return;
        }

        try {
            setLoading(true);
            const res = await fetch("/api/reservar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_agenda: nuevaReserva.id_agenda,
                    id_equipo: parseInt(selectedEquipo),
                }),
            });

            if (!res.ok) throw new Error();

            toast.success("Reserva confirmada correctamente.");
            onHide();
        } catch (err) {
            toast.error("Hubo un error al realizar la reserva.");
        } finally {
            setLoading(false);
        }
    };

    const handleCrearEquipo = () => {
        toast.info("Serás redirigido para crear tu equipo.");
        window.location.href = "/misEquipos";
    };

    return (
        <Dialog open={show} onOpenChange={onHide}>
            <DialogContent className="bg-[#0b1120] text-white border border-slate-800 max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        Finaliza tu reserva
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Completa la información para confirmar tu reserva.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    <div className="flex justify-center">
                        <Image
                            src="/images/reserva/reserva.jpg"
                            alt="Imagen de reserva"
                            width={300}
                            height={200}
                            className="rounded-lg"
                        />
                    </div>

                    <div className="space-y-2 text-sm">
                        <p>
                            <strong>Complejo:</strong>{" "}
                            {nuevaReserva.nombre_complejo}
                        </p>
                        <p>
                            <strong>Dirección:</strong>{" "}
                            {nuevaReserva.direccion_complejo}
                        </p>
                        <p>
                            <strong>Teléfono:</strong>{" "}
                            {nuevaReserva.telefono_complejo}
                        </p>
                        <p>
                            <strong>Cancha:</strong>{" "}
                            {nuevaReserva.nombre_cancha}
                        </p>
                        <p>
                            <strong>Fecha:</strong> {nuevaReserva.fecha}
                        </p>
                        <p>
                            <strong>Hora:</strong> {nuevaReserva.hora}
                        </p>

                        {equipos.length > 0 ? (
                            <div className="pt-2">
                                <Label className="mb-1 block text-white">
                                    Selecciona tu equipo
                                </Label>
                                <Select
                                    onValueChange={(value) =>
                                        setSelectedEquipo(value)
                                    }
                                >
                                    <SelectTrigger className="bg-slate-800 text-white">
                                        <SelectValue placeholder="Elige un equipo" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 text-white">
                                        {equipos.map((e) => (
                                            <SelectItem
                                                key={e.id_equipo}
                                                value={e.id_equipo.toString()}
                                            >
                                                {e.nombre_equipo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ) : (
                            <div className="pt-4">
                                <p className="text-gray-400">
                                    No tienes equipos creados.{" "}
                                    <button
                                        onClick={handleCrearEquipo}
                                        className="text-emerald-400 underline font-semibold"
                                    >
                                        Crear equipo
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="pt-2 flex justify-end gap-3">
                    {equipos.length > 0 && (
                        <Button
                            onClick={handleReservar}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-400 text-white"
                            disabled={loading}
                        >
                            {loading ? "Reservando..." : "Confirmar Reserva"}
                        </Button>
                    )}
                    <DialogClose asChild>
                        <Button variant="destructive">Cancelar</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
