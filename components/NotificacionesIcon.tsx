import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks";
import { getRelativeTime } from "@/lib/utils";

export default function NotificacionesIcon() {
    const { notificaciones, hayNoLeidas, marcarComoVisto } = useNotifications();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="relative p-2">
                    <Bell
                        className="w-4.5 h-4.5 text-white hover:text-custom-green cursor-pointer"
                        strokeWidth={2}
                    />
                    {hayNoLeidas && (
                        <div className="absolute top-[5px] right-[7px] h-2.5 w-2.5">
                            <span className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-green-500 animate-ping opacity-75 pointer-events-none" />
                            <span className="absolute inset-0 m-auto h-[7px] w-[7px] rounded-full bg-green-500 pointer-events-none" />
                        </div>
                    )}
                </button>
            </PopoverTrigger>

            <PopoverContent
                side="bottom"
                align="end"
                className="w-[400px] p-0 bg-[#1a1f2b] border border-gray-800 text-white"
            >
                <div className="px-4 py-3 font-semibold border-b border-gray-800">
                    Notificaciones
                </div>
                <ul className="max-h-64 overflow-y-auto text-sm divide-y divide-gray-800 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                    {notificaciones.length === 0 ? (
                        <li className="px-4 py-2 text-gray-400 text-sm">
                            No hay notificaciones
                        </li>
                    ) : (
                        notificaciones.map((n) => {
                            const isClickable = !!n.url;
                            return (
                                <li
                                    key={n.id}
                                    className={`px-4 py-3 transition-colors ${
                                        n.leido
                                            ? "bg-transparent text-gray-400"
                                            : "bg-[#232938] text-white"
                                    } ${
                                        isClickable
                                            ? "cursor-pointer hover:bg-[#1e232f]"
                                            : ""
                                    }`}
                                    onClick={() => {
                                        if (isClickable)
                                            window.location.href = n.url!;
                                    }}
                                >
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium">
                                            {n.titulo}
                                        </h4>
                                        <span
                                            className={`text-xs ${
                                                n.leido
                                                    ? "text-gray-600"
                                                    : "text-gray-400"
                                            }`}
                                        >
                                            {getRelativeTime(n.created_at)}
                                        </span>
                                    </div>

                                    <p
                                        className={`mt-1 text-[13px] tracking-[-3%] ${
                                            n.leido
                                                ? "text-gray-500"
                                                : "text-gray-300"
                                        }`}
                                    >
                                        {n.mensaje}
                                    </p>

                                    {!n.leido && (
                                        <div className="mt-2 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // evita redirección si clic en botón
                                                    marcarComoVisto(n.id);
                                                }}
                                                className="text-xs text-custom-green hover:underline cursor-pointer"
                                            >
                                                Marcar como visto
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })
                    )}
                </ul>
            </PopoverContent>
        </Popover>
    );
}
