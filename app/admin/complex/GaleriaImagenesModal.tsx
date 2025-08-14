"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
    idComplejo: number;
    open: boolean;
    onClose: () => void;
}

interface Imagen {
    name: string;
    url: string;
}

export default function ImagenesModal({ idComplejo, open, onClose }: Props) {
    const [imagenes, setImagenes] = useState<Imagen[]>([]);
    const [cargando, setCargando] = useState(false);
    const [subiendo, setSubiendo] = useState(false);

    const fetchImagenes = async () => {
        setCargando(true);
        const res = await fetch(
            `/api/admin/complex/images?id_complejo=${idComplejo}`
        );
        const data = await res.json();
        setImagenes(data.images || []);
        setCargando(false);
    };

    useEffect(() => {
        if (open) fetchImagenes();
    }, [open]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("imagenes", files[i]);
        }
        formData.append("id_complejo", idComplejo.toString());

        setSubiendo(true);
        const res = await fetch(`/api/admin/complex/images/upload`, {
            method: "POST",
            body: formData,
        });

        if (res.ok) await fetchImagenes();
        setSubiendo(false);
    };

    const eliminarImagen = async (name: string) => {
        const res = await fetch(`/api/admin/complex/images/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });

        if (res.ok) await fetchImagenes();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Galería de imágenes</DialogTitle>
                    <DialogDescription>
                        Sube o elimina las imágenes de tu predio.
                    </DialogDescription>
                </DialogHeader>

                <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    disabled={subiendo}
                    className="text-white"
                />

                {subiendo && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-300">
                        <LoadingSpinner /> Subiendo imágenes...
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                    {cargando ? (
                        <LoadingSpinner />
                    ) : imagenes.length === 0 ? (
                        <p className="text-gray-500 text-sm">
                            No hay imágenes aún.
                        </p>
                    ) : (
                        imagenes.map((img) => (
                            <div
                                key={img.url}
                                className="relative group border border-gray-200 rounded-md overflow-hidden"
                            >
                                <img
                                    src={img.url}
                                    alt="imagen"
                                    className="object-cover w-full h-40"
                                />

                                <button
                                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                    onClick={() => eliminarImagen(img.name)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
