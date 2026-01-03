import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    shimmerColor?: string;
    shimmerSize?: string;
    borderRadius?: string;
    shimmerDuration?: string;
    background?: string;
    className?: string;
    children?: React.ReactNode;
}

const ShimmerButton: React.FC<ShimmerButtonProps> = ({
    shimmerColor = '#ffffff',
    shimmerSize = '0.05em',
    shimmerDuration = '3s',
    borderRadius = '1px',
    background = 'radial-gradient(ellipse 80% 80% at 50% -20%,rgba(120,119,198,0.3),rgba(255,255,255,0))',
    className,
    children,
    ...props
}) => {
    return (
        <button
            className={cn(
                "group relative overflow-hidden whitespace-nowrap px-6 py-3 transition-all active:scale-95",
                "bg-zinc-950 text-zinc-200 border border-zinc-800 hover:border-zinc-600",
                className
            )}
            style={{
                borderRadius,
            }}
            {...props}
        >
            {/* Shimmer Overlay */}
            <div
                className="absolute inset-0 -z-10 bg-[image:var(--bg)]"
                style={{
                    '--bg': background,
                } as React.CSSProperties}
            />

            {/* Moving Shimmer */}
            <div
                className="absolute inset-0 z-0 h-full w-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            >
                <div className="absolute inset-[-100%] w-auto rotate-[20deg] animate-[shimmer_3s_infinite] bg-[linear-gradient(110deg,transparent,35%,var(--shimmer-color),40%,transparent)]"
                    style={{ '--shimmer-color': shimmerColor } as React.CSSProperties}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </div>

            {/* Glow Effect on Hover */}
            <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-orange-500/10 blur-xl" />

        </button>
    );
};

export default ShimmerButton;
