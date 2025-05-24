"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUser } from "@/context/userContext";

const publicRoutes = ["/", "/login", "/register", "/reset-password"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useUser();
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user && !publicRoutes.includes(pathname)) {
            router.replace("/login");
        }
    }, [user, isLoading, pathname, router]);

    if (isLoading) {
        return null; // O un loader si prefieres
    }

    return <>{children}</>;
}
