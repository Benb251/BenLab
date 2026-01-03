import React, { useRef, memo, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import { cn } from '../../lib/utils';
import { GenerationResult } from '../../types/generation';
import { AI_MODELS } from '../../constants';
import { Maximize2 } from 'lucide-react';

interface ImageResultGridProps {
  images: GenerationResult[];
  onSelect: (image: GenerationResult) => void;
}

const getAspectClass = (ratio: string) => {
  switch (ratio) {
    case '1:1': return 'aspect-square';
    case '16:9': return 'aspect-video';
    case '9:16': return 'aspect-[9/16]';
    case '4:3': return 'aspect-[4/3]';
    case '3:4': return 'aspect-[3/4]';
    case '3:2': return 'aspect-[3/2]';
    case '2:3': return 'aspect-[2/3]';
    case '21:9': return 'aspect-[21/9]';
    default: return 'aspect-square';
  }
};

interface TiltCardProps {
  image: GenerationResult;
  onSelect: () => void;
}

const TiltCard: React.FC<TiltCardProps> = memo(({
  image,
  onSelect
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Mouse position tracking for 3D Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const xPct = (e.clientX - rect.left) / width - 0.5;
    const yPct = (e.clientY - rect.top) / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  }, [x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  // Subtle 3D Transform
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-5, 5]);

  // Memoize the model name lookup
  const modelName = useMemo(() =>
    AI_MODELS.find(m => m.id === image.modelId)?.name || "UNKNOWN_CORE",
    [image.modelId]
  );
  const isAuto = image.aspectRatio === 'auto';

  return (
    <motion.div
      ref={ref}
      onClick={onSelect}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5, z: 20 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative group cursor-pointer perspective-1000 w-full",
        !isAuto && getAspectClass(image.aspectRatio)
      )}
    >
      <div className={cn(
        "relative w-full bg-zinc-900 rounded-sm overflow-hidden transition-all duration-300 ease-out",
        // Industrial Border
        "border border-zinc-800 group-hover:border-orange-500/50",
        // Glow
        "shadow-[0_0_0_1px_rgba(0,0,0,0)] group-hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]",
        !isAuto && "h-full"
      )}>
        {/* Image Layer with LayoutId - CRITICAL for Shared Transition */}
        <div className={cn("w-full bg-zinc-950 overflow-hidden", !isAuto && "h-full")}>
          <motion.img
            layoutId={`image-${image.id}`}
            src={image.url}
            alt={`Gen ${image.id}`}
            className={cn(
              "w-full transition-transform duration-500",
              isAuto ? "h-auto object-contain" : "h-full object-cover"
            )}
          />
        </div>

        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* HUD Overlay */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 pointer-events-none">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-['Oswald'] text-sm text-white uppercase tracking-wider shadow-black drop-shadow-md">{modelName}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-orange-500 uppercase px-1 border border-orange-500/30 bg-orange-500/10 rounded-[1px]">
                  {image.aspectRatio}
                </span>
                <span className="text-[9px] font-mono text-zinc-500">
                  ID: {image.id.slice(-4)}
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Technical Corner Accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-white/20 group-hover:border-orange-500 transition-colors duration-300" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-white/20 group-hover:border-orange-500 transition-colors duration-300" />
      </div>
    </motion.div>
  );
});

TiltCard.displayName = 'TiltCard';

// Memoized container variants - defined outside component to prevent recreation
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

// Memoized TiltCard wrapper to ensure stable onSelect callback per image
const MemoizedTiltCardWrapper: React.FC<{
  img: GenerationResult;
  onSelect: (image: GenerationResult) => void;
  isSingle: boolean;
}> = memo(({ img, onSelect, isSingle }) => {
  const handleSelect = useCallback(() => {
    onSelect(img);
  }, [onSelect, img]);

  return (
    <div className={cn(
      "relative transition-all duration-500",
      isSingle ? "w-full max-w-[500px]" : "w-full"
    )}>
      <TiltCard
        image={img}
        onSelect={handleSelect}
      />
    </div>
  );
});

MemoizedTiltCardWrapper.displayName = 'MemoizedTiltCardWrapper';

const ImageResultGrid: React.FC<ImageResultGridProps> = memo(({ images, onSelect }) => {
  const isSingle = images.length === 1;

  // Memoize grid class computation
  const gridClassName = useMemo(() => cn(
    "w-full mx-auto pb-32",
    isSingle
      ? "flex items-start justify-center"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min"
  ), [isSingle]);

  return (
    <div className="w-full h-full flex flex-col p-6 md:p-12 overflow-y-auto custom-scrollbar">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4 flex-shrink-0">
        <div className="flex flex-col">
          <h3 className="font-['Oswald'] text-xl text-zinc-200 uppercase tracking-widest flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Output_Log
          </h3>
          <span className="text-[10px] font-mono text-zinc-500 mt-1 uppercase tracking-wider">
            {images.length} Units Generated // Decrypted
          </span>
        </div>
        <div className="hidden md:block text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
          Render_Queue: Idle
        </div>
      </div>

      {/* Grid Container */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className={gridClassName}
      >
        {images.map((img) => (
          <MemoizedTiltCardWrapper
            key={img.id}
            img={img}
            onSelect={onSelect}
            isSingle={isSingle}
          />
        ))}
      </motion.div>
    </div>
  );
});

ImageResultGrid.displayName = 'ImageResultGrid';

export default ImageResultGrid;