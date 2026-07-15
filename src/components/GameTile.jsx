import { motion } from 'framer-motion';

const WoodIcon = () => (
  <svg className="w-6 h-6 text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
    <path d="M3 15h18" />
    <path d="M9 3v18" />
    <path d="M15 3v18" />
  </svg>
);

const Stone2Icon = () => (
  <svg className="w-6 h-6 text-zinc-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <path d="M12 2v20" />
    <path d="M2 7h20" />
    <path d="M2 12h20" />
    <path d="M2 17h20" />
  </svg>
);

const Stone1Icon = () => (
  <svg className="w-6 h-6 text-zinc-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="2" />
    <path d="M12 2v20" />
    <path d="M2 7h20" />
    <path d="M2 12h20" />
    <path d="M2 17h20" />
    <path d="M6 4l4 4-2 3" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5" />
    <path d="M16 14l3 3-2 2" stroke="rgba(239,68,68,0.7)" strokeWidth="1.5" />
  </svg>
);

const GearIcon = () => (
  <svg className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const BatteryIcon = () => (
  <svg className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
    <line x1="22" y1="11" x2="22" y2="13" />
    <path d="M7 10l2 2-2 2" />
    <path d="M11 10l2 2-2 2" />
  </svg>
);

const FlameIcon = () => (
  <svg className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

const WrenchIcon = () => (
  <svg className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

const ZapIcon = () => (
  <svg className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const TurboIcon = () => (
  <svg className="w-6 h-6 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="M4.93 4.93l1.41 1.41" />
    <path d="M17.66 17.66l1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="M6.34 17.66l-1.41 1.41" />
    <path d="M19.07 4.93l-1.41 1.41" />
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8a4 4 0 1 1-4 4" />
  </svg>
);

const DiscoBallIcon = () => (
  <svg className="w-7 h-7 text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    <path d="M2 12h20" />
    <path d="M12 2v20" />
  </svg>
);

const RocketIcon = ({ vertical }) => (
  <div className="relative flex items-center justify-center">
    <svg className="w-6 h-6 text-white drop-shadow-[0_2px_6px_rgba(240,73,214,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M14 2l.09.09a2.7 2.7 0 0 1 0 3.82L10.09 9.91a2.7 2.7 0 0 1-3.82 0L6.18 9.82" />
      <path d="M12 15l9-9-3-3-9 9" />
      <path d="M17 9l-4 4" />
    </svg>
    <span className="absolute -bottom-2 text-[8px] font-black text-white bg-black/50 px-1 py-0.2 rounded border border-white/20 select-none">
      {vertical ? '↕️' : '↔️'}
    </span>
  </div>
);

const HelicopterIcon = () => (
  <svg className="w-6 h-6 text-white drop-shadow-[0_2px_6px_rgba(6,182,212,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v4" />
    <path d="M8 2h8" />
  </svg>
);

export default function GameTile({ type }) {
  if (type === 'WOOD') {
    return (
      <div className="relative w-full h-full rounded-xl bg-amber-800 border border-b-[3px] border-amber-950/70 shadow-[0_4px_6px_rgba(0,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.15)] flex items-center justify-center overflow-hidden aspect-square select-none pointer-events-none" title="Wood Crate">
        {/* Inner wooden border */}
        <div className="absolute inset-1 border border-amber-900/50 bg-amber-850/60 flex items-center justify-center w-[calc(100%-8px)] h-[calc(100%-8px)]">
          {/* Diagonal wood plank lines */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.25)_55%,transparent_55%)] opacity-30 pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_45%,rgba(0,0,0,0.25)_45%,rgba(0,0,0,0.25)_55%,transparent_55%)] opacity-30 pointer-events-none" />
          {/* Horizontal plank divisions */}
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-amber-950/45" />
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-amber-950/45" />
          {/* Corner nails */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-zinc-500 shadow-sm" />
          <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-zinc-500 shadow-sm" />
          <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-zinc-500 shadow-sm" />
          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-zinc-500 shadow-sm" />
          
          <span className="text-lg font-bold filter drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] text-amber-250">
            📦
          </span>
        </div>
      </div>
    );
  }

  if (type === 'STONE_2') {
    return (
      <div className="relative w-full h-full rounded-xl bg-slate-700 border border-b-[3px] border-slate-550/70 shadow-[inset_0_3px_6px_rgba(0,0,0,0.6),0_4px_8px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden aspect-square select-none pointer-events-none" title="Stone Block">
        {/* Shiny metallic shine highlight */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20" />
        <div className="absolute inset-1 border border-slate-650/40 bg-slate-750/70 flex items-center justify-center w-[calc(100%-8px)] h-[calc(100%-8px)]">
          {/* Metal rivet points */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          
          <span className="text-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]">
            🧱
          </span>
        </div>
      </div>
    );
  }

  if (type === 'STONE_1') {
    return (
      <div className="relative w-full h-full rounded-xl bg-slate-700 border border-b-[3px] border-slate-550/70 shadow-[inset_0_3px_6px_rgba(0,0,0,0.6),0_4px_8px_rgba(0,0,0,0.4)] flex items-center justify-center overflow-hidden aspect-square select-none pointer-events-none" title="Cracked Stone">
        {/* Shiny metallic shine highlight */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/20" />
        <div className="absolute inset-1 border border-slate-650/40 bg-slate-750/70 flex items-center justify-center w-[calc(100%-8px)] h-[calc(100%-8px)]">
          {/* Metal rivet points */}
          <div className="absolute top-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          <div className="absolute bottom-0.5 left-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          <div className="absolute bottom-0.5 right-0.5 w-1 h-1 rounded-full bg-slate-400 border border-slate-600 shadow-inner" />
          
          {/* SVG Deep Overlay Cracks */}
          <svg className="absolute inset-0 w-full h-full text-red-500/80 drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.95)] pointer-events-none z-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M4 6l4 4-2 3M20 8l-5 4 3 3" />
            <path d="M12 4l1 5-3 3 2 4" strokeWidth="2" />
          </svg>
          
          <span className="text-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] opacity-60">
            🧱
          </span>
        </div>
      </div>
    );
  }

  let bgClass = '';
  let Icon = null;
  let label = '';

  switch (type) {
    case 'tire':
    case 1:
      bgClass = 'bg-gradient-to-br from-gray-400 to-gray-600 border-gray-300';
      Icon = <GearIcon />;
      label = 'Tire/Gear';
      break;
    case 'battery':
    case 2:
      bgClass = 'bg-gradient-to-br from-green-400 to-green-600 border-green-300';
      Icon = <BatteryIcon />;
      label = 'Battery';
      break;
    case 'engine':
    case 3:
      bgClass = 'bg-gradient-to-br from-red-500 to-orange-500 border-orange-400';
      Icon = <FlameIcon />;
      label = 'Engine';
      break;
    case 'wrench':
    case 4:
      bgClass = 'bg-gradient-to-br from-blue-400 to-blue-600 border-blue-300';
      Icon = <WrenchIcon />;
      label = 'Wrench';
      break;
    case 'spark_plug':
    case 5:
      bgClass = 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-yellow-200';
      Icon = <ZapIcon />;
      label = 'Spark Plug';
      break;
    case 'turbo':
    case 6:
      bgClass = 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-400';
      Icon = <TurboIcon />;
      label = 'Turbo Charger';
      break;

    // Blockers / Obstacles
    case 'WOOD':
      bgClass = 'bg-gradient-to-br from-amber-700 to-amber-900 border-amber-800';
      Icon = <WoodIcon />;
      label = 'Wood Crate';
      break;
    case 'STONE_2':
      bgClass = 'bg-gradient-to-br from-zinc-500 to-zinc-700 border-zinc-650';
      Icon = <Stone2Icon />;
      label = 'Stone Block';
      break;
    case 'STONE_1':
      bgClass = 'bg-gradient-to-br from-zinc-600 to-zinc-800 border-zinc-700';
      Icon = <Stone1Icon />;
      label = 'Cracked Stone';
      break;

    // Boosters
    case 'COLOR_BOMB':
      bgClass = 'bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 border-rose-300';
      Icon = <DiscoBallIcon />;
      label = 'Disco Ball';
      break;
    case 'H_BOMB':
      bgClass = 'bg-gradient-to-br from-fuchsia-500 to-pink-600 border-fuchsia-300';
      Icon = <RocketIcon vertical={false} />;
      label = 'Horizontal Rocket';
      break;
    case 'V_BOMB':
      bgClass = 'bg-gradient-to-br from-fuchsia-500 to-pink-600 border-fuchsia-300';
      Icon = <RocketIcon vertical={true} />;
      label = 'Vertical Rocket';
      break;
    case 'HELICOPTER':
      bgClass = 'bg-gradient-to-br from-cyan-400 to-teal-500 border-cyan-300';
      Icon = <HelicopterIcon />;
      label = 'Helicopter';
      break;

    default:
      bgClass = 'bg-slate-700 border-slate-600';
      Icon = null;
      label = 'Tile';
  }

  const isB = ['COLOR_BOMB', 'H_BOMB', 'V_BOMB', 'HELICOPTER'].includes(type);

  return (
    <div
      className={`w-full h-full rounded-xl flex items-center justify-center shadow-[inset_0_3px_5px_rgba(255,255,255,0.4),inset_0_-4px_6px_rgba(0,0,0,0.4)] border border-b-[3px] border-black/20 ${bgClass}`}
      title={label}
    >
      {/* Glossy Overlay Highlight */}
      <div className="absolute top-0.5 left-0.5 right-0.5 h-1/3 bg-white/20 rounded-t-lg blur-[0.5px] pointer-events-none" />
      
      {/* Icon */}
      <motion.div
        className="z-10 select-none pointer-events-none"
        {...(isB ? {
          animate: { scale: [0.95, 1.12, 0.95] },
          transition: { repeat: Infinity, duration: 1.6, ease: "easeInOut" }
        } : {})}
      >
        {Icon}
      </motion.div>
    </div>
  );
}
