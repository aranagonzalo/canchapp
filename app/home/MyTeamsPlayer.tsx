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
import { toast, Toaster } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useUser } from "@/context/userContext";
import { useNotifications } from "@/hooks";

interface Equipo {
    id_equipo: number;
    nombre_equipo: string;
    cant_max: number;
    cant_jugadores: number;
    ubicacion: string;
    publico: boolean;
    capitan: number;
}

export default function MyTeamsPlayer({ id_jugador }: { id_jugador: number }) {
    const { user } = useUser();

    const [equipos, setEquipos] = useState<Equipo[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingEquipoId, setDeletingEquipoId] = useState<number | null>(
        null
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        nombre_equipo: "",
        cant_max: 0,
        ubicacion: "",
        publico: true,
        tipo_equipo: "",
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const createParam = params.get("create");

        if (createParam === "true") {
            setModalOpen(true);
        }
    }, []);

    const fetchEquipos = async () => {
        try {
            const res = await fetch(`/api/teams/my_teams/${id_jugador}`);

            if (!res.ok) {
                const errorData = await res.json();
                toast.error(errorData.message || "Error al obtener equipos");
                setEquipos([]);
                return;
            }

            const data = await res.json();
            setEquipos(data);
        } catch (err) {
            console.error("Error de red:", err);
            toast.error("Error de red al cargar tus equipos");
            setEquipos([]);
        } finally {
            setLoading(false);
        }
    };

    const crearEquipo = async () => {
        try {
            const yaExiste = equipos.some(
                (eq) =>
                    eq.nombre_equipo.trim().toLowerCase() ===
                    form.nombre_equipo.trim().toLowerCase()
            );
            if (yaExiste) {
                toast.error("Ya tienes un equipo con ese nombre");
                return;
            }
            if (form.nombre_equipo.trim().length < 3) {
                toast.error(
                    "El nombre del equipo debe tener al menos 3 caracteres."
                );
                return;
            }

            if (form.ubicacion.trim().length < 5) {
                toast.error("La ubicación debe tener al menos 5 caracteres.");
                return;
            }

            if (!form.tipo_equipo) {
                toast.error("Selecciona un tipo de equipo.");
                return;
            }
            const res = await fetch("/api/teams/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    capitan: id_jugador,
                    id_jugadores: [id_jugador],
                }),
            });
            if (!res.ok) throw new Error("Error al crear equipo");
            toast.success("Equipo creado correctamente");

            setModalOpen(false);
            fetchEquipos();
        } catch (err) {
            console.error(err);
            toast.error("No se pudo crear el equipo");
        }
    };

    const eliminarEquipo = async (id_equipo: number) => {
        try {
            setDeletingEquipoId(id_equipo);
            const res = await fetch(`/api/teams/delete/${id_equipo}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Error al eliminar el equipo");

            toast.success("Equipo eliminado correctamente");
            fetchEquipos();
            setModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("No se pudo eliminar el equipo");
        } finally {
            setDeletingEquipoId(null);
        }
    };

    useEffect(() => {
        fetchEquipos();
    }, []);

    useEffect(() => {
        if (!modalOpen) {
            setForm({
                nombre_equipo: "",
                cant_max: 10,
                ubicacion: "",
                publico: true,
                tipo_equipo: "",
            });
        }
    }, [modalOpen]);

    useEffect(() => {
        switch (form.tipo_equipo) {
            case "Futbol 5":
                setForm((prev) => ({ ...prev, cant_max: 10 }));
                break;
            case "Futbol 7":
                setForm((prev) => ({ ...prev, cant_max: 14 }));
                break;
            case "Futbol 9":
                setForm((prev) => ({ ...prev, cant_max: 18 }));
                break;
            case "Futbol 11":
                setForm((prev) => ({ ...prev, cant_max: 22 }));
                break;
            default:
                setForm((prev) => ({ ...prev, cant_max: 0 }));
        }
    }, [form.tipo_equipo]);

    if (loading)
        return (
            <div className="text-white flex gap-2 items-center">
                <LoadingSpinner /> Cargando tus equipos...
            </div>
        );

    return (
        <div>
            <Toaster richColors position="top-right" />
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Mis equipos</h2>
                <Dialog
                    open={modalOpen}
                    onOpenChange={(open) => {
                        setModalOpen(open);
                        if (!open) {
                            const params = new URLSearchParams(
                                window.location.search
                            );
                            if (params.has("create")) {
                                params.delete("create");
                                const newUrl = `${
                                    window.location.pathname
                                }?${params.toString()}`;
                                window.history.replaceState({}, "", newUrl);
                            }
                        }
                    }}
                >
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-700 hover:to-amber-500 cursor-pointer text-white text-sm">
                            + Crear Equipo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#0b1120] rounded-lg shadow-lg max-h-[90vh] w-full border border-slate-800">
                        <DialogClose className="absolute top-4 right-4 text-white cursor-pointer z-30 hover:text-gray-300">
                            <X className="z-20 h-5 w-5 text-white" />
                        </DialogClose>
                        <DialogHeader>
                            <DialogTitle className="text-white">
                                Crear Equipo
                            </DialogTitle>
                            <DialogDescription className="text-gray-400">
                                Crea un nuevo equipo.
                            </DialogDescription>
                        </DialogHeader>

                        <Input
                            placeholder="Nombre del equipo"
                            value={form.nombre_equipo}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    nombre_equipo: e.target.value,
                                })
                            }
                            className="mb-2 w-full border border-slate-700 text-white !placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none"
                        />
                        <Input
                            placeholder="Ubicación"
                            value={form.ubicacion}
                            onChange={(e) =>
                                setForm({ ...form, ubicacion: e.target.value })
                            }
                            className="mb-2 w-full border border-slate-700 text-white !placeholder-gray-500 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none"
                        />
                        <Label className="text-white">Tipo de Equipo</Label>
                        <Select
                            value={form.tipo_equipo}
                            onValueChange={(value) =>
                                setForm({ ...form, tipo_equipo: value })
                            }
                        >
                            <SelectTrigger className="mb-4 w-full text-white border border-slate-700 focus-visible:ring-white">
                                <SelectValue placeholder="Tipo de Equipo" />
                            </SelectTrigger>
                            <SelectContent className="text-white bg-slate-900 border-slate-700">
                                <SelectItem value="Futbol 5">
                                    Futbol 5
                                </SelectItem>
                                <SelectItem value="Futbol 7">
                                    Futbol 7
                                </SelectItem>
                                <SelectItem value="Futbol 9">
                                    Futbol 9
                                </SelectItem>
                                <SelectItem value="Futbol 11">
                                    Futbol 11
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {/* Visibilidad del equipo */}
                        <Label className="text-white">
                            Visibilidad del equipo
                        </Label>
                        <Select
                            value={form.publico ? "publico" : "privado"}
                            onValueChange={(value) =>
                                setForm({
                                    ...form,
                                    publico: value === "publico",
                                })
                            }
                        >
                            <SelectTrigger className="mb-1 w-full md:w-1/2 text-white border border-slate-700 focus-visible:ring-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="text-white bg-slate-900 border-slate-700">
                                <SelectItem value="publico">Público</SelectItem>
                                <SelectItem value="privado">Privado</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-slate-400 mb-4">
                            {form.publico
                                ? "Tu equipo será visible en la búsqueda de jugadores."
                                : "Tu equipo no será visible en la búsqueda de jugadores."}
                        </p>
                        <Button
                            onClick={crearEquipo}
                            className="w-full bg-gradient-to-r from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600 cursor-pointer text-white"
                        >
                            Guardar
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>

            <Table>
                <TableHeader className="bg-[#1a1f2b] text-white ">
                    <TableRow className="border-b border-slate-800 h-12 hover:bg-slate-800">
                        <TableHead className="text-white">Nombre</TableHead>
                        <TableHead className="text-white">Ubicación</TableHead>
                        <TableHead className="text-white">Jugadores</TableHead>
                        <TableHead className="text-white">Máximo</TableHead>
                        <TableHead className="text-white">Acción</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {equipos.length === 0 ? (
                        <TableRow className="border-b border-gray-800 hover:bg-gray-900">
                            <TableCell
                                colSpan={5}
                                className="text-slate-400 h-12 text-center hover:bg-slate-900"
                            >
                                Aún no tenés equipos
                            </TableCell>
                        </TableRow>
                    ) : (
                        equipos?.map((equipo) => (
                            <TableRow
                                key={equipo.id_equipo}
                                className="border-b border-gray-800 hover:bg-gray-900 h-12"
                            >
                                <TableCell className="flex items-center gap-2">
                                    {equipo.nombre_equipo}
                                    {equipo.capitan === user?.id && (
                                        <span className="text-xs bg-gradient-to-r from-custom-dark-green to-custom-green text-white px-2 py-0.5 rounded-full">
                                            Capitán
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>{equipo.ubicacion}</TableCell>
                                <TableCell>{equipo.cant_jugadores}</TableCell>
                                <TableCell className="flex items-center gap-3">
                                    {equipo.cant_max}
                                </TableCell>
                                {equipo.capitan === user?.id && (
                                    <TableCell>
                                        <button
                                            onClick={() =>
                                                eliminarEquipo(equipo.id_equipo)
                                            }
                                            className="w-26 bg-red-500 hover:bg-red-600 cursor-pointer rounded text-white font-medium py-1 px-2 text-xs flex items-center justify-center"
                                            title="Eliminar equipo"
                                        >
                                            {deletingEquipoId ===
                                            equipo.id_equipo ? (
                                                <LoadingSpinner />
                                            ) : (
                                                "Eliminar Equipo"
                                            )}
                                        </button>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
