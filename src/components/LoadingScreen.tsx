import { useEffect, useState } from "react";
import { Palmtree, Compass } from "lucide-react";

export default function LoadingScreen() {
  const [flavorText, setFlavorText] = useState("Gathering tropical outfits...");

  const funMessages = [
    "Plucking the Ukulele strings...",
    "Weaving fresh flower leis...",
    "Waxing the surfboards...",
    "Shaking the coconut cocktails...",
    "Tuning the beach bonfire embers...",
    "Catching the perfect tidal wave...",
    "Consulting local surf pros..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * funMessages.length);
      setFlavorText(funMessages[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full text-white text-center flex-1 py-12">
      <div className="relative mb-8">
        {/* Glowing radial backplate */}
        <div className="absolute inset-x-[-30px] inset-y-[-30px] rounded-full bg-orange-500/20 blur-xl animate-pulse" />
        
        {/* Rotating outer compass ring */}
        <div className="animate-spin duration-10000 ease-linear">
          <Compass className="w-24 h-24 text-amber-300 stroke-[1.25]" />
        </div>
        
        {/* Center dancing Palm Tree icon */}
        <div className="absolute inset-0 flex items-center justify-center animate-bounce">
          <Palmtree className="w-10 h-10 text-emerald-400" />
        </div>
      </div>

      <h1 className="font-script text-5xl md:text-6xl text-amber-200 drop-shadow-lg mb-2">
        Hello Kinettix!
      </h1>
      <p className="font-display font-medium text-lg text-emerald-100 mb-6 tracking-wide drop-shadow-md">
        LOADING OUTFIT BATTLE
      </p>

      {/* Decorative progress bar */}
      <div className="w-56 h-2 bg-slate-800/60 rounded-full overflow-hidden border border-amber-500/20 backdrop-blur-sm mb-4">
        <div className="h-full bg-gradient-to-r from-orange-400 to-amber-300 rounded-full animate-[progress_3s_infinite_linear]" 
          style={{
            animation: "shimmer 2s infinite linear",
            backgroundSize: "200% 100%"
          }}
        />
      </div>

      <span className="font-sans text-sm text-amber-100/70 tracking-wide font-medium min-h-[20px] transition-all duration-300">
        {flavorText}
      </span>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
