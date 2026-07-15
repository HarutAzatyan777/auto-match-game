import { motion } from 'framer-motion';
import GameTile from './GameTile';

export default function DefeatModal({ isOpen, remainingTargets, onReset, onQuit }) {
  if (!isOpen) return null;

  // Filter for targets that were NOT completed (required > 0)
  const incompleteTargets = remainingTargets.filter((t) => t.required > 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm px-6"
    >
      <motion.div
        initial={{ scale: 0.8, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 30, opacity: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 200 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900/95 border-2 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)] p-8 flex flex-col items-center text-center gap-6 relative overflow-hidden"
      >
        {/* Top Header Section */}
        <div className="relative">
          <span className="text-7xl relative z-10 filter drop-shadow-[0_8px_16px_rgba(239,68,68,0.4)]">
            🥀🏎️
          </span>
          <div className="absolute -inset-4 bg-red-500/10 rounded-full blur-xl animate-pulse" />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black bg-gradient-to-r from-red-400 via-rose-500 to-red-600 bg-clip-text text-transparent uppercase tracking-wide">
            Out of Moves!
          </h2>
          <p className="text-xs text-slate-400 font-semibold px-4">
            You ran out of repairs before collecting all required parts.
          </p>
        </div>

        {/* Incomplete Targets Panel */}
        <div className="w-full bg-slate-950/60 rounded-2xl p-4 border border-slate-800 flex flex-col gap-3 items-center">
          <span className="text-red-400 text-[10px] font-bold uppercase tracking-widest">
            Missing Parts
          </span>
          <div className="flex items-center justify-center gap-4">
            {incompleteTargets.map((t, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 select-none">
                <div className="w-7 h-7 relative shrink-0">
                  <GameTile type={t.type} />
                </div>
                <span className="text-xs font-black text-red-500 tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                  {t.required} left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons Group */}
        <div className="w-full flex flex-col gap-3.5 mt-2">
          <button
            onClick={onReset}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-red-500 to-rose-600 text-white border border-red-400 shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all hover:brightness-110"
          >
            Retry Level 🔄
          </button>

          <button
            onClick={onQuit}
            className="w-full py-3 px-6 rounded-2xl font-black text-sm bg-slate-800 border border-slate-700 text-slate-300 active:scale-[0.98] transition-all hover:bg-slate-700 hover:text-white"
          >
            Quit to Garage
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
