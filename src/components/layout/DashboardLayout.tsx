"use client";

import React, { useState } from 'react'
import Sidebar from "./Sidebar"
import Header from "./Header"
import type { Theme } from "@/types"

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [theme, setTheme] = useState<Theme>("light");
    const isDark = theme === "dark";

    return (
        <div
            className={`
        flex min-h-screen transition-colors duration-300
        ${isDark ? "bg-gray-950" : "bg-slate-100"}
        `}
        >
            {/* ── Sidebar ── */}
            <Sidebar theme={theme} onThemeChange={setTheme} />

            {/* ── Main Panel ── */}
            <div className="flex flex-col flex-1 min-w-0">
                <Header theme={theme} />

                <main
                    className={`
            flex-1 p-6 overflow-auto transition-colors duration-300
            ${isDark ? "bg-gray-950 text-gray-100" : "bg-slate-100 text-gray-800"}
            `}
                >
                    {children}
                </main>
            </div>
        </div>
    )
}

export default DashboardLayout