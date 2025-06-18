"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, MapPin, Phone, Users, Clock } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ReservaModal } from "./ReservaModal";
import { Toaster } from "sonner";

interface Complejo {
    id_complejo: number;
    nombre_complejo: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    descripcion: string | null;
}

interface Cancha {
    id_cancha: number;
    nombre_cancha: string;
    cant_jugador: number;
    techo: boolean;
    horarios_disponibles: string[];
    precio_turno: number;
    imagen?: string;
}

export default function ComplejoDetallePage() {
    const { id } = useParams();
    const router = useRouter();
    const [complejo, setComplejo] = useState<Complejo | null>(null);
    const [loading, setLoading] = useState(true);
    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [selectedCanchaId, setSelectedCanchaId] = useState<number | null>(
        null
    );

    useEffect(() => {
        fetch(`/api/complexes/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === "Respuesta ok") {
                    setComplejo(data.complejo);
                    setCanchas(data.canchas); // ✅ ahora también seteamos las canchas
                } else {
                    setComplejo(null);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener el complejo:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading)
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0b1120] to-[#030712] text-white flex flex-col gap-2 items-center justify-center">
                <LoadingSpinner /> Cargando...
            </div>
        );

    if (!complejo) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0b1120] to-[#030712] text-white flex flex-col items-center justify-center">
                <p className="text-xl mb-4">
                    No se encontró el complejo solicitado.
                </p>
                <Button onClick={() => router.push("/complexes")}>
                    Volver al mapa
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-[#0b1120] to-[#030712] min-h-screen pb-20  text-white">
            <Toaster richColors position="top-right" />
            {/* Banner */}
            <div
                className="relative h-64 md:h-96 w-full bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('/images/canchas/cancha1.jpeg')`,
                }}
            >
                <div className="absolute inset-0 flex items-end p-6 max-w-[1200px] mx-auto">
                    <div>
                        <h1 className="text-3xl font-bold mb-1">
                            {complejo.nombre_complejo}
                        </h1>
                        <p className="flex items-center text-sm text-gray-300">
                            <MapPin className="w-4 h-4 mr-1" />
                            {complejo.ciudad}, {complejo.direccion}
                            <Star className="ml-4 w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="ml-1">4.8 (8 reseñas)</span>
                        </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                        {/* <Button variant="secondary">Guardar</Button> */}
                    </div>
                </div>
            </div>

            {/* Tabs sección */}
            <Tabs
                defaultValue="canchas"
                className="w-full max-w-[1200px] mx-auto px-6 pt-12"
            >
                <TabsList className="bg-[#1a1f2b] border border-gray-800 rounded-md mb-6 gap-1">
                    <TabsTrigger
                        value="canchas"
                        className="data-[state=active]:bg-gray-700 text-white px-4 py-2 text-sm cursor-pointer shadow"
                    >
                        Canchas
                    </TabsTrigger>
                    <TabsTrigger
                        value="info"
                        className="data-[state=active]:bg-gray-700 text-white px-4 py-2 text-sm cursor-pointer shadow"
                    >
                        Información
                    </TabsTrigger>
                    <TabsTrigger
                        value="resenas"
                        className="data-[state=active]:bg-gray-700 text-white px-4 py-2 text-sm cursor-pointer shadow"
                    >
                        Reseñas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="canchas">
                    <h2 className="text-xl font-bold mb-4">
                        Canchas disponibles
                    </h2>

                    {canchas.length === 0 ? (
                        <p className="text-sm text-gray-400">
                            Este complejo aún no tiene canchas registradas.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {canchas.map((cancha, i) => (
                                <div
                                    key={cancha.id_cancha}
                                    className="bg-[#1a1f2b] p-4 rounded-xl border border-gray-700"
                                >
                                    <div
                                        className="h-28 bg-gray-700 rounded mb-3 bg-center bg-cover"
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
                                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                        <Users className="w-4 h-4" /> Capacidad:{" "}
                                        {cancha.cant_jugador} jugadores
                                    </p>
                                    {/* <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                        <Clock className="w-4 h-4" />{" "}
                                        Disponible: {cancha.horario_apertura} -{" "}
                                        {cancha.horario_cierre}
                                    </p> */}
                                    {/* {cancha.horarios_disponibles.length > 0 && (
                                        <p className="text-sm text-green-400">
                                            Disponible hoy
                                        </p>
                                    )} */}

                                    <div className="text-right -mt-4">
                                        <p className="text-green-400 font-bold mb-1">
                                            ${cancha.precio_turno}/h
                                        </p>

                                        <Button
                                            onClick={() =>
                                                setSelectedCanchaId(
                                                    cancha.id_cancha
                                                )
                                            }
                                            className="mt-3 cursor-pointer w-full bg-gradient-to-r from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600"
                                        >
                                            Reservar
                                        </Button>
                                        {selectedCanchaId && (
                                            <ReservaModal
                                                idComplejo={
                                                    complejo?.id_complejo
                                                }
                                                idCancha={selectedCanchaId}
                                                onClose={() =>
                                                    setSelectedCanchaId(null)
                                                }
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="info">
                    <h2 className="text-xl font-bold mb-4">
                        Información del Complejo
                    </h2>
                    <p className="text-sm text-gray-400 mb-2">
                        <Phone className="inline w-4 h-4 mr-1" />{" "}
                        {complejo.telefono}
                    </p>
                    <p className="text-sm text-gray-400">
                        {complejo.descripcion ||
                            "Este complejo aún no tiene descripción."}
                    </p>
                </TabsContent>

                <TabsContent value="resenas">
                    <h2 className="text-xl font-bold mb-4">Reseñas</h2>
                    <p className="text-sm text-gray-400">
                        Aún no hay reseñas disponibles.
                    </p>
                </TabsContent>
            </Tabs>
        </div>
    );
}
