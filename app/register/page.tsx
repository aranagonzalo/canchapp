"use client";

import { useState } from "react";
import { Calendar, CalendarIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast, Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar as DatePicker } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";

// Tipado

type AdminField =
    | "complejo"
    | "cuit"
    | "provincia"
    | "ciudad"
    | "calle"
    | "altura"
    | "telefono"
    | "adminNombre"
    | "adminApellido"
    | "adminEmail"
    | "adminEmail2"
    | "adminPassword"
    | "adminPassword2"
    | "adminCelular";

type AdminFormState = Record<AdminField, string>;

type JugadorState = {
    nombre: string;
    apellido: string;
    email: string;
    email2: string;
    password: string;
    password2: string;
    telefono: string;
    fecha_nac: string;
    genero: string;
};

const initialJugadorData: JugadorState = {
    nombre: "",
    apellido: "",
    email: "",
    email2: "",
    password: "",
    password2: "",
    telefono: "",
    fecha_nac: "",
    genero: "",
};

const initialAdminData: AdminFormState = {
    complejo: "",
    cuit: "",
    provincia: "",
    ciudad: "",
    calle: "",
    altura: "",
    telefono: "",
    adminNombre: "",
    adminApellido: "",
    adminEmail: "",
    adminEmail2: "",
    adminPassword: "",
    adminPassword2: "",
    adminCelular: "",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function RegisterPage() {
    const [jugador, setJugador] = useState<JugadorState>(initialJugadorData);
    const [admin, setAdmin] = useState<AdminFormState>(initialAdminData);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const { login } = useUser();

    const validate = (data: Record<string, string>) => {
        const newErrors: Record<string, boolean> = {};
        Object.entries(data).forEach(([key, value]) => {
            if (!value.trim()) newErrors[key] = true;
        });
        return newErrors;
    };

    const handleSubmit = async (type: "jugador" | "admin") => {
        const data = type === "jugador" ? jugador : admin;
        const newErrors = validate(data);
        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast.error("Por favor completa todos los campos obligatorios.");
            return;
        }

        setLoading(true);

        try {
            // Paso 1: Registro
            const response = await fetch(`api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...data,
                    mail: type === "jugador" ? jugador.email : admin.adminEmail,
                    contrasena:
                        type === "jugador"
                            ? jugador.password
                            : admin.adminPassword,
                    tipo: type, // requerido para el backend
                }),
            });

            const resData = await response.json();

            if (!response.ok) {
                toast.error(resData.message || "Error al registrar.");
                setLoading(false);
                return;
            }

            toast.success("Registro exitoso!");

            // Paso 2: Login automático
            const loginResponse = await fetch(`api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mail: type === "jugador" ? jugador.email : admin.adminEmail,
                    pass:
                        type === "jugador"
                            ? jugador.password
                            : admin.adminPassword,
                }),
            });

            const loginData = await loginResponse.json();

            if (!loginResponse.ok) {
                toast.error(
                    loginData.message ||
                        "Error al iniciar sesión automáticamente"
                );
                setLoading(false);
                return null;
            }

            toast.success("Inicio de sesión exitoso");
            login(loginData); // guarda en contexto
            router.push("/home");

            type === "jugador"
                ? setJugador({
                      nombre: "",
                      apellido: "",
                      email: "",
                      email2: "",
                      password: "",
                      password2: "",
                      telefono: "",
                      fecha_nac: "",
                      genero: "",
                  })
                : setAdmin({
                      complejo: "",
                      cuit: "",
                      provincia: "",
                      ciudad: "",
                      calle: "",
                      altura: "",
                      telefono: "",
                      adminNombre: "",
                      adminApellido: "",
                      adminEmail: "",
                      adminEmail2: "",
                      adminPassword: "",
                      adminPassword2: "",
                      adminCelular: "",
                  });
        } catch (error) {
            console.error("Error de red:", error);
            toast.error("No se pudo conectar al servidor.");
            setLoading(false);
        }

        setLoading(false);
    };

    return (
        <>
            <Toaster richColors position="top-right" />

            <div
                className="relative min-h-screen bg-cover bg-center flex items-center justify-center px-4"
                style={{
                    backgroundImage: "url('/images/banners/banner5.jpg')",
                }}
            >
                <div className="absolute inset-0 bg-black opacity-60 z-10" />
                <div className="relative z-20 w-full max-w-2xl bg-[#0b1120]/90 p-6 sm:p-10 rounded-xl shadow-xl max-h-[90vh]">
                    <a
                        href="/"
                        className="flex items-center justify-center gap-2 text-xl font-bold mb-6 text-white"
                    >
                        <div className="bg-gradient-to-br from-green-400 to-green-700 p-1.5 rounded-md">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-white">CanchApp</span>
                    </a>

                    <Tabs defaultValue="jugador" className="w-full h-full">
                        <TabsList className="flex justify-center mb-6 bg-[#014b35] text-white border border-green-900 w-full shadow">
                            <TabsTrigger
                                value="jugador"
                                className="data-[state=active]:bg-custom-dark-green text-white cursor-pointer"
                            >
                                Jugador
                            </TabsTrigger>
                            <TabsTrigger
                                value="admin"
                                className="data-[state=active]:bg-custom-dark-green text-white cursor-pointer"
                            >
                                Administrador
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="jugador">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                {Object.entries(jugador).map(
                                    ([field, value]) => {
                                        const labelMap: Record<string, string> =
                                            {
                                                nombre: "Nombre",
                                                apellido: "Apellido",
                                                email: "Correo electrónico",
                                                email2: "Repetir correo electrónico",
                                                password: "Contraseña",
                                                password2: "Repetir contraseña",
                                                telefono: "Celular",
                                                fecha_nac:
                                                    "Fecha de nacimiento",
                                                genero: "Género",
                                            };

                                        const placeholderMap: Record<
                                            string,
                                            string
                                        > = {
                                            nombre: "Juan",
                                            apellido: "Pérez",
                                            email: "juan@mail.com",
                                            email2: "juan@mail.com",
                                            password: "••••••••",
                                            password2: "••••••••",
                                            telefono: "+54 911 1234 5678",
                                            fecha_nac: "",
                                            genero: "",
                                        };

                                        if (field === "genero") {
                                            return (
                                                <div
                                                    key={field}
                                                    className="flex flex-col"
                                                >
                                                    <Label className="text-white mb-1.5">
                                                        {labelMap[field]}
                                                    </Label>
                                                    <Select
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setJugador(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    genero: value,
                                                                })
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger className="input">
                                                            <SelectValue placeholder="Seleccionar género" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Hombre">
                                                                Hombre
                                                            </SelectItem>
                                                            <SelectItem value="Mujer">
                                                                Mujer
                                                            </SelectItem>
                                                            <SelectItem value="Otro">
                                                                Otro
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    {errors[field] && (
                                                        <span className="text-red-400 text-xs mt-1">
                                                            Este campo es
                                                            obligatorio
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        }

                                        if (field === "fecha_nac") {
                                            const selectedDate = value
                                                ? new Date(value)
                                                : undefined;

                                            return (
                                                <div
                                                    key={field}
                                                    className="flex flex-col"
                                                >
                                                    <Label className="text-white mb-1.5">
                                                        {labelMap[field]}
                                                    </Label>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                className={cn(
                                                                    "input flex justify-between items-center text-left font-normal",
                                                                    !value &&
                                                                        "text-muted-foreground",
                                                                    errors[
                                                                        field
                                                                    ] &&
                                                                        "border-red-500"
                                                                )}
                                                            >
                                                                {value
                                                                    ? format(
                                                                          new Date(
                                                                              value
                                                                          ),
                                                                          "dd/MM/yyyy",
                                                                          {
                                                                              locale: es,
                                                                          }
                                                                      )
                                                                    : "Seleccionar fecha"}
                                                                <CalendarIcon className="ml-2 h-4 w-4 text-white" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 bg-[#0b1120] text-white border border-slate-700 overflow-hidden">
                                                            <DatePicker
                                                                mode="single"
                                                                selected={
                                                                    selectedDate
                                                                        ? new Date(
                                                                              selectedDate +
                                                                                  "T00:00:00"
                                                                          )
                                                                        : undefined
                                                                }
                                                                onSelect={(
                                                                    date
                                                                ) =>
                                                                    setJugador(
                                                                        (
                                                                            prev
                                                                        ) => ({
                                                                            ...prev,
                                                                            fecha_nac:
                                                                                date
                                                                                    ? date
                                                                                          .toISOString()
                                                                                          .split(
                                                                                              "T"
                                                                                          )[0]
                                                                                    : "",
                                                                        })
                                                                    )
                                                                }
                                                                locale={es}
                                                                showOutsideDays
                                                                className="bg-[#0b1120] text-white"
                                                            />
                                                        </PopoverContent>
                                                    </Popover>
                                                    {errors[field] && (
                                                        <span className="text-red-400 text-xs mt-1">
                                                            Este campo es
                                                            obligatorio
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div
                                                key={field}
                                                className="flex flex-col"
                                            >
                                                <Label className="text-white mb-1.5">
                                                    {labelMap[field]}
                                                </Label>
                                                <Input
                                                    type={
                                                        field.includes(
                                                            "password"
                                                        )
                                                            ? "password"
                                                            : "text"
                                                    }
                                                    placeholder={
                                                        placeholderMap[field]
                                                    }
                                                    value={value}
                                                    onChange={(e) =>
                                                        setJugador((prev) => ({
                                                            ...prev,
                                                            [field]:
                                                                e.target.value,
                                                        }))
                                                    }
                                                    className={`input ${
                                                        errors[field]
                                                            ? "border-red-500"
                                                            : ""
                                                    }`}
                                                />
                                                {errors[field] && (
                                                    <span className="text-red-400 text-xs mt-1">
                                                        Este campo es
                                                        obligatorio
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                            <button
                                disabled={loading}
                                type="button"
                                onClick={() => handleSubmit("jugador")}
                                className={cn(
                                    "cursor-pointer mt-6 w-full py-2 text-white rounded-md font-medium transition flex justify-center items-center gap-2",
                                    "bg-gradient-to-r from-custom-green to-custom-dark-green h-10",
                                    loading
                                        ? "opacity-70 cursor-not-allowed"
                                        : "hover:opacity-90"
                                )}
                            >
                                {loading ? (
                                    <LoadingSpinner />
                                ) : (
                                    "Finalizar registro"
                                )}
                            </button>
                        </TabsContent>

                        <TabsContent
                            value="admin"
                            className="max-h-[414px] overflow-y-auto"
                        >
                            <h3 className="text-white text-lg font-semibold mb-2">
                                Datos del Complejo
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                {(
                                    [
                                        "complejo",
                                        "cuit",
                                        "provincia",
                                        "ciudad",
                                        "calle",
                                        "altura",
                                        "telefono",
                                    ] as AdminField[]
                                ).map((field) => {
                                    const label =
                                        field.charAt(0).toUpperCase() +
                                        field
                                            .slice(1)
                                            .replace(/([A-Z])/g, " $1");
                                    const placeholders: Record<
                                        AdminField,
                                        string
                                    > = {
                                        complejo: "Complejo Deportivo Sur",
                                        cuit: "20-12345678-9",
                                        provincia: "Buenos Aires",
                                        ciudad: "La Plata",
                                        calle: "Calle 13",
                                        altura: "1234",
                                        telefono: "+54 911 2345 6789",
                                        adminNombre: "",
                                        adminApellido: "",
                                        adminEmail: "",
                                        adminEmail2: "",
                                        adminPassword: "",
                                        adminPassword2: "",
                                        adminCelular: "",
                                    };
                                    return (
                                        <div
                                            key={field}
                                            className="flex flex-col"
                                        >
                                            <Label className="text-white mb-1.5">
                                                {label}
                                            </Label>
                                            <Input
                                                placeholder={
                                                    placeholders[field]
                                                }
                                                value={admin[field]}
                                                onChange={(e) =>
                                                    setAdmin((prev) => ({
                                                        ...prev,
                                                        [field]: e.target.value,
                                                    }))
                                                }
                                                className={`input ${
                                                    errors[field]
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                            {errors[field] && (
                                                <span className="text-red-400 text-xs mt-1">
                                                    Este campo es obligatorio
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <h3 className="text-white text-lg font-semibold mb-2">
                                Datos del Administrador
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(
                                    [
                                        "adminNombre",
                                        "adminApellido",
                                        "adminEmail",
                                        "adminEmail2",
                                        "adminPassword",
                                        "adminPassword2",
                                        "adminCelular",
                                    ] as AdminField[]
                                ).map((field) => {
                                    const label = field
                                        .replace("admin", "")
                                        .replace(/([A-Z])/g, " $1")
                                        .trim();
                                    const placeholders: Record<
                                        AdminField,
                                        string
                                    > = {
                                        complejo: "",
                                        cuit: "",
                                        provincia: "",
                                        ciudad: "",
                                        calle: "",
                                        altura: "",
                                        telefono: "",
                                        adminNombre: "Laura",
                                        adminApellido: "Gómez",
                                        adminEmail: "laura@mail.com",
                                        adminEmail2: "laura@mail.com",
                                        adminPassword: "••••••••",
                                        adminPassword2: "••••••••",
                                        adminCelular: "+54 911 9999 8888",
                                    };
                                    return (
                                        <div
                                            key={field}
                                            className="flex flex-col"
                                        >
                                            <Label className="text-white mb-1.5">
                                                {label}
                                            </Label>
                                            <Input
                                                type={
                                                    field.includes("Password")
                                                        ? "password"
                                                        : "text"
                                                }
                                                placeholder={
                                                    placeholders[field]
                                                }
                                                value={admin[field]}
                                                onChange={(e) =>
                                                    setAdmin((prev) => ({
                                                        ...prev,
                                                        [field]: e.target.value,
                                                    }))
                                                }
                                                className={`input ${
                                                    errors[field]
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                            {errors[field] && (
                                                <span className="text-red-400 text-xs mt-1">
                                                    Este campo es obligatorio
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <button
                                disabled={loading}
                                type="button"
                                onClick={() => handleSubmit("admin")}
                                className={cn(
                                    "cursor-pointer mt-6 w-full py-2 text-white rounded-md font-medium transition flex justify-center items-center gap-2",
                                    "bg-gradient-to-r from-custom-green to-custom-dark-green h-10",
                                    loading
                                        ? "opacity-70 cursor-not-allowed"
                                        : "hover:opacity-90"
                                )}
                            >
                                {loading ? (
                                    <LoadingSpinner />
                                ) : (
                                    "Finalizar registro"
                                )}
                            </button>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}
