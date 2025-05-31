"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface Jugador {
    nombre: string;
    edad: number;
    pierna_habil?: string;
    sexo: string;
    posicion?: string;
    telefono?: string;
}

interface PlayerListModalProps {
    jugadores: Jugador[];
    open: boolean;
    onClose: () => void;
    equipoNombre: string | null;
}

export default function PlayerListModal({
    jugadores,
    open,
    onClose,
    equipoNombre,
}: PlayerListModalProps) {
    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-[#0b1120] rounded-lg shadow-lg !max-w-4xl max-h-[90vh] w-full border border-slate-800">
                <DialogClose className="absolute top-4 right-4 text-white cursor-pointer z-30 hover:text-gray-300">
                    <X className="z-20 h-5 w-5 text-white" />
                </DialogClose>
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {equipoNombre
                            ? `Jugadores - ${equipoNombre}`
                            : "Jugadores"}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Información detallada de los jugadores activos en este
                        equipo.
                    </DialogDescription>
                </DialogHeader>

                {/* Contenedor con scroll interno */}
                <div className="overflow-auto max-h-[70vh] pb-4">
                    <div className="">
                        {" "}
                        {/* evita corte horizontal */}
                        <Table>
                            <TableHeader className="bg-slate-800 text-white sticky top-0 z-10">
                                <TableRow className="hover:bg-slate-800 transition-colors border-b border-slate-700 h-12">
                                    <TableHead className="text-white">
                                        Jugador
                                    </TableHead>
                                    <TableHead className="text-white">
                                        Pie Hábil
                                    </TableHead>
                                    <TableHead className="text-white">
                                        Sexo
                                    </TableHead>
                                    <TableHead className="text-white">
                                        Posición
                                    </TableHead>
                                    <TableHead className="text-white">
                                        Teléfono
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jugadores.map((jugador, idx) => (
                                    <TableRow
                                        key={idx}
                                        className="hover:bg-[#0b1120] transition-colors border-b border-slate-700"
                                    >
                                        <TableCell className="flex items-center gap-3 text-white">
                                            <Avatar className="h-8 w-8 ">
                                                <AvatarFallback className="bg-gradient-to-r from-custom-dark-green to-custom-green">
                                                    {jugador.nombre
                                                        .slice(0, 1)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium capitalize">
                                                    {jugador.nombre}
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    Edad: {jugador.edad}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-white">
                                            {jugador.pierna_habil ||
                                                "Información privada"}
                                        </TableCell>
                                        <TableCell className="text-white">
                                            {jugador.sexo}
                                        </TableCell>
                                        <TableCell className="text-white">
                                            {jugador.posicion ||
                                                "Información privada"}
                                        </TableCell>
                                        <TableCell className="text-white">
                                            {jugador.telefono || "Privado"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
