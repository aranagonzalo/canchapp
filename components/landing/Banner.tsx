import { AvatarStack } from "../AvatarStack";

export default function Banner() {
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
                        CanchApp te conecta con los mejores complejos
                        deportivos. <br />
                        Forma tu equipo, elige tu horario y ¡a jugar!
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="/reservar"
                            className="bg-gradient-to-r from-custom-green to-custom-dark-green transition-all hover:bg-green-600 shadow text-white px-6 py-3 rounded-full font-semibold"
                        >
                            Reservar Ahora
                        </a>
                        <a
                            href="/complexes"
                            className="bg-white text-black px-6 py-3 rounded-full font-semibold"
                        >
                            Ver Complejos
                        </a>
                    </div>
                    <div className="mt-6 flex items-center text-sm text-gray-300">
                        <AvatarStack />
                        <span className="text-green-400 font-bold ml-36 mr-2">
                            +1000
                        </span>{" "}
                        usuarios ya están jugando
                    </div>
                </div>
            </div>
        </section>
    );
}
