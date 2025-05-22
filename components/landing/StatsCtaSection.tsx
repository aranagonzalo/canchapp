// src/components/sections/StatsCtaSection.tsx
export function StatsCtaSection() {
    const stats = [
        { value: "100+", label: "Complejos" },
        { value: "500+", label: "Canchas" },
        { value: "10K+", label: "Usuarios" },
        { value: "50K+", label: "Reservas" },
    ];

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

                <button className="hover:scale-105 hover:cursor-pointer mb-12 bg-white text-[#275d3e] hover:bg-gray-100 font-semibold px-6 py-3 rounded-full text-sm transition">
                    Comenzar Ahora
                </button>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                    {stats.map((stat, i) => (
                        <div key={i}>
                            <p className="text-4xl font-bold text-white">
                                {stat.value}
                            </p>
                            <p className="text-sm text-gray-400">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
