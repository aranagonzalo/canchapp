import Image from "next/image";
import { StarRating } from "@/components/StarRating";
import { MapPin } from "lucide-react";

const complexes = [
    {
        id: 1,
        name: "Complejo Deportivo 1",
        location: "Resistencia, Chaco",
        rating: 4.5,
        reviews: 120,
        price: "$5000/h",
        available: 4,
        image: "/images/canchas/cancha1.jpeg",
        tag: "TOP 1",
    },
    {
        id: 2,
        name: "Complejo Deportivo 2",
        location: "Resistencia, Chaco",
        rating: 2.6,
        reviews: 120,
        price: "$5000/h",
        available: 4,
        image: "/images/canchas/cancha2.jpeg",
        tag: "TOP 2",
    },
    {
        id: 3,
        name: "Complejo Deportivo 3",
        location: "Resistencia, Chaco",
        rating: 3.8,
        reviews: 120,
        price: "$5000/h",
        available: 4,
        image: "/images/canchas/cancha3.jpeg",
        tag: "TOP 3",
    },
];

export default function FeaturedComplexes() {
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
                    {complexes.map((c) => (
                        <div
                            key={c.id}
                            className="bg-[#1a1f2b] rounded-xl overflow-hidden shadow relative"
                        >
                            <div className="relative h-48 w-full">
                                <Image
                                    src={c.image}
                                    alt={c.name}
                                    fill
                                    className="object-cover"
                                />
                                <span className="absolute top-2 right-2 text-white text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-custom-green to-custom-dark-green shadow">
                                    {c.tag}
                                </span>
                                <div className="absolute bottom-2 left-2 text-white z-10">
                                    <h4 className="text-base font-semibold leading-none drop-shadow">
                                        {c.name}
                                    </h4>
                                    <div className="flex items-center text-sm text-gray-300 gap-1 drop-shadow">
                                        <MapPin className="w-4 h-4" />
                                        <span>{c.location}</span>
                                    </div>
                                </div>
                                {/* dark overlay gradient for readability */}
                                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/70 to-transparent z-[1]" />
                            </div>

                            <div className="p-4 pt-3">
                                <StarRating
                                    rating={c.rating}
                                    totalReviews={c.reviews}
                                />

                                <p className="text-sm mb-1 bg-gradient-to-r from-custom-green to-custom-dark-green bg-clip-text text-transparent font-medium">
                                    {c.available} canchas disponibles
                                </p>

                                <div className="flex justify-between items-center mt-4">
                                    <span className="font-semibold bg-gradient-to-r from-custom-green to-custom-dark-green bg-clip-text text-transparent">
                                        {c.price}
                                    </span>
                                    <button className="bg-gray-700 hover:bg-gray-600 text-white text-sm px-4 py-1.5 rounded-md">
                                        Ver Detalle
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
