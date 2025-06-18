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

export default function EditarCanchaModal({
    cancha,
    onClose,
}: {
    cancha: any;
    onClose: () => void;
}) {
    const [nombre, setNombre] = useState(cancha.nombre_cancha);
    const [techo, setTecho] = useState(cancha.techo);

    const handleSave = async () => {
        await fetch(`/api/cancha/${cancha.id_cancha}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre_cancha: nombre, techo }),
        });
        onClose();
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
                    <Button
                        className="cursor-pointer bg-gradient-to-br from-custom-dark-green to-custom-green hover:from-emerald-700 hover:to-emerald-600"
                        onClick={handleSave}
                    >
                        Confirmar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
