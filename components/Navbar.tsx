"use client";

import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
                                Resumen
                            </Link>
                            <Link href="/home" className="hover:text-green-400">
                                Reservas
                            </Link>
                            <Link href="/home" className="hover:text-green-400">
                                Equipos
                            </Link>
                            <Link
                                href="/complejos"
                                className="hover:text-green-400"
                            >
                                Complejos
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

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild className="ml-16">
                            <button className="flex items-center gap-2 outline-none">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-gradient-to-r from-custom-dark-green to-custom-green text-white font-medium text-base">
                                        {user.nombre
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium hover:text-green-400 cursor-pointer">
                                    {user.nombre}
                                </span>
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-56 bg-[#0b1220] text-white border border-slate-700">
                            <DropdownMenuLabel className="text-xs text-gray-400">
                                {user.nombre} {user.apellido}
                            </DropdownMenuLabel>
                            <DropdownMenuLabel className="text-xs text-gray-400">
                                {user.mail}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/profile"
                                    className="cursor-pointer"
                                >
                                    Ir al Perfil
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="text-red-500 cursor-pointer"
                            >
                                Cerrar sesión
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </nav>
    );
}
