// app/home/page.tsx
"use client";

import { useUser } from "@/context/userContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, MapPin, Star } from "lucide-react";
import AvailableTeamsPlayer from "./AvailableTeamsPlayer";
import MyTeamsPlayer from "./MyTeamsPlayer";
import Players from "./Players";
import { useRouter, useSearchParams } from "next/navigation";
import MyReservations from "./MyReservations";
import MyRequests from "./MyRequests";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { StarRating } from "@/components/StarRating";
import { formatHourRange } from "@/lib/utils";

interface Dashboard {
    complejos_recomendados: {
        id_complejo: number;
        total_reservas: number;
        nombre_complejo: string;
        rating_promedio: number;
        total_reviews: number;
        direccion: string;
        imagen_destacada: string;
    }[];

    equipos: {
        id_equipo: number;
        nombre_equipo: string;
        cant_max: number;
        capitan: number;
        id_jugadores: number[];
        ubicacion: string;
        proximo_partido: string | null;
        publico: boolean;
    }[];

    reservas: {
        listado: Reserva[]; // O mejor aún: Reserva[] si defines su tipo
        total: number;
        ultimos_30_dias: number;
    };

    reviews: {
        cantidad: number;
        promedio_puntaje: number;
    };
}

interface Reserva {
    id: number;
    fecha: string;
    horas: string[];
    is_active: string;
    complejo: { nombre_complejo: string; direccion: string };
    direccion: string;
    id_equipo: number;
}

export default function HomePage() {
    const { user } = useUser();

    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [dashboard, setDashboard] = useState<Dashboard | null>(null);

    const tabParam = searchParams.get("tab") || "resumen";
    const subtabParam = searchParams.get("subtab") || "disponibles";

    const updateURL = (newTab: string, newSubtab?: string) => {
        const params = new URLSearchParams();
        params.set("tab", newTab);
        if (newTab === "equipos" && newSubtab) {
            params.set("subtab", newSubtab);
        }
        router.replace(`/home?${params.toString()}`);
    };

    const fetchReservas = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/dashboard?id_jugador=${user?.id}`);
            const data = await res.json();
            setDashboard(data);
        } catch (err) {
            toast.error("Error al obtener reservas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchReservas();
    }, [user?.id]);

    if (loading)
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0b1120] to-[#030712] text-white flex flex-col gap-2 items-center justify-center">
                <LoadingSpinner /> Cargando...
            </div>
        );

    return (
        <main className="min-h-screen bg-gradient-to-b to-[#0b1120] from-[#030712] text-white pt-24 px-6 pb-16">
            <Toaster richColors position="top-right" />
            <header className="flex items-center justify-between mb-8 max-w-[1200px] mx-auto">
                <h1 className="text-3xl font-bold">
                    {tabParam[0].toUpperCase() +
                        tabParam.slice(1, tabParam.length)}
                </h1>
            </header>
            <Tabs
                value={tabParam}
                onValueChange={(value) => updateURL(value)}
                className="w-full max-w-[1200px] mx-auto"
            >
                <TabsList className="bg-[#1a1f2b] border border-gray-800 rounded-md mb-6 gap-1">
                    <TabsTrigger
                        value="resumen"
                        className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700 px-4 py-2 text-sm cursor-pointer data-[state=active]:border data-[state=active]:border-gray-800 shadow rounded"
                    >
                        Resumen
                    </TabsTrigger>
                    <TabsTrigger
                        value="reservas"
                        className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700 px-4 py-2 text-sm cursor-pointer data-[state=active]:border data-[state=active]:border-gray-800 shadow rounded"
                    >
                        Reservas
                    </TabsTrigger>
                    <TabsTrigger
                        value="equipos"
                        className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700 px-4 py-2 text-sm cursor-pointer data-[state=active]:border data-[state=active]:border-gray-800 shadow rounded"
                    >
                        Equipos
                    </TabsTrigger>
                    <TabsTrigger
                        value="jugadores"
                        className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700 px-4 py-2 text-sm cursor-pointer data-[state=active]:border data-[state=active]:border-gray-800 shadow rounded"
                    >
                        Jugadores
                    </TabsTrigger>
                    <TabsTrigger
                        value="solicitudes"
                        className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700 px-4 py-2 text-sm cursor-pointer data-[state=active]:border data-[state=active]:border-gray-800 shadow rounded"
                    >
                        Solicitudes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="resumen">
                    {/* Tarjetas de estadísticas */}
                    <div className="flex gap-4 mb-8">
                        <div className="bg-[#1a1f2b] rounded-xl p-4 flex-1 flex items-center justify-between border border-gray-800">
                            <div className="flex flex-col w-full">
                                <div className="w-full flex justify-between items-center">
                                    <p className="text-sm text-gray-400">
                                        Reservas Activas
                                    </p>
                                    <Clock className="text-emerald-400 w-4 h-4 " />
                                </div>
                                <h2 className="text-3xl font-semibold my-4">
                                    {dashboard?.reservas?.total}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {dashboard?.reservas?.ultimos_30_dias} en el
                                    último mes
                                </p>
                            </div>
                        </div>
                        <div className="bg-[#1a1f2b] rounded-xl p-4 flex-1 flex items-center justify-between border border-gray-800">
                            <div className="flex flex-col w-full">
                                <div className="w-full flex justify-between items-center">
                                    <p className="text-sm text-gray-400">
                                        Mis Equipos
                                    </p>
                                    <Users className="text-emerald-400 w-4 h-4" />
                                </div>

                                <h2 className="text-3xl font-semibold my-4">
                                    {dashboard?.equipos?.length}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Eres capitán de{" "}
                                    {
                                        dashboard?.equipos?.filter(
                                            (e) => e.capitan === user?.id
                                        ).length
                                    }{" "}
                                    equipo(s)
                                </p>
                            </div>
                        </div>
                        <div className="bg-[#1a1f2b] rounded-xl p-4 flex-1 flex items-center justify-between border border-gray-800">
                            <div className="flex flex-col w-full">
                                <div className="w-full flex justify-between items-center">
                                    <p className="text-sm text-gray-400 mb-1">
                                        Reseñas Escritas
                                    </p>
                                    <MapPin className="text-emerald-400 w-4 h-4" />
                                </div>
                                <h2 className="text-3xl font-semibold my-4">
                                    {dashboard?.reviews?.cantidad}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {dashboard?.reviews?.promedio_puntaje} es la
                                    puntuación promedio
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Próximas Reservas */}
                        <section>
                            <h3 className="text-xl font-bold mb-1">
                                Próximas Reservas
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Tus próximos partidos programados
                            </p>
                            <ul className="space-y-3">
                                {dashboard?.reservas?.listado?.map((r, i) => (
                                    <li
                                        key={i}
                                        className="bg-[#1a1f2b] p-4 rounded-xl flex justify-between items-center border border-gray-800"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="bg-green-600/20 p-2 rounded-md self-center">
                                                <Calendar className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    {r.complejo.nombre_complejo}{" "}
                                                    {!r.is_active && (
                                                        <span className="ml-2 bg-white text-black text-[11px] py-1 px-2 rounded-full">
                                                            Cancelada
                                                        </span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {formatHourRange(r.horas)}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {r.fecha}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() =>
                                                router.push(
                                                    "/home?tab=reservas"
                                                )
                                            }
                                            className="cursor-pointer bg-gradient-to-r from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-1.5 text-sm rounded-md"
                                        >
                                            Ver
                                        </Button>
                                    </li>
                                ))}
                                {dashboard?.reservas?.listado?.length === 0 && (
                                    <p className="text-sm text-gray-500 italic text-center mt-2">
                                        No tienes reservas próximas registradas.
                                    </p>
                                )}
                                {/* Crear nueva reserva */}
                                <Button
                                    onClick={() => router.push("/complexes")}
                                    className="cursor-pointer w-full mt-2 text-white bg-[#2a2f40] hover:bg-[#363c50] border border-[#3b445c] text-sm"
                                >
                                    + Reservar un predio
                                </Button>
                            </ul>
                        </section>

                        {/* Mis Equipos */}
                        <section>
                            <h3 className="text-xl font-bold mb-1">
                                Mis Equipos
                            </h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Equipos donde participas
                            </p>

                            {/* Equipo 1 */}
                            {dashboard?.equipos?.map((equipo) => (
                                <div
                                    key={equipo.id_equipo}
                                    className="bg-[#1a1f2b] p-4 rounded-xl mb-3 flex justify-between items-center border border-gray-800"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="bg-green-600/20 p-2 rounded-md">
                                            <Users className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold flex items-center gap-2">
                                                {equipo.nombre_equipo}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                {equipo.capitan ===
                                                    user?.id && (
                                                    <span className="bg-gradient-to-br from-custom-dark-green to-custom-green text-white text-xs px-2 py-0.5 rounded-full">
                                                        Capitán
                                                    </span>
                                                )}{" "}
                                                {equipo.id_jugadores.length}{" "}
                                                jugadores
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() =>
                                            router.push(
                                                "/home?tab=equipos&subtab=mis"
                                            )
                                        }
                                        className="cursor-pointer bg-gradient-to-r from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-1.5 text-sm rounded-md"
                                    >
                                        {equipo.capitan === user?.id
                                            ? "Gestionar"
                                            : "Ver"}
                                    </Button>
                                </div>
                            ))}
                            {dashboard?.equipos?.length === 0 && (
                                <p className="text-sm text-gray-500 italic text-center mt-2">
                                    Aún no formas parte de ningún equipo.
                                </p>
                            )}

                            {/* Crear nuevo equipo */}
                            <Button
                                onClick={() =>
                                    router.push(
                                        "/home?tab=equipos&subtab=mis&create=true"
                                    )
                                }
                                className="cursor-pointer w-full mt-2 text-white bg-[#2a2f40] hover:bg-[#363c50] border border-[#3b445c] text-sm"
                            >
                                + Crear Nuevo Equipo
                            </Button>
                        </section>
                    </div>

                    <section className="mt-10">
                        <h3 className="text-xl font-bold mb-2">
                            Predios Recomendados
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Basado en tus reservas anteriores
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {dashboard?.complejos_recomendados?.map((c) => (
                                <div
                                    key={c.id_complejo}
                                    className="bg-[#1a1f2b] p-3 rounded-xl border border-gray-800"
                                >
                                    <img
                                        className="h-40 w-full object-cover bg-gray-700 mb-3 rounded"
                                        src={
                                            c.imagen_destacada ||
                                            "/images/banners/banner4.jpg"
                                        }
                                        alt={c.nombre_complejo}
                                    />
                                    <StarRating
                                        rating={c.rating_promedio}
                                        totalReviews={c.total_reviews}
                                        showTotal
                                    />
                                    <p className="font-semibold">
                                        {c.nombre_complejo}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        {c.direccion}
                                    </p>
                                    <a
                                        href={`/complex/${c.id_complejo}`}
                                        className="text-sm text-green-400 hover:underline inline-block mt-2"
                                    >
                                        Ver
                                    </a>
                                </div>
                            ))}
                        </div>
                    </section>
                </TabsContent>

                <TabsContent value="reservas">
                    {user?.tipo === "jugador" ? <MyReservations /> : null}
                </TabsContent>

                <TabsContent value="equipos">
                    {user?.tipo === "jugador" ? (
                        <Tabs
                            value={subtabParam}
                            onValueChange={(value) =>
                                updateURL("equipos", value)
                            }
                            className="w-full"
                        >
                            <TabsList className="bg-[#1a1f2b] border border-gray-800 rounded-md mb-6 gap-1">
                                <TabsTrigger
                                    value="disponibles"
                                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700 px-4 py-2 text-sm cursor-pointer data-[state=active]:border data-[state=active]:border-gray-800 shadow rounded"
                                >
                                    Equipos disponibles
                                </TabsTrigger>
                                <TabsTrigger
                                    value="mis"
                                    className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-700 px-4 py-2 text-sm cursor-pointer data-[state=active]:border data-[state=active]:border-gray-800 shadow rounded"
                                >
                                    Mis equipos
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="disponibles">
                                <AvailableTeamsPlayer id_jugador={user?.id} />
                            </TabsContent>

                            <TabsContent value="mis">
                                <MyTeamsPlayer id_jugador={user?.id} />
                            </TabsContent>
                        </Tabs>
                    ) : null}
                </TabsContent>

                <TabsContent value="jugadores">
                    <Players />
                </TabsContent>

                <TabsContent value="solicitudes">
                    {user?.tipo === "jugador" ? <MyRequests /> : null}
                </TabsContent>
            </Tabs>
        </main>
    );
}
