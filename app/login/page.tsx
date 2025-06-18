// app/login/page.tsx
"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useUser } from "@/context/userContext";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast, Toaster } from "sonner";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { login } = useUser();

    async function handleLogin(email: string, password: string) {
        try {
            const response = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mail: email,
                    pass: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message || "Error al iniciar sesión");
                return null;
            }

            toast.success("Inicio de sesión exitoso");
            return data;
        } catch (err) {
            console.error("Error de red:", err);
            toast.error("No se pudo conectar al servidor.");
            return null;
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Completa todos los campos");
            return;
        }

        setLoading(true);
        const user = await handleLogin(email, password);
        setLoading(false);

        if (user) {
            console.log("Usuario autenticado:", user);
            login(user);
            if (user.tipo === "jugador") {
                router.push("/home");
            } else {
                router.push("/admin/home");
            }
        }
    };

    return (
        <>
            <Toaster richColors position="top-right" />
            <div className="relative min-h-screen bg-cover bg-center flex items-center justify-center">
                <div className="absolute inset-0 bg-black opacity-60 z-10" />
                <img
                    src="/images/banners/banner5.jpg"
                    alt="Banner"
                    className="w-full h-[100dvh] object-cover"
                />
                <div className="absolute z-20 bg-[#0b1120] bg-opacity-90 p-8 sm:p-10 rounded-xl w-full max-w-md shadow-xl flex flex-col justify-center">
                    <a
                        href="/"
                        className="flex items-center justify-center gap-2 text-xl font-bold mb-6 text-white"
                    >
                        <div className="bg-gradient-to-br from-green-400 to-green-700 p-1.5 rounded-md">
                            <Calendar />
                        </div>
                        <span className="text-white">CanchApp</span>
                    </a>

                    <h2 className="text-2xl font-bold text-white mb-1 text-center">
                        Iniciar Sesión
                    </h2>
                    <p className="text-sm text-gray-400 text-center mb-6">
                        Ingresa tus credenciales para acceder a tu cuenta
                    </p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="text-sm text-white">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                placeholder="tu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mt-1 p-2 bg-[#1a1f2b] text-white rounded-md placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-custom-green"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center">
                                <label className="text-sm text-white">
                                    Contraseña
                                </label>
                                <a
                                    href="#"
                                    className="text-sm text-custom-green hover:underline"
                                >
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mt-1 p-2 bg-[#1a1f2b] text-white rounded-md placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-custom-green"
                            />
                        </div>

                        <button
                            disabled={loading}
                            type="submit"
                            className={`
                                w-full py-2 text-white rounded-md font-medium transition flex justify-center items-center gap-2
                                bg-gradient-to-r from-custom-green to-custom-dark-green h-10
                                ${
                                    loading
                                        ? "opacity-70 cursor-not-allowed"
                                        : "hover:opacity-90"
                                }
                              `}
                        >
                            {loading ? <LoadingSpinner /> : "Iniciar Sesión"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        ¿No tienes una cuenta?{" "}
                        <a
                            href="/register"
                            className="text-custom-green hover:underline"
                        >
                            Regístrate
                        </a>
                    </p>
                </div>
            </div>
        </>
    );
};

export default LoginPage;
