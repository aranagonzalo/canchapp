// src/components/sections/HowItWorks.tsx
import { LucideUsers, LucideMapPin, LucideClock } from "lucide-react";

export function HowItWorks() {
    const steps = [
        {
            title: "Crea tu Equipo",
            description:
                "Registra tu equipo e invita a tus amigos para que se unan. Designa un capitán para gestionar las reservas.",
            icon: <LucideUsers className="w-10 h-10 text-white" />,
        },
        {
            title: "Encuentra Complejos",
            description:
                "Explora los mejores complejos deportivos cerca de ti y elige la cancha que más te guste.",
            icon: <LucideMapPin className="w-10 h-10 text-white" />,
        },
        {
            title: "Reserva tu Horario",
            description:
                "Selecciona el día y horario que prefieras, y reservá al instante.",
            icon: <LucideClock className="w-10 h-10 text-white" />,
        },
    ];

    return (
        <section className="bg-[#030712] text-white py-20 px-4">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Cómo Funciona
                </h2>
                <p className="text-gray-400 mb-12">
                    Reservar una cancha nunca fue tan fácil. Sigue estos simples
                    pasos y comienza a jugar.
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div
                            key={index}
                            className="bg-gradient-to-br from-[#1f2938] via-[#1f2938] to-[#1e2d28] p-6 rounded-xl flex flex-col items-center text-center"
                        >
                            <div className="bg-gradient-to-br shadow from-custom-green to-custom-dark-green p-4 rounded-full mb-4">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-2">
                                {step.title}
                            </h3>
                            <p className="text-sm text-gray-300">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
