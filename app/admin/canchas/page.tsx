"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Users, Pencil, Trash2, PlusCircle, CalendarPlus } from "lucide-react";
import EditarCanchaModal from "./EditarCanchaModal";
import CrearCanchaModal from "./CrearCanchaModal";
import { useUser } from "@/context/userContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Toaster } from "sonner";
import ConfirmarEliminarModal from "./EliminarCanchaModal";

interface Cancha {
    id_cancha: number;
    nombre_cancha: string;
    cant_jugador: number;
    techo: boolean;
    imagen?: string;
    precio_turno: number;
    horarios_disponibles: string[];
}

export default function CanchasAdmin() {
    const { user } = useUser();
    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [idComplejo, setIdComplejo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalEditar, setModalEditar] = useState<Cancha | null>(null);
    const [modalCrear, setModalCrear] = useState(false);
    const [modalEliminar, setModalEliminar] = useState<number | null>(null);

    const fetchCanchas = async () => {
        if (!user?.id) return;
        setLoading(true);
        const res = await fetch(`/api/admin/canchas?id_admin=${user.id}`);
        const data = await res.json();
        setCanchas(data?.canchas || []);
        setIdComplejo(data?.id_complejo);
        setLoading(false);
    };

    useEffect(() => {
        fetchCanchas();
    }, [user]);

    const eliminarCancha = async (id: number) => {
        const confirm = window.confirm(
            "¿Estás seguro de eliminar esta cancha?"
        );
        if (!confirm) return;
        const res = await fetch(`/api/cancha/${id}`, { method: "DELETE" });
        if (res.ok) {
            setCanchas((prev) => prev.filter((c) => c.id_cancha !== id));
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center bg-gradient-to-b to-[#0b1120] from-[#030712] min-h-screen pb-20  text-white">
                <div className="text-white p-10 flex gap-1">
                    <LoadingSpinner />
                    Cargando...
                </div>
            </div>
        );

    return (
        <div className="bg-gradient-to-b to-[#0b1120] from-[#030712] min-h-screen pb-20  text-white">
            <div className="w-full max-w-[1200px] mx-auto px-6 pt-32">
                <Toaster richColors position="top-right" />
                <div className="flex justify-between items-center mb-12">
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-bold">
                            Canchas registradas
                        </h2>
                        <p className="text-gray-400 mt-2">
                            Edita, agrega fechas, o elimina las canchas
                            registradas de tu complejo.
                        </p>
                    </div>

                    <Button
                        onClick={() => setModalCrear(true)}
                        className="flex gap-2"
                        variant="secondary"
                    >
                        <PlusCircle className="w-4 h-4" /> Nueva cancha
                    </Button>
                </div>

                {canchas.length === 0 ? (
                    <p className="text-sm text-gray-400">
                        Tu complejo aún no tiene canchas registradas.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {canchas.map((cancha, i) => (
                            <div
                                key={cancha.id_cancha}
                                className="bg-[#1a1f2b] p-4 rounded-xl border border-gray-700"
                            >
                                <div
                                    className="h-40 bg-white rounded mb-3 bg-center bg-cover"
                                    style={{
                                        backgroundImage: `url('${
                                            cancha.imagen ||
                                            `/images/canchas/cancha${
                                                i + 1
                                            }.jpeg`
                                        }')`,
                                    }}
                                ></div>
                                <div className="flex justify-between items-start mb-2">
                                    <p className="font-semibold">
                                        {cancha.nombre_cancha}
                                    </p>
                                    {cancha.techo && (
                                        <span className="text-sm text-green-400 bg-[#033] px-2 py-0.5 rounded-full">
                                            Techada
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between text-sm text-gray-400 mb-1 ">
                                    <p className="flex items-center gap-1">
                                        {" "}
                                        <Users className="w-4 h-4" /> Capacidad:{" "}
                                        {cancha.cant_jugador} jugadores
                                    </p>

                                    <span className="text-base text-green-400 font-semibold px-2 py-0.5 rounded-full">
                                        $ {cancha.precio_turno}/h
                                    </span>
                                </div>

                                <div className="flex justify-between gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        className="bg-gradient-to-br from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600 cursor-pointer"
                                        onClick={() => setModalEditar(cancha)}
                                    >
                                        <Pencil className="w-4 h-4 mr-1" />{" "}
                                        Editar
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="cursor-pointer"
                                        onClick={() =>
                                            setModalEliminar(cancha.id_cancha)
                                        }
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />{" "}
                                        Eliminar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {modalEditar && (
                <EditarCanchaModal
                    cancha={modalEditar}
                    onClose={() => setModalEditar(null)}
                    onUpdated={fetchCanchas}
                />
            )}

            {modalCrear && idComplejo && (
                <CrearCanchaModal
                    onClose={() => setModalCrear(false)}
                    idComplejo={idComplejo} // debes tenerlo guardado
                    onCreated={fetchCanchas}
                />
            )}

            {modalEliminar && (
                <ConfirmarEliminarModal
                    canchaId={modalEliminar}
                    onClose={() => setModalEliminar(null)}
                    onDeleted={fetchCanchas}
                />
            )}
        </div>
    );
}
