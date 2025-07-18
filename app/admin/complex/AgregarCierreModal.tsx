"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AgregarCierreModal({
    idComplejo,
    onCierreAgregado,
}: {
    idComplejo: number;
    onCierreAgregado: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [motivo, setMotivo] = useState("");
    const [loading, setLoading] = useState(false);

    const handleGuardar = async () => {
        if (!fechaInicio || !fechaFin) {
            toast.error("Debes ingresar ambas fechas.");
            return;
        }

        if (fechaFin < fechaInicio) {
            toast.error(
                "La fecha de fin no puede ser anterior a la de inicio."
            );
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/admin/cierres/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_complejo: idComplejo,
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    motivo,
                }),
            });

            if (!res.ok) {
                toast.error("Error al registrar cierre.");
            } else {
                toast.success("Cierre registrado");
                onCierreAgregado();
                setOpen(false);
                setFechaInicio("");
                setFechaFin("");
                setMotivo("");
            }
        } catch (err) {
            toast.error("Error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="mt-4 bg-gradient-to-br from-custom-dark-green to-custom-green">
                    Agregar Cierre Temporal
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1f2b] text-white border border-gray-800">
                <DialogHeader>
                    <DialogTitle>Nuevo Cierre Temporal</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-5 mt-5">
                    <div>
                        <Label className="mb-2.5">Fecha de inicio</Label>
                        <Input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            className="text-white border-gray-700"
                        />
                    </div>
                    <div>
                        <Label className="mb-2.5">Fecha de fin</Label>
                        <Input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                            className="text-white border-gray-700"
                        />
                    </div>
                    <div>
                        <Label className="mb-2.5">Motivo (opcional)</Label>
                        <Input
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Vacaciones, mantenimiento..."
                            className="text-white border-gray-700"
                        />
                    </div>
                </div>
                <DialogFooter className="mt-3">
                    <Button
                        disabled={loading}
                        onClick={handleGuardar}
                        className="bg-gradient-to-br from-custom-dark-green to-custom-green"
                    >
                        {loading ? "Guardando..." : "Guardar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
