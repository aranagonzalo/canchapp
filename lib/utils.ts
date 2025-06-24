import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now.getTime() - date.getTime()) / 1000; // en segundos

    const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

    if (diff < 60) return rtf.format(-Math.floor(diff), "second");
    if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
    if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
    if (diff < 2592000) return rtf.format(-Math.floor(diff / 86400), "day");
    if (diff < 31536000)
        return rtf.format(-Math.floor(diff / 2592000), "month");

    return rtf.format(-Math.floor(diff / 31536000), "year");
}

export function formatHourRange(hours: string[]): string {
    if (!hours.length) return "";

    const start = parseInt(hours[0], 10);
    const end = parseInt(hours[hours.length - 1], 10) + 1;

    const formatHour = (h: number) => {
        const hour = h % 12 === 0 ? 12 : h % 12;
        const suffix = h < 12 || h === 24 ? "a.m." : "p.m.";
        return `${hour.toString().padStart(2, "0")}:00 ${suffix}`;
    };

    return `${formatHour(start)} - ${formatHour(end)}`;
}

export function formatPhoneForWhatsApp(raw: string): string {
    const cleaned = raw.replace(/\D/g, "");

    // Diccionario de códigos por país (los primeros dígitos)
    const codigos = {
        pe: "51",
        ar: "54",
        cl: "56",
        co: "57",
    };

    // Si empieza con alguno de los códigos
    if (cleaned.startsWith(codigos.pe)) {
        return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }
    if (cleaned.startsWith(codigos.ar)) {
        return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }
    if (cleaned.startsWith(codigos.cl)) {
        return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }
    if (cleaned.startsWith(codigos.co)) {
        return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
    }

    // Si no tiene código de país, asumimos por heurística según longitud
    if (cleaned.length === 9 && cleaned.startsWith("9")) {
        return `+51${cleaned}`; // Perú
    }
    if (cleaned.length === 10 && cleaned.startsWith("15")) {
        return `+54${cleaned}`; // Argentina móvil
    }

    // Por defecto, se asume Argentina
    return `+54${cleaned}`;
}
