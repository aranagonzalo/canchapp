// src/components/sections/FeaturedComplexes.tsx
import Image from "next/image";

const complexes = [
    {
        id: 1,
        name: "Complejo Deportivo 1",
        location: "Resistencia, Chaco",
        rating: 4.5,
        reviews: 120,
        price: "$5000/h",
        available: 4,
        image: "/images/complex1.jpg",
        tag: "TOP 1",
    },
    {
        id: 2,
        name: "Complejo Deportivo 2",
        location: "Resistencia, Chaco",
        rating: 4.6,
        reviews: 120,
        price: "$5000/h",
        available: 4,
        image: "/images/complex2.jpg",
        tag: "TOP 2",
    },
    {
        id: 3,
        name: "Complejo Deportivo 3",
        location: "Resistencia, Chaco",
        rating: 4.3,
        reviews: 120,
        price: "$5000/h",
        available: 4,
        image: "/images/complex3.jpg",
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
                                <span className="absolute top-2 right-2 bg-green-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                    {c.tag}
                                </span>
                            </div>
                            <div className="p-4">
                                <h4 className="text-lg font-bold mb-1">
                                    {c.name}
                                </h4>
                                <p className="text-sm text-gray-400 mb-2">
                                    📍 {c.location}
                                </p>
                                <p className="text-sm mb-1">
                                    ⭐ {c.rating} ({c.reviews} reseñas)
                                </p>
                                <p className="text-sm text-green-400 mb-1">
                                    {c.available} canchas disponibles
                                </p>
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-green-500 font-semibold">
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
