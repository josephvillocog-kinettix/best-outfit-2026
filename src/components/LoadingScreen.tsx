import { useEffect, useState } from "react";

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
        <div className="absolute inset-x-[-35px] inset-y-[-35px] rounded-full bg-orange-500/25 blur-xl animate-pulse pointer-events-none" />
        
        {/* Customized loaded brand logo image */}
        <img
          src="/assets/Asset_10.png"
          alt="Kinettix Outing Logo"
          className="w-28 h-28 object-contain relative z-10 animate-bounce cursor-default drop-shadow-[0_8px_16px_rgba(251,146,60,0.25)]"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/assets/asset_10.png";
          }}
        />
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
