"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";
import { AvatarStack } from "../AvatarStack";

export default function Banner() {
    const router = useRouter();
    const { user } = useUser();

    const handleVerComplejos = () => {
        if (user) {
            router.push("/complexes");
        } else {
            router.push("/login");
        }
    };
    return (
        <section className="relative text-white">
            <div className="absolute inset-0 bg-black opacity-60 z-10" />
            <img
                src="/images/banners/banner4.jpg"
                alt="Banner"
                className="w-full h-[100dvh] object-cover"
            />
            <div className="absolute top-0 left-0 w-full h-full z-20 flex items-center justify-start px-6 md:px-12 pt-20 lg:px-24 xl:px-40 2xl:px-56">
                <div className="max-w-3xl text-left">
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                        La forma más{" "}
                        <span className="text-green-400">inteligente</span>{" "}
                        <br />
                        de reservar tu cancha
                    </h1>
                    <p className="text-base md:text-lg text-gray-300 mb-8">
                        CanchApp te conecta con los mejores predios deportivos.{" "}
                        <br />
                        Forma tu equipo, elige tu horario y ¡a jugar!
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex flex-wrap gap-4">
                            <button
                                onClick={handleVerComplejos}
                                className="cursor-pointer bg-gradient-to-r hover:scale-[1.03] from-custom-green to-custom-dark-green transition-all hover:from-emerald-500 hover:to-emerald-700 shadow text-white px-6 py-3 rounded-full font-semibold"
                            >
                                Reservar Ahora
                            </button>
                            <button
                                onClick={handleVerComplejos}
                                className="cursor-pointer transition-all hover:scale-[1.03] hover:bg-white  bg-gray-200 text-black px-6 py-3 rounded-full font-semibold"
                            >
                                Ver Predios
                            </button>
                        </div>
                    </div>
                    <div className="mt-6 flex items-center text-sm text-gray-300">
                        <AvatarStack />
                        <span className="text-green-400 font-bold ml-36 mr-2">
                            +60
                        </span>{" "}
                        usuarios ya están jugando
                    </div>
                </div>
            </div>
        </section>
    );
}
