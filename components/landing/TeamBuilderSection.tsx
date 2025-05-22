// src/components/landing/TeamBuilderSection.tsx
import Image from "next/image";
import { Users, Trophy, CalendarCheck } from "lucide-react";

export function TeamBuilderSection() {
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
                <div className="flex-1 relative rounded-xl overflow-hidden z-20 border border-slate-800 shadow">
                    <Image
                        src="/images/team-sample.jpg"
                        alt="Equipo en la cancha"
                        width={600}
                        height={400}
                        className="rounded-xl object-cover w-full h-auto z-20"
                    />

                    {/* Overlay inferior */}
                    <div className="z-20 absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map((n) => (
                                <div
                                    key={n}
                                    className="w-3 h-3 rounded-full bg-gray-400"
                                />
                            ))}
                        </div>
                        <p className="text-green-400 font-medium">
                            Los Campeones – 5 jugadores
                        </p>
                        <button className="mt-3 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                            Crear mi Equipo
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
