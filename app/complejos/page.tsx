"use client";

import {
    APIProvider,
    Map,
    AdvancedMarker,
    InfoWindow,
} from "@vis.gl/react-google-maps";
import { ListCheck, MapPin, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Complejo {
    id_complejo: number;
    nombre_complejo: string;
    direccion: string;
    telefono: string;
    latitud: number;
    longitud: number;
}

export default function ComplejosPage() {
    const [complejos, setComplejos] = useState<Complejo[]>([]);
    const [filtered, setFiltered] = useState<Complejo[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [selected, setSelected] = useState<Complejo | null>(null);

    const router = useRouter();

    useEffect(() => {
        fetch("http://localhost:3001/popups")
            .then((res) => res.json())
            .then((data: Complejo[]) => {
                setComplejos(data);
                setFiltered(data);
            })
            .catch((err) => console.error("Error al obtener complejos:", err));
    }, []);

    useEffect(() => {
        const term = busqueda.toLowerCase();
        setFiltered(
            complejos.filter((c) =>
                c.nombre_complejo.toLowerCase().includes(term)
            )
        );
    }, [busqueda, complejos]);

    return (
        <div className="min-h-screen bg-gradient-to-b to-[#0b1120] from-[#030712] text-white py-32 px-6">
            <div className="max-w-[1200px] mx-auto">
                <h1 className="text-3xl font-bold mb-2">
                    Complejos deportivos
                </h1>
                <p className="text-gray-400 mb-6">
                    Filtra y visualiza los complejos disponibles
                </p>

                <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full max-w-md px-4 py-2 rounded bg-[#1a1f2b] text-white border border-gray-600 focus:outline-none mb-6"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-3">
                            Lista de Complejos
                        </h2>
                        <ul className="space-y-3">
                            {filtered.map((c) => (
                                <li
                                    key={c.id_complejo}
                                    onClick={() => setSelected(c)}
                                    className="bg-[#1a1f2b] flex p-4 rounded-md cursor-pointer border shadow border-gray-800 hover:bg-[#2b3347] justify-between"
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold">
                                            {c.nombre_complejo}
                                        </p>
                                        <p className="text-sm text-gray-400 flex gap-2 items-center">
                                            <MapPin className="w-4 h-4" />
                                            {c.direccion}
                                        </p>
                                        <p className="text-sm text-gray-400 flex gap-2 items-center">
                                            <Phone className="w-4 h-4" />{" "}
                                            {c.telefono}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            router.push(
                                                `/complex/${c.id_complejo}`
                                            )
                                        }
                                        className="flex gap-1 bg-gradient-to-r from-custom-dark-green to-custom-green w-fit h-fit items-center justify-center rounded shadow px-3 py-1 text-white font-medium text-sm cursor-pointer hover:from-emerald-700 hover:to-emerald-600"
                                    >
                                        <ListCheck className="w-4 h-4" />
                                        Reservar{" "}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-3">Mapa</h2>
                        <APIProvider apiKey="AIzaSyC717n1-JDtnYNbRu18MYpKnVxy3Zqw6Q8">
                            <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-700">
                                <Map
                                    center={
                                        selected
                                            ? {
                                                  lat: selected.latitud,
                                                  lng: selected.longitud,
                                              }
                                            : { lat: -27.46, lng: -58.98 }
                                    }
                                    zoom={13}
                                    className="w-full h-full"
                                >
                                    {filtered.map((c) => (
                                        <AdvancedMarker
                                            key={c.id_complejo}
                                            position={{
                                                lat: c.latitud,
                                                lng: c.longitud,
                                            }}
                                            onClick={() => setSelected(c)}
                                        />
                                    ))}
                                    {selected && (
                                        <InfoWindow
                                            position={{
                                                lat: selected.latitud,
                                                lng: selected.longitud,
                                            }}
                                            onCloseClick={() =>
                                                setSelected(null)
                                            }
                                        >
                                            <div className="text-sm">
                                                <p className="font-bold">
                                                    {selected.nombre_complejo}
                                                </p>
                                                <p>{selected.direccion}</p>
                                                <p>📞 {selected.telefono}</p>
                                            </div>
                                        </InfoWindow>
                                    )}
                                </Map>
                            </div>
                        </APIProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}
