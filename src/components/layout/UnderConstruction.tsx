import React from 'react';
import { HardHat } from 'lucide-react';

export default function UnderConstruction({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-blue-50 text-[#4F7CF3] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <HardHat size={48} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500 max-w-md mx-auto">
                We are actively building this feature. Check back soon for updates to the MACENZA platform.
            </p>
        </div>
    );
}