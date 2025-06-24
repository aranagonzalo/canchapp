"use client";

import Image from "next/image";
import { StarRating } from "@/components/StarRating";
import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

interface Complejos {
    id_complejo: number;
    total_reservas: number;
    nombre_complejo: string;
    direccion: string;
    precio_promedio_turno: number;
    total_reviews: number;
    rating_promedio: number;
}

export default function FeaturedComplexes() {
    const router = useRouter();
    const { user } = useUser();

    const [loading, setLoading] = useState(true);
    const [recommended, setRecommended] = useState<Complejos[] | []>([]);

    const fetchReservas = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/complexes/recommended`);
            const data = await res.json();
            setRecommended(data);
        } catch (err) {
            console.log("Error al obtener reservas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReservas();
    }, []);

    const handleClick = (id: number) => {
        if (user) {
            router.push(`/complex/${id}`);
        } else {
            router.push("/login");
        }
    };

    return (
        <section className="bg-[#030712] text-white py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
                    Complejos Destacados
                </h2>
                <p className="text-gray-400 text-center mb-10">
                    Descubre los mejores complejos deportivos con canchas de
                    primera calidad.
                </p>

                <h3 className="text-xl font-semibold mb-4">
                    Populares esta semana
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    {recommended?.map((c, index) => (
                        <div
                            key={c.id_complejo}
                            className="bg-[#1a1f2b] rounded-xl overflow-hidden shadow relative"
                        >
                            <div className="relative h-48 w-full">
                                {/* Imagen dummy mientras no viene del backend */}
                                <Image
                                    src={`/images/canchas/cancha${
                                        (index % 3) + 1
                                    }.jpeg`}
                                    alt={c.nombre_complejo}
                                    fill
                                    className="object-cover"
                                />
                                <span className="absolute top-2 right-2 text-white text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-custom-green to-custom-dark-green shadow">
                                    TOP {index + 1}
                                </span>
                                <div className="absolute bottom-2 left-2 text-white z-10">
                                    <h4 className="text-base font-semibold leading-none drop-shadow">
                                        {c.nombre_complejo}
                                    </h4>
                                    <div className="flex items-center text-sm text-gray-300 gap-1 drop-shadow">
                                        <MapPin className="w-4 h-4" />
                                        <span>{c.direccion}</span>
                                    </div>
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/70 to-transparent z-[1]" />
                            </div>

                            <div className="p-4 pt-3">
                                {/* Relleno temporal de estrellas */}
                                <StarRating
                                    rating={c.rating_promedio}
                                    totalReviews={c.total_reviews}
                                    showTotal
                                />

                                <p className="text-sm mb-1 bg-gradient-to-r from-custom-green to-custom-dark-green bg-clip-text text-transparent font-medium">
                                    {c.total_reservas} reservas en total
                                </p>

                                <div className="flex justify-between items-center mt-4">
                                    {c.precio_promedio_turno !== null ? (
                                        <span className="font-semibold bg-gradient-to-r from-custom-green to-custom-dark-green bg-clip-text text-transparent">
                                            $ {c.precio_promedio_turno}/h
                                        </span>
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">
                                            Sin canchas activas
                                        </span>
                                    )}
                                    <Button
                                        onClick={() =>
                                            handleClick(c.id_complejo)
                                        }
                                        className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-1.5 rounded-md"
                                    >
                                        Ver Detalle
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
