// src/components/landing/TeamBuilderSection.tsx
"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

import Image from "next/image";
import { AvatarStack } from "../AvatarStack";
import { Button } from "../ui/button";

export function TeamBuilderSection() {
    const router = useRouter();
    const { user } = useUser();

    const handleCreateTeam = () => {
        if (user) {
            router.push("/home?tab=equipos&subtab=mis&create=true");
        } else {
            router.push("/login");
        }
    };

    return (
        <section className="relative bg-[#030712] text-white py-20 px-4">
            {/* Gradiente blur decorativo centrado */}
            <div
                className="absolute inset-0 flex justify-center items-center pointer-events-none z-10"
                aria-hidden="true"
            >
                <div className="w-[600px] h-[600px] bg-green-500 opacity-10 rounded-full blur-[180px]" />
            </div>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                {/* Texto + tarjetas */}
                <div className="flex-1">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        Forma tu Equipo
                    </h2>
                    <p className="text-gray-400 mb-8">
                        Crea tu equipo, invita a tus amigos y organiza tus
                        partidos fácilmente.
                    </p>

                    <div className="flex flex-col gap-4">
                        <div className="bg-[#1f283a] border border-slate-700 p-4 rounded-xl z-20">
                            <h3 className="text-lg font-bold mb-1">
                                Gestión de Equipos
                            </h3>
                            <p className="text-sm text-gray-400">
                                Crea múltiples equipos, asigna roles y mantén
                                organizados a todos los jugadores.
                            </p>
                        </div>
                        <div className="bg-[#1f283a] border border-slate-700 p-4 rounded-xl z-20">
                            <h3 className="text-lg font-bold mb-1">
                                Capitanes
                            </h3>
                            <p className="text-sm text-gray-400">
                                Los capitanes pueden gestionar reservas,
                                confirmar asistencias y coordinar pagos.
                            </p>
                        </div>
                        <div className="bg-[#1f283a] border border-slate-700 p-4 rounded-xl z-20">
                            <h3 className="text-lg font-bold mb-1">
                                Historial de Partidos
                            </h3>
                            <p className="text-sm text-gray-400">
                                Lleva un registro de todos tus partidos,
                                estadísticas y reservas anteriores.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Imagen + overlay */}
                <div className="flex-1 relative border border-slate-800 shadow rounded-xl z-10 overflow-hidden">
                    {/* Contenedor para imagen y overlay con bordes compartidos */}
                    <div className="relative w-full h-full">
                        <Image
                            src="/images/equipos/equipo3.jpeg"
                            alt="Equipo en la cancha"
                            width={600}
                            height={400}
                            className="object-cover w-full h-auto"
                        />

                        {/* Overlay inferior */}
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white z-20 pointer-events-none">
                            <div className="pointer-events-auto">
                                <AvatarStack />
                                <p className="text-green-400 font-semibold tracking-tight drop-shadow">
                                    Los Campeones{" "}
                                    <span className="text-slate-200 font-medium">
                                        – 5 jugadores
                                    </span>
                                </p>
                                <Button
                                    onClick={handleCreateTeam}
                                    className="cursor-pointer mt-3 bg-gradient-to-r from-custom-green to-custom-dark-green hover:from-custom-dark-green hover:to-emerald-700 text-white px-4 py-2 rounded-md text-sm font-normal tracking-tight"
                                >
                                    Crear mi Equipo
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
