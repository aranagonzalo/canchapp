import { Calendar } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="bg-[#0b1220]/80 shadow shadow-black/40 backdrop-blur-2xl text-white py-4 px-6 flex items-center justify-between fixed top-0 left-0 w-full z-50">
            <a href="/" className="flex items-center gap-2 text-xl font-bold">
                <div className="bg-gradient-to-br from-green-400 to-green-700 p-1.5 rounded-md">
                    <Calendar />
                </div>
                <span className="text-white">CanchApp</span>
            </a>
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
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    Registrarse
                </a>
            </div>
        </nav>
    );
}
