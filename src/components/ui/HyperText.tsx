import React, { useEffect, useState, useRef } from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HyperTextProps {
    text: string;
    className?: string;
    duration?: number;
    delay?: number;
    as?: React.ElementType;
    startOnView?: boolean;
    animateOnHover?: boolean;
    characterSet?: string;
}

const DEFAULT_CHARACTER_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

const HyperText: React.FC<HyperTextProps> = ({
    text,
    className,
    duration = 800,
    delay = 0,
    as: Component = 'span',
    startOnView = true,
    animateOnHover = false,
    characterSet = DEFAULT_CHARACTER_SET,
}) => {
    const MotionComponent = React.useMemo(() => motion(Component), [Component]);
    const [displayText, setDisplayText] = useState(text.split('').map(() => characterSet[Math.floor(Math.random() * characterSet.length)]));
    const [isAnimating, setIsAnimating] = useState(false);
    const iterations = useRef(0);

    const triggerAnimation = () => {
        iterations.current = 0;
        setIsAnimating(true);
    };

    useEffect(() => {
        if (!startOnView && !animateOnHover) {
            triggerAnimation();
        }
    }, [startOnView, animateOnHover]);

    useEffect(() => {
        if (!isAnimating) return;

        const intervalTime = duration / (text.length * 10); // Dynamic speed based on length
        const maxIterations = text.length + 10;

        const interval = setInterval(() => {
            if (!isAnimating) return;

            if (iterations.current >= maxIterations) {
                setDisplayText(text.split(''));
                setIsAnimating(false);
                clearInterval(interval);
            } else {
                setDisplayText(
                    text.split('').map((char, i) => {
                        if (char === ' ') return ' ';
                        if (i < iterations.current) {
                            return text[i];
                        }
                        return characterSet[Math.floor(Math.random() * characterSet.length)];
                    })
                );
                iterations.current += 1 / 3; // Slower resolve speed
            }
        }, intervalTime > 30 ? 30 : intervalTime); // Cap speed

        return () => clearInterval(interval);
    }, [text, duration, isAnimating, characterSet]);

    return (
        <MotionComponent
            className={cn("overflow-hidden flex", className)}
            onMouseEnter={animateOnHover ? triggerAnimation : undefined}
            whileInView={startOnView && !isAnimating ? triggerAnimation : undefined}
            viewport={{ once: true }}
        >
            {displayText.map((char, i) => (
                <motion.span key={i} className="inline-block" layout>
                    {char}
                </motion.span>
            ))}
        </MotionComponent>
    );
};

export default HyperText;
