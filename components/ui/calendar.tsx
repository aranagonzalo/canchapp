"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn("p-3", className)}
            classNames={{
                months: "flex flex-col sm:flex-row gap-2",
                month: "flex flex-col gap-4",
                month_caption:
                    "flex justify-center items-center w-full px-2 capitalize",
                caption_label: "text-sm font-medium",
                caption_dropdowns: "flex gap-2 justify-center items-center",

                nav: "flex items-center gap-2",
                nav_button: cn(
                    buttonVariants({ variant: "outline" }),
                    "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
                ),
                button_previous: "",
                button_next: "",
                month_grid: "w-full border-collapse space-x-1",
                weekdays: "flex",
                weekday:
                    "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                week: "flex w-full mt-2",
                day: cn(
                    "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
                    props.mode === "range"
                        ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
                        : "[&:has([aria-selected])]:rounded-md"
                ),
                day_button: cn(
                    buttonVariants({ variant: "ghost" }),
                    "size-8 p-0 font-normal aria-selected:opacity-100"
                ),
                range_start:
                    "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
                range_end:
                    "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
                selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                today: "bg-accent text-accent-foreground",
                outside:
                    "day-outside text-muted-foreground aria-selected:text-muted-foreground",
                disabled: "text-muted-foreground opacity-50",
                range_middle:
                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                hidden: "invisible",
                ...classNames,
            }}
            components={{
                PreviousMonthButton: (props) => (
                    <button
                        {...props}
                        className="p-1 text-white absolute left-1 top-15"
                        aria-label="Mes anterior"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                ),
                NextMonthButton: (props) => (
                    <button
                        {...props}
                        className="p-1 text-white absolute right-1 top-15"
                        aria-label="Mes siguiente"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                ),
            }}
            {...props}
        />
    );
}

export { Calendar };
