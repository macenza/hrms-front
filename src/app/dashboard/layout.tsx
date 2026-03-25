"use client";

import React, { useState } from 'react'
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import type { Theme } from "@/types"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const isDark = theme === "dark";
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar persists across all pages in this group */}
      <Sidebar theme={theme} onThemeChange={setTheme} />

      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header persists across all pages in this group */}
        <Header theme={theme} />

        {/* The specific page (dashboard, profile, etc.) renders here */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}