'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Move, Loader2, Crop } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'sonner';

interface CropPhotoModalProps {
    isOpen: boolean;
    imageSrc: string | null;
    onClose: () => void;
    onCropSave: (croppedFile: File) => Promise<void>;
}

export default function CropPhotoModal({
    isOpen,
    imageSrc,
    onClose,
    onCropSave
}: CropPhotoModalProps) {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isSaving, setIsSaving] = useState(false);
    const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

    const imgRef = useRef<HTMLImageElement>(null);

    // Reset crop state on open/imageSrc change
    useEffect(() => {
        if (isOpen) {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
            setIsDragging(false);
        }
    }, [isOpen, imageSrc]);

    if (!isOpen || !imageSrc) return null;

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = e.currentTarget;
        setNaturalSize({ width: naturalWidth, height: naturalHeight });
        
        // Smart zoom: scale image to fit viewport width/height beautifully
        const viewportSize = 256;
        const scaleX = viewportSize / naturalWidth;
        const scaleY = viewportSize / naturalHeight;
        const fitScale = Math.max(scaleX, scaleY);
        setZoom(fitScale);
    };

    // Desktop dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUpOrLeave = () => {
        setIsDragging(false);
    };

    // Mobile dragging
    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            const touch = e.touches[0];
            setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            setOffset({
                x: touch.clientX - dragStart.x,
                y: touch.clientY - dragStart.y
            });
        }
    };

    const handleCrop = () => {
        if (!imgRef.current) return;
        setIsSaving(true);

        const img = new Image();
        img.src = imageSrc;
        img.onload = async () => {
            try {
                const canvas = document.createElement('canvas');
                const uiBoxSize = 256;
                canvas.width = 300;
                canvas.height = 300;
                
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    toast.error("Could not initialize cropping context.");
                    setIsSaving(false);
                    return;
                }

                // Render high-fidelity background
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, 300, 300);

                // Math projection: scale coordinates from 256 viewport to 300 output resolution
                const outputScale = 300 / uiBoxSize;
                const drawWidth = naturalSize.width * zoom * outputScale;
                const drawHeight = naturalSize.height * zoom * outputScale;
                
                // Centered coordinates on the output canvas
                const cx = (300 - drawWidth) / 2 + (offset.x * outputScale);
                const cy = (300 - drawHeight) / 2 + (offset.y * outputScale);

                ctx.drawImage(img, cx, cy, drawWidth, drawHeight);

                canvas.toBlob(async (blob) => {
                    if (blob) {
                        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
                        try {
                            await onCropSave(file);
                            onClose();
                        } catch (err) {
                            // Handled by parent
                        }
                    }
                    setIsSaving(false);
                }, 'image/jpeg', 0.95);
            } catch (err) {
                console.error(err);
                toast.error("Cropping failed.");
                setIsSaving(false);
            }
        };
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-2">
                        <Crop className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Crop Profile Photo</h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Viewport */}
                <div className="p-6 flex flex-col items-center justify-center space-y-6">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 text-center uppercase tracking-wider">
                        Drag to reposition · Use slider to zoom
                    </p>

                    {/* Viewport Mask Box */}
                    <div 
                        className="w-64 h-64 rounded-full border-2 border-blue-500 shadow-lg overflow-hidden relative cursor-move bg-gray-950/80 select-none flex items-center justify-center"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUpOrLeave}
                        onMouseLeave={handleMouseUpOrLeave}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUpOrLeave}
                    >
                        {/* Drag Assist Overlay */}
                        <div className="absolute inset-0 bg-transparent flex items-center justify-center pointer-events-none z-10">
                            <Move size={24} className="text-white/30" />
                        </div>

                        {/* Interactive Image */}
                        <img 
                            ref={imgRef}
                            src={imageSrc}
                            alt="Crop preview"
                            onLoad={handleImageLoad}
                            style={{
                                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                transformOrigin: 'center center',
                                maxWidth: 'none',
                                transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                            }}
                            className="pointer-events-none"
                        />
                    </div>

                    {/* Zoom Sliders */}
                    <div className="w-full flex items-center gap-3 px-2">
                        <ZoomOut size={16} className="text-gray-400" />
                        <input 
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.01"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                        />
                        <ZoomIn size={16} className="text-gray-400" />
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800 shrink-0 bg-gray-50/50 dark:bg-gray-900/50">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleCrop}
                        disabled={isSaving}
                        className="gap-2 font-bold shadow-sm shadow-blue-500/25 dark:shadow-none"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : null}
                        Crop & Save
                    </Button>
                </div>

            </div>
        </div>
    );
}
