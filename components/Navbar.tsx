"use client";

import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
    const { user, logout } = useUser();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    return (
        <nav className="bg-[#0b1220]/80 shadow shadow-black/40 backdrop-blur-2xl text-white py-4 px-6 flex items-center justify-between fixed top-0 left-0 w-full z-50">
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
                <div className="bg-gradient-to-br from-green-400 to-green-700 p-1.5 rounded-md">
                    <Calendar />
                </div>
                <span className="text-white">CanchApp</span>
            </a>

            {!user ? (
                <>
                    <div className="hidden md:flex gap-8 text-sm">
                        <a href="#complejos" className="hover:text-green-400">
                            Complejos
                        </a>
                        <a href="#funciona" className="hover:text-green-400">
                            Cómo Funciona
                        </a>
                        <a href="#equipos" className="hover:text-green-400">
                            Equipos
                        </a>
                        <a href="#cta" className="hover:text-green-400">
                            Comenzar
                        </a>
                    </div>
                    <div className="flex items-center gap-4">
                        <a href="/login" className="text-sm hover:underline">
                            Iniciar Sesión
                        </a>
                        <a
                            href="/register"
                            className="bg-gradient-to-r from-custom-green to-custom-dark-green hover:from-custom-dark-green hover:to-emerald-700 text-white px-4 py-2 rounded-md text-sm font-normal tracking-tight"
                        >
                            Registrarse
                        </a>
                    </div>
                </>
            ) : (
                <div className="flex items-center gap-4 text-sm">
                    {user.tipo === "jugador" ? (
                        <>
                            <Link href="/home" className="hover:text-green-400">
                                Mis Reservas
                            </Link>
                            <Link
                                href="/complejos"
                                className="hover:text-green-400"
                            >
                                Buscar Canchas
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/admin/canchas"
                                className="hover:text-green-400"
                            >
                                Mis Canchas
                            </Link>
                            <Link
                                href="/admin/reservas"
                                className="hover:text-green-400"
                            >
                                Reservas del Día
                            </Link>
                        </>
                    )}

                    <span className="font-medium">{user.nombre}</span>
                    <button
                        onClick={handleLogout}
                        className="text-sm px-3 py-1 rounded bg-red-600 hover:bg-red-500 transition"
                    >
                        Cerrar sesión
                    </button>
                </div>
            )}
        </nav>
    );
}
