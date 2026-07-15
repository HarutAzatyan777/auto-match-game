import { motion } from 'framer-motion';
import useGameStore from '../store/useGameStore';
import { generateLevelData } from '../utils/LevelGenerator';

export default function Garage() {
  const {
    stars,
    unlockedParts,
    carConfig,
    currentLevel,
    unlockPart,
    setActiveTab
  } = useGameStore();

  const levelConfig = generateLevelData(currentLevel);
  const isUnlocked = (partId) => unlockedParts.includes(partId);

  const handleUnlock = (partId, cost) => {
    unlockPart(partId, cost);
  };

  return (
    <div className={`flex flex-col items-center gap-5 w-full max-w-sm select-none p-5 rounded-3xl bg-gradient-to-br ${levelConfig.backgroundStyle} border shadow-2xl transition-all duration-500`}>
      
      {/* ── Sleek Header ────────────────────────────────────────────────── */}
      <div className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl bg-slate-900/80 backdrop-blur border border-slate-800 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Garage Upgrades
          </span>
          <span className="text-base font-black text-white leading-none mt-0.5">
            Level {currentLevel} Roadster
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-xl filter drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]"
          >
            ⭐
          </motion.span>
          <span className="text-base font-black text-amber-400 tabular-nums">
            {stars}
          </span>
        </div>
      </div>

      {/* ── Layered Car Visual ────────────────────────────────────────── */}
      <div className="relative w-full h-40 bg-slate-950/40 border border-slate-800/80 rounded-2xl overflow-hidden flex items-center justify-center">
        
        {/* Simple Vector Styled Car Body/Elements */}
        <div className="relative w-64 h-24 flex items-center justify-center">
          
          {/* 1. Paint (Custom Paint) / Car Body */}
          <div
            className={`absolute top-6 left-8 w-48 h-10 rounded-full transition-all duration-500 ${
              isUnlocked('paint')
                ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                : 'bg-slate-700/80 grayscale opacity-45'
            }`}
          >
            {/* Cockpit / cabin */}
            <div
              className={`absolute -top-4 left-16 w-20 h-8 rounded-t-full border-t border-x transition-all duration-500 ${
                isUnlocked('paint') ? 'bg-cyan-500/20 border-white/20' : 'bg-slate-800/50 border-slate-700/30'
              }`}
            />
          </div>

          {/* 2. Engine (V8 Engine) - glowing under the hood */}
          <motion.div
            animate={isUnlocked('engine') ? { opacity: [0.8, 1, 0.8] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`absolute top-8 left-10 w-8 h-6 rounded-md flex items-center justify-center text-xs transition-all duration-500 ${
              isUnlocked('engine')
                ? 'bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)] text-slate-900 border border-amber-300 font-bold'
                : 'bg-slate-800 grayscale opacity-35 text-slate-500'
            }`}
          >
            ⚡
          </motion.div>

          {/* 3. Wheels (Alloy Wheels) - Front and Back wheels */}
          {/* Front Wheel */}
          <motion.div
            animate={isUnlocked('wheels') ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className={`absolute bottom-4 left-14 w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
              isUnlocked('wheels')
                ? 'bg-slate-900 border-zinc-400 shadow-[0_0_10px_rgba(161,161,170,0.5)]'
                : 'bg-zinc-800 border-zinc-700 grayscale opacity-40'
            }`}
          >
            <div className="w-1.5 h-6 bg-zinc-500 absolute" />
            <div className="w-6 h-1.5 bg-zinc-500 absolute" />
            <div className="w-3.5 h-3.5 rounded-full bg-zinc-600 z-10 border border-zinc-400" />
          </motion.div>

          {/* Back Wheel */}
          <motion.div
            animate={isUnlocked('wheels') ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className={`absolute bottom-4 right-14 w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all duration-500 ${
              isUnlocked('wheels')
                ? 'bg-slate-900 border-zinc-400 shadow-[0_0_10px_rgba(161,161,170,0.5)]'
                : 'bg-zinc-800 border-zinc-700 grayscale opacity-40'
            }`}
          >
            <div className="w-1.5 h-6 bg-zinc-500 absolute" />
            <div className="w-6 h-1.5 bg-zinc-500 absolute" />
            <div className="w-3.5 h-3.5 rounded-full bg-zinc-600 z-10 border border-zinc-400" />
          </motion.div>
          
        </div>
      </div>

      {/* ── Upgrade Cards List ────────────────────────────────────────── */}
      <div className="w-full flex flex-col gap-3">
        {carConfig.map((part) => {
          const unlocked = isUnlocked(part.id);
          const canAfford = stars >= part.cost;

          return (
            <div
              key={part.id}
              className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
                unlocked
                  ? 'bg-emerald-950/20 border-emerald-500/20 shadow-inner'
                  : 'bg-slate-900/60 border-slate-800/80 shadow-md'
              }`}
            >
              <div className="flex flex-col items-start gap-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  {part.type}
                </span>
                <span className="text-sm font-black text-white">
                  {part.name}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-slate-400">Cost:</span>
                  <span className="text-[10px] font-black text-amber-400 flex items-center gap-0.5">
                    ⭐ {part.cost} {part.cost === 1 ? 'Star' : 'Stars'}
                  </span>
                </div>
              </div>

              <button
                disabled={unlocked || !canAfford}
                onClick={() => handleUnlock(part.id, part.cost)}
                className={[
                  'px-4 py-2 rounded-xl font-extrabold text-xs transition-all duration-200 border min-w-[90px]',
                  unlocked
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-default'
                    : canAfford
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 border-yellow-300 text-slate-950 shadow-md active:scale-[0.97] hover:brightness-110'
                    : 'bg-slate-800/40 border-slate-800/80 text-slate-500 cursor-not-allowed'
                ].join(' ')}
              >
                {unlocked ? 'Restored ✓' : 'Restore'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Play Next Level Action Button ────────────────────────────── */}
      <button
        onClick={() => setActiveTab('board')}
        className="w-full py-4 px-6 mt-2 rounded-2xl font-black text-sm bg-gradient-to-r from-sky-500 to-blue-600 border border-sky-400 text-white shadow-lg shadow-sky-500/30 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        <span>🏎️</span> Play Next Level
      </button>
    </div>
  );
}
