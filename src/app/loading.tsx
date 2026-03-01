"use client";

import { motion } from "motion/react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[100] bg-[#FDFDFD] flex flex-col items-center justify-center">
      <div className="relative">
        {/* Animated Amber Logo Pulse */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="text-4xl font-serif tracking-tighter uppercase text-[#1A1A1A]"
        >
          Amber
        </motion.div>
        
        {/* Progress Line */}
        <div className="mt-8 w-32 h-[1px] bg-[#1A1A1A]/5 relative overflow-hidden mx-auto">
          <motion.div
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-[#D4AF37]"
          />
        </div>
      </div>
    </div>
  );
}
