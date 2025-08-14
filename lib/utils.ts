import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface EquipoRef {
    id_equipo: number;
    nombre_equipo: string;
}

interface Reserva {
    nombre_complejo: string;
    direccion_complejo: string;
    telefono_complejo: string;
    nombre_cancha: string;

    // ya NO hay id_admin ni id
    mail_admin: string | null;

    fecha: string;
    horas: string[];
    is_active: boolean;

    // nuevo formato
    equipoCreador: EquipoRef | null;
    equipoInvitado: EquipoRef | null;
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

export function reservaExpirada(reserva: Reserva) {
    const ahora = new Date();

    const [year, month, day] = reserva.fecha.split("-");
    const fechaReserva = new Date(Number(year), Number(month) - 1, Number(day));

    const ultimaHora = Math.max(...reserva.horas.map(Number)) + 1;

    if (fechaReserva < ahora) {
        // Si la fecha ya pasó
        return true;
    }

    if (fechaReserva === ahora) {
        const horaActual = ahora.getHours();
        if (ultimaHora < horaActual) {
            // Si es hoy y la última hora ya pasó
            return true;
        }
    }

    return false;
}

//PLANTILLAS DE CORREOS:

export function getReservaEmailTemplate({
    titulo,
    mensaje,
    url,
}: {
    titulo: string;
    mensaje: string;
    url: string;
}): string {
    return `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #22c55e; margin-bottom: 16px;">${titulo}</h2>
          <p style="color: #333333; font-size: 16px; line-height: 1.5;">
            ${mensaje}
          </p>
          <div style="text-align: center; margin-top: 32px;">
          <p style="color: #333333; font-size: 16px; line-height: 1.5;">
            Haz click en el link a continuación para ver tus reserva:
          </p>
            <a href="${url}" target="_blank" 
               style="background-color: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
              Ver reservas
            </a>
          </div>
          <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">
            Este es un mensaje automático de CanchApp. Por favor no respondas este correo.
          </p>
        </div>
      </div>
    `;
}

export function getSolicitudEmailTemplate({
    titulo,
    mensaje,
    url,
}: {
    titulo: string;
    mensaje: string;
    url: string;
}): string {
    return `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #22c55e; margin-bottom: 16px;">${titulo}</h2>
          <p style="color: #333333; font-size: 16px; line-height: 1.5;">
            ${mensaje}
          </p>
          <div style="text-align: center; margin-top: 32px;">
          <p style="color: #333333; font-size: 16px; line-height: 1.5;">
            Haz click en el link a continuación para ver tus equipos:
          </p>
            <a href="${url}" target="_blank" 
               style="background-color: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
              Ver equipos
            </a>
          </div>
          <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">
            Este es un mensaje automático de CanchApp. Por favor no respondas este correo.
          </p>
        </div>
      </div>
    `;
}

export function getResetTemplate({
    titulo,
    mensaje,
    url,
}: {
    titulo: string;
    mensaje: string;
    url: string;
}): string {
    return `
    <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 24px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h2 style="color: #22c55e; margin-bottom: 16px;">${titulo}</h2>
        <p style="color: #333333; font-size: 16px; line-height: 1.5;">
          ${mensaje}
        </p>
        <div style="text-align: center; margin-top: 32px;">
        <p style="color: #333333; font-size: 16px; line-height: 1.5;">
          Haz click en el link a continuación para restablecer tu contraseña:
        </p>
          <a href="${url}" target="_blank" 
             style="background-color: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">
          Este es un mensaje automático de CanchApp. Por favor no respondas este correo.
        </p>
      </div>
    </div>
  `;
}

export function getInvitacionPartidoEmailTemplate({
    titulo,
    mensaje,
    url,
}: {
    titulo: string;
    mensaje: string;
    url: string;
}): string {
    return `
      <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 24px;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #22c55e; margin-bottom: 16px;">${titulo}</h2>
          <p style="color: #333333; font-size: 16px; line-height: 1.5;">
            ${mensaje}
          </p>
          <div style="text-align: center; margin-top: 32px;">
          <p style="color: #333333; font-size: 16px; line-height: 1.5;">
            Haz click en el link a continuación para ver las invitaciones que has recibido:
          </p>
            <a href="${url}" target="_blank" 
               style="background-color: #22c55e; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold;">
              Ver invitaciones de partido
            </a>
          </div>
          <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">
            Este es un mensaje automático de CanchApp. Por favor no respondas este correo.
          </p>
        </div>
      </div>
    `;
}
