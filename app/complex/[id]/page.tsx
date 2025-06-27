"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Star, MapPin, Phone, Users, Clock } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ReservaModal } from "./ReservaModal";
import { Toaster } from "sonner";
import { formatPhoneForWhatsApp } from "@/lib/utils";
import { useUser } from "@/context/userContext";
import ReviewsModal from "./ReviewsModal";
import ReviewsList from "./ReviewsList";
import { StarRating } from "@/components/StarRating";
import SkeletonCarousel from "@/app/admin/complex/SkeletonCarousel";
import BannerCarousel from "@/app/admin/complex/BannerCarousel";
import FullscreenCarousel from "@/app/admin/complex/FullScreenCarousel";

interface Complejo {
    id_admin: number;
    id_complejo: number;
    nombre_complejo: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    descripcion: string | null;
    administrador: { mail: string };
}

interface Cancha {
    id_cancha: number;
    nombre_cancha: string;
    cant_jugador: number;
    techo: boolean;
    horarios_disponibles: string[];
    precio_turno: number;
    imagen?: string;
}

interface ReviewStats {
    avg_rating: number;
    total_reviews: number;
}

export default function ComplejoDetallePage() {
    const { id } = useParams();
    const { user } = useUser();
    const router = useRouter();
    const [complejo, setComplejo] = useState<Complejo | null>(null);
    const [loading, setLoading] = useState(true);
    const [openReviewModal, setOpenReviewModal] = useState(false);
    const [canchas, setCanchas] = useState<Cancha[]>([]);
    const [reviews, setReviews] = useState<ReviewStats | null>(null);
    const [selectedCanchaId, setSelectedCanchaId] = useState<number | null>(
        null
    );
    const [selectedCanchaName, setSelectedCanchaName] = useState<string | null>(
        null
    );
    const [isOperational, setIsOperational] = useState(false);
    const [imagenes, setImagenes] = useState<string[]>([]);
    const [verGaleriaCompleta, setVerGaleriaCompleta] = useState(false);
    const [loadingImages, setLoadingImages] = useState(false);

    useEffect(() => {
        if (!complejo?.id_complejo) return;
        setLoadingImages(true);
        fetch(`/api/admin/complex/images?id_complejo=${complejo.id_complejo}`)
            .then((res) => res.json())
            .then((data) => {
                const urls = data.images?.map((img: any) => img.url) || [];
                setImagenes(urls);
                setLoadingImages(false);
            });
    }, [complejo?.id_complejo]);

    useEffect(() => {
        fetch(`/api/complexes/${id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.Status === "Respuesta ok") {
                    setComplejo(data.complejo);
                    setCanchas(data.canchas); // ✅ ahora también seteamos las canchas
                    setReviews(data.reviews_stats);
                    setIsOperational(data.tiene_horario_operativo);
                } else {
                    setComplejo(null);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener el complejo:", err);
                setLoading(false);
            });
    }, [id]);

    if (loading)
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0b1120] to-[#030712] text-white flex flex-col gap-2 items-center justify-center">
                <LoadingSpinner /> Cargando...
            </div>
        );

    if (!complejo) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0b1120] to-[#030712] text-white flex flex-col items-center justify-center">
                <p className="text-xl mb-4">
                    No se encontró el complejo solicitado.
                </p>
                <Button onClick={() => router.push("/complexes")}>
                    Volver al mapa
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-[#0b1120] to-[#030712] min-h-screen pb-20  text-white">
            <Toaster richColors position="top-right" />
            {/* Banner */}
            <div className="relative h-64 md:h-96 w-full bg-cover bg-center bg-no-repeat">
                {loadingImages ? (
                    <SkeletonCarousel />
                ) : imagenes.length > 0 ? (
                    <BannerCarousel
                        images={imagenes}
                        onClickImage={() => setVerGaleriaCompleta(true)}
                    />
                ) : (
                    <img
                        src="/images/banners/banner4.jpg"
                        className="w-full h-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black opacity-80" />
                <div className="absolute inset-0 flex items-end p-6 max-w-[1200px] mx-auto">
                    <div className="z-30">
                        <h1 className="text-3xl font-bold mb-2">
                            {complejo.nombre_complejo}
                        </h1>
                        <div className="flex items-center text-sm text-gray-300">
                            <MapPin className="w-4 h-4 mr-1" />
                            <p className="mr-3">
                                {complejo.ciudad}, {complejo.direccion}
                            </p>
                            {reviews && (
                                <StarRating
                                    rating={reviews.avg_rating}
                                    totalReviews={reviews.total_reviews}
                                    showTotal
                                    totalTextColor="text-gray-300"
                                />
                            )}
                        </div>
                    </div>
                    <div className="ml-7 flex flex-col gap-4 md:flex-row">
                        <a
                            href={`https://wa.me/${formatPhoneForWhatsApp(
                                complejo.telefono
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="z-30 mt-2 w-fit font-medium flex gap-2 bg-[#1b8d4a] hover:bg-[#007933] justify-center items-center text-white px-2.5 py-2 rounded-md text-xs transition"
                        >
                            <img src="/whatsapp.png" className="w-5 h-5" />{" "}
                            WhatsApp
                        </a>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${complejo.direccion} - ${complejo.ciudad}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="z-30 mt-2 w-fit font-medium flex gap-2 bg-white hover:bg-gray-300 justify-center items-center text-black px-2.5 py-2 rounded-md text-xs transition"
                        >
                            <img src="/maps.png" className="w-5 h-5" /> Maps
                        </a>
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Button
                            onClick={() => setOpenReviewModal(true)}
                            variant="secondary"
                            className="z-30 cursor-pointer hover:bg-gray-300"
                        >
                            Califica este complejo
                        </Button>
                        {openReviewModal && user?.id && (
                            <ReviewsModal
                                idComplejo={complejo?.id_complejo}
                                idJugador={user?.id}
                                onClose={() => setOpenReviewModal(false)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs sección */}
            <Tabs
                defaultValue="canchas"
                className="w-full max-w-[1200px] mx-auto px-6 pt-12"
            >
                <TabsList className="bg-[#1a1f2b] border border-gray-800 rounded-md mb-6 gap-1">
                    <TabsTrigger
                        value="canchas"
                        className="data-[state=active]:bg-gray-700 text-white px-4 py-2 text-sm cursor-pointer shadow"
                    >
                        Canchas
                    </TabsTrigger>
                    <TabsTrigger
                        value="info"
                        className="data-[state=active]:bg-gray-700 text-white px-4 py-2 text-sm cursor-pointer shadow"
                    >
                        Información
                    </TabsTrigger>
                    <TabsTrigger
                        value="resenas"
                        className="data-[state=active]:bg-gray-700 text-white px-4 py-2 text-sm cursor-pointer shadow"
                    >
                        Reseñas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="canchas">
                    <h2 className="text-xl font-bold mb-4">
                        Canchas disponibles
                    </h2>

                    {canchas.length === 0 ? (
                        <p className="text-sm text-gray-400">
                            Este complejo aún no tiene canchas registradas.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {canchas.map((cancha, i) => (
                                <div
                                    key={cancha.id_cancha}
                                    className="bg-[#1a1f2b] p-4 rounded-xl border border-gray-700"
                                >
                                    <div
                                        className="h-40 bg-gray-700 rounded mb-3 bg-center bg-cover"
                                        style={{
                                            backgroundImage: `url('${
                                                cancha.imagen ||
                                                `/images/banners/banner4.jpg`
                                            }')`,
                                        }}
                                    ></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-semibold">
                                            {cancha.nombre_cancha}
                                        </p>
                                        {cancha.techo && (
                                            <span className="text-sm text-green-400 bg-[#033] px-2 py-0.5 rounded-full">
                                                Techada
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-1">
                                        <Users className="w-4 h-4" /> Capacidad:{" "}
                                        {cancha.cant_jugador} jugadores
                                    </p>

                                    <div className="text-right -mt-4">
                                        <p className="text-green-400 font-bold mb-1">
                                            ${cancha.precio_turno}/h
                                        </p>

                                        <Button
                                            disabled={!isOperational}
                                            onClick={() => {
                                                setSelectedCanchaId(
                                                    cancha.id_cancha
                                                );
                                                setSelectedCanchaName(
                                                    cancha.nombre_cancha
                                                );
                                            }}
                                            className="mt-3 cursor-pointer w-full bg-gradient-to-r from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600"
                                        >
                                            Reservar
                                        </Button>
                                        {!isOperational && (
                                            <p className="text-xs text-red-400 mt-1 text-center">
                                                Este complejo aún no tiene
                                                horarios disponibles.
                                            </p>
                                        )}
                                        {selectedCanchaId && (
                                            <ReservaModal
                                                mailAdmin={
                                                    complejo?.administrador
                                                        ?.mail
                                                }
                                                idAdmin={complejo?.id_admin}
                                                idComplejo={
                                                    complejo?.id_complejo
                                                }
                                                idCancha={selectedCanchaId}
                                                nombreCancha={
                                                    selectedCanchaName!
                                                }
                                                onClose={() => {
                                                    setSelectedCanchaId(null);
                                                    setSelectedCanchaName(null);
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="info">
                    <h2 className="text-xl font-bold mb-4">
                        Información del Complejo
                    </h2>
                    <p className="text-sm text-gray-400 mb-2">
                        <Phone className="inline w-4 h-4 mr-1" />{" "}
                        {complejo.telefono}
                    </p>
                    <p className="text-sm text-gray-400">
                        {complejo.descripcion ||
                            "Este complejo aún no tiene descripción."}
                    </p>
                </TabsContent>

                <TabsContent value="resenas">
                    <h2 className="text-xl font-bold mb-4">Reseñas</h2>
                    <ReviewsList idComplejo={complejo.id_complejo} />
                </TabsContent>
            </Tabs>
            <FullscreenCarousel
                open={verGaleriaCompleta}
                onClose={() => setVerGaleriaCompleta(false)}
                images={imagenes}
            />
        </div>
    );
}
