"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function CrearCanchaModal({
    onClose,
    idComplejo,
    onCreated,
}: {
    onClose: () => void;
    onCreated: () => void;
    idComplejo: number;
}) {
    const [nombre, setNombre] = useState("");
    const [techo, setTecho] = useState(false);
    const [precio, setPrecio] = useState("");
    const [jugadores, setJugadores] = useState("");
    const [imagen, setImagen] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImagen(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("nombre_cancha", nombre);
        formData.append("techo", techo.toString());
        formData.append("precio_turno", precio);
        formData.append("cant_jugador", jugadores);
        formData.append("id_complejo", idComplejo.toString());
        if (imagen) formData.append("imagen", imagen);

        await fetch(`/api/admin/canchas/create`, {
            method: "POST",
            body: formData,
        });

        onCreated();
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="bg-[#1a1f2b] border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>Crear Nueva Cancha</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Nombre de la cancha"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        className="border-gray-700"
                    />
                    <div className="flex items-center gap-2">
                        <Switch checked={techo} onCheckedChange={setTecho} />
                        <span>{techo ? "Con techo" : "Sin techo"}</span>
                    </div>

                    <Select
                        value={jugadores}
                        onValueChange={(value) => setJugadores(value)}
                    >
                        <SelectTrigger className="border-gray-700">
                            <SelectValue placeholder="Cantidad de jugadores" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">Fútbol 5</SelectItem>
                            <SelectItem value="7">Fútbol 7</SelectItem>
                            <SelectItem value="9">Fútbol 9</SelectItem>
                            <SelectItem value="11">Fútbol 11</SelectItem>
                        </SelectContent>
                    </Select>

                    <Input
                        min={500}
                        placeholder="Precio por hora"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        type="number"
                        className="border-gray-700"
                    />

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-300">
                            Subir imagen de la cancha
                        </label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="border-gray-700 text-white shadow"
                        />
                        {preview && (
                            <Image
                                src={preview}
                                alt="Preview"
                                width={300}
                                height={180}
                                className="rounded-lg object-cover mt-2"
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={handleCreate}
                            disabled={loading}
                            className="cursor-pointer bg-gradient-to-br from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600"
                        >
                            {loading && (
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                            )}
                            Confirmar
                        </Button>
                        <Button variant="destructive" onClick={onClose}>
                            Cerrar
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
