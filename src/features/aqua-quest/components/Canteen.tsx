/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

interface CanteenProps {
  fillPercentage: number;
  contaminationLevel: number;
}

export default function Canteen({ fillPercentage, contaminationLevel }: CanteenProps) {
  // Calculate color based on contamination
  // 0 contamination: Blue
  // 5 contamination: Dark Green/Brown
  const getLidColor = () => {
    const colors = [
      '#3b82f6', // blue-500
      '#2563eb', // blue-600
      '#1d4ed8', // blue-700
      '#1e3a8a', // blue-900
      '#064e3b', // emerald-950
    ];
    return colors[Math.min(contaminationLevel, colors.length - 1)];
  };

  const getLiquidColor = () => {
    if (contaminationLevel === 0) return 'rgba(59, 130, 246, 0.8)'; // blue
    if (contaminationLevel === 1) return 'rgba(37, 99, 235, 0.85)';
    if (contaminationLevel === 2) return 'rgba(16, 185, 129, 0.7)'; // emerald
    if (contaminationLevel === 3) return 'rgba(5, 150, 105, 0.8)';
    if (contaminationLevel === 4) return 'rgba(6, 78, 59, 0.9)'; // dark green
    return 'rgba(69, 10, 10, 0.9)'; // deep dark
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-24 h-64 bg-white/10 rounded-3xl border-4 border-white/30 backdrop-blur-sm overflow-hidden flex flex-col justify-end">
        {/* Lid */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 rounded-t-lg transition-colors duration-500"
          style={{ backgroundColor: getLidColor() }}
        />
        
        {/* Fill Level */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${Math.min(fillPercentage, 100)}%` }}
          transition={{ type: 'spring', damping: 20, stiffness: 50 }}
          className="w-full relative"
          style={{ backgroundColor: getLiquidColor() }}
        >
          {/* Waves Effect */}
          <div className="absolute -top-4 left-0 w-full h-8 flex">
             <motion.div 
               animate={{ x: [-10, 10, -10] }}
               transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
               className="w-[200%] h-full opacity-50"
               style={{ 
                 background: `radial-gradient(circle at 50% 100%, ${getLiquidColor()} 0%, transparent 70%)`,
                 backgroundSize: '40px 100%'
               }}
             />
          </div>
        </motion.div>

        {/* Labels */}
        <div className="absolute inset-0 flex flex-col justify-between items-center py-4 pointer-events-none">
          <span className="text-[10px] font-bold text-white/50">CANTIL</span>
          <div className="flex flex-col items-center">
             <span className="text-xl font-bold text-white drop-shadow-md">{Math.round(fillPercentage)}%</span>
          </div>
        </div>
      </div>

      {/* Contamination Indicators */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full border-2 border-white/20 transition-all duration-300 ${
              i < contaminationLevel ? 'bg-red-500 scale-110 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
