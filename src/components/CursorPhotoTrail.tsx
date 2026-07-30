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
  spawnDistancePx?: number;

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
  spawnDistancePx = 80,
  imageSizeRange = [120, 180],
  lifespanMs = 600,
  trailZIndex = 50,
  children,
  className,
  style,
}: CursorPhotoTrailProps) {
  const [trail, setTrail] = useState<TrailItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  // Tracks the position of the last spawned image, not the raw cursor position.
  // The gap between lastPos and the current cursor is the carry-over remainder,
  // so spacing stays exactly spawnDistancePx even when the cursor moves fast.
  const lastSpawnPosRef = useRef<{ x: number; y: number } | null>(null);
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
      const rect = container.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      if (!lastSpawnPosRef.current) {
        lastSpawnPosRef.current = { x: cx, y: cy };
        return;
      }

      // Walk along the path in spawnDistancePx steps, carrying over the remainder.
      // This keeps spacing exact even when the cursor jumps far between events.
      let { x: lx, y: ly } = lastSpawnPosRef.current;
      while (true) {
        const dx = cx - lx;
        const dy = cy - ly;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < spawnDistancePx) break;
        const ux = dx / dist;
        const uy = dy / dist;
        lx += ux * spawnDistancePx;
        ly += uy * spawnDistancePx;
        spawnImage(lx, ly);
      }
      lastSpawnPosRef.current = { x: lx, y: ly };
    };

    container.addEventListener('mousemove', handleMouseMove);
    return () => container.removeEventListener('mousemove', handleMouseMove);
  }, [spawnImage, spawnDistancePx]);

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
