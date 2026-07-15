import { motion } from 'framer-motion';
import GameTile from './GameTile';

export default function GameHUD({ currentLevel, remainingTargets, movesRemaining, targetRef }) {
  const targetMet = remainingTargets.every(t => t.required === 0);

  return (
    <div className="flex justify-between items-center w-full px-1 mb-2">
      {/* Left Column: Target Block */}
      <div ref={targetRef} className="flex flex-col items-center justify-center w-[100px] h-[65px] rounded-2xl bg-gradient-to-b from-purple-600 to-indigo-800 border-2 border-white shadow-[0_4px_12px_rgba(124,58,237,0.25)] overflow-hidden shrink-0">
        <span className="text-[8px] font-bold tracking-widest text-purple-200 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
          Target
        </span>
        <div className="flex items-center justify-center gap-2 mt-1">
          {remainingTargets.map((t, idx) => (
            <div key={idx} className="flex flex-col items-center select-none">
              <motion.div
                key={`${t.type}-${t.required}`}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-[22px] h-[22px] relative shrink-0"
              >
                <GameTile type={t.type} />
              </motion.div>
              <span className="text-[9px] font-black text-white leading-none mt-0.5 tabular-nums drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.7)] flex items-center justify-center min-h-[10px]">
                {t.required === 0 ? '✅' : t.required}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Column: Prominent Level Medal */}
      <div className="relative w-[70px] h-[70px] rounded-full bg-gradient-to-b from-amber-300 via-yellow-400 to-amber-500 border-4 border-yellow-250 shadow-xl flex items-center justify-center select-none shrink-0">
        <div className="absolute inset-0.5 rounded-full border border-yellow-100/30 bg-gradient-to-tr from-transparent via-white/25 to-transparent" />
        <span className="text-3xl filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          🏎️
        </span>
        <div className="absolute -bottom-1.5 px-2 py-0.5 rounded-full bg-slate-950 border border-yellow-400 shadow-md text-[8px] font-black text-yellow-400 tracking-wider uppercase leading-none">
          Lvl {currentLevel}
        </div>
      </div>

      {/* Right Column: Moves Block */}
      <div className="flex flex-col items-center justify-center w-[100px] h-[65px] rounded-2xl bg-gradient-to-b from-purple-600 to-indigo-800 border-2 border-white shadow-[0_4px_12px_rgba(124,58,237,0.25)] relative shrink-0">
        <span className="text-[9px] font-extrabold tracking-widest text-purple-200 uppercase drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
          Moves
        </span>
        <div className="mt-1">
          {movesRemaining <= 5 && !targetMet ? (
            <motion.span
              animate={{ scale: [1, 1.25, 1], color: ['#ffffff', '#f43f5e', '#ffffff'] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="text-lg font-black tabular-nums leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] inline-block"
            >
              {movesRemaining}
            </motion.span>
          ) : (
            <span className="text-lg font-black text-white tabular-nums leading-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              {movesRemaining}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
