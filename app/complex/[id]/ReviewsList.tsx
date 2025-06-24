"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getRelativeTime } from "@/lib/utils";

interface Review {
    id: number;
    puntuacion: number;
    comentario: string | null;
    created_at: string;
    jugador: {
        id_jugador: number;
        nombre: string;
        apellido: string;
    };
}

export default function ReviewsList({ idComplejo }: { idComplejo: number }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/reviews/get-by-complejo?id_complejo=${idComplejo}`)
            .then((res) => res.json())
            .then((data) => {
                setReviews(data.reviews || []);
                setLoading(false);
            });
    }, [idComplejo]);

    if (loading)
        return <p className="text-gray-400 text-sm">Cargando reseñas...</p>;

    if (reviews.length === 0)
        return (
            <p className="text-gray-400 text-sm">
                Aún no hay reseñas disponibles.
            </p>
        );

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div
                    key={review.id}
                    className="w-full md:w-[480px] bg-[#1a1f2b] p-4 rounded-lg border border-gray-700"
                >
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold">
                            {review.jugador.nombre} {review.jugador.apellido}
                        </p>
                        <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                        i <= review.puntuacion
                                            ? "text-yellow-400 fill-yellow-400"
                                            : "text-gray-600"
                                    }`}
                                    fill={
                                        i <= review.puntuacion
                                            ? "currentColor"
                                            : "none"
                                    }
                                    strokeWidth={
                                        i <= review.puntuacion ? 0 : 1.5
                                    }
                                />
                            ))}
                        </div>
                    </div>
                    {review.comentario && (
                        <p className="text-sm text-gray-300">
                            {review.comentario}
                        </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(review.created_at)}
                    </p>
                </div>
            ))}
        </div>
    );
}
