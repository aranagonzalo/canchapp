"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast, Toaster } from "sonner";
import { useUser } from "@/context/userContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Edit, MapPin, Phone, Star } from "lucide-react";
import CierresTemporalesSection from "./CierresTemporales";
import HourSelect from "./HourSelect";
import GaleriaImagenesModal from "./GaleriaImagenesModal";
import BannerCarousel from "./BannerCarousel";
import FullscreenCarousel from "./FullScreenCarousel";
import SkeletonCarousel from "./SkeletonCarousel";

interface Complejo {
    id_complejo: number;
    nombre_complejo: string;
    telefono: string;
    direccion: string;
    cant_canchas: number;
    ciudad: string;
    cuit: string;
    descripcion: string;
    latitud: number;
    longitud: number;
}

interface Horario {
    dia_semana: number;
    hora_apertura: string;
    hora_cierre: string;
    activo: boolean;
}

export default function ComplejoAdminProfile() {
    const { user } = useUser(); // necesitas tener el id y tipo del usuario logueado
    const [complejo, setComplejo] = useState<Complejo | null>(null);
    const [horarios, setHorarios] = useState<Horario[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingSave, setLoadingSave] = useState(false);
    const [showImagenesModal, setShowImagenesModal] = useState(false);
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

    function cleanNulls<T extends Record<string, any>>(obj: T): T {
        const cleaned: any = {};
        for (const key in obj) {
            cleaned[key] = obj[key] === null ? "" : obj[key];
        }
        return cleaned;
    }

    useEffect(() => {
        if (!user?.id) return;

        fetch(`/api/admin/complex?id_admin=${user.id}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.complejo) {
                    setComplejo(cleanNulls(data.complejo));
                }
                const base = Array.from({ length: 7 }, (_, i) => ({
                    dia_semana: i,
                    hora_apertura: "00:00",
                    hora_cierre: "00:00",
                    activo: false,
                }));

                const merged = base.map((dia) => {
                    const encontrado = data.horarios.find(
                        (h: any) => h.dia_semana === dia.dia_semana
                    );
                    if (encontrado) {
                        return {
                            dia_semana: dia.dia_semana,
                            hora_apertura:
                                encontrado.hora_apertura?.slice(0, 5) ||
                                "00:00",
                            hora_cierre:
                                encontrado.hora_cierre?.slice(0, 5) || "00:00",
                            activo: true,
                        };
                    }
                    return dia;
                });

                setHorarios(merged);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error al obtener complejo:", err);
                setLoading(false);
            });
    }, [user]);

    const handleSave = async () => {
        if (!complejo) return;

        const horariosActivos = horarios.filter((h) => h.activo);

        // Validación: hora_apertura debe ser menor a hora_cierre
        const horariosInvalidos = horariosActivos.filter(
            (h) =>
                h.hora_apertura >= h.hora_cierre ||
                !h.hora_apertura ||
                !h.hora_cierre
        );

        if (horariosInvalidos.length > 0) {
            toast.error(
                "Revisa que la hora de apertura sea menor que la de cierre en todos los días activos."
            );
            return;
        }

        setLoadingSave(true);

        const response = await fetch("/api/admin/complex/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...complejo,
                cant_canchas: complejo.cant_canchas || "0",
                horarios: horariosActivos,
            }),
        });

        const result = await response.json();
        setLoadingSave(false);

        if (response.ok) {
            toast.success("Datos actualizados correctamente");
            setEditMode(false);
        } else {
            toast.error(result.message || "Error al actualizar");
        }
    };

    if (loading)
        return (
            <div className="flex items-center justify-center bg-gradient-to-b to-[#0b1120] from-[#030712] min-h-screen pb-20  text-white">
                <div className="text-white p-10 flex gap-1">
                    <LoadingSpinner />
                    Cargando...
                </div>
            </div>
        );

    if (!complejo) {
        return (
            <div className="text-white p-10">
                No se encontró información del complejo.
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b to-[#0b1120] from-[#030712] min-h-screen pb-20  text-white flex-col flex items-center justify-center">
            <Toaster richColors position="top-right" />
            {/* Banner */}
            <div className="relative h-64 md:h-96 w-full">
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
                    <div>
                        <h1 className="text-3xl font-bold mb-1">
                            {complejo.nombre_complejo}
                        </h1>
                        <p className="flex items-center text-sm text-gray-300">
                            <MapPin className="w-4 h-4 mr-1" />
                            {complejo.ciudad}, {complejo.direccion}
                            <Star className="ml-4 w-4 h-4 text-yellow-400 fill-yellow-400" />
                            <span className="ml-1">4.8 (8 reseñas)</span>
                        </p>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setShowImagenesModal(true)}
                        className="cursor-pointer absolute bottom-4 right-4 bg-white text-black hover:bg-gray-100 hover:scale-[1.03] transition-all z-20"
                    >
                        <Edit className="w-4 h-4 mr-1" />
                        Editar Fotos
                    </Button>
                </div>
            </div>

            <div className="w-full max-w-[700px] mt-8 border-gray-800 border bg-[#1a1f2b] rounded-xl p-8 mx-20">
                <div className="flex justify-between items-center pb-8">
                    <h2 className="text-xl font-bold">
                        Información del Complejo
                    </h2>
                    <div className="flex justify-end gap-4">
                        {editMode ? (
                            <>
                                <Button
                                    onClick={handleSave}
                                    className="cursor-pointer bg-gradient-to-br from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-500"
                                >
                                    {loadingSave ? (
                                        <LoadingSpinner />
                                    ) : (
                                        "Guardar"
                                    )}
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="cursor-pointer"
                                    onClick={() => setEditMode(false)}
                                >
                                    Cancelar
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="secondary"
                                onClick={() => setEditMode(true)}
                                className="flex gap-1 cursor-pointer"
                            >
                                <Edit /> Editar
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Input
                        disabled={!editMode}
                        value={complejo.nombre_complejo}
                        onChange={(e) =>
                            setComplejo({
                                ...complejo,
                                nombre_complejo: e.target.value,
                            })
                        }
                        placeholder="Nombre del complejo"
                        className="py-5 disabled:text-gray-500 disabled:border-gray-500 border-gray-400 shadow"
                    />
                    <Input
                        disabled={!editMode}
                        value={complejo.telefono}
                        onChange={(e) =>
                            setComplejo({
                                ...complejo,
                                telefono: e.target.value,
                            })
                        }
                        placeholder="Teléfono"
                        className="py-5 disabled:text-gray-500 disabled:border-gray-500 border-gray-400 shadow"
                    />
                    <Input
                        disabled={!editMode}
                        value={complejo.direccion}
                        onChange={(e) =>
                            setComplejo({
                                ...complejo,
                                direccion: e.target.value,
                            })
                        }
                        placeholder="Dirección"
                        className="py-5 disabled:text-gray-500 disabled:border-gray-500 border-gray-400 shadow"
                    />
                    <Input
                        disabled={!editMode}
                        value={complejo.ciudad}
                        onChange={(e) =>
                            setComplejo({ ...complejo, ciudad: e.target.value })
                        }
                        placeholder="Ciudad"
                        className="py-5 disabled:text-gray-500 disabled:border-gray-500 border-gray-400 shadow"
                    />
                    <Input
                        disabled={!editMode}
                        value={complejo.cuit}
                        onChange={(e) =>
                            setComplejo({ ...complejo, cuit: e.target.value })
                        }
                        placeholder="CUIT"
                        className="py-5 disabled:text-gray-500 disabled:border-gray-500 border-gray-400 shadow"
                    />
                    <Input
                        disabled={!editMode}
                        type="number"
                        value={complejo.cant_canchas}
                        onChange={(e) =>
                            setComplejo({
                                ...complejo,
                                cant_canchas: Number(e.target.value),
                            })
                        }
                        placeholder="Cantidad de canchas"
                        className="py-5 disabled:text-gray-500 disabled:border-gray-500 border-gray-400 shadow"
                    />
                    <Textarea
                        rows={10}
                        disabled={!editMode}
                        value={complejo.descripcion || ""}
                        onChange={(e) =>
                            setComplejo({
                                ...complejo,
                                descripcion: e.target.value,
                            })
                        }
                        placeholder="Descripción del complejo"
                        className="h-24 col-span-2 resize-none disabled:text-gray-500 disabled:border-gray-500 border-gray-400 shadow"
                    />
                    {!editMode ? (
                        <div className="col-span-2 mt-4">
                            <h3 className="font-semibold mb-4">
                                Horarios de atención
                            </h3>
                            <table className="w-full text-sm text-gray-300 border-collapse">
                                <thead>
                                    <tr className="text-left border-b border-gray-600">
                                        <th className="py-2 pr-4">Día</th>
                                        <th className="py-2 pr-4">
                                            Hora Apertura
                                        </th>
                                        <th className="py-2">Hora Cierre</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {horarios?.map((h, i) => {
                                        const dia = h.dia_semana ?? i;
                                        const apertura = h.hora_apertura?.slice(
                                            0,
                                            5
                                        );
                                        const cierre = h.hora_cierre?.slice(
                                            0,
                                            5
                                        );
                                        const sinAtencion =
                                            !apertura ||
                                            !cierre ||
                                            (apertura === "00:00" &&
                                                cierre === "00:00");

                                        return (
                                            <tr
                                                key={dia}
                                                className="border-b border-gray-700"
                                            >
                                                <td className="py-2 pr-4 font-semibold">
                                                    {
                                                        [
                                                            "Dom",
                                                            "Lun",
                                                            "Mar",
                                                            "Mié",
                                                            "Jue",
                                                            "Vie",
                                                            "Sáb",
                                                        ][dia]
                                                    }
                                                </td>
                                                {sinAtencion ? (
                                                    <td
                                                        colSpan={2}
                                                        className="py-2 italic text-gray-500"
                                                    >
                                                        No hay atención este
                                                        día.
                                                    </td>
                                                ) : (
                                                    <>
                                                        <td className="py-2 pr-4">
                                                            {apertura}
                                                        </td>
                                                        <td className="py-2">
                                                            {cierre}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="col-span-2 mt-4">
                            <h3 className="font-semibold mb-2">
                                Editar horarios
                            </h3>
                            <div className="grid gap-2">
                                {horarios.map((h, idx) => (
                                    <div
                                        key={h.dia_semana ?? idx}
                                        className="flex items-center gap-4"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={h.activo}
                                            onChange={() =>
                                                setHorarios((prev) =>
                                                    prev.map((prevH, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...prevH,
                                                                  activo: !prevH.activo,
                                                              }
                                                            : prevH
                                                    )
                                                )
                                            }
                                            className="scale-125 accent-emerald-500"
                                        />
                                        <span className="w-20">
                                            {
                                                [
                                                    "Dom",
                                                    "Lun",
                                                    "Mar",
                                                    "Mié",
                                                    "Jue",
                                                    "Vie",
                                                    "Sáb",
                                                ][h.dia_semana]
                                            }
                                        </span>
                                        <HourSelect
                                            value={h.hora_apertura ?? ""}
                                            disabled={!h.activo}
                                            onChange={(val) =>
                                                setHorarios((prev) =>
                                                    prev.map((prevH, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...prevH,
                                                                  hora_apertura:
                                                                      val,
                                                              }
                                                            : prevH
                                                    )
                                                )
                                            }
                                        />
                                        <span>a</span>
                                        <HourSelect
                                            value={h.hora_cierre ?? ""}
                                            disabled={!h.activo}
                                            onChange={(val) =>
                                                setHorarios((prev) =>
                                                    prev.map((prevH, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...prevH,
                                                                  hora_cierre:
                                                                      val,
                                                              }
                                                            : prevH
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {complejo?.id_complejo && (
                        <CierresTemporalesSection
                            idComplejo={complejo.id_complejo}
                        />
                    )}
                </div>
            </div>
            <FullscreenCarousel
                open={verGaleriaCompleta}
                onClose={() => setVerGaleriaCompleta(false)}
                images={imagenes}
            />
            {showImagenesModal && complejo?.id_complejo && (
                <GaleriaImagenesModal
                    idComplejo={complejo.id_complejo}
                    onClose={() => setShowImagenesModal(false)}
                    open={showImagenesModal}
                />
            )}
        </div>
    );
}
