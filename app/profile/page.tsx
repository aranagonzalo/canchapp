"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/userContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast, Toaster } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [perfil, setPerfil] = useState<any>(null);
    const [form, setForm] = useState<any>(null);

    useEffect(() => {
        const fetchPerfil = async () => {
            try {
                const response = await fetch(`${API_URL}/perfil`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ tipo: user?.tipo, id: user?.id }),
                });
                const data = await response.json();
                if (data.Status === "Respuesta ok") {
                    setPerfil(data);
                    setForm({ ...data, mailViejo: data.mail }); // mailViejo requerido para update
                }
            } catch (error) {
                console.error("Error al cargar el perfil:", error);
                toast.error("No se pudo cargar el perfil.");
            }
        };

        if (user) fetchPerfil();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!form) return;
        setLoading(true);
        try {
            const response = await fetch(
                `${API_URL}/perfil/update/${user?.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(form),
                }
            );

            const resData = await response.json();

            if (response.ok) {
                toast.success("Perfil actualizado correctamente.");
            } else {
                // Mostrar mensaje del backend si está disponible
                toast.error(
                    resData.message || "Error al actualizar el perfil."
                );
                console.warn("Validación backend:", resData.message);
            }
        } catch (err) {
            console.error("Error de red:", err);
            toast.error("No se pudo conectar al servidor.");
        }
        setLoading(false);
    };

    if (!form) {
        return (
            <div className="min-h-screen bg-[#0b1120] text-white flex items-center justify-center gap-2">
                <LoadingSpinner /> <p>Cargando...</p>
            </div>
        );
    }

    return (
        <>
            <Toaster richColors position="top-right" />
            <main className="min-h-screen bg-gradient-to-b from-[#0b1120] to-[#030712] text-white pt-36 px-6 pb-16 w-full">
                <div className="max-w-[700px] mx-auto bg-slate-950 shadow rounded-xl border border-gray-900 p-10">
                    <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

                    <div className="space-y-4">
                        <div>
                            <Label className="mb-1">Nombre</Label>
                            <input
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 bg-[#1a1f2b] text-white rounded-md placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-custom-green"
                            />
                        </div>

                        {user?.tipo === "jugador" && (
                            <>
                                <div>
                                    <Label className="mb-1">Apellido</Label>
                                    <input
                                        name="apellido"
                                        value={form.apellido}
                                        onChange={handleChange}
                                        className="w-full mt-1 p-2 bg-[#1a1f2b] text-white rounded-md placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-custom-green"
                                    />
                                </div>

                                <div>
                                    <Label className="mb-1">Sexo</Label>
                                    <input
                                        name="sexo"
                                        value={form.sexo}
                                        onChange={handleChange}
                                        className="w-full mt-1 p-2 bg-[#1a1f2b] text-white rounded-md placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-custom-green"
                                    />
                                </div>
                            </>
                        )}

                        <div>
                            <Label className="mb-1">Teléfono</Label>
                            <input
                                name="telefono"
                                value={form.telefono}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 bg-[#1a1f2b] text-white rounded-md placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-custom-green"
                            />
                        </div>

                        <div>
                            <Label className="mb-1">Correo</Label>
                            <input
                                name="mail"
                                value={form.mail}
                                onChange={handleChange}
                                className="w-full mt-1 p-2 bg-[#1a1f2b] text-white rounded-md placeholder-gray-500 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-custom-green"
                            />
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full cursor-pointer bg-gradient-to-r from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600 mt-4"
                        >
                            {loading ? <LoadingSpinner /> : "Guardar Cambios"}
                        </Button>
                    </div>
                </div>
            </main>
        </>
    );
}
