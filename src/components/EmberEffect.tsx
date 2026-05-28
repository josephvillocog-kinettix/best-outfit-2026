import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number; // percentage
  size: number;  // pixels
  delay: number; // seconds
  duration: number; // seconds
}

export default function EmberEffect() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate 45 randomized ember particles
    const initialParticles: Particle[] = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 10 + 4, // 4px to 14px
      delay: Math.random() * 12,    // staggered start
      duration: Math.random() * 8 + 10 // 10s to 18s duration
    }));
    setParticles(initialParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 w-2 h-2 rounded-full animate-ember"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.id % 3 === 0 
              ? "#ff7e5f" // Orange-red
              : p.id % 3 === 1 
                ? "#feb47b" // Peach-gold
                : "#ef4444", // Bright lava red
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            filter: "perspective(1px) translateZ(0)",
          }}
        />
      ))}
    </div>
  );
}
