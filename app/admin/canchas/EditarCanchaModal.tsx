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
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function EditarCanchaModal({
    cancha,
    onClose,
    onUpdated,
}: {
    cancha: any;
    onClose: () => void;
    onUpdated: () => void;
}) {
    const [nombre, setNombre] = useState(cancha.nombre_cancha);
    const [techo, setTecho] = useState(cancha.techo);
    const [precio, setPrecio] = useState(cancha.precio_turno.toString());
    const [jugadores, setJugadores] = useState(cancha.cant_jugador.toString());
    const [imagenPreview, setImagenPreview] = useState(cancha.imagen); // ⬅️ NUEVO
    const [nuevaImagen, setNuevaImagen] = useState<File | null>(null); // ⬅️ NUEVO
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);

        const formData = new FormData();
        formData.append("id", cancha.id_cancha);
        formData.append("nombre_cancha", nombre);
        formData.append("techo", techo.toString());
        formData.append("precio_turno", precio);
        formData.append("cant_jugador", jugadores);
        if (nuevaImagen) formData.append("imagen", nuevaImagen); // ⬅️ NUEVO

        const res = await fetch(`/api/admin/canchas/update`, {
            method: "PUT",
            body: formData,
        });

        if (res.ok) {
            toast.success("Cancha actualizada", {
                description: "Los cambios se guardaron correctamente.",
            });
            onUpdated();
            onClose();
        } else {
            toast.error("Error al actualizar la cancha");
        }
        setLoading(false);
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Cancha</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre de la cancha"
                    />
                    <div className="flex items-center gap-2">
                        <Switch checked={techo} onCheckedChange={setTecho} />
                        <span>{techo ? "Con techo" : "Sin techo"}</span>
                    </div>
                    <Select
                        value={jugadores}
                        onValueChange={(value) => setJugadores(value)}
                    >
                        <SelectTrigger>
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
                        type="number"
                        placeholder="Precio por hora"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                    />

                    {/* Imagen actual */}
                    {imagenPreview && (
                        <img
                            src={imagenPreview}
                            alt="Imagen cancha"
                            className="w-full h-40 object-contain rounded-md border border-gray-100"
                        />
                    )}

                    {/* Input de imagen nueva */}
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setNuevaImagen(file);
                                setImagenPreview(URL.createObjectURL(file)); // actualizar preview
                            }
                        }}
                    />

                    <Button
                        disabled={loading}
                        className="cursor-pointer bg-gradient-to-br from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600"
                        onClick={handleSave}
                    >
                        {loading ? <LoadingSpinner /> : "Confirmar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
