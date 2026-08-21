import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface ConfettiParticle {
  id: number;
  color: string;
  size: number;
  angle: number; // in radians
  distance: number;
  shape: "circle" | "square" | "triangle";
  rotate: number;
}

interface ConfettiEffectProps {
  active: boolean;
  onComplete: () => void;
}

// A comemoração usa a paleta da casa: fita, dial e gravando.
const COLORS = [
  "#0e5c4a", // fita
  "#34a98b", // fita-clara
  "#f0a828", // dial
  "#f5be55", // dial-clara
  "#e2453a", // gravando
  "#c6c1b3", // linha
];

export function ConfettiEffect({ active, onComplete }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  useEffect(() => {
    if (active) {
      // Generate 45 subtle particles exploding from center
      const newParticles: ConfettiParticle[] = Array.from({ length: 45 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        // Distances distributed nicely to create a rich layered cloud
        const distance = 80 + Math.random() * 260;
        const size = 5 + Math.random() * 8;
        const shapes: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const rotate = Math.random() * 360;

        return {
          id: i,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size,
          angle,
          distance,
          shape,
          rotate,
        };
      });

      setParticles(newParticles);

      // Automatically stop/cleanup after animation is complete
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete();
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <div id="confetti-container" className="fixed inset-0 pointer-events-none z-50 overflow-hidden flex items-center justify-center">
      <AnimatePresence>
        {particles.map((p) => {
          // Calculate final coordinates based on angle and explosion distance
          const targetX = Math.cos(p.angle) * p.distance;
          // Drifts downward due to simulated gravity
          const targetY = Math.sin(p.angle) * p.distance + 110;

          return (
            <motion.div
              key={p.id}
              className="absolute"
              initial={{
                x: 0,
                y: 0,
                scale: 0.1,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                x: targetX,
                y: targetY,
                scale: [1, 1, 0.7, 0],
                rotate: p.rotate + (p.id % 2 === 0 ? 360 : -360),
                opacity: [1, 1, 0.8, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.3 + Math.random() * 0.9,
                ease: [0.1, 0.8, 0.25, 1], // beautiful snap explosion and drift
              }}
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.shape === "circle" ? "50%" : p.shape === "triangle" ? "0%" : "2px",
                clipPath: p.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
              }}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}
