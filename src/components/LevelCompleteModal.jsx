import { motion } from 'framer-motion';

export default function LevelCompleteModal({ isOpen, score, backgroundStyle, onGoToGarage }) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-6"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 200 }}
        className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-8 flex flex-col items-center text-center gap-6 relative overflow-hidden"
      >
        {/* Background gradient beam */}
        <div className={`absolute -right-20 -top-20 w-48 h-48 rounded-full blur-3xl opacity-35 bg-gradient-to-br ${backgroundStyle}`} />
        
        <div className="relative">
          <span className="text-8xl relative z-10 filter drop-shadow-[0_8px_16px_rgba(234,179,8,0.3)]">
            🏆
          </span>
          <motion.span
            animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="absolute -top-3 -right-3 text-3xl z-0"
          >
            ✨
          </motion.span>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 bg-clip-text text-transparent">
            Victory!
          </h2>
          <p className="text-xs text-slate-400 font-semibold px-4">
            Level Complete! You collected all required parts with a final score of <span className="text-white font-bold">{score}</span>!
          </p>
        </div>

        <div className="w-full bg-slate-950/60 rounded-2xl p-4 border border-slate-800 flex flex-col gap-2.5 items-center">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Reward</span>
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between px-4 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">🔧</span>
                <span className="text-xs font-semibold text-slate-400">Tools</span>
              </div>
              <span className="text-sm font-black text-sky-400">+50 Tools</span>
            </div>

            <div className="flex items-center justify-between px-4 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-1.5">
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className="text-xl inline-block"
                >
                  ⭐
                </motion.span>
                <span className="text-xs font-semibold text-slate-400">Stars</span>
              </div>
              <span className="text-sm font-black text-amber-400">+1 Star Earned!</span>
            </div>
          </div>
        </div>

        <button
          onClick={onGoToGarage}
          className="w-full py-3.5 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 border border-yellow-300 shadow-lg shadow-yellow-500/20 active:scale-[0.98] transition-all hover:brightness-110"
        >
          Go to Garage
        </button>
      </motion.div>
    </motion.div>
  );
}
