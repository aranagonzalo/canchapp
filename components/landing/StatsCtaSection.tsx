// src/components/sections/StatsCtaSection.tsx
"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import { useEffect, useState } from "react";

const formatCount = (num: number) => {
    if (num >= 1000 && num < 10000) return `${(num / 1000).toFixed(1)}K+`;
    if (num >= 10000) return `${Math.floor(num / 1000)}K+`;
    return `${num}+`;
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
    <div>
        <p className="text-4xl font-bold text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
    </div>
);

export function StatsCtaSection() {
    const router = useRouter();
    const { user } = useUser();

    const handleCtaClick = () => {
        if (user) {
            router.push("/home");
        } else {
            router.push("/login");
        }
    };

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<{
        complejos: number;
        canchas: number;
        usuarios: number;
        reservas: number;
    } | null>(null);

    const fetchReservas = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/stats`);
            const data = await res.json();
            setStats(data);
        } catch (err) {
            console.log("Error al obtener reservas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservas();
    }, []);

    return (
        <section className="bg-gradient-to-br from-[#275d3e] to-[#262e3a] text-white py-20 px-4">
            <div className="max-w-5xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-3">
                    ¿Listo para jugar?
                </h2>
                <p className="text-gray-300 mb-10">
                    Únete a miles de jugadores que ya están disfrutando de
                    CanchApp.
                </p>

                <button
                    onClick={handleCtaClick}
                    className="hover:scale-105 hover:cursor-pointer mb-12 bg-white text-[#275d3e] hover:bg-gray-100 font-semibold px-6 py-3 rounded-full text-sm transition"
                >
                    Comenzar Ahora
                </button>

                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <StatItem
                            label="Complejos"
                            value={formatCount(stats.complejos)}
                        />
                        <StatItem
                            label="Canchas"
                            value={formatCount(stats.canchas)}
                        />
                        <StatItem
                            label="Usuarios"
                            value={formatCount(stats.usuarios)}
                        />
                        <StatItem
                            label="Reservas"
                            value={formatCount(stats.reservas)}
                        />
                    </div>
                )}
            </div>
        </section>
    );
}
