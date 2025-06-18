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
