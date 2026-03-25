"use client";

import React from "react";
import { Search, Bell, ChevronDown } from "lucide-react";
import type { Theme } from "@/types";

interface HeaderProps {
    theme: Theme;
}

const Header = ({ theme }: HeaderProps) => {
    const isDark = theme === "dark";
    return (
        <header
            className={`
        flex items-center justify-between px-8 py-4 border-b
        transition-colors duration-300
        ${isDark
                    ? "bg-gray-900 border-gray-800 text-gray-100"
                    : "bg-white border-gray-100 text-gray-800"
                }
        `}
        > </header>
    )
}

export default Header