// app/home/page.tsx
"use client";

import { useUser } from "@/context/userContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, MapPin, Star } from "lucide-react";
import AvailableTeamsPlayer from "./AvailableTeamsPlayer";
import AvailableTeamsAdmin from "./AvailableTeamsAdmin";
import MyTeamsPlayer from "./MyTeamsPlayer";
import Players from "./Players";
import { useRouter, useSearchParams } from "next/navigation";
import MyReservations from "./MyReservations";
import MyRequests from "./MyRequests";

export default function HomePage() {
    const { user } = useUser();

    const router = useRouter();
    const searchParams = useSearchParams();

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

    return (
        <main className="min-h-screen bg-gradient-to-b to-[#0b1120] from-[#030712] text-white pt-24 px-6 pb-16">
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
                                    3
                                </h2>
                                <p className="text-xs text-gray-500">
                                    +1 desde el mes pasado
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
                                    2
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Eres capitán de 1 equipo
                                </p>
                            </div>
                        </div>
                        <div className="bg-[#1a1f2b] rounded-xl p-4 flex-1 flex items-center justify-between border border-gray-800">
                            <div className="flex flex-col w-full">
                                <div className="w-full flex justify-between items-center">
                                    <p className="text-sm text-gray-400 mb-1">
                                        Complejos Favoritos
                                    </p>
                                    <MapPin className="text-emerald-400 w-4 h-4" />
                                </div>
                                <h2 className="text-3xl font-semibold my-4">
                                    4
                                </h2>
                                <p className="text-xs text-gray-500">
                                    Visitaste 8 complejos en total
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
                                {[1, 2, 3].map((i) => (
                                    <li
                                        key={i}
                                        className="bg-[#1a1f2b] p-4 rounded-xl flex justify-between items-center border border-gray-800"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="bg-green-600/20 p-2 rounded-md">
                                                <Calendar className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">
                                                    Complejo Deportivo {i}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    Mañana, 19:00 - 20:00
                                                </p>
                                            </div>
                                        </div>
                                        <Button className="cursor-pointer bg-gradient-to-r from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-1.5 text-sm rounded-md">
                                            Ver
                                        </Button>
                                    </li>
                                ))}
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
                            <div className="bg-[#1a1f2b] p-4 rounded-xl mb-3 flex justify-between items-center border border-gray-800">
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-600/20 p-2 rounded-md">
                                        <Users className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold flex items-center gap-2">
                                            Los Campeones
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            <span className="bg-gradient-to-br from-custom-dark-green to-custom-green text-white text-xs px-2 py-0.5 rounded-full">
                                                Capitán
                                            </span>{" "}
                                            8 jugadores
                                        </p>
                                    </div>
                                </div>
                                <Button className="cursor-pointer bg-gradient-to-r from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-1.5 text-sm rounded-md">
                                    Gestionar
                                </Button>
                            </div>

                            {/* Equipo 2 */}
                            <div className="bg-[#1a1f2b] p-4 rounded-xl mb-3 flex justify-between items-center border border-[#2c3446]">
                                <div className="flex items-start gap-3">
                                    <div className="bg-green-600/20 p-2 rounded-md">
                                        <Users className="w-5 h-5 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">
                                            Amigos FC
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            10 jugadores
                                        </p>
                                    </div>
                                </div>
                                <Button className="cursor-pointer bg-gradient-to-r from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600 text-white px-4 py-1.5 text-sm rounded-md">
                                    Ver
                                </Button>
                            </div>

                            {/* Crear nuevo equipo */}
                            <Button className="cursor-pointer w-full mt-2 text-white bg-[#2a2f40] hover:bg-[#363c50] border border-[#3b445c] text-sm">
                                + Crear Nuevo Equipo
                            </Button>
                        </section>
                    </div>

                    <section className="mt-10">
                        <h3 className="text-xl font-bold mb-2">
                            Complejos Recomendados
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                            Basado en tus reservas anteriores
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="bg-[#1a1f2b] p-4 rounded-xl"
                                >
                                    <div className="h-24 bg-gray-700 mb-3 rounded"></div>
                                    <div className="flex items-center text-yellow-400 mb-1">
                                        {Array.from({ length: 4 }).map(
                                            (_, idx) => (
                                                <Star
                                                    key={idx}
                                                    className="w-4 h-4 fill-yellow-400"
                                                />
                                            )
                                        )}
                                    </div>
                                    <p className="font-semibold">
                                        Complejo Deportivo {i}
                                    </p>
                                    <p className="text-sm text-gray-400 flex items-center">
                                        <MapPin className="w-4 h-4 mr-1" />{" "}
                                        Resistencia, Chaco
                                    </p>
                                    <a
                                        href="#"
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
                    ) : (
                        <AvailableTeamsAdmin />
                    )}
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
