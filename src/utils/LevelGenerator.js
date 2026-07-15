// ---------------------------------------------------------------------------
// src/utils/LevelGenerator.js
// ---------------------------------------------------------------------------

const GRID_ROWS = 8;
const GRID_COLS = 8;

const diamond = [
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0]
];

const cutSquare = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0]
];

const cross = [
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 1, 0, 0]
];

const heartShape = [
  [0, 1, 1, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0]
];

const hollowSquare = [
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1]
];

const masks = [diamond, cutSquare, cross, heartShape, hollowSquare];

export function generateLevelData(levelIndex) {
  const mask = masks[levelIndex % masks.length];
  
  const colorsCount = levelIndex > 10 ? 6 : 5;
  const targetScore = 1000 + (levelIndex * 250);
  const movesAllowed = Math.max(15, 30 - Math.floor(levelIndex / 5));

  const PART_NAMES = ['tire', 'battery', 'engine', 'wrench', 'spark_plug', 'turbo'];
  const targets = [];
  const numTargets = Math.min(3, Math.floor(Math.random() * 2) + 1 + (levelIndex > 5 ? 1 : 0));
  const selectedTypes = [];
  while (selectedTypes.length < numTargets) {
    const candidate = PART_NAMES[Math.floor(Math.random() * colorsCount)];
    if (!selectedTypes.includes(candidate)) {
      selectedTypes.push(candidate);
    }
  }

  for (const type of selectedTypes) {
    const required = 10 + (levelIndex * 2) + Math.floor(Math.random() * 5);
    targets.push({ type, required });
  }

  // Fill playable cells with random part numbers 1..colorsCount
  const grid = mask.map((row) =>
    row.map((num) => {
      if (num === 0) return 0;
      return Math.floor(Math.random() * colorsCount) + 1;
    })
  );

  // Sprinkle obstacles based on levelIndex
  if (levelIndex >= 5) {
    const candidates = [];
    for (let r = 2; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (grid[r][c] !== 0) {
          // Calculate weight: rows closer to middle/bottom (r >= 3) and cols closer to center (2..5)
          const rowWeight = r >= 3 ? 3 : 1;
          const colWeight = (c >= 2 && c <= 5) ? 2 : 1;
          const totalWeight = rowWeight * colWeight;
          candidates.push({ r, c, weight: totalWeight });
        }
      }
    }

    // Sort by weight descending to favor middle/bottom cluster cells
    candidates.sort((a, b) => b.weight - a.weight);

    // Take top candidate pool and shuffle them slightly to keep it random
    const pool = candidates.slice(0, Math.min(18, candidates.length));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    let placed = 0;
    // Wood obstacles: 3 to 6
    const numWood = Math.floor(Math.random() * 4) + 3;
    for (let i = 0; i < numWood && i < pool.length; i++) {
      const { r, c } = pool[i];
      grid[r][c] = 'WOOD';
      placed++;
    }

    // Stone obstacles: 2 to 4 (only if levelIndex >= 10)
    if (levelIndex >= 10) {
      const numStone = Math.floor(Math.random() * 3) + 2;
      let stonePlaced = 0;
      for (let i = placed; stonePlaced < numStone && i < pool.length; i++) {
        const { r, c } = pool[i];
        grid[r][c] = 'STONE_2';
        stonePlaced++;
        placed++;
      }
    }
  }

  const worldIndex = Math.floor((levelIndex - 1) / 5) % 3;
  const themes = [
    "from-slate-950 to-zinc-900 border-zinc-800 shadow-zinc-900/20",
    "from-slate-950 via-slate-900 to-cyan-950/30 border-cyan-900/30 shadow-cyan-950/20",
    "from-slate-950 via-slate-900 to-violet-950/30 border-violet-900/30 shadow-violet-950/20"
  ];
  const names = ["Old Garage", "Modern Workshop", "Luxury Studio"];

  return {
    id: levelIndex,
    worldId: worldIndex + 1,
    worldName: names[worldIndex],
    backgroundStyle: themes[worldIndex],
    grid,
    targets,
    movesAllowed,
    gridDifficulty: colorsCount,
  };
}
