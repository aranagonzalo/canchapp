"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ConfirmarEliminarModal({
    canchaId,
    onClose,
    onDeleted,
}: {
    canchaId: number;
    onClose: () => void;
    onDeleted: () => void;
}) {
    const [loading, setLoading] = useState(false);

    const eliminar = async () => {
        setLoading(true);
        await fetch(`/api/admin/canchas/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_cancha: canchaId }),
        });
        setLoading(false);
        onDeleted();
        onClose();
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        ¿Estás seguro de eliminar esta cancha?
                    </DialogTitle>
                    <DialogDescription>
                        Al eliminar esta cancha se eliminarán también las
                        reservas asociadas para ti y para los jugadores que la
                        hayan reservado.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                    <Button variant="secondary" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={eliminar}
                        disabled={loading}
                    >
                        {loading && <LoadingSpinner />}
                        Eliminar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
