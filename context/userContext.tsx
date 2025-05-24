"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
    id: number;
    nombre: string;
    tipo: "jugador" | "admin";
};

type UserContextType = {
    user: User | null;
    isLoading: boolean;
    login: (user: User) => void;
    logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("user");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed?.id && parsed?.nombre && parsed?.tipo) {
                    setUser(parsed);
                }
            } catch (err) {
                console.error("Error al leer localStorage", err);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <UserContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
}
