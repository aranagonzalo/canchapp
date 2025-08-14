import { useUser } from "@/context/userContext";
import { useQuery } from "@tanstack/react-query";

async function fetchReservations(jugadorId: number) {
    const response = await fetch(`/api/reservations/captain?id=${jugadorId}`);
    if (!response.ok) {
        throw new Error("Error al obtener las reservas");
    }
    return response.json();
}

export function useReservations() {
    const { user } = useUser();
    const jugadorId = user?.id;

    return useQuery({
        queryKey: ["reservations", jugadorId],
        queryFn: () => fetchReservations(jugadorId!),
        enabled: !!jugadorId,
    });
}
