import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/cn";

interface BallSphereProps {
  letter: string;
  number: number;
  sequence?: number;
  isDrawing?: boolean;
  className?: string;
}

export const BallSphere: React.FC<BallSphereProps> = ({
  letter,
  number,
  isDrawing = false,
  className
}) => {
  // Traditional Bingo 75 color coding with high-quality radial gradients
  let bgGradient = "radial-gradient(circle at 30% 30%, #1e1b4b 0%, #0c0a0f 65%, #030005 100%)";
  let borderGlow = "border-primary shadow-[0_0_25px_rgba(139,92,246,0.6)]";
  let haloColor = "bg-primary/20";

  if (letter === "B") {
    // Elegant Blue/Cyan
    bgGradient = "radial-gradient(circle at 30% 30%, #0891b2 0%, #0f766e 40%, #042f2e 85%, #021412 100%)";
    borderGlow = "border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.7)]";
    haloColor = "bg-cyan-500/25";
  } else if (letter === "I") {
    // Vibrant Red/Orange
    bgGradient = "radial-gradient(circle at 30% 30%, #ea580c 0%, #c2410c 45%, #7c2d12 85%, #451a03 100%)";
    borderGlow = "border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.7)]";
    haloColor = "bg-orange-500/25";
  } else if (letter === "N") {
    // Bright Gold/Yellow
    bgGradient = "radial-gradient(circle at 30% 30%, #eab308 0%, #ca8a04 40%, #854d0e 80%, #422006 100%)";
    borderGlow = "border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.7)]";
    haloColor = "bg-yellow-500/20";
  } else if (letter === "G") {
    // Deep Emerald Green
    bgGradient = "radial-gradient(circle at 30% 30%, #059669 0%, #047857 40%, #064e3b 80%, #022c22 100%)";
    borderGlow = "border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.7)]";
    haloColor = "bg-emerald-500/25";
  } else if (letter === "O") {
    // Majestic Magenta/Violet
    bgGradient = "radial-gradient(circle at 30% 30%, #db2777 0%, #b91c1c 45%, #581c87 85%, #3b0764 100%)";
    borderGlow = "border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.7)]";
    haloColor = "bg-pink-500/25";
  }

  return (
    <div className={cn("flex flex-col items-center justify-center select-none gap-4", className)}>
      <div className="relative">
        {/* Outer Halo */}
        <div className={cn("absolute inset-0 rounded-full blur-2xl animate-pulse", haloColor)} />

        {/* Main Glass Sphere with Radial Gradient */}
        <motion.div
          initial={isDrawing ? { scale: 0.3, rotate: -180 } : { scale: 1, rotate: 0 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className={cn(
            "relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex flex-col items-center justify-center border-4 overflow-hidden",
            borderGlow
          )}
          style={{ background: bgGradient }}
        >
          {/* Ring Shine reflection */}
          <div className="absolute top-2 left-2 right-2 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full pointer-events-none" />

          {/* Shiny highlights */}
          <div className="absolute top-4 left-1/4 w-12 h-6 bg-white/25 blur-sm rounded-full transform -rotate-12" />

          {/* Letter */}
          <span className="text-xl sm:text-2xl font-bold tracking-widest text-white/80 font-tech z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {letter}
          </span>

          {/* Number */}
          <span className="text-6xl sm:text-7xl font-extrabold text-white font-tech tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] z-10">
            {number}
          </span>

          {/* Sphere inner texture/shadow */}
          <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
        </motion.div>
      </div>
    </div>
  );
};
export default BallSphere;
