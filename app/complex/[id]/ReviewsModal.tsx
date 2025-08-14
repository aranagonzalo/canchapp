"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface ReviewsModalProps {
    idComplejo: number;
    idJugador: number;
    onClose: () => void;
}

export default function ReviewsModal({
    idComplejo,
    idJugador,
    onClose,
}: ReviewsModalProps) {
    const [rating, setRating] = useState<number>(0);
    const [hover, setHover] = useState<number | null>(null);
    const [comentario, setComentario] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.warning("Selecciona una puntuación antes de enviar.");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/reviews/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id_jugador: idJugador,
                    id_complejo: idComplejo,
                    puntuacion: rating,
                    comentario,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                toast.success("Reseña enviada correctamente");
                onClose();
            } else {
                toast.error(data.error || "No se pudo enviar la reseña");
            }
        } catch (error) {
            toast.error("Error al enviar reseña");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="bg-[#1a1f2b] border border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        Califica este predio
                    </DialogTitle>
                </DialogHeader>

                <div className="flex justify-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => {
                        const filled = (hover ?? rating) >= star;
                        return (
                            <Star
                                key={star}
                                className={`w-8 h-8 cursor-pointer transition ${
                                    filled
                                        ? "text-yellow-400 fill-yellow-400 stroke-yellow-400"
                                        : "text-gray-500"
                                }`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(null)}
                                fill={filled ? "currentColor" : "none"}
                                strokeWidth={filled ? 0 : 1.5}
                            />
                        );
                    })}
                </div>

                <Textarea
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Escribe un comentario (opcional)"
                    className=" border-gray-800 text-white mb-4"
                />

                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-custom-green to-custom-dark-green"
                    >
                        {loading ? "Enviando..." : "Enviar Reseña"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
