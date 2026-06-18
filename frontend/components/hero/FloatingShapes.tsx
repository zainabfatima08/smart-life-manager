'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import type { MouseEvent } from 'react';
import { cn } from '@/lib/utils';

type ShapeKind = 'sphere' | 'blob' | 'ring' | 'flower' | 'capsule';

type Shape = {
  id: string;
  kind: ShapeKind;
  className: string;
  depth: number;
  duration: number;
  delay: number;
  rotate: number;
};

const shapes: Shape[] = [
  { id: 'sphere-top-left', kind: 'sphere', className: 'left-[8%] top-[14%] h-24 w-24 md:h-32 md:w-32', depth: 26, duration: 7, delay: 0, rotate: 14 },
  { id: 'blob-right', kind: 'blob', className: 'right-[7%] top-[18%] h-28 w-28 md:h-40 md:w-40', depth: -22, duration: 9, delay: 0.6, rotate: -18 },
  { id: 'ring-left', kind: 'ring', className: 'left-[4%] bottom-[18%] h-28 w-28 md:h-36 md:w-36', depth: 18, duration: 8, delay: 1.2, rotate: 28 },
  { id: 'flower-bottom', kind: 'flower', className: 'bottom-[8%] right-[18%] h-24 w-24 md:h-32 md:w-32', depth: -30, duration: 10, delay: 0.2, rotate: -26 },
  { id: 'capsule-top', kind: 'capsule', className: 'left-[44%] top-[8%] h-16 w-36 md:h-20 md:w-48', depth: 14, duration: 6.5, delay: 1.6, rotate: 10 },
  { id: 'sphere-mobile', kind: 'sphere', className: 'bottom-[28%] left-[16%] h-14 w-14 md:h-20 md:w-20', depth: -16, duration: 7.5, delay: 0.9, rotate: -12 },
];

function ShapeGraphic({ kind }: { kind: ShapeKind }) {
  if (kind === 'ring') {
    return <div className="h-full w-full rounded-full border-[18px] border-white/75 bg-transparent shadow-2xl shadow-indigo-300/40 backdrop-blur-sm" />;
  }

  if (kind === 'flower') {
    return (
      <div className="relative h-full w-full drop-shadow-2xl">
        {[0, 60, 120, 180, 240, 300].map((rotation) => (
          <div
            key={rotation}
            className="absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-bottom-left rounded-full bg-gradient-to-br from-rose-300 via-fuchsia-400 to-indigo-400 opacity-90 blur-[0.2px]"
            style={{ transform: `rotate(${rotation}deg) translate(-8%, -92%)` }}
          />
        ))}
        <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-200 shadow-xl" />
      </div>
    );
  }

  if (kind === 'capsule') {
    return <div className="h-full w-full rounded-full bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 shadow-2xl shadow-orange-300/40 ring-1 ring-white/70" />;
  }

  if (kind === 'blob') {
    return <div className="h-full w-full rounded-[42%_58%_68%_32%/45%_42%_58%_55%] bg-gradient-to-br from-cyan-300 via-sky-400 to-indigo-500 shadow-2xl shadow-sky-300/40 ring-1 ring-white/70" />;
  }

  return <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#bfdbfe_18%,#818cf8_52%,#22c55e_100%)] shadow-2xl shadow-indigo-300/50 ring-1 ring-white/70" />;
}

function FloatingShapeItem({ shape, smoothX, smoothY }: { shape: Shape; smoothX: ReturnType<typeof useSpring>; smoothY: ReturnType<typeof useSpring> }) {
  const x = useTransform(smoothX, [-0.5, 0.5], [-shape.depth, shape.depth]);
  const y = useTransform(smoothY, [-0.5, 0.5], [-shape.depth * 0.7, shape.depth * 0.7]);

  return (
    <motion.div
      className={cn('absolute will-change-transform', shape.className)}
      style={{ x, y }}
      animate={{ translateY: [0, -22, 0], rotate: [0, shape.rotate, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: shape.duration, delay: shape.delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <ShapeGraphic kind={shape.kind} />
    </motion.div>
  );
}

export function FloatingShapes() {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 80, damping: 24, mass: 0.35 });
  const smoothY = useSpring(pointerY, { stiffness: 80, damping: 24, mass: 0.35 });

  function onMouseMove(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  }

  function onMouseLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div aria-hidden="true" onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className="pointer-events-auto absolute inset-0 overflow-hidden">
      {shapes.map((shape) => (
        <FloatingShapeItem key={shape.id} shape={shape} smoothX={smoothX} smoothY={smoothY} />
      ))}
    </div>
  );
}