// app/home/page.tsx
"use client";

import { useUser } from "@/context/userContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Clock, MapPin, Star } from "lucide-react";

export default function HomePage() {
    const { user } = useUser();

    return (
        <main className="min-h-screen bg-[#0b1120] text-white pt-24 px-6 pb-16">
            <Tabs
                defaultValue="resumen"
                className="w-full max-w-[1200px] mx-auto"
            >
                <TabsList className="bg-[#1a1f2b] border border-[#2c3446] rounded-lg mb-6 gap-1">
                    <TabsTrigger
                        value="resumen"
                        className="data-[state=active]:bg-[#323c53] text-white px-4 py-2 text-sm cursor-pointer shadow"
                    >
                        Resumen
                    </TabsTrigger>
                    <TabsTrigger
                        value="reservas"
                        className="data-[state=active]:bg-[#323c53] text-white px-4 py-2 text-sm cursor-pointer shadow"
                    >
                        Reservas
                    </TabsTrigger>
                    <TabsTrigger
                        value="equipos"
                        className="data-[state=active]:bg-[#323c53] text-white px-4 py-2 text-sm cursor-pointer shadow"
                    >
                        Equipos
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="resumen">
                    <header className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                        <div className="flex gap-4">
                            <Button variant="secondary">+ Nueva Reserva</Button>
                        </div>
                    </header>

                    <div className="flex gap-4 mb-8">
                        <div className="bg-[#1a1f2b] rounded-xl p-4 flex-1">
                            <p className="text-sm text-gray-400 mb-1">
                                Reservas Activas
                            </p>
                            <h2 className="text-3xl font-semibold">3</h2>
                            <p className="text-xs text-gray-500">
                                +1 desde el mes pasado
                            </p>
                        </div>
                        <div className="bg-[#1a1f2b] rounded-xl p-4 flex-1">
                            <p className="text-sm text-gray-400 mb-1">
                                Mis Equipos
                            </p>
                            <h2 className="text-3xl font-semibold">2</h2>
                            <p className="text-xs text-gray-500">
                                Eres capitán de 1 equipo
                            </p>
                        </div>
                        <div className="bg-[#1a1f2b] rounded-xl p-4 flex-1">
                            <p className="text-sm text-gray-400 mb-1">
                                Complejos Favoritos
                            </p>
                            <h2 className="text-3xl font-semibold">4</h2>
                            <p className="text-xs text-gray-500">
                                Visitaste 8 complejos en total
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <section>
                            <h3 className="text-xl font-bold mb-4">
                                Próximas Reservas
                            </h3>
                            <ul className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <li
                                        key={i}
                                        className="bg-[#1a1f2b] p-4 rounded-xl flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-semibold">
                                                Complejo Deportivo {i}
                                            </p>
                                            <p className="text-sm text-gray-400">
                                                <Calendar className="inline w-4 h-4 mr-1" />{" "}
                                                Mañana, 19:00 - 20:00
                                            </p>
                                        </div>
                                        <Button variant="default">Ver</Button>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h3 className="text-xl font-bold mb-4">
                                Mis Equipos
                            </h3>
                            <div className="bg-[#1a1f2b] p-4 rounded-xl mb-3">
                                <p className="font-semibold flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Los Campeones
                                    <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full ml-2">
                                        Capitán
                                    </span>
                                </p>
                                <p className="text-sm text-gray-400">
                                    8 jugadores
                                </p>
                                <Button variant="default" className="mt-2">
                                    Gestionar
                                </Button>
                            </div>
                            <div className="bg-[#1a1f2b] p-4 rounded-xl mb-3">
                                <p className="font-semibold flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Amigos FC
                                </p>
                                <p className="text-sm text-gray-400">
                                    10 jugadores
                                </p>
                                <Button variant="default" className="mt-2">
                                    Ver
                                </Button>
                            </div>
                            <Button variant="outline" className="w-full mt-2">
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
                    <div className="text-gray-400 text-center py-10">
                        Aún no hay reservas disponibles.
                    </div>
                </TabsContent>

                <TabsContent value="equipos">
                    <div className="text-gray-400 text-center py-10">
                        Aún no hay equipos disponibles.
                    </div>
                </TabsContent>
            </Tabs>
        </main>
    );
}
