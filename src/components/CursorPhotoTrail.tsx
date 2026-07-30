import { useRef, useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface TrailItem {
  id: number;
  x: number;
  y: number;
  src: string;
  size: number;
  rotation: number;
}

interface CursorPhotoTrailProps {
  images: string[];
  order?: 'sequential' | 'random';
  maxImages?: number;
  spawnIntervalMs?: number;
  minMovePx?: number;
  imageSizeRange?: [number, number];
  lifespanMs?: number;
  trailZIndex?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function CursorPhotoTrail({
  images,
  order = 'sequential',
  maxImages = 6,
  spawnIntervalMs = 80,
  minMovePx = 10,
  imageSizeRange = [120, 180],
  lifespanMs = 600,
  trailZIndex = 50,
  children,
  className,
  style,
}: CursorPhotoTrailProps) {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastSpawnPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const orderIndexRef = useRef<number>(0);
  const idCounterRef = useRef<number>(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const spawnImage = useCallback(
    (x: number, y: number) => {
      if (images.length === 0) return;

      const src =
        order === 'random'
          ? images[Math.floor(Math.random() * images.length)]
          : images[orderIndexRef.current % images.length];

      if (order === 'sequential') orderIndexRef.current++;

      const [minSize, maxSize] = imageSizeRange;
      const size = minSize + Math.random() * (maxSize - minSize);
      const rotation = (Math.random() - 0.5) * 8;
      const id = ++idCounterRef.current;

      setTrail(prev => {
        const next = [...prev, { id, x, y, src, size, rotation }];
        return next.length > maxImages ? next.slice(next.length - maxImages) : next;
      });

      const timer = setTimeout(() => {
        setTrail(prev => prev.filter(item => item.id !== id));
        timersRef.current.delete(id);
      }, lifespanMs);

      timersRef.current.set(id, timer);
    },
    [images, order, imageSizeRange, maxImages, lifespanMs],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const rect = container.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      // Time gate: at most one spawn per spawnIntervalMs.
      // Gap between photos scales naturally with cursor speed —
      // fast cursor travels farther between spawns → larger gaps.
      if (now - lastSpawnTimeRef.current < spawnIntervalMs) return;

      // Distance gate: don't spawn if cursor hasn't moved (e.g. page scroll).
      const last = lastSpawnPosRef.current;
      if (last) {
        const dx = cx - last.x;
        const dy = cy - last.y;
        if (Math.sqrt(dx * dx + dy * dy) < minMovePx) return;
      }

      spawnImage(cx, cy);
      lastSpawnPosRef.current = { x: cx, y: cy };
      lastSpawnTimeRef.current = now;
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [spawnImage, spawnIntervalMs, minMovePx]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {children}
      <AnimatePresence>
        {trail.map(item => (
          <motion.img
            key={item.id}
            src={item.src}
            alt=""
            draggable={false}
            initial={{ opacity: 0, scale: 0.92, rotate: item.rotation }}
            animate={{ opacity: 1, scale: 1, rotate: item.rotation }}
            exit={{
              opacity: 0,
              rotate: item.rotation,
              transition: { duration: 0.5, ease: 'easeOut' },
            }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: item.x,
              top: item.y,
              width: item.size,
              height: item.size,
              objectFit: 'cover',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              userSelect: 'none',
              zIndex: trailZIndex,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
