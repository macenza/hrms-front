"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/data";
import type { Theme } from "@/types";
import {
    LayoutGrid,
    Users,
    CalendarDays,
    UserX,
    Layers,
    FileText,
    CreditCard,
    Box,
    Bell,
    Settings,
    ChevronDown,
    Sun,
    Moon,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
    grid: LayoutGrid,
    users: Users,
    calendar: CalendarDays,
    "user-x": UserX,
    layers: Layers,
    "file-text": FileText,
    "credit-card": CreditCard,
    bell: Bell,
    settings: Settings,
};

interface SidebarProps {
    theme: Theme;
    onThemeChange: (t: Theme) => void;
}

const Sidebar = ({ theme, onThemeChange }: SidebarProps) => {
    const pathname = usePathname();
    const [expanded, setExpanded] = useState<string[]>([]);

    const toggleExpand = (label: string) =>
        setExpanded((prev) =>
            prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
        );

    const isDark = theme === "dark";

    return (
        <aside
            className={`
        flex flex-col w-[220px] min-h-screen shrink-0 px-4 py-6
        transition-colors duration-300
        ${isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-700"}
        shadow-sm
      `}
        > </aside>
    )
}

export default Sidebar