/**
 * src/components/GameBoard.jsx
 *
 * Interactive 8×8 Match-3 board with:
 *   • Swipe / drag gesture input (pointer events, mobile-first)
 *   • Score display (matches × 10, with combo multiplier for chains)
 *   • Gravity + tile refill via applyGravity()
 *   • Automatic cascade / chain-reaction loop via useEffect
 *
 * Gesture model:
 *   pointerdown → record origin cell + (clientX, clientY)
 *   pointerup   → compute (deltaX, deltaY)
 *     • |delta| < MIN_SWIPE_PX  → ignore (accidental touch)
 *     • |deltaX| > |deltaY|     → horizontal swap (L/R)
 *     • |deltaY| > |deltaX|     → vertical   swap (U/D)
 *
 * State machine (locked flag acts as a mutex):
 *   IDLE      → waiting for a swipe
 *   SWAPPING  → optimistic swap shown; match check runs
 *   CASCADING → useEffect drives gravity rounds until board is clean
 *   REVERTING → no-match swap shown briefly, then restored
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate, LayoutGroup } from 'framer-motion';
import useGameStore from '../store/useGameStore';
import { worlds } from '../config/levels';
import { generateLevelData } from '../utils/LevelGenerator';
import GameTile from './GameTile';
import LevelCompleteModal from './LevelCompleteModal';
import GameHUD from './GameHUD';
import DefeatModal from './DefeatModal';
import {
  generateInitialGrid,
  checkForMatches,
  applyGravity,
  isBooster,
  isBlocker,
  detonate,
  processExplosions,
  hasPossibleMoves,
  shuffleGrid,
  GRID_ROWS,
  GRID_COLS,
} from '../utils/gameLogic';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** ms to show a failed swap before reverting. */
const REVERT_DELAY_MS = 380;

/** ms between each cascade / gravity step (gives tiles time to "fall"). */
const CASCADE_DELAY_MS = 320;

/** ms matched tiles stay highlighted before gravity is applied. */
const MATCH_FLASH_MS = 280;

/** Score awarded per matched tile. */
const POINTS_PER_TILE = 10;

/** Minimum pointer travel (px) before a gesture is treated as a swipe. */
const MIN_SWIPE_PX = 30;

// ---------------------------------------------------------------------------
// Visual config
// ---------------------------------------------------------------------------

