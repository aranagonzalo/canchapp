interface Avatar {
    initials: string;
    name: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
}

const avatars: Avatar[] = [
    {
        initials: "MT",
        name: "Mariana Torres",
        bgColor: "bg-pink-200",
        borderColor: "border-pink-500",
        textColor: "text-pink-500",
    },
    {
        initials: "RL",
        name: "Ricardo Lozano",
        bgColor: "bg-yellow-200",
        borderColor: "border-yellow-500",
        textColor: "text-yellow-500",
    },
    {
        initials: "SV",
        name: "Sofía Valdez",
        bgColor: "bg-green-200",
        borderColor: "border-green-500",
        textColor: "text-green-500",
    },
    {
        initials: "DP",
        name: "Diego Paredes",
        bgColor: "bg-blue-200",
        borderColor: "border-blue-500",
        textColor: "text-blue-500",
    },
    {
        initials: "KN",
        name: "Karen Navarro",
        bgColor: "bg-purple-200",
        borderColor: "border-purple-500",
        textColor: "text-purple-500",
    },
];

export const AvatarStack = () => {
    return (
        <div className="flex items-center relative mb-2 h-10">
            {avatars.map((person, idx) => (
                <div
                    key={idx}
                    className={`absolute group w-9 h-9 rounded-full ${person.bgColor} ${person.textColor} flex items-center justify-center text-sm font-medium shadow cursor-default ${person.borderColor}`}
                    style={{
                        left: `${idx * 25}px`,
                        zIndex: 10 + idx,
                        borderWidth: "2px",
                    }}
                >
                    {person.initials}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/3 mb-1 hidden group-hover:block bg-[#030712] text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {person.name}
                    </div>
                </div>
            ))}
        </div>
    );
};
