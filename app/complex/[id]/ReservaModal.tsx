"use client";
import { es } from "react-day-picker/locale";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser } from "@/context/userContext";
import { toast, Toaster } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { sendEmail, useNotifications } from "@/hooks";
import { formatHourRange, getReservaEmailTemplate } from "@/lib/utils";

interface Props {
    mailAdmin: string;
    idAdmin: number;
    idComplejo: number;
    idCancha: number;
    nombreCancha: string | null;
    onClose: () => void;
}

export function ReservaModal({
    mailAdmin,
    idAdmin,
    idComplejo,
    idCancha,
    nombreCancha,
    onClose,
}: Props) {
    const { user } = useUser();
    const { notificar } = useNotifications();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [disabledDates, setDisabledDates] = useState<Date[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);
    const [loadingHoras, setLoadingHoras] = useState(false);
    const [horasSeleccionadas, setHorasSeleccionadas] = useState<string[]>([]);

    useEffect(() => {
        fetch(`/api/canchas/${idCancha}/disponibilidad-general`)
            .then((res) => res.json())
            .then((data) => {
                const fechas = data.fechas_no_disponibles.map(
                    (f: any) => new Date(f.fecha)
                );
                setDisabledDates(fechas);
            });
    }, [idCancha]);
    const [equiposCapitan, setEquiposCapitan] = useState<any[]>([]);
    const [loadingEquipos, setLoadingEquipos] = useState(true);
    const [selectedEquipoId, setSelectedEquipoId] = useState<
        string | undefined
    >(undefined);

    useEffect(() => {
        const fetchEquipos = async () => {
            try {
                const res = await fetch(`/api/equipos?capitan_id=${user?.id}`);
                const data = await res.json();
                setEquiposCapitan(data.equipos || []);
            } catch (err) {
                console.error("Error al obtener equipos:", err);
            } finally {
                setLoadingEquipos(false);
            }
        };

        if (user?.id) {
            fetchEquipos();
        }
    }, [user]);

    useEffect(() => {
        if (selectedDate) {
            const fecha = selectedDate.toISOString().split("T")[0];
            setLoadingHoras(true);
            fetch(
                `/api/canchas/${idCancha}/horarios-disponibles?fecha=${fecha}`
            )
                .then((res) => res.json())
                .then((data) => {
                    setHorasDisponibles(data.horas_disponibles);
                    setHorasSeleccionadas([]);
                })
                .finally(() => setLoadingHoras(false));
        }
    }, [selectedDate, idCancha]);

    useEffect(() => {
        setSelectedDate(new Date()); // 👈 seleccionar hoy al abrir
    }, []);

    const isToday = selectedDate?.toDateString() === new Date().toDateString();
    const currentHour = new Date().getHours();

    const handleHoraClick = (hora: string) => {
        setHorasSeleccionadas(
            (prev) =>
                prev.includes(hora)
                    ? prev.filter((h) => h !== hora) // deseleccionar
                    : [...prev, hora] // seleccionar
        );
    };

    async function handleReserva() {
        if (
            !selectedDate ||
            !selectedEquipoId ||
            horasSeleccionadas.length === 0
        ) {
            toast.info(
                "Debes seleccionar un día, horario y equipo para continuar."
            );
            return;
        }

        const res = await fetch("/api/reservations/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_equipo: selectedEquipoId,
                id_cancha: idCancha,
                id_complejo: idComplejo,
                fecha: selectedDate.toISOString().split("T")[0],
                horas: horasSeleccionadas, // array de strings ["08", "09"]
            }),
        });

        const data = await res.json();
        if (res.ok) {
            toast.success("Reserva realizada correctamente");
            // notificar al administrador
            try {
                notificar({
                    titulo: "Nueva reserva",
                    mensaje: `${
                        user?.nombre
                    } ha hecho una nueva reserva en ${nombreCancha} el ${
                        selectedDate.toISOString().split("T")[0]
                    } a las ${formatHourRange(horasSeleccionadas)}`,
                    url: "/admin/reservas",
                    destinatarios: [{ id: idAdmin, tipo: "administrador" }],
                });
            } catch (err) {
                console.log(err);
            }

            // enviar notificacion por correo
            const html = getReservaEmailTemplate({
                titulo: "Nueva Reserva Recibida",
                mensaje: `¡Hola! Te saludamos desde CanchApp para notificarte que ${
                    user?.nombre
                } ha hecho una nueva reserva en ${nombreCancha} el ${
                    selectedDate.toISOString().split("T")[0]
                } a las ${formatHourRange(horasSeleccionadas)}.`,
                url: `https://canchapp.vercel.app/admin/reservas`,
            });

            try {
                await sendEmail({
                    to: mailAdmin,
                    subject: "CanchApp - ¡Nueva Reserva Recibida!",
                    html: html,
                });
            } catch (err) {
                console.log(err);
            }
            onClose();
        } else {
            toast.error(data.message || "Error al reservar");
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="!max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Reservar cancha</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="pr-4 border-r border-gray-200 flex justify-center">
                        <Calendar
                            locale={es}
                            className="!p-0"
                            required
                            mode="single"
                            selected={selectedDate ?? undefined}
                            onSelect={setSelectedDate}
                            disabled={(date) =>
                                date < today || // 🔒 deshabilita días pasados
                                disabledDates.some(
                                    (d) =>
                                        d.toDateString() === date.toDateString()
                                )
                            }
                        />
                    </div>
                    <div className="pl-4">
                        <p className="mb-2 font-semibold">
                            Horarios disponibles
                        </p>
                        {loadingHoras ? (
                            <div className="flex gap-2 items-center text-sm text-gray-400">
                                <LoadingSpinner />
                                Obteniendo horarios disponibles...
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {horasDisponibles.map((hora) => {
                                    const horaNum = parseInt(hora);
                                    const isDisabled =
                                        isToday && horaNum <= currentHour;

                                    return (
                                        <Button
                                            key={hora}
                                            variant="outline"
                                            disabled={isDisabled}
                                            className={`text-sm ${
                                                horasSeleccionadas.includes(
                                                    hora
                                                )
                                                    ? "bg-emerald-500 text-white hover:text-white hover:bg-emerald-600"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                handleHoraClick(hora)
                                            }
                                        >
                                            {hora}:00 - {horaNum + 1}:00
                                        </Button>
                                    );
                                })}
                            </div>
                        )}
                        <div className="mt-4">
                            {loadingEquipos ? (
                                <p className="text-sm text-gray-500">
                                    Cargando tus equipos...
                                </p>
                            ) : equiposCapitan.length === 0 ? (
                                <p className="text-red-500 text-sm">
                                    No tienes equipos registrados como capitán.
                                </p>
                            ) : (
                                <Select
                                    value={selectedEquipoId}
                                    onValueChange={(value: string) =>
                                        setSelectedEquipoId(value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona un equipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {equiposCapitan.map((eq) => (
                                            <SelectItem
                                                key={eq.id_equipo}
                                                value={eq.id_equipo}
                                            >
                                                {eq.nombre_equipo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-6 flex justify-between items-center">
                    <Button variant="ghost" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        disabled={
                            horasSeleccionadas.length === 0 ||
                            selectedEquipoId === null
                        }
                        onClick={handleReserva}
                        className="cursor-pointer bg-gradient-to-r from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600"
                    >
                        Reservar ahora
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
