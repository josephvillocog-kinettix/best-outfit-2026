import React, { useState, useRef, useEffect } from "react";
import { Voter } from "../types";
import { Sparkles, Ticket, ShieldAlert } from "lucide-react";
import { motion } from "motion/react";

interface LoginScreenProps {
  votersList: Voter[];
  onLoginSuccess: (voter: Voter) => void;
}

export default function LoginScreen({ votersList, onLoginSuccess }: LoginScreenProps) {
  const [voterIdInput, setVoterIdInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);
  const [isExploding, setIsExploding] = useState(false);
  const [isCardShaking, setIsCardShaking] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);

  // Clean up animation frames on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const startEmberExplosion = (targetX: number, targetY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const card = cardRef.current;
    if (card) {
      canvas.width = card.clientWidth;
      canvas.height = card.clientHeight;
    }

    const particles: any[] = [];
    const colors = [
      "rgba(249, 115, 22, ",  // Brand orange
      "rgba(245, 158, 11, ",  // Brand amber
      "rgba(239, 68, 68, ",   // Lava red
      "rgba(253, 224, 71, ",  // Sunflower yellow
      "rgba(255, 255, 255, ", // Bright spark white
    ];

    // Spawn 80 ember particles
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 8.5; // High initial burst speed
      const colorBase = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: targetX,
        y: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 1 + Math.random() * 3.5,
        colorBase,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02,
        gravity: -0.06, // Rises slightly resembling fiery floating embers
        wind: (Math.random() - 0.5) * 0.2, // Drifting turbulence
      });
    }

    particlesRef.current = particles;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const activeParticles = particlesRef.current;

      for (let i = activeParticles.length - 1; i >= 0; i--) {
        const p = activeParticles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Apply friction
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Apply heat lift draft and drift
        p.vy += p.gravity;
        p.vx += p.wind + (Math.random() - 0.5) * 0.12;

        // Apply decay
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          activeParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.colorBase + "1.0)";
        ctx.fillStyle = p.colorBase + p.alpha.toFixed(2) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (activeParticles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    tick();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExploding) return;

    const trimmedId = voterIdInput.trim();
    const trimmedLastName = lastNameInput.trim();

    if (!trimmedId) {
      setErrorText("Please enter last 4 digits of Employee ID!");
      return;
    }

    if (trimmedId !== "73083773" && !trimmedLastName) {
      setErrorText("Please enter your Last Name to verify your identity!");
      return;
    }

    // Attempt case-insensitive lookup
    let foundVoter = votersList.find(
      (v) => 
        String(v.id).trim().toLowerCase() === trimmedId.toLowerCase() &&
        String(v.name).trim().toLowerCase().includes(trimmedLastName.toLowerCase())
    );

    // Bypass/Special check for administrator key 73083773
    if (trimmedId === "73083773") {
      foundVoter = {
        id: "73083773",
        name: "System Administrator"
      };
    }

    if (foundVoter) {
      setErrorText(null);
      setIsExploding(true);
      setIsCardShaking(true);

      // Measure precise button center position relative to the main card container
      setTimeout(() => {
        const btn = buttonRef.current;
        const card = cardRef.current;
        if (btn && card) {
          const btnRect = btn.getBoundingClientRect();
          const cardRect = card.getBoundingClientRect();
          const x = btnRect.left - cardRect.left + btnRect.width / 2;
          const y = btnRect.top - cardRect.top + btnRect.height / 2;
          startEmberExplosion(x, y);
        } else {
          // Hardcoded fallback position if DOM queries fail
          startEmberExplosion(180, 275);
        }
      }, 5);

      // Allow visual explosive elements state to finish fully before page change trigger
      setTimeout(() => {
        onLoginSuccess(foundVoter);
      }, 980);

    } else {
      setErrorText("Oops! That key is not registered. Please double check and try again!");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full text-white z-10 relative flex-1 py-4">
      <motion.div
        ref={cardRef}
        animate={
          isCardShaking
            ? {
                x: [0, -8, 8, -6, 6, -4, 4, -2, 2, 0],
                scale: [1, 1.05, 0.98, 1.03, 0.99, 1.01, 1],
              }
            : { x: 0, scale: 1 }
        }
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-sm glass-card-dark rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-white/10"
      >
        {/* Particle Canvas overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none z-50 rounded-3xl"
        />

        {/* Tropical Ribbon */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 pointer-events-none" />

        {/* Decorative sunset elements */}
        <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-6">
          <span className="font-script text-4xl text-amber-200 block mb-1">
            Welcome Kinettix!
          </span>
          <h2 className="font-display font-bold text-2xl text-white tracking-wide">
            ENTER VOTING BOOTH
          </h2>
          <p className="text-xs text-amber-100/60 mt-1 font-sans">
            Use the last 4 digits of your Employee ID and Last Name to join the ballot.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-display font-medium uppercase tracking-wider text-amber-200 mb-1.5 ml-1">
              Employee ID Number(4 digits)
            </label>
            <div className="relative">
              <input
                type="text"
                value={voterIdInput}
                onChange={(e) => setVoterIdInput(e.target.value)}
                placeholder="e.g. 0288"
                disabled={isExploding}
                className="w-full bg-slate-900/60 border border-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-white/30 text-center tracking-widest font-mono text-lg transition-all focus:outline-none disabled:opacity-50"
              />
              <div className="absolute right-3 top-3.5 opacity-40">
                <Ticket className="w-5 h-5 text-amber-100" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-display font-medium uppercase tracking-wider text-amber-200 mb-1.5 ml-1">
              Employee Last Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={lastNameInput}
                onChange={(e) => setLastNameInput(e.target.value)}
                placeholder="e.g. Smith"
                disabled={isExploding}
                className="w-full bg-slate-900/60 border border-white/15 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-xl px-4 py-3 text-white placeholder-white/30 text-center text-base transition-all focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {errorText && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-200">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </div>
          )}

          <motion.button
            ref={buttonRef}
            type="submit"
            disabled={isExploding}
            animate={isExploding ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="w-full mt-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 font-display font-bold text-base py-3 px-6 rounded-xl shadow-lg hover:shadow-orange-500/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-0"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Submit</span>
          </motion.button>
        </form>

      </motion.div>
    </div>
  );
}
