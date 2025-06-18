"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DisponiblesModal({
    cancha,
    onClose,
}: {
    cancha: any;
    onClose: () => void;
}) {
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [horaInicio, setHoraInicio] = useState("");
    const [horaFin, setHoraFin] = useState("");

    const handleSave = async () => {
        await fetch(`/api/agenda`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_cancha: cancha.id_cancha,
                fechaInicio,
                fechaFin,
                horaInicio,
                horaFin,
            }),
        });
        onClose();
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar Disponibilidad</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                    <Input
                        type="date"
                        value={fechaInicio}
                        onChange={(e) => setFechaInicio(e.target.value)}
                    />
                    <Input
                        type="date"
                        value={fechaFin}
                        onChange={(e) => setFechaFin(e.target.value)}
                    />
                    <Input
                        type="time"
                        value={horaInicio}
                        onChange={(e) => setHoraInicio(e.target.value)}
                    />
                    <Input
                        type="time"
                        value={horaFin}
                        onChange={(e) => setHoraFin(e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={handleSave} className="bg-blue-600">
                        Guardar
                    </Button>
                    <Button variant="destructive" onClick={onClose}>
                        Cancelar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
