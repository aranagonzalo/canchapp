"use client";

import {
    Map as GoogleMap,
    InfoWindow,
    useMap,
} from "@vis.gl/react-google-maps";
import { ListCheck, MapPin, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatPhoneForWhatsApp } from "@/lib/utils";
import { StarRating } from "@/components/StarRating";

interface Complejo {
    id_complejo: number;
    nombre_complejo: string;
    direccion: string;
    telefono: string;
    ciudad: string;
    latitud: number;
    longitud: number;
    total_reviews: number;
    avg_puntuacion: number;
}

const geocodeCache: Map<string, { lat: number; lng: number }> = new Map();

export default function ComplejosPage() {
    const [complejos, setComplejos] = useState<Complejo[]>([]);
    const [filtered, setFiltered] = useState<Complejo[]>([]);
    const [busqueda, setBusqueda] = useState("");
    const [selected, setSelected] = useState<Complejo | null>(null);
    const [geoPosition, setGeoPosition] = useState<{
        lat: number;
        lng: number;
    } | null>(null);

    const router = useRouter();

    const map = useMap();

    useEffect(() => {
        if (geoPosition && map) {
            map.panTo(geoPosition);
        }
    }, [geoPosition, map]);

    async function geocodeDireccion(direccion: string): Promise<{
        lat: number;
        lng: number;
    } | null> {
        if (geocodeCache.has(direccion)) {
            return geocodeCache.get(direccion)!;
        }

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS;
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                direccion
            )}&key=${apiKey}`
        );
        const data = await response.json();

        if (data.status === "OK") {
            const location = data.results[0].geometry.location;
            geocodeCache.set(direccion, location); // almacena en caché
            return location;
        } else {
            console.warn("Geocoding falló:", data.status);
            return null;
        }
    }

    useEffect(() => {
        if (selected) {
            console.log(selected);
            const direccionCompleta = `${selected.direccion}, ${selected.ciudad}`;
            geocodeDireccion(direccionCompleta).then((pos) => {
                if (pos) setGeoPosition(pos);
            });
        } else {
            setGeoPosition(null);
        }
    }, [selected]);

    useEffect(() => {
        fetch("api/complexes")
            .then((res) => res.json())
            .then((data: Complejo[]) => {
                setComplejos(data);
                setFiltered(data);
            })
            .catch((err) => console.error("Error al obtener predios:", err));
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
                <h1 className="text-3xl font-bold mb-2">Predios deportivos</h1>
                <p className="text-gray-400 mb-6">
                    Filtra y visualiza los predios disponibles
                </p>

                <Input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full max-w-md px-4 py-2 rounded-md bg-[#1a1f2b] text-white border border-gray-800 focus:outline-none mb-6"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-3">
                            Lista de Predios
                        </h2>
                        <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                            {filtered?.map((c) => (
                                <li
                                    key={c.id_complejo}
                                    onClick={() => setSelected(c)}
                                    className="bg-[#1a1f2b] flex p-4 rounded-md cursor-pointer border shadow border-gray-800 hover:border-custom-dark-green/30 transition-all hover:bg-gradient-to-br hover:from-[#1a1f2b] hover:via-[#1a1f2b] hover:to-custom-dark-green/20 justify-between"
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="font-bold">
                                            {c.nombre_complejo}
                                        </p>
                                        <p className="text-sm text-gray-400 flex gap-2 items-center">
                                            <MapPin className="w-4 h-4" />
                                            {c.direccion} - {c.ciudad}
                                        </p>
                                        <StarRating
                                            rating={c.avg_puntuacion}
                                            totalReviews={c.total_reviews}
                                            showTotal
                                        />
                                        <div className="flex flex-col gap-2 md:flex-row">
                                            <a
                                                href={`https://wa.me/${formatPhoneForWhatsApp(
                                                    c.telefono
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 w-fit font-medium flex gap-2 bg-[#1b8d4a] hover:bg-[#007933] justify-center items-center text-white px-2.5 py-2 rounded-md text-xs transition"
                                            >
                                                <img
                                                    src="/whatsapp.png"
                                                    className="w-5 h-5"
                                                />{" "}
                                                WhatsApp
                                            </a>
                                            <a
                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                                    `${c.direccion} - ${c.ciudad}`
                                                )}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 w-fit font-medium flex gap-2 bg-white hover:bg-gray-300 justify-center items-center text-black px-2.5 py-2 rounded-md text-xs transition"
                                            >
                                                <img
                                                    src="/maps.png"
                                                    className="w-5 h-5"
                                                />{" "}
                                                Maps
                                            </a>
                                        </div>
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

                        <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-700">
                            <GoogleMap
                                id="main-map"
                                center={
                                    geoPosition ?? {
                                        lat: -27.46,
                                        lng: -58.98,
                                    }
                                }
                                zoom={13}
                                className="w-full h-full"
                            >
                                {selected && (
                                    <InfoWindow
                                        position={
                                            geoPosition ?? {
                                                lat: -27.46,
                                                lng: -58.98,
                                            }
                                        }
                                        onCloseClick={() => setSelected(null)}
                                        className="w-[280px] h-[100px] !overflow-hidden"
                                        headerContent={
                                            <div className="text-black text-lg font-medium w-full h-full">
                                                {selected.nombre_complejo}
                                            </div>
                                        }
                                    >
                                        <div className="!overflow-hidden h-full py-4 font-sm font-medium text-slate-700 flex flex-col gap-2 justify-between">
                                            <p className="text-sm text-gray-700 flex gap-2 items-center">
                                                <MapPin className="w-4 h-4" />
                                                {selected.direccion}
                                            </p>
                                            <p className="text-sm text-gray-700 flex gap-1 items-center">
                                                <Phone className="w-4 h-4" />{" "}
                                                {selected.telefono}
                                            </p>
                                            <button
                                                onClick={() =>
                                                    router.push(
                                                        `/complex/${selected.id_complejo}`
                                                    )
                                                }
                                                className="flex gap-1 bg-gradient-to-r from-custom-dark-green to-custom-green w-full h-fit items-center justify-center rounded shadow px-3 py-1 text-white font-medium text-sm cursor-pointer hover:from-emerald-700 hover:to-emerald-600"
                                            >
                                                <ListCheck className="w-4 h-4" />
                                                Reservar{" "}
                                            </button>
                                        </div>
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
