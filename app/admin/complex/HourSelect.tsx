// components/HourSelect.tsx
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface HourSelectProps {
    value: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}

export default function HourSelect({
    value,
    disabled = false,
    onChange,
}: HourSelectProps) {
    const horas = Array.from(
        { length: 24 },
        (_, i) => i.toString().padStart(2, "0") + ":00"
    );

    return (
        <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger
                className={`bg-slate-800 text-white border rounded px-2 py-1 disabled:opacity-40 w-[100px]`}
            >
                <SelectValue placeholder="--:--" />
            </SelectTrigger>
            <SelectContent>
                {horas.map((hora) => (
                    <SelectItem key={hora} value={hora}>
                        {hora}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
