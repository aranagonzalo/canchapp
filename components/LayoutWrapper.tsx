"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    return (
        <QueryClientProvider client={queryClient}>
            {!isAuthRoute && <Navbar />}
            {children}
            {!isAuthRoute && <Footer />}
        </QueryClientProvider>
    );
}
