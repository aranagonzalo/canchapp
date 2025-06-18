"use client";

import { useEffect, useState } from "react";
import { Star, Calendar, LayoutGrid } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";

export default function AdminDashboardStats() {
    const { user } = useUser();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await fetch(
                `/api/admin/dashboard?id_administrador=${user?.id}`
            );
            const data = await res.json();
            setStats(data);
        } catch (err) {
            toast.error("Error al obtener estadísticas del administrador.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) fetchStats();
    }, [user?.id]);

    if (loading)
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0b1120] to-[#030712] text-white flex flex-col gap-2 items-center justify-center">
                <LoadingSpinner /> Cargando...
            </div>
        );

    return (
        <main className="min-h-screen bg-gradient-to-b to-[#0b1120] from-[#030712] text-white pt-32 px-6 pb-16">
            <header className="flex items-center justify-between mb-8 max-w-[1200px] mx-auto">
                <h1 className="text-3xl font-bold">Resumen</h1>
            </header>
            <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-white mt-6">
                <div className="bg-[#1a1f2b] p-4 rounded-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-400">
                            Reservas últimos 7 días
                        </p>
                        <Calendar className="text-emerald-400 w-5 h-5" />
                    </div>
                    <h3 className="text-3xl font-semibold">
                        {stats.reservas_ultimos_7}
                    </h3>
                </div>

                <div className="bg-[#1a1f2b] p-4 rounded-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-400">
                            Reservas últimos 30 días
                        </p>
                        <Calendar className="text-emerald-400 w-5 h-5" />
                    </div>
                    <h3 className="text-3xl font-semibold">
                        {stats.reservas_ultimos_30}
                    </h3>
                </div>

                <div className="bg-[#1a1f2b] p-4 rounded-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-400">
                            Canchas registradas
                        </p>
                        <LayoutGrid className="text-emerald-400 w-5 h-5" />
                    </div>
                    <h3 className="text-3xl font-semibold">
                        {stats.total_canchas}
                    </h3>
                </div>

                <div className="bg-[#1a1f2b] p-4 rounded-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-400">
                            Reseñas recibidas
                        </p>
                        <Star className="text-yellow-400 w-5 h-5" />
                    </div>
                    <h3 className="text-3xl font-semibold">
                        {stats.total_resenas}
                    </h3>
                </div>

                <div className="bg-[#1a1f2b] p-4 rounded-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-400">
                            Puntuación promedio
                        </p>
                        <Star className="text-yellow-400 w-5 h-5 fill-yellow-400" />
                    </div>
                    <h3 className="text-3xl font-semibold">
                        {stats.promedio_puntuacion}
                    </h3>
                </div>
            </div>
        </main>
    );
}
