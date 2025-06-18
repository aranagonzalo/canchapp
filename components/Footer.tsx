import { Mail, MapPin } from "lucide-react";
import Image from "next/image";

// src/components/Footer.tsx
export default function Footer() {
    return (
        <footer className="bg-slate-950 text-gray-400 py-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
                {/* CanchApp */}
                <div>
                    <h4 className="items-center flex gap-2 text-white font-semibold text-lg mb-4">
                        <Image
                            src="/logo-canchapp.png"
                            alt="Logo Canchapp"
                            width={100}
                            height={100}
                            className="w-6 h-6"
                        />
                        CanchApp
                    </h4>
                    <p className="text-sm">
                        La plataforma más fácil para reservar canchas, organizar
                        equipos y disfrutar del deporte.
                    </p>
                </div>

                {/* Enlaces útiles */}
                <div>
                    <h4 className="text-white font-semibold text-lg mb-4">
                        Enlaces
                    </h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="#complejos" className="hover:text-white">
                                Complejos
                            </a>
                        </li>
                        <li>
                            <a href="#equipos" className="hover:text-white">
                                Equipos
                            </a>
                        </li>
                        <li>
                            <a href="#funciona" className="hover:text-white">
                                Cómo Funciona
                            </a>
                        </li>
                        <li>
                            <a href="#cta" className="hover:text-white">
                                Comenzar
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Legal */}
                <div>
                    <h4 className="text-white font-semibold text-lg mb-4">
                        Legal
                    </h4>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="/terms" className="hover:text-white">
                                Términos y Condiciones
                            </a>
                        </li>
                        <li>
                            <a href="/privacy" className="hover:text-white">
                                Política de Privacidad
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Contacto / Redes */}
                <div>
                    <h4 className="text-white font-semibold text-lg mb-4">
                        Contáctanos
                    </h4>
                    <p className="text-sm mb-2 flex gap-2 items-center">
                        <Mail className="w-4 h-4 " /> hola@canchapp.com
                    </p>
                    <p className="text-sm mb-4 flex gap-2 items-center">
                        <MapPin className="w-4 h-4 " /> Chaco, Argentina
                    </p>
                </div>
            </div>

            <div className="mt-12 text-center text-xs text-gray-600">
                © {new Date().getFullYear()} CanchApp. Todos los derechos
                reservados.
            </div>
        </footer>
    );
}
