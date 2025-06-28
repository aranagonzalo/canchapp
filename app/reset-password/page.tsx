"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ResetPasswordPage() {
    const params = useSearchParams();
    const token = params.get("token");

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            toast.error("Ingresa tu nueva contraseña.");
            return;
        }
        setLoading(true);

        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, password }),
        });

        const data = await res.json();
        setLoading(false);

        if (res.ok) {
            toast.success("Contraseña actualizada. Ahora inicia sesión.");
        } else {
            toast.error(data.message || "Error al actualizar.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1120] text-white px-4">
            <Toaster richColors position="top-right" />
            <h1 className="text-2xl font-bold mb-2">Nueva Contraseña</h1>
            <p className="text-gray-400 mb-6 text-center max-w-sm">
                Ingresa tu nueva contraseña.
            </p>

            <form className="w-full max-w-md space-y-4" onSubmit={handleReset}>
                <input
                    type="password"
                    placeholder="Nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 bg-[#1a1f2b] text-white rounded-md placeholder-gray-500 border border-gray-600 focus:outline-none"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 bg-custom-green rounded text-black font-semibold"
                >
                    {loading ? <LoadingSpinner /> : "Restablecer"}
                </button>
            </form>
        </div>
    );
}
