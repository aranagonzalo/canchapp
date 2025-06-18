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
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function CrearCanchaModal({
    onClose,
    idComplejo,
}: {
    onClose: () => void;
    idComplejo: number;
}) {
    const [nombre, setNombre] = useState("");
    const [techo, setTecho] = useState(false);
    const [precio, setPrecio] = useState("");
    const [jugadores, setJugadores] = useState("");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        await fetch(`/api/admin/canchas/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nombre_cancha: nombre,
                techo,
                precio_turno: Number(precio),
                cant_jugador: Number(jugadores),
                id_complejo: idComplejo,
            }),
        });
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Crear Nueva Cancha</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <Input
                        placeholder="Nombre de la cancha"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                        <Switch checked={techo} onCheckedChange={setTecho} />
                        <span>{techo ? "Con techo" : "Sin techo"}</span>
                    </div>
                    <Input
                        placeholder="Capacidad de jugadores"
                        value={jugadores}
                        onChange={(e) => setJugadores(e.target.value)}
                        type="number"
                    />
                    <Input
                        placeholder="Precio por hora"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        type="number"
                    />
                    <div className="flex justify-end gap-2">
                        <Button
                            onClick={handleCreate}
                            disabled={loading}
                            className="cursor-pointer bg-gradient-to-br from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                            ) : null}
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