const PART_CONFIG = {
  tire: {
    emoji: '🛞',
    bg: 'bg-slate-700',
    ring: 'ring-slate-400',
    glow: 'shadow-slate-400',
    label: 'Tire',
  },
  battery: {
    emoji: '🔋',
    bg: 'bg-emerald-700',
    ring: 'ring-emerald-400',
    glow: 'shadow-emerald-400',
    label: 'Battery',
  },
  engine: {
    emoji: '⚙️',
    bg: 'bg-orange-700',
    ring: 'ring-orange-400',
    glow: 'shadow-orange-400',
    label: 'Engine',
  },
  spark_plug: {
    emoji: '⚡',
    bg: 'bg-yellow-600',
    ring: 'ring-yellow-300',
    glow: 'shadow-yellow-300',
    label: 'Spark Plug',
  },
  wrench: {
    emoji: '🔧',
    bg: 'bg-sky-700',
    ring: 'ring-sky-400',
    glow: 'shadow-sky-400',
    label: 'Wrench',
  },
  turbo: {
    emoji: '🌀',
    bg: 'bg-indigo-700',
    ring: 'ring-indigo-400',
    glow: 'shadow-indigo-400',
    label: 'Turbo Charger',
  },
  COLOR_BOMB: {
    emoji: '🪩',
    bg: 'bg-gradient-to-tr from-rose-600 via-pink-500 to-indigo-600',
    ring: 'ring-pink-300',
    glow: 'shadow-pink-500 shadow-lg',
    label: 'Disco Ball',
  },
  H_BOMB: {
    emoji: '🚀',
    bg: 'bg-gradient-to-r from-cyan-600 to-blue-800',
    ring: 'ring-cyan-300',
    glow: 'shadow-cyan-400 shadow-md',
    label: 'Horizontal Rocket',
  },
  V_BOMB: {
    emoji: '🚀',
    bg: 'bg-gradient-to-b from-cyan-600 to-blue-800',
    ring: 'ring-cyan-300',
    glow: 'shadow-cyan-400 shadow-md',
    label: 'Vertical Rocket',
  },
  HELICOPTER: {
    emoji: '🚁',
    bg: 'bg-gradient-to-br from-teal-500 to-emerald-700',
    ring: 'ring-teal-300',
    glow: 'shadow-teal-400 shadow-md',
    label: 'Helicopter',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve a swipe direction into the adjacent target cell coordinates.
 * Returns null if the origin is already at the board edge in that direction.
 *
 * @param {{ row: number, col: number }} origin
 * @param {number} deltaX  - positive = right, negative = left
 * @param {number} deltaY  - positive = down,  negative = up
 * @returns {{ row: number, col: number } | null}
 */
function resolveSwipeTarget(origin, deltaX, deltaY) {
  const { row, col } = origin;
  let targetRow = row;
  let targetCol = col;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    // Horizontal swipe
    targetCol = deltaX > 0 ? col + 1 : col - 1;
  } else {
    // Vertical swipe
    targetRow = deltaY > 0 ? row + 1 : row - 1;
  }

  // Clamp to board bounds
  if (
    targetRow < 0 || targetRow >= GRID_ROWS ||
    targetCol < 0 || targetCol >= GRID_COLS
  ) {
    return null;
  }

  return { row: targetRow, col: targetCol };
}

function swapCells(grid, a, b) {
  const next = grid.map((row) => [...row]);
  const tmp = next[a.row][a.col];
  next[a.row][a.col] = next[b.row][b.col];
  next[b.row][b.col] = tmp;
  return next;
}

function matchesToSet(matches) {
  return new Set(matches.map(({ row, col }) => `${row},${col}`));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

let tileIdCounter = 0;
function generateTileId() {
  return `tile-${tileIdCounter++}`;
}

const PART_MAPPING = {
  1: 'tire',
  2: 'battery',
  3: 'engine',
  4: 'wrench',
  5: 'spark_plug',
  6: 'turbo'
};

const mapLayoutToGrid = (layoutGrid) => {
  if (!layoutGrid || !Array.isArray(layoutGrid)) return [];
  return layoutGrid.map((row) =>
    row.map((val) => {
      if (val === 0) {
        return { id: generateTileId(), type: 'empty', isWall: true };
      }
      if (typeof val === 'string') {
        return { id: generateTileId(), type: val, isWall: false };
      }
      return {
        id: generateTileId(),
        type: PART_MAPPING[val] ?? 'wrench',
        isWall: false,
      };
    })
  );
};



export default function GameBoard() {
  const {
    currentLevel,
    currentWorldIndex,
    currentLevelIndex,
    advanceLevel,
    addTools,
    addStars,
    addScore,
    setActiveTab
  } = useGameStore();

  const levelConfig = generateLevelData(currentLevel);
  const levelGrid = levelConfig.grid;

  const [grid, setGrid]           = useState(() => {
    return mapLayoutToGrid(levelGrid);
  });
  const [score, setScore]         = useState(0);
  const [comboCount, setComboCount] = useState(0);   // cascade depth
  const [matchedSet, setMatchedSet] = useState(new Set());
  const [swapping, setSwapping]   = useState(null);  // {a,b} animating pair
  const [isProcessing, setIsProcessing] = useState(false);
  const [movesRemaining, setMovesRemaining] = useState(levelConfig.movesAllowed);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDefeatModal, setShowDefeatModal] = useState(false);
  const [shufflingNotification, setShufflingNotification] = useState(false);

  const [remainingTargets, setRemainingTargets] = useState(() => {
    return levelConfig.targets.map(t => ({ ...t }));
  });
  const targetsRef = useRef(levelConfig.targets.map(t => ({ ...t })));

  const [flyingTokens, setFlyingTokens] = useState([]);
  const targetUiRef = useRef(null);
  const boardRef = useRef(null);

  const getCellCoordinates = useCallback((row, col) => {
    if (!boardRef.current) return { x: 0, y: 0 };
    const rect = boardRef.current.getBoundingClientRect();
    const cellWidth = rect.width / 8;
    const cellHeight = rect.height / 8;
    const x = rect.left + col * cellWidth + cellWidth / 2;
    const y = rect.top + row * cellHeight + cellHeight / 2;
    return { x, y };
  }, []);

  const getTargetCoordinates = useCallback(() => {
    if (!targetUiRef.current) return { x: 0, y: 0 };
    const rect = targetUiRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }, []);

  const getPlayableGrid = useCallback((levelGrid) => {
    let initialGrid = mapLayoutToGrid(levelGrid);
    let attempts = 0;
    while (!hasPossibleMoves(initialGrid) && attempts < 15) {
      initialGrid = shuffleGrid(initialGrid);
      attempts++;
    }
    return initialGrid;
  }, []);

  // ── Auto-shuffle check when board settles ──────────────────────────────────
  useEffect(() => {
    if (isProcessing) return;
    const targetMet = remainingTargets.every(t => t.required === 0);
    if (targetMet || movesRemaining <= 0) return;

    const possible = hasPossibleMoves(grid);
    if (!possible) {
      setIsProcessing(true);
      setShufflingNotification(true);
      const timer = setTimeout(() => {
        const shuffled = shuffleGrid(grid);
        setGrid(shuffled);
        setShufflingNotification(false);
        setIsProcessing(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [grid, isProcessing, movesRemaining, remainingTargets]);

  // Reset grid, score, and moves when level changes
  useEffect(() => {
    const freshConfig = generateLevelData(currentLevel);
    setGrid(getPlayableGrid(freshConfig.grid));

    setMovesRemaining(freshConfig.movesAllowed);
    setScore(0);
    targetsRef.current = freshConfig.targets.map(t => ({ ...t }));
    setRemainingTargets(freshConfig.targets.map(t => ({ ...t })));
    setFlyingTokens([]);
    setIsProcessing(false);
    setShowSuccessModal(false);
    setShowDefeatModal(false);
  }, [currentLevel, getPlayableGrid]);

  const handleResetBoard = useCallback(() => {
    const freshConfig = generateLevelData(currentLevel);
    setGrid(getPlayableGrid(freshConfig.grid));

    setMovesRemaining(freshConfig.movesAllowed);
    setScore(0);
    targetsRef.current = freshConfig.targets.map(t => ({ ...t }));
    setRemainingTargets(freshConfig.targets.map(t => ({ ...t })));
    setFlyingTokens([]);
    setIsProcessing(false);
    setShowSuccessModal(false);
    setShowDefeatModal(false);
  }, [currentLevel, getPlayableGrid]);

  const handleNextLevel = () => {
    setShowSuccessModal(false);
    advanceLevel();
  };

  const handleGoToGarage = () => {
    setShowSuccessModal(false);
    advanceLevel();
    setActiveTab('garage');
  };

  const handleDefeatReset = () => {
    setShowDefeatModal(false);
    handleResetBoard();
  };

  const handleDefeatQuit = () => {
    setShowDefeatModal(false);
    setActiveTab('garage');
  };

  // ── Check Win/Loss Conditions ─────────────────────────────────────────────
  useEffect(() => {
    if (isProcessing || flyingTokens.length > 0) return;

    const targetMet = remainingTargets.every(t => t.required === 0);
    if (targetMet) {
      setIsProcessing(true);
      setShowSuccessModal(true);
      addTools(50);
      addStars(1);
    } else if (movesRemaining === 0) {
      setIsProcessing(true);
      setShowDefeatModal(true);
    }
  }, [isProcessing, flyingTokens.length, remainingTargets, movesRemaining, addTools, addStars, handleResetBoard]);

  /**
   * Tracks the active pointer gesture.
   * Stored in a ref (not state) so reads inside event handlers are always
   * fresh without causing re-renders on every pixel of movement.
   * Shape: { row, col, startX, startY } | null
   */
  const dragRef = useRef(null);

  const lastTapRef = useRef({ row: -1, col: -1, time: 0 });

  // Stable ref so cascade useEffect always sees the latest grid without
  // being added to its dependency array (avoids infinite loops).
  const gridRef = useRef(grid);
  gridRef.current = grid;

  const scoreRef = useRef(score);
  scoreRef.current = score;

  const comboRef = useRef(comboCount);
  comboRef.current = comboCount;

  const revertTimer = useRef(null);
  const cascadeTimer = useRef(null);

  const handleTileCollected = useCallback((type, row, col) => {
    const activeTarget = targetsRef.current.find(t => t.type === type && t.required > 0);
    if (!activeTarget) return;

    const startCoords = getCellCoordinates(row, col);
    const tokenId = `token-${Date.now()}-${Math.random()}`;

    setFlyingTokens((prev) => [
      ...prev,
      {
        id: tokenId,
        type,
        startX: startCoords.x,
        startY: startCoords.y,
      }
    ]);
  }, [getCellCoordinates]);

  const collectTargets = useCallback((clearedCells, currentGrid) => {
    for (const cell of clearedCells) {
      const tile = currentGrid[cell.row]?.[cell.col];
      if (tile && tile.type) {
        handleTileCollected(tile.type);
      }
    }
  }, [handleTileCollected]);

  /**
   * Award points for a set of matches.
   * Combo multiplier: each successive cascade round doubles the points.
   */
  const awardPoints = useCallback((matchCount, cascade) => {
    const multiplier = Math.pow(2, cascade);
    const gained = matchCount * POINTS_PER_TILE * multiplier;
    setScore((s) => s + gained);
    addScore(gained);
    return gained;
  }, [addScore]);

  const resolveMatches = useCallback(async (currentGrid, lastSwapPos = null, combo = 0) => {
    const stringGrid = currentGrid.map((row) => row.map((cell) => cell?.type));
    const { matches, boosters } = checkForMatches(stringGrid, lastSwapPos);

    if (matches.length === 0) {
      setIsProcessing(false);
      return;
    }

    setIsProcessing(true);
    setComboCount(combo + 1);

    const explodedMatches = processExplosions(currentGrid, matches);
    collectTargets(explodedMatches, currentGrid);
    awardPoints(explodedMatches.length, combo);
    setMatchedSet(matchesToSet(explodedMatches));

    await new Promise((resolve) => setTimeout(resolve, MATCH_FLASH_MS));

    const settled = applyGravity(currentGrid, explodedMatches, boosters, levelConfig.gridDifficulty);

    setGrid(settled);
    setMatchedSet(new Set());

    await new Promise((resolve) => setTimeout(resolve, CASCADE_DELAY_MS));
    await resolveMatches(settled, null, combo + 1);
  }, [levelConfig.gridDifficulty, movesRemaining, awardPoints, addTools, addStars, collectTargets]);

  const attemptSwap = useCallback(
    async (a, b) => {
      setIsProcessing(true);
      setSwapping({ a, b });

      const swappedGrid = swapCells(gridRef.current, a, b);
      setGrid(swappedGrid);

      await new Promise((resolve) => setTimeout(resolve, REVERT_DELAY_MS));

      const typeA = gridRef.current[a.row]?.[a.col]?.type;
      const typeB = gridRef.current[b.row]?.[b.col]?.type;

      const isBoosterA = isBooster(typeA);
      const isBoosterB = isBooster(typeB);

      if (isBoosterA || isBoosterB) {
        setSwapping(null);
        setMovesRemaining((prev) => prev - 1);

        let cleared = [];
        if (typeA === 'COLOR_BOMB' && !isBooster(typeB)) {
          cleared = detonate(swappedGrid, b.row, b.col, typeB);
        } else if (typeB === 'COLOR_BOMB' && !isBooster(typeA)) {
          cleared = detonate(swappedGrid, a.row, a.col, typeA);
        } else {
          const visited = new Set();
          if (isBoosterA) cleared.push(...detonate(swappedGrid, b.row, b.col, null, visited));
          if (isBoosterB) cleared.push(...detonate(swappedGrid, a.row, a.col, null, visited));
        }

        const uniqueCleared = Array.from(new Set(cleared.map(c => `${c.row},${c.col}`)))
          .map(str => {
            const [r, c] = str.split(',').map(Number);
            return { row: r, col: c };
          });

        collectTargets(uniqueCleared, swappedGrid);
        awardPoints(uniqueCleared.length, 0);
        setMatchedSet(matchesToSet(uniqueCleared));

        await new Promise((resolve) => setTimeout(resolve, MATCH_FLASH_MS));

        const settled = applyGravity(swappedGrid, uniqueCleared, [], levelConfig.gridDifficulty);
        setGrid(settled);
        setMatchedSet(new Set());

        await new Promise((resolve) => setTimeout(resolve, CASCADE_DELAY_MS));
        await resolveMatches(settled, null, 1);
        return;
      }

      const stringGrid = swappedGrid.map((row) => row.map((cell) => cell.type));
      const { matches, boosters } = checkForMatches(stringGrid, b);

      if (matches.length > 0) {
        const explodedMatches = processExplosions(swappedGrid, matches);
        
        collectTargets(explodedMatches, swappedGrid);
        awardPoints(explodedMatches.length, 0);
        console.log(
          `[GameBoard] ✅ Match! ${explodedMatches.length} cells`,
          explodedMatches,
        );
        setMatchedSet(matchesToSet(explodedMatches));
        setSwapping(null);
        setComboCount(1);
        setMovesRemaining((prev) => prev - 1);

        await new Promise((resolve) => setTimeout(resolve, MATCH_FLASH_MS));

        const settled = applyGravity(swappedGrid, explodedMatches, boosters, levelConfig.gridDifficulty);
        setGrid(settled);
        setMatchedSet(new Set());

        await new Promise((resolve) => setTimeout(resolve, CASCADE_DELAY_MS));
        await resolveMatches(settled, null, 1);
      } else {
        console.log('[GameBoard] ❌ No match — reverting.');
        setGrid(swapCells(swappedGrid, a, b));
        setSwapping(null);
        await new Promise((resolve) => setTimeout(resolve, REVERT_DELAY_MS));
        setIsProcessing(false);
      }
    },
    [currentLevel, levelConfig.gridDifficulty, collectTargets, resolveMatches, awardPoints], // Re-bind swap handler when difficulty / level changes
  );

  // ── Pointer gesture handlers ──────────────────────────────────────────────

  /**
   * Record the pointer-down origin so we can compute direction on pointer-up.
   * Using setPointerCapture ensures the up-event fires on this element even
   * if the finger slides off it (critical for fast swipes on mobile).
   */
  const handlePointerDown = useCallback((e, row, col) => {
    if (isProcessing || movesRemaining <= 0 || score >= levelConfig.targetScore) return;

    // Guard against pointer-down on wall tiles or blockers
    const tile = grid[row]?.[col];
    if (!tile || tile.isWall || tile.type === 'empty' || isBlocker(tile.type)) return;

    const element = e.currentTarget;
    element.setPointerCapture(e.pointerId);
    
    const rect = element.getBoundingClientRect();
    dragRef.current = {
      row,
      col,
      startX: e.clientX,
      startY: e.clientY,
      cellWidth: rect.width,
      cellHeight: rect.height,
      element,
      lockedAxis: null,
    };

    // Visual highlight: raise layers and scale up
    element.style.zIndex = '30';
    animate(element, { scale: 1.08 }, { duration: 0.1, ease: 'easeOut' });
  }, [isProcessing, grid, movesRemaining, score, levelConfig.targetScore]);

  /**
   * Handle active pointer movement: locks axis and translates the tile.
   */
  const handlePointerMove = useCallback((e) => {
    const drag = dragRef.current;
    if (!drag || isProcessing) return;

    const deltaX = e.clientX - drag.startX;
    const deltaY = e.clientY - drag.startY;

    // Lock to dominant axis after a minor movement threshold (5px)
    if (!drag.lockedAxis) {
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const dist = Math.max(absX, absY);
      if (dist > 5) {
        drag.lockedAxis = absX > absY ? 'x' : 'y';
      }
    }

    let x = 0;
    let y = 0;

    if (drag.lockedAxis === 'x') {
      // Clamp drag distance to one cell width
      x = Math.max(-drag.cellWidth, Math.min(drag.cellWidth, deltaX));
    } else if (drag.lockedAxis === 'y') {
      // Clamp drag distance to one cell height
      y = Math.max(-drag.cellHeight, Math.min(drag.cellHeight, deltaY));
    }

    if (drag.lockedAxis) {
      drag.element.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.08)`;
    }
  }, [isProcessing]);

  /**
   * On pointer-up: compute delta, resolve swipe direction, fire the swap.
   */
  const handlePointerUp = useCallback((e) => {
    const drag = dragRef.current;
    if (!drag) return;

    try {
      drag.element.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Capture might already be released
    }

    dragRef.current = null;

    if (isProcessing) {
      // Snap back if the board was locked during release
      animate(drag.element, { x: 0, y: 0, scale: 1 }, { type: 'spring', stiffness: 300, damping: 25 })
        .then(() => {
          drag.element.style.zIndex = '';
          drag.element.style.transform = '';
        });
      return;
    }

    const deltaX = e.clientX - drag.startX;
    const deltaY = e.clientY - drag.startY;

    let target = null;
    let isSwapTriggered = false;

    if (drag.lockedAxis === 'x') {
      const percent = Math.abs(deltaX) / drag.cellWidth;
      if (percent >= 0.5) {
        const sign = Math.sign(deltaX);
        const targetCol = drag.col + sign;
        if (targetCol >= 0 && targetCol < GRID_COLS) {
          const targetTile = grid[drag.row]?.[targetCol];
          if (targetTile && !targetTile.isWall && targetTile.type !== 'empty') {
            target = { row: drag.row, col: targetCol };
          }
        }
      }
    } else if (drag.lockedAxis === 'y') {
      const percent = Math.abs(deltaY) / drag.cellHeight;
      if (percent >= 0.5) {
        const sign = Math.sign(deltaY);
        const targetRow = drag.row + sign;
        if (targetRow >= 0 && targetRow < GRID_ROWS) {
          const targetTile = grid[targetRow]?.[drag.col];
          if (targetTile && !targetTile.isWall && targetTile.type !== 'empty') {
            target = { row: targetRow, col: drag.col };
          }
        }
      }
    }

    if (target) {
      const targetTile = grid[target.row]?.[target.col];
      if (targetTile && isBlocker(targetTile.type)) {
        isSwapTriggered = false;
      } else {
        isSwapTriggered = true;
        // Immediately reset styles so layout transitions take over
        drag.element.style.zIndex = '';
        drag.element.style.transform = '';
        attemptSwap({ row: drag.row, col: drag.col }, target);
      }
    }

    if (!isSwapTriggered) {
      const dist = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      const tile = grid[drag.row]?.[drag.col];

      if (dist < 8 && tile && isBooster(tile.type)) {
        const now = Date.now();
        const prev = lastTapRef.current;
        if (prev.row === drag.row && prev.col === drag.col && now - prev.time < 350) {
          // 💥 Double Tap to Detonate Booster!
          setIsProcessing(true);
          setMovesRemaining((prev) => prev - 1);
          drag.element.style.zIndex = '';
          drag.element.style.transform = '';

          const cleared = detonate(grid, drag.row, drag.col);
          const uniqueCleared = Array.from(new Set(cleared.map(c => `${c.row},${c.col}`)))
            .map(str => {
              const [r, c] = str.split(',').map(Number);
              return { row: r, col: c };
            });

          collectTargets(uniqueCleared, grid);
          awardPoints(uniqueCleared.length, 0);
          setMatchedSet(matchesToSet(uniqueCleared));

          setTimeout(async () => {
            const settled = applyGravity(grid, uniqueCleared, [], levelConfig.gridDifficulty);
            setGrid(settled);
            setMatchedSet(new Set());

            await new Promise((resolve) => setTimeout(resolve, CASCADE_DELAY_MS));
            await resolveMatches(settled, null, 1);
          }, MATCH_FLASH_MS);

          // Reset
          lastTapRef.current = { row: -1, col: -1, time: 0 };
          return;
        } else {
          lastTapRef.current = { row: drag.row, col: drag.col, time: now };
        }
      } else {
        // Snap-back animation
        animate(drag.element, { x: 0, y: 0, scale: 1 }, { type: 'spring', stiffness: 300, damping: 25 })
          .then(() => {
            drag.element.style.zIndex = '';
            drag.element.style.transform = '';
          });
      }
    }
  }, [isProcessing, grid, attemptSwap, resolveMatches, awardPoints, levelConfig.gridDifficulty, collectTargets]);

  // ── Derived display values ────────────────────────────────────────────────

  const safeGrid = (grid && grid.length === 8) ? grid : mapLayoutToGrid(levelGrid);

  const targetMet = remainingTargets.every(t => t.required === 0);
  const showCombo  = comboCount > 1 && isProcessing;
  const statusText = isProcessing
    ? comboCount > 0
      ? `🔗 Combo ×${comboCount}!`
      : 'Checking…'
    : 'Swipe a tile to play';

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={`fixed grid grid-cols-1 justify-items-center content-start gap-4 select-none w-[380px] h-[520px] p-5 rounded-3xl bg-gradient-to-br ${levelConfig.backgroundStyle} border shadow-2xl transition-all duration-500 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden`}>

      {/* 🔄 Shuffling Notification */}
      <AnimatePresence>
        {shufflingNotification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2.5 bg-amber-500 text-slate-950 font-black rounded-full shadow-2xl border border-amber-300 text-xs tracking-wider uppercase flex items-center gap-1.5"
          >
            <span>🔄</span> No Moves! Shuffling...
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top UI HUD Header ─────────────────────────────────────────── */}
      <GameHUD
        currentLevel={currentLevel}
        remainingTargets={remainingTargets}
        movesRemaining={movesRemaining}
        targetRef={targetUiRef}
      />

      {/* ── 8×8 grid ────────────────────────────────────────────────────── */}
      <div
        ref={boardRef}
        className={`grid grid-cols-8 p-[6px] rounded-2xl bg-transparent overflow-hidden relative w-[316px] h-[316px] mx-auto ${isProcessing || movesRemaining === 0 ? 'pointer-events-none' : ''}`}
        role="grid"
        aria-label="Game board"
      >
        {/* Interactive Tiles Layer */}
        <AnimatePresence>
          {safeGrid.map((row, rIndex) =>
            row.map((tile, cIndex) => {
              if (!tile || tile.isWall) {
                return (
                  <div
                    key={`wall-empty-${rIndex}-${cIndex}`}
                    style={{
                      gridRowStart: rIndex + 1,
                      gridColumnStart: cIndex + 1,
                    }}
                    className="w-[38px] h-[38px] shrink-0 opacity-0 pointer-events-none"
                  />
                );
              }

              const cfg      = PART_CONFIG[tile.type] ?? PART_CONFIG.wrench;
              const isMatch  = matchedSet.has(`${rIndex},${cIndex}`);
              const isSwap   =
                swapping &&
                ((swapping.a.row === rIndex && swapping.a.col === cIndex) ||
                 (swapping.b.row === rIndex && swapping.b.col === cIndex));

              return (
                <div
                  key={`cell-wrapper-${rIndex}-${cIndex}`}
                  style={{
                    gridRowStart: rIndex + 1,
                    gridColumnStart: cIndex + 1,
                  }}
                  className="w-[38px] h-[38px] shrink-0 bg-slate-900/60 border border-slate-800/40 relative flex items-center justify-center shadow-inner"
                >
                  <motion.button
                    key={tile.id}
                    layout
                    initial={{ y: -150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ scale: 1.4, opacity: 0, rotate: 45 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 26,
                      exit: {
                        type: "tween",
                        ease: "easeOut",
                        duration: 0.22,
                      }
                    }}
                    id={`cell-${rIndex}-${cIndex}`}
                    role="gridcell"
                    aria-label={`${cfg.label} at row ${rIndex + 1} column ${cIndex + 1}`}
                    // Pointer events replace the old click-to-select model
                    onPointerDown={(e) => handlePointerDown(e, rIndex, cIndex)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    // Prevent touch scroll and fill the wrapper cell
                    style={{
                      touchAction: 'none',
                      position: 'absolute',
                      top: 1,
                      left: 1,
                      width: 'calc(100% - 2px)',
                      height: 'calc(100% - 2px)',
                    }}
                    className={[
                      'rounded-md z-20',
                      'font-bold cursor-grab active:cursor-grabbing',
                      'transition-all duration-150 hover:scale-105 hover:brightness-110',
                      // matched flash
                      isMatch
                        ? 'ring-2 ring-white scale-110 brightness-150 animate-pulse z-30'
                        : '',
                      // swap wobble
                      isSwap ? 'scale-90 opacity-70' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <GameTile type={tile.type} />
                  </motion.button>
                </div>
              );
            }),
          )}
        </AnimatePresence>
      </div>

      {/* ── Status bar / Reset button ──────────────────────────────────── */}
      <div className="flex flex-col items-center gap-2.5 w-full mt-1">
        <p
          className={[
            'text-xs tracking-wide transition-colors duration-200 text-center',
            targetMet
              ? 'text-emerald-400 font-bold animate-pulse'
              : movesRemaining <= 0
              ? 'text-rose-400 font-bold'
              : isProcessing
              ? 'text-yellow-400 font-semibold'
              : 'text-slate-500',
          ].join(' ')}
        >
          {targetMet
            ? '🎉 Target Met! Visit the Garage to restore your car!'
            : movesRemaining <= 0
            ? '😢 Out of moves! Reset board to try again.'
            : statusText}
        </p>

        {movesRemaining <= 0 && !targetMet && !isProcessing && (
          <button
            onClick={handleResetBoard}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-red-600 border border-rose-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-rose-600/20 active:scale-[0.98] transition-all hover:brightness-110"
          >
            Reset Board 🔄
          </button>
        )}
      </div>

      {/* ── Flying Tokens Layer ────────────────────────────────────────── */}
      <AnimatePresence>
        {flyingTokens.map((token) => {
          const dest = getTargetCoordinates();
          return (
            <motion.div
              key={token.id}
              initial={{ x: token.startX - 12, y: token.startY - 12, scale: 1, opacity: 1 }}
              animate={{ x: dest.x - 12, y: dest.y - 12, scale: 0.5, opacity: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onAnimationComplete={() => {
                // Decrement target count on arrival
                const next = targetsRef.current.map(t => {
                  if (t.type === token.type && t.required > 0) {
                    return { ...t, required: t.required - 1 };
                  }
                  return t;
                });
                targetsRef.current = next;
                setRemainingTargets(next);

                // Remove token from transiting array
                setFlyingTokens((prev) => prev.filter((t) => t.id !== token.id));
              }}
              style={{
                position: 'fixed',
                width: '24px',
                height: '24px',
                zIndex: 9999,
                pointerEvents: 'none',
              }}
            >
              <GameTile type={token.type} />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* ── Success Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        <LevelCompleteModal
          isOpen={showSuccessModal}
          score={score}
          backgroundStyle={levelConfig.backgroundStyle}
          onGoToGarage={handleGoToGarage}
        />
      </AnimatePresence>

      {/* ── Defeat Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        <DefeatModal
          isOpen={showDefeatModal}
          remainingTargets={remainingTargets}
          onReset={handleDefeatReset}
          onQuit={handleDefeatQuit}
        />
      </AnimatePresence>
    </div>
  );
}
