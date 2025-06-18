"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import AgregarCierreModal from "./AgregarCierreModal";

interface Cierre {
    id_cierre: number;
    fecha_inicio: string;
    fecha_fin: string;
    motivo?: string;
}

export default function CierresTemporalesSection({
    idComplejo,
}: {
    idComplejo: number;
}) {
    const [cierres, setCierres] = useState<Cierre[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingDelete, setLoadingDelete] = useState<number | null>(null);

    const fetchCierres = async () => {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/admin/cierres?id_complejo=${idComplejo}`
            );
            const data = await res.json();
            if (Array.isArray(data)) {
                setCierres(data);
            } else {
                setCierres([]);
            }
        } catch (error) {
            console.error("Error al traer cierres:", error);
            toast.error("No se pudo cargar la información.");
        }
        setLoading(false);
    };

    useEffect(() => {
        if (!idComplejo) return;
        fetchCierres();
    }, [idComplejo]);

    const handleEliminar = async (id_cierre: number) => {
        setLoadingDelete(id_cierre);
        try {
            const res = await fetch(
                `/api/admin/cierres/delete?id_cierre=${id_cierre}`,
                {
                    method: "DELETE",
                }
            );

            if (!res.ok) {
                toast.error("Error al eliminar cierre.");
            } else {
                toast.success("Cierre eliminado");
                await fetchCierres();
            }
        } catch (err) {
            toast.error("Error de conexión al eliminar.");
        } finally {
            setLoadingDelete(null);
        }
    };

    return (
        <div className="col-span-2 mt-10">
            <h3 className="font-semibold mb-3 text-lg">Cierres Temporales</h3>
            {loading ? (
                <div className="flex gap-2 items-center text-white">
                    <LoadingSpinner /> Cargando...
                </div>
            ) : cierres.length === 0 ? (
                <p className="text-sm text-gray-400">
                    No hay cierres temporales registrados.
                </p>
            ) : (
                <ul className="space-y-2 text-sm">
                    {cierres.map((cierre) => (
                        <li
                            key={cierre.id_cierre}
                            className="flex justify-between items-center bg-slate-800 border border-slate-600 rounded-md px-4 py-2"
                        >
                            <div>
                                <div>
                                    <strong>Del</strong> {cierre.fecha_inicio}{" "}
                                    <strong>al</strong> {cierre.fecha_fin}
                                </div>
                                {cierre.motivo && (
                                    <div className="text-gray-400 italic">
                                        {cierre.motivo}
                                    </div>
                                )}
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={loadingDelete === cierre.id_cierre}
                                onClick={() => handleEliminar(cierre.id_cierre)}
                            >
                                {loadingDelete === cierre.id_cierre ? (
                                    <LoadingSpinner />
                                ) : (
                                    "Eliminar"
                                )}
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <AgregarCierreModal
                idComplejo={idComplejo}
                onCierreAgregado={fetchCierres}
            />
        </div>
    );
}
