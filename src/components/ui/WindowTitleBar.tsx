import React, { useState, useEffect } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

// We'll import dynamically or use a check to prevent crashes in non-tauri envs
let appWindow: any = null;

const WindowTitleBar: React.FC = () => {
    const [isMaximized, setIsMaximized] = useState(false);
    const [isTauri, setIsTauri] = useState(false);

    useEffect(() => {
        // Safe check for Tauri environment
        const initTauri = async () => {
            try {
                // @ts-ignore
                if (window.__TAURI_INTERNALS__) {
                    const { getCurrentWindow } = await import('@tauri-apps/api/window');
                    appWindow = getCurrentWindow();
                    setIsTauri(true);

                    // Initial state
                    const maximized = await appWindow.isMaximized();
                    setIsMaximized(maximized);

                    // Listen for resize to update maximized state
                    const unlisten = await appWindow.onResized(async () => {
                        const m = await appWindow.isMaximized();
                        setIsMaximized(m);
                    });
                    return () => { unlisten(); };
                }
            } catch (e) {
                console.warn("Tauri API not available", e);
            }
        };
        initTauri();
    }, []);

    const handleMinimize = () => {
        if (appWindow) appWindow.minimize().catch((e: any) => console.error(e));
    };

    const handleMaximize = async () => {
        if (!appWindow) return;
        if (isMaximized) {
            await appWindow.unmaximize();
        } else {
            await appWindow.maximize();
        }
        setIsMaximized(!isMaximized);
    };

    const handleClose = () => {
        if (appWindow) appWindow.close().catch((e: any) => console.error(e));
    };

    return (
        <div className="relative w-full h-8 bg-zinc-950/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-[9999] select-none shrink-0 overflow-hidden">
            {/* Background Drag Region - Absolute to cover whole area but stay behind buttons */}
            <div
                data-tauri-drag-region
                className="absolute inset-0 z-0 cursor-default active:cursor-grabbing"
            />

            {/* Identity (Pointer events none so drag works through it) */}
            <div className="relative z-10 flex items-center gap-2 px-4 pointer-events-none">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="font-['Oswald'] text-[10px] tracking-[0.3em] text-white/40 uppercase font-bold">
                    BenLab_System_Link // V.2.0.1
                </span>
            </div>

            {/* Control Buttons (Higher Z-index to capture clicks) */}
            <div className="relative z-20 flex items-center h-full">
                <button
                    onClick={handleMinimize}
                    className="w-10 h-full flex items-center justify-center text-zinc-500 hover:bg-white/5 hover:text-white transition-all pointer-events-auto"
                    title="Minimize"
                >
                    <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                    onClick={handleMaximize}
                    className="w-10 h-full flex items-center justify-center text-zinc-500 hover:bg-white/5 hover:text-white transition-all pointer-events-auto"
                    title="Maximize"
                >
                    <Square className="w-2.5 h-2.5" />
                </button>
                <button
                    onClick={handleClose}
                    className="w-10 h-full flex items-center justify-center text-zinc-500 hover:bg-red-500 hover:text-white transition-all pointer-events-auto"
                    title="Close"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
};

export default WindowTitleBar;
