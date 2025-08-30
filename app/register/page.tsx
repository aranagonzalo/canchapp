"use client";

import { useMemo, useState } from "react";
import { CalendarIcon } from "lucide-react";
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
import { format, getMonth, getYear, setMonth } from "date-fns";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { es } from "date-fns/locale";
import Image from "next/image";
import { useUser } from "@/context/userContext";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useNotifications } from "@/hooks";
import HourSelect from "../admin/complex/HourSelect";

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
    | "adminPassword2";

const diasSemana = [
    { nombre: "Lunes", index: 1 },
    { nombre: "Martes", index: 2 },
    { nombre: "Miércoles", index: 3 },
    { nombre: "Jueves", index: 4 },
    { nombre: "Viernes", index: 5 },
    { nombre: "Sábado", index: 6 },
    { nombre: "Domingo", index: 0 },
];

const customLabels: Partial<Record<AdminField, string>> = {
    adminEmail: "Correo electrónico",
    adminEmail2: "Repetir correo electrónico",
    adminPassword: "Contraseña",
    adminPassword2: "Repetir contraseña",
};

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
};

export default function RegisterPage() {
    const [jugador, setJugador] = useState<JugadorState>(initialJugadorData);
    const [admin, setAdmin] = useState<AdminFormState>(initialAdminData);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [horarios, setHorarios] = useState<
        { dia: number; apertura: string; cierre: string; activo: boolean }[]
    >([
        { dia: 1, apertura: "08:00", cierre: "22:00", activo: true },
        { dia: 2, apertura: "08:00", cierre: "22:00", activo: true },
        { dia: 3, apertura: "08:00", cierre: "22:00", activo: true },
        { dia: 4, apertura: "08:00", cierre: "22:00", activo: true },
        { dia: 5, apertura: "08:00", cierre: "22:00", activo: true },
        { dia: 6, apertura: "09:00", cierre: "20:00", activo: false },
        { dia: 0, apertura: "09:00", cierre: "20:00", activo: false },
    ]);
    const [open, setOpen] = useState(false);

    const startYear = useMemo(() => getYear(new Date()) - 100, []);
    const endYear = useMemo(() => getYear(new Date()), []);

    const [date, setDate] = useState<Date>(new Date());
    const months = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ];

    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) =>
        String(startYear + i)
    );

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
            const response = await fetch(
                `api/auth/${
                    type === "jugador" ? "register" : "register-admin"
                }`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(
                        type === "jugador"
                            ? {
                                  ...jugador,
                                  mail: jugador.email,
                                  contrasena: jugador.password,
                                  tipo: "jugador",
                              }
                            : {
                                  complejo: {
                                      nombreComplejo: admin.complejo,
                                      cuit: admin.cuit,
                                      ciudad: admin.ciudad,
                                      direccion: `${admin.calle} ${admin.altura}`,
                                      telefonoComplejo: admin.telefono,
                                      horarios: horarios.filter(
                                          (h) => h.activo
                                      ),
                                  },
                                  administrador: {
                                      nombre: admin.adminNombre,
                                      apellido: admin.adminApellido,
                                      mail: admin.adminEmail,
                                      contrasena: admin.adminPassword,
                                  },
                              }
                    ),
                }
            );

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
            if (type === "jugador") {
                router.push("/home");
            } else {
                router.push("/admin/home");
            }

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
                  });
        } catch (error) {
            console.error("Error de red:", error);
            toast.error("No se pudo conectar al servidor.");
            setLoading(false);
        }

        setLoading(false);
    };

    const handleMonthChange = (month: string) => {
        console.log(month);
        if (!date) return;
        const newDate = setMonth(date, months.indexOf(month));
        setDate(newDate);
    };

    const handleYearChange = (year: string) => {
        if (!date) return;
        const newDate = new Date(date);
        newDate.setFullYear(Number(year));
        setDate(newDate);
    };

    return (
        <>
            <Toaster richColors position="top-right" />

            <div
                className="relative min-h-screen bg-cover bg-center flex items-center justify-center sm:px-4"
                style={{
                    backgroundImage: "url('/images/banners/banner5.jpg')",
                }}
            >
                <div className="absolute inset-0 bg-black opacity-60 z-10" />
                <div className="relative z-20 w-full max-w-2xl bg-[#0b1120]/90 p-6 sm:p-10 rounded-xl shadow-xl max-h-[95dvh] overflow-y-auto">
                    <a
                        href="/"
                        className="flex items-center justify-center gap-2 text-xl font-bold mb-6 text-white"
                    >
                        <div className="bg-gradient-to-br from-green-400 to-green-700 p-1.5 rounded-md">
                            <Image
                                src="/logo-canchapp.png"
                                alt="Logo Canchapp"
                                width={100}
                                height={100}
                                className="w-6 h-6"
                            />
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

                        <TabsContent
                            value="jugador"
                            className="max-h-[414px] overflow-y-auto"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mr-6">
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
                                                    className="flex flex-col mr-6"
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
                                                    className="flex flex-col mr-6"
                                                >
                                                    <Label className="text-white mb-1.5">
                                                        {labelMap[field]}
                                                    </Label>
                                                    <Popover
                                                        open={open}
                                                        onOpenChange={setOpen}
                                                    >
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
                                                                              date
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
                                                            <div className="flex justify-between px-3 pt-3">
                                                                <Select
                                                                    onValueChange={
                                                                        handleMonthChange
                                                                    }
                                                                    value={
                                                                        months[
                                                                            getMonth(
                                                                                date
                                                                            )
                                                                        ]
                                                                    }
                                                                >
                                                                    <SelectTrigger className="w-[110px] border-slate-700">
                                                                        <SelectValue placeholder="Mes" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {months.map(
                                                                            (
                                                                                month
                                                                            ) => (
                                                                                <SelectItem
                                                                                    value={
                                                                                        month
                                                                                    }
                                                                                    key={
                                                                                        month
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        month
                                                                                    }
                                                                                </SelectItem>
                                                                            )
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                                <Select
                                                                    onValueChange={(
                                                                        value
                                                                    ) =>
                                                                        handleYearChange(
                                                                            value
                                                                        )
                                                                    }
                                                                    value={years.find(
                                                                        (y) =>
                                                                            y ===
                                                                            getYear(
                                                                                date
                                                                            ).toString()
                                                                    )}
                                                                >
                                                                    <SelectTrigger className="text-white w-[110px] border-slate-700">
                                                                        <SelectValue placeholder="Año" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {years.map(
                                                                            (
                                                                                year
                                                                            ) => (
                                                                                <SelectItem
                                                                                    value={year.toString()}
                                                                                    key={
                                                                                        year
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        year
                                                                                    }
                                                                                </SelectItem>
                                                                            )
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <DatePicker
                                                                mode="single"
                                                                month={date}
                                                                selected={date}
                                                                onSelect={(
                                                                    selected
                                                                ) => {
                                                                    if (
                                                                        selected
                                                                    ) {
                                                                        setDate(
                                                                            selected
                                                                        );
                                                                        setJugador(
                                                                            (
                                                                                prev
                                                                            ) => ({
                                                                                ...prev,
                                                                                fecha_nac:
                                                                                    selected
                                                                                        ? format(
                                                                                              selected,
                                                                                              "yyyy-MM-dd"
                                                                                          )
                                                                                        : "",
                                                                            })
                                                                        );
                                                                        setOpen(
                                                                            false
                                                                        );
                                                                    }
                                                                }}
                                                                locale={es}
                                                                showOutsideDays
                                                                className="bg-[#0b1120] text-white"
                                                                defaultMonth={
                                                                    date
                                                                }
                                                                disableNavigation={
                                                                    false
                                                                }
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
                                                className="flex flex-col mr-6"
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
                                    "cursor-pointer mt-6 w-[calc(100%-24px)] py-2 text-white rounded-md font-medium transition flex justify-center items-center gap-2",
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
                                Datos del Predio
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mr-6">
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
                                        complejo: "Predio Deportivo Sur",
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

                            <h3 className="text-white text-lg font-semibold mt-6 mb-2">
                                Horarios de Atención
                            </h3>
                            <div className="grid gap-2">
                                {horarios.map((h, idx) => (
                                    <div
                                        key={h.dia ?? idx}
                                        className="flex items-center gap-4"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={h.activo}
                                            onChange={() =>
                                                setHorarios((prev) =>
                                                    prev.map((prevH, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...prevH,
                                                                  activo: !prevH.activo,
                                                              }
                                                            : prevH
                                                    )
                                                )
                                            }
                                            className="scale-125 accent-emerald-500"
                                        />
                                        <span className="w-20 text-white">
                                            {
                                                [
                                                    "Dom",
                                                    "Lun",
                                                    "Mar",
                                                    "Mié",
                                                    "Jue",
                                                    "Vie",
                                                    "Sáb",
                                                ][h.dia]
                                            }
                                        </span>
                                        <HourSelect
                                            value={h.apertura ?? ""}
                                            disabled={!h.activo}
                                            onChange={(val) =>
                                                setHorarios((prev) =>
                                                    prev.map((prevH, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...prevH,
                                                                  apertura: val,
                                                              }
                                                            : prevH
                                                    )
                                                )
                                            }
                                        />
                                        <span className="text-white">a</span>
                                        <HourSelect
                                            value={h.cierre ?? ""}
                                            disabled={!h.activo}
                                            onChange={(val) =>
                                                setHorarios((prev) =>
                                                    prev.map((prevH, i) =>
                                                        i === idx
                                                            ? {
                                                                  ...prevH,
                                                                  cierre: val,
                                                              }
                                                            : prevH
                                                    )
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>

                            <h3 className="text-white text-lg font-semibold mt-8 mb-2">
                                Datos del Administrador
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-6">
                                {(
                                    [
                                        "adminNombre",
                                        "adminApellido",
                                        "adminEmail",
                                        "adminEmail2",
                                        "adminPassword",
                                        "adminPassword2",
                                    ] as AdminField[]
                                ).map((field) => {
                                    const label =
                                        customLabels[field] ||
                                        field
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
                                    "cursor-pointer mt-6 w-[calc(100%-24px)] py-2 text-white rounded-md font-medium transition flex justify-center items-center gap-2",
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
