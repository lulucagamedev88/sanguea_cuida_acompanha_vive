/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue } from 'motion/react';
import { IMAGES } from '../constants';

interface BubbleProps {
  id: number;
  x: number;
  isContaminated: boolean;
  speed: number;
  isPaused: boolean;
  onPop: (id: number, wasPoppedByUser: boolean) => void;
}

export default function Bubble({ id, x, isContaminated, speed, isPaused, onPop }: BubbleProps) {
  const y = useMotionValue(-100);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const onPopRef = useRef(onPop);

  useEffect(() => {
    onPopRef.current = onPop;
  }, [onPop]);

  useEffect(() => {
    const viewportHeight = typeof window !== 'undefined'
      ? window.innerHeight || document.documentElement.clientHeight || 800
      : 800;

    const animation = animate(y, viewportHeight * 1.1, {
      duration: 10 / speed,
      ease: 'linear',
      onComplete: () => onPopRef.current(id, false),
    });

    animationRef.current = animation;
    if (isPaused) animation.pause();

    return () => {
      animation.stop();
      animationRef.current = null;
    };
  }, [id, speed, y]);

  useEffect(() => {
    if (isPaused) animationRef.current?.pause();
    else animationRef.current?.play();
  }, [isPaused]);

  return (
    <motion.div
      style={{
        y,
        left: `${x}%`,
        width: 'clamp(50px, 8vw, 80px)',
        height: 'clamp(50px, 8vw, 80px)',
        pointerEvents: isPaused ? 'none' : 'auto',
      }}
      className="absolute cursor-pointer select-none touch-none"
      onPointerDown={(event) => {
        event.stopPropagation();
        if (!isPaused) onPop(id, true);
      }}
    >
      <img
        src={isContaminated ? IMAGES.contaminatedBubble : IMAGES.cleanBubble}
        alt="Bolha de água"
        draggable={false}
        className="pointer-events-none h-full w-full object-contain drop-shadow-lg"
      />
    </motion.div>
  );
}
