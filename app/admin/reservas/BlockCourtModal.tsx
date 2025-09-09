"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type CanchaOption = { id_cancha: number; nombre_cancha: string };

type BlockCourtModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;

    /** Cancha actualmente seleccionada en el selector externo */
    selectedCanchaId: number | null;
    selectedCanchaName?: string;

    /** Opcional: lista de canchas del admin para multi-selección */
    canchasOptions?: CanchaOption[];

    /** Opcional: valores por defecto del rango de fechas */
    defaultDateFrom?: string; // "YYYY-MM-DD"
    defaultDateTo?: string; // "YYYY-MM-DD"

    /** Llamar tras aplicar cambios para refrescar calendario/listas */
    onApplied?: () => void;
};

const DIA_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]; // 0..6

export default function BlockCourtModal({
    open,
    onOpenChange,
    selectedCanchaId,
    selectedCanchaName,
    canchasOptions,
    defaultDateFrom,
    defaultDateTo,
    onApplied,
}: BlockCourtModalProps) {
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [canchaIds, setCanchaIds] = useState<number[]>([]);
    const [dateFrom, setDateFrom] = useState<string>(defaultDateFrom ?? "");
    const [dateTo, setDateTo] = useState<string>(defaultDateTo ?? "");
    const [timeStart, setTimeStart] = useState<string>("16:00");
    const [timeEnd, setTimeEnd] = useState<string>("18:00");
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]); // 0..6
    const [allowConflicts, setAllowConflicts] = useState(false);
    const [unblockMode, setUnblockMode] = useState(false); // false = bloquear, true = desbloquear

    // Prefijar la cancha seleccionada cuando se abre el modal
    useEffect(() => {
        if (!open) return;
        if (canchasOptions && canchasOptions.length > 0) {
            // Si hay opciones, marcamos por defecto la seleccionada (si existe)
            if (selectedCanchaId) setCanchaIds([selectedCanchaId]);
        } else if (selectedCanchaId) {
            // Sin lista: solo la seleccionada
            setCanchaIds([selectedCanchaId]);
        }
    }, [open, selectedCanchaId, canchasOptions]);

    // Validación simple
    const valid = useMemo(() => {
        if (!canchaIds.length) return false;
        if (!dateFrom || !dateTo) return false;
        if (!timeStart || !timeEnd) return false;
        if (daysOfWeek.length === 0) return false;
        if (timeEnd <= timeStart) return false;
        return true;
    }, [canchaIds, dateFrom, dateTo, timeStart, timeEnd, daysOfWeek]);

    const resetLocalState = () => {
        setSubmitting(false);
        setAllowConflicts(false);
        setUnblockMode(false);
        setDaysOfWeek([]);
        setTimeStart("16:00");
        setTimeEnd("18:00");
        // Mantengo las fechas por si repiten acción; quita si prefieres limpiar:
        // setDateFrom(defaultDateFrom ?? "");
        // setDateTo(defaultDateTo ?? "");
    };

    const handleApply = async () => {
        if (!valid) {
            toast.error("Completa el formulario correctamente.");
            return;
        }
        try {
            setSubmitting(true);

            const payload = {
                canchaIds,
                dateFrom,
                dateTo,
                timeStart,
                timeEnd,
                daysOfWeek,
                ...(unblockMode ? {} : { allowConflicts }),
            };

            const url = unblockMode
                ? "/api/admin/blocks/delete"
                : "/api/admin/blocks";

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json?.message || "Operación fallida.");

            if (unblockMode) {
                toast.success("Bloqueos eliminados correctamente.");
            } else {
                const totalConflicts = Array.isArray(json?.results)
                    ? json.results.reduce(
                          (acc: number, r: any) =>
                              acc + (r.conflicts?.length ?? 0),
                          0
                      )
                    : 0;
                toast.success(
                    totalConflicts > 0 && !allowConflicts
                        ? `Bloqueo aplicado. (${totalConflicts} hora(s) ya estaban reservadas y se omitieron).`
                        : "Bloqueo aplicado correctamente."
                );
            }

            onApplied?.();
            onOpenChange(false);
            resetLocalState();
        } catch (e: any) {
            toast.error(e.message || "Error inesperado.");
        } finally {
            setSubmitting(false);
        }
    };

    // Helpers UI
    const toggleDay = (i: number, checked: boolean | string) => {
        const v = Boolean(checked);
        setDaysOfWeek((prev) =>
            v ? [...new Set([...prev, i])].sort() : prev.filter((d) => d !== i)
        );
    };

    const toggleCancha = (id: number, checked: boolean | string) => {
        const v = Boolean(checked);
        setCanchaIds((prev) =>
            v ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)
        );
    };

    const hasCanchasList = !!(canchasOptions && canchasOptions.length > 0);

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (!o) resetLocalState();
            }}
        >
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle className="text-base">
                        {unblockMode
                            ? "Desbloquear horarios"
                            : "Bloquear horarios"}
                    </DialogTitle>
                    <p className="text-sm text-gray-400">
                        Cancha seleccionada:{" "}
                        <strong>
                            {selectedCanchaName ?? selectedCanchaId ?? "-"}
                        </strong>
                    </p>
                </DialogHeader>

                <div className="grid gap-5">
                    {/* Modo */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Switch
                                id="unblockMode"
                                checked={unblockMode}
                                onCheckedChange={setUnblockMode}
                            />
                            <Label htmlFor="unblockMode" className="text-sm">
                                Modo desbloquear
                            </Label>
                        </div>

                        {!unblockMode && (
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="allowConflicts"
                                    checked={allowConflicts}
                                    onCheckedChange={setAllowConflicts}
                                />
                                <Label
                                    htmlFor="allowConflicts"
                                    className="text-sm"
                                >
                                    Permitir conflictos (forzar bloqueo)
                                </Label>
                            </div>
                        )}
                    </div>

                    {/* Rango de fechas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-sm">Desde</Label>
                            <Input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-sm">Hasta</Label>
                            <Input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Rango horario */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-sm">Hora inicio</Label>
                            <Input
                                type="time"
                                step={3600}
                                value={timeStart}
                                onChange={(e) => setTimeStart(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label className="text-sm">Hora fin</Label>
                            <Input
                                type="time"
                                step={3600}
                                value={timeEnd}
                                onChange={(e) => setTimeEnd(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Días de la semana */}
                    <div>
                        <Label className="text-sm mb-2 block">Días</Label>
                        <div className="flex flex-wrap gap-3">
                            {DIA_LABELS.map((d, i) => (
                                <label
                                    key={i}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <Checkbox
                                        checked={daysOfWeek.includes(i)}
                                        onCheckedChange={(v) => toggleDay(i, v)}
                                    />
                                    {d}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Canchas */}
                    <div>
                        <Label className="text-sm mb-2 block">Canchas</Label>
                        {hasCanchasList ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {canchasOptions!.map((c) => (
                                    <label
                                        key={c.id_cancha}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={canchaIds.includes(
                                                c.id_cancha
                                            )}
                                            onCheckedChange={(v) =>
                                                toggleCancha(c.id_cancha, v)
                                            }
                                        />
                                        {c.nombre_cancha}
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400">
                                No se proporcionó una lista de canchas. Se
                                aplicará a:{" "}
                                <strong>
                                    {selectedCanchaName ??
                                        selectedCanchaId ??
                                        "—"}
                                </strong>
                            </p>
                        )}
                    </div>
                </div>

                <DialogFooter className="mt-2">
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleApply}
                        disabled={!valid || submitting}
                    >
                        {unblockMode ? "Desbloquear" : "Aplicar bloqueo"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
