"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthRoute = pathname === "/login" || pathname === "/register";

    return (
        <>
            {!isAuthRoute && <Navbar />}
            {children}
            {!isAuthRoute && <Footer />}
        </>
    );
}
