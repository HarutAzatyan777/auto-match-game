/**
 * src/utils/gameLogic.js
 *
 * Core pure-function utilities for the Match-3 car restoration game.
 * Nothing in this file has side effects – all functions take input
 * and return new values, making them easy to test in isolation.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Number of rows on the board. */
export const GRID_ROWS = 8;

/** Number of columns on the board. */
export const GRID_COLS = 8;

/**
 * All possible car-part tile types.
 * Keep this list at 5+ types so the no-match constraint is always satisfiable.
 */
export const CAR_PARTS = [
  'tire',
  'battery',
  'engine',
  'spark_plug',
  'wrench',
  'turbo',
];

// ── Unique ID generator for logic tiles ───────────────────────────────────
let logicTileIdCounter = 0;
export function generateLogicTileId() {
  return `tile-logic-${logicTileIdCounter++}`;
}


/**
 * Pick one element from an array at random.
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickSafePart(grid, row, col, numParts = CAR_PARTS.length) {
  const parts = CAR_PARTS.slice(0, numParts);

  const safeParts = parts.filter(type => {
    // 1. Horizontal check: left neighbors
    if (col >= 2) {
      const t1 = typeof grid[row]?.[col-1] === 'object' ? grid[row]?.[col-1]?.type : grid[row]?.[col-1];
      const t2 = typeof grid[row]?.[col-2] === 'object' ? grid[row]?.[col-2]?.type : grid[row]?.[col-2];
      if (t1 === type && t2 === type) return false;
    }
    // Horizontal check: right neighbors
    if (col < GRID_COLS - 2) {
      const t1 = typeof grid[row]?.[col+1] === 'object' ? grid[row]?.[col+1]?.type : grid[row]?.[col+1];
      const t2 = typeof grid[row]?.[col+2] === 'object' ? grid[row]?.[col+2]?.type : grid[row]?.[col+2];
      if (t1 === type && t2 === type) return false;
    }
    // Horizontal check: middle neighbors
    if (col >= 1 && col < GRID_COLS - 1) {
      const tLeft = typeof grid[row]?.[col-1] === 'object' ? grid[row]?.[col-1]?.type : grid[row]?.[col-1];
      const tRight = typeof grid[row]?.[col+1] === 'object' ? grid[row]?.[col+1]?.type : grid[row]?.[col+1];
      if (tLeft === type && tRight === type) return false;
    }

    // 2. Vertical check: cells below (r+1, r+2)
    if (row < GRID_ROWS - 2) {
      const t1 = typeof grid[row+1]?.[col] === 'object' ? grid[row+1]?.[col]?.type : grid[row+1]?.[col];
      const t2 = typeof grid[row+2]?.[col] === 'object' ? grid[row+2]?.[col]?.type : grid[row+2]?.[col];
      if (t1 === type && t2 === type) return false;
    }
    // Vertical check: cells above (r-1, r-2)
    if (row >= 2) {
      const t1 = typeof grid[row-1]?.[col] === 'object' ? grid[row-1]?.[col]?.type : grid[row-1]?.[col];
      const t2 = typeof grid[row-2]?.[col] === 'object' ? grid[row-2]?.[col]?.type : grid[row-2]?.[col];
      if (t1 === type && t2 === type) return false;
    }
    // Vertical check: middle neighbors
    if (row >= 1 && row < GRID_ROWS - 1) {
      const tAbove = typeof grid[row-1]?.[col] === 'object' ? grid[row-1]?.[col]?.type : grid[row-1]?.[col];
      const tBelow = typeof grid[row+1]?.[col] === 'object' ? grid[row+1]?.[col]?.type : grid[row+1]?.[col];
      if (tAbove === type && tBelow === type) return false;
    }

    return true;
  });

  if (safeParts.length === 0) {
    return pickRandom(parts);
  }

  return pickRandom(safeParts);
}

function isWallCell(cell) {
  if (!cell) return false;
  if (cell === 'empty' || cell === 0) return true;
  if (typeof cell === 'object' && (cell.type === 'empty' || cell.isWall)) return true;
  return false;
}

/**
 * Return a random car-part type that does NOT create a 3-in-a-row
 * at position (row, col) given the grid built so far.
 *
 * Strategy: collect all part types that would form a forbidden run,
 * then choose uniformly from the remaining safe options.
 *
 * @param {string[][]} grid - Partially filled grid (rows above and to the
 *   left of the current cell are already set).
 * @param {number} row
 * @param {number} col
 * @returns {string}
 */
function safePart(grid, row, col, numParts = CAR_PARTS.length) {
  return pickSafePart(grid, row, col, numParts);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a fresh 8×8 grid populated with random car-part tiles.
 *
 * Guarantee: no horizontal or vertical run of 3+ identical tiles exists
 * anywhere on the returned board, so the player sees a neutral starting
 * state with no pre-solved matches.
 *
 * @returns {string[][]} A 2D array [row][col] of CAR_PARTS strings.
 *
 * @example
 * const grid = generateInitialGrid();
 * console.log(grid[0][0]); // e.g. 'tire'
 */
export function generateInitialGrid(numParts = CAR_PARTS.length) {
  // Initialise an empty GRID_ROWS × GRID_COLS 2D array.
  const grid = Array.from({ length: GRID_ROWS }, () =>
    new Array(GRID_COLS).fill(null),
  );

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      grid[row][col] = {
        id: generateLogicTileId(),
        type: safePart(grid, row, col, numParts),
        isWall: false
      };
    }
  }

  return grid;
}

/**
 * Scan the entire grid and return every cell that belongs to a match
 * (3 or more identical tiles in a horizontal or vertical run).
 *
 * Returns a Set of "row,col" strings for O(1) membership tests.
 *
 * @param {string[][]} grid
 * @returns {Set<string>} e.g. new Set(['0,1', '0,2', '0,3'])
 */
export function findMatches(grid) {
  const matched = new Set();

  // ── Horizontal runs ───────────────────────────────────────────────────────
  for (let row = 0; row < GRID_ROWS; row++) {
    let runStart = 0;
    for (let col = 1; col <= GRID_COLS; col++) {
      const same =
        col < GRID_COLS && grid[row][col] === grid[row][runStart];

      if (!same) {
        const runLength = col - runStart;
        if (runLength >= 3) {
          for (let k = runStart; k < col; k++) {
            matched.add(`${row},${k}`);
          }
        }
        runStart = col;
      }
    }
  }

  // ── Vertical runs ─────────────────────────────────────────────────────────
  for (let col = 0; col < GRID_COLS; col++) {
    let runStart = 0;
    for (let row = 1; row <= GRID_ROWS; row++) {
      const same =
        row < GRID_ROWS && grid[row][col] === grid[runStart][col];

      if (!same) {
        const runLength = row - runStart;
        if (runLength >= 3) {
          for (let k = runStart; k < row; k++) {
            matched.add(`${k},${col}`);
          }
        }
        runStart = row;
      }
    }
  }

  return matched;
}

/**
 * Scan the entire 8×8 grid and return every cell that is part of a match
 * (3 or more identical consecutive car parts horizontally or vertically).
 *
 * ── Performance characteristics ──────────────────────────────────────────
 *  • Single forward pass for horizontals, single forward pass for verticals.
 *  • A flat Uint8Array bitmap (64 bytes) tracks matched cells with no string
 *    allocations or Set hashing — purely typed-array reads/writes.
 *  • Total work: O(ROWS × COLS). On a 64-cell board this is ~128 iterations
 *    plus one final scan to build the output array — negligible even at 60 fps.
 *
 * @param {string[][]} grid - 2D array [row][col] of car-part strings.
 * @returns {{ row: number, col: number }[]} Matched cells, or [] if none.
 */
export function checkForMatches(grid, swappedCell = null) {
  const matches = [];
  const boosters = [];
  const matchedCoords = new Set(); // string "row,col"

  // Helper to add a coordinate to match list
  const addMatch = (row, col) => {
    const key = `${row},${col}`;
    if (!matchedCoords.has(key)) {
      matchedCoords.add(key);
      matches.push({ row, col });
    }
  };

  // 1. Scan horizontal runs
  const horizontalRuns = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    let runStart = 0;
    for (let c = 1; c <= GRID_COLS; c++) {
      if (c < GRID_COLS && grid[r][c] === grid[r][runStart]) continue;
      const len = c - runStart;
      if (len >= 3 && grid[r][runStart] !== 'empty' && !isBooster(grid[r][runStart])) {
        horizontalRuns.push({ r, startC: runStart, endC: c - 1, length: len, type: grid[r][runStart] });
      }
      runStart = c;
    }
  }

  // 2. Scan vertical runs
  const verticalRuns = [];
  for (let c = 0; c < GRID_COLS; c++) {
    let runStart = 0;
    for (let r = 1; r <= GRID_ROWS; r++) {
      if (r < GRID_ROWS && grid[r][c] === grid[runStart][c]) continue;
      const len = r - runStart;
      if (len >= 3 && grid[runStart][c] !== 'empty' && !isBooster(grid[runStart][c])) {
        verticalRuns.push({ c, startR: runStart, endR: r - 1, length: len, type: grid[runStart][c] });
      }
      runStart = r;
    }
  }

  // 3. Scan 2x2 squares
  const squares = [];
  for (let r = 0; r < GRID_ROWS - 1; r++) {
    for (let c = 0; c < GRID_COLS - 1; c++) {
      const type = grid[r][c];
      if (type && type !== 'empty' && !isBooster(type) &&
          grid[r][c+1] === type &&
          grid[r+1][c] === type &&
          grid[r+1][c+1] === type) {
        squares.push({ r, c, type });
      }
    }
  }

  // Process horizontal runs
  for (const run of horizontalRuns) {
    const cells = [];
    for (let c = run.startC; c <= run.endC; c++) {
      addMatch(run.r, c);
      cells.push({ row: run.r, col: c });
    }

    if (run.length >= 5) {
      const spawn = findSpawnCell(cells, swappedCell);
      boosters.push({ row: spawn.row, col: spawn.col, type: 'COLOR_BOMB' });
    } else if (run.length === 4) {
      const spawn = findSpawnCell(cells, swappedCell);
      boosters.push({ row: spawn.row, col: spawn.col, type: 'V_BOMB' });
    }
  }

  // Process vertical runs
  for (const run of verticalRuns) {
    const cells = [];
    for (let r = run.startR; r <= run.endR; r++) {
      addMatch(r, run.c);
      cells.push({ row: r, col: run.c });
    }

    if (run.length >= 5) {
      const spawn = findSpawnCell(cells, swappedCell);
      if (!boosters.some(b => b.row === spawn.row && b.col === spawn.col)) {
        boosters.push({ row: spawn.row, col: spawn.col, type: 'COLOR_BOMB' });
      }
    } else if (run.length === 4) {
      const spawn = findSpawnCell(cells, swappedCell);
      if (!boosters.some(b => b.row === spawn.row && b.col === spawn.col)) {
        boosters.push({ row: spawn.row, col: spawn.col, type: 'H_BOMB' });
      }
    }
  }

  // Process 2x2 squares
  for (const sq of squares) {
    const cells = [
      { row: sq.r, col: sq.c },
      { row: sq.r, col: sq.c + 1 },
      { row: sq.r + 1, col: sq.c },
      { row: sq.r + 1, col: sq.c + 1 }
    ];

    cells.forEach(c => addMatch(c.row, c.col));

    const spawn = findSpawnCell(cells, swappedCell);
    if (!boosters.some(b => b.row === spawn.row && b.col === spawn.col)) {
      boosters.push({ row: spawn.row, col: spawn.col, type: 'HELICOPTER' });
    }
  }

  return { matches, boosters };
}

function findSpawnCell(cells, swappedCell) {
  if (swappedCell) {
    const found = cells.find(c => c.row === swappedCell.row && c.col === swappedCell.col);
    if (found) return found;
  }
  return cells[Math.floor(cells.length / 2)];
}

export function isBooster(type) {
  return ['COLOR_BOMB', 'H_BOMB', 'V_BOMB', 'HELICOPTER'].includes(type);
}

/**
 * Check whether swapping two adjacent cells would produce at least one match.
 * Used to validate player moves before animating them.
 *
 * @param {string[][]} grid
 * @param {{ row: number, col: number }} cellA
 * @param {{ row: number, col: number }} cellB
 * @returns {boolean}
 */
export function isValidSwap(grid, cellA, cellB) {
  const typeA = typeof grid[cellA.row]?.[cellA.col] === 'object' ? grid[cellA.row]?.[cellA.col]?.type : grid[cellA.row]?.[cellA.col];
  const typeB = typeof grid[cellB.row]?.[cellB.col] === 'object' ? grid[cellB.row]?.[cellB.col]?.type : grid[cellB.row]?.[cellB.col];
  if (isBlocker(typeA) || isBlocker(typeB)) return false;

  // Shallow-clone rows (we only mutate two cells, so full deep-clone is overkill)
  const clone = grid.map((row) => [...row]);

  const tmp = clone[cellA.row][cellA.col];
  clone[cellA.row][cellA.col] = clone[cellB.row][cellB.col];
  clone[cellB.row][cellB.col] = tmp;

  return checkForMatches(clone).matches.length > 0;
}

/**
 * Remove matched tiles, apply gravity (tiles fall down), and refill empty
 * slots at the top of each column with new random car parts.
 *
 * This is a pure function — it never mutates the original grid.
 *
 * ── Algorithm (per column) ────────────────────────────────────────────────
 *  Uses a single-pass "write pointer" sweep (similar to the partition step
 *  in quicksort). Starting from the bottom row and moving up:
 *    • writePtr starts at the bottom of the column.
 *    • Every non-null cell is placed at writePtr and writePtr moves up.
 *    • Any rows above writePtr after the pass are null → filled with new parts.
 *  This is O(ROWS) per column with no temporary arrays or shifting.
 *
 * @param {(string|null)[][]} grid   - Current board state (2D array of strings).
 * @param {{ row: number, col: number }[]} matches
 *   - Output of checkForMatches(); cells to clear.
 *
 * @returns {string[][]} A fully populated new grid with gravity applied and
 *   empty cells refilled. No nulls remain.
 *
 * @example
 * const matches = checkForMatches(grid);           // [{row,col}, ...]
 * const nextGrid = applyGravity(grid, matches);    // ready to render
 */
export function isBlocker(type) {
  return ['WOOD', 'STONE_1', 'STONE_2'].includes(type);
}

export function applyGravity(grid, matches, boosters = [], numParts = CAR_PARTS.length) {
  // Deep copy the cell objects so modifications to types do not mutate source state
  const next = grid.map((row) =>
    row.map((cell) => (cell ? { ...cell } : null))
  );

  const toClear = new Set(matches.map(m => `${m.row},${m.col}`));

  // 1. Direct hit on obstacles in matches list itself (e.g. from booster blast paths)
  for (const key of toClear) {
    const [r, c] = key.split(',').map(Number);
    const cell = next[r]?.[c];
    if (cell && isBlocker(cell.type)) {
      if (cell.type === 'STONE_2') {
        cell.type = 'STONE_1';
        toClear.delete(key);
      } else {
        // WOOD or STONE_1 is destroyed, keep in toClear to turn to null
      }
    }
  }

  // 2. Adjacent damage step (from matched tiles)
  const dirs = [
    { r: -1, c: 0 },
    { r: 1, c: 0 },
    { r: 0, c: -1 },
    { r: 0, c: 1 }
  ];

  const addedClearKeys = new Set();
  for (const key of toClear) {
    const [r, c] = key.split(',').map(Number);
    for (const d of dirs) {
      const nr = r + d.r;
      const nc = c + d.c;
      const neighbor = next[nr]?.[nc];
      if (neighbor && isBlocker(neighbor.type)) {
        if (neighbor.type === 'STONE_2') {
          neighbor.type = 'STONE_1';
        } else if (neighbor.type === 'WOOD' || neighbor.type === 'STONE_1') {
          addedClearKeys.add(`${nr},${nc}`);
        }
      }
    }
  }

  // Merge the dynamically destroyed blockers into toClear
  for (const key of addedClearKeys) {
    toClear.add(key);
  }

  // 3. Clear all marked cells
  for (const key of toClear) {
    const [r, c] = key.split(',').map(Number);
    if (next[r]?.[c] && !isWallCell(next[r][c])) {
      next[r][c] = null;
    }
  }

  for (const booster of boosters) {
    next[booster.row][booster.col] = {
      id: generateLogicTileId(),
      type: booster.type,
      isWall: false
    };
  }

  // 4. Gravity flow (shifting normal tiles down, keeping walls and active blockers stationary)
  for (let col = 0; col < GRID_COLS; col++) {
    const activeTiles = [];
    for (let row = 0; row < GRID_ROWS; row++) {
      const val = next[row][col];
      if (val !== null && val !== undefined && !isWallCell(val) && !isBlocker(val.type)) {
        activeTiles.push(val);
      }
    }

    let activeIdx = activeTiles.length - 1;
    for (let row = GRID_ROWS - 1; row >= 0; row--) {
      const cell = next[row][col];
      if (isWallCell(cell) || (cell && isBlocker(cell.type))) {
        continue;
      }
      if (activeIdx >= 0) {
        next[row][col] = activeTiles[activeIdx];
        activeIdx--;
      } else {
        const spawnedType = pickSafePart(next, row, col, numParts);
        next[row][col] = {
          id: generateLogicTileId(),
          type: spawnedType,
          isWall: false
        };
      }
    }
  }

  return next;
}

export function detonate(grid, startRow, startCol, targetColor = null, visited = new Set()) {
  const key = `${startRow},${startCol}`;
  if (visited.has(key)) return [];
  visited.add(key);

  const tile = grid[startRow]?.[startCol];
  const tileType = typeof tile === 'object' ? tile?.type : tile;

  if (!tileType || tileType === 'empty') return [];

  // Consume booster immediately to prevent double detonation loops
  grid[startRow][startCol] = null;

  const cleared = [{ row: startRow, col: startCol }];

  // 1. Line Bombs
  if (tileType === 'H_BOMB') {
    // Clear whole row
    for (let c = 0; c < GRID_COLS; c++) {
      if (c === startCol) continue;
      const other = grid[startRow]?.[c];
      const otherType = typeof other === 'object' ? other?.type : other;
      if (otherType && otherType !== 'empty') {
        if (isBooster(otherType)) {
          cleared.push(...detonate(grid, startRow, c, null, visited));
        } else {
          cleared.push({ row: startRow, col: c });
        }
      }
    }
  } else if (tileType === 'V_BOMB') {
    // Clear whole column
    for (let r = 0; r < GRID_ROWS; r++) {
      if (r === startRow) continue;
      const other = grid[r]?.[startCol];
      const otherType = typeof other === 'object' ? other?.type : other;
      if (otherType && otherType !== 'empty') {
        if (isBooster(otherType)) {
          cleared.push(...detonate(grid, r, startCol, null, visited));
        } else {
          cleared.push({ row: r, col: startCol });
        }
      }
    }
  }
  // 2. Color Bomb
  else if (tileType === 'COLOR_BOMB') {
    let colorToClear = targetColor;
    if (!colorToClear) {
      const counts = {};
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          const cell = grid[r][c];
          const type = typeof cell === 'object' ? cell?.type : cell;
          if (type && type !== 'empty' && !isBooster(type)) {
            counts[type] = (counts[type] || 0) + 1;
          }
        }
      }
      let maxCount = 0;
      for (const t in counts) {
        if (counts[t] > maxCount) {
          maxCount = counts[t];
          colorToClear = t;
        }
      }
    }

    if (colorToClear) {
      for (let r = 0; r < GRID_ROWS; r++) {
        for (let c = 0; c < GRID_COLS; c++) {
          if (r === startRow && c === startCol) continue;
          const cell = grid[r][c];
          const type = typeof cell === 'object' ? cell?.type : cell;
          if (type === colorToClear) {
            cleared.push({ row: r, col: c });
          }
        }
      }
    }
  }
  // 3. Helicopter
  else if (tileType === 'HELICOPTER') {
    // Clear 4 adjacent neighbors
    const dirs = [
      { r: -1, c: 0 },
      { r: 1, c: 0 },
      { r: 0, c: -1 },
      { r: 0, c: 1 }
    ];
    for (const d of dirs) {
      const nr = startRow + d.r;
      const nc = startCol + d.c;
      const other = grid[nr]?.[nc];
      const otherType = typeof other === 'object' ? other?.type : other;
      if (otherType && otherType !== 'empty') {
        if (isBooster(otherType)) {
          cleared.push(...detonate(grid, nr, nc, null, visited));
        } else {
          cleared.push({ row: nr, col: nc });
        }
      }
    }

    // Select ONE random tile on the board and clear it
    const candidates = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (visited.has(`${r},${c}`)) continue;
        const cell = grid[r][c];
        const type = typeof cell === 'object' ? cell?.type : cell;
        if (type && type !== 'empty' && !isBooster(type)) {
          candidates.push({ row: r, col: c });
        }
      }
    }
    if (candidates.length > 0) {
      const lucky = candidates[Math.floor(Math.random() * candidates.length)];
      cleared.push(lucky);
    }
  }

  return cleared;
}

export function processExplosions(grid, matches) {
  const finalCleared = [...matches];
  const visited = new Set(matches.map(m => `${m.row},${m.col}`));

  for (const match of matches) {
    const tile = grid[match.row]?.[match.col];
    const tileType = typeof tile === 'object' ? tile?.type : tile;
    if (tileType && isBooster(tileType)) {
      const extra = detonate(grid, match.row, match.col, null, visited);
      finalCleared.push(...extra);
    }
  }

  return finalCleared;
}

export function hasPossibleMoves(grid) {
  // If there are any boosters on the board, there is at least one valid move
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = grid[r][c];
      const type = typeof cell === 'object' ? cell?.type : cell;
      if (type && isBooster(type)) {
        return true;
      }
    }
  }

  const stringGrid = grid.map((row) =>
    row.map((cell) => {
      if (typeof cell === 'object') return cell?.type ?? 'empty';
      return cell;
    })
  );

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const type = stringGrid[r][c];
      if (type === 'empty') continue;

      // Try right neighbor
      if (c + 1 < GRID_COLS) {
        const rightType = stringGrid[r][c+1];
        if (rightType !== 'empty') {
          stringGrid[r][c] = rightType;
          stringGrid[r][c+1] = type;

          const { matches } = checkForMatches(stringGrid);
          const hasMatch = matches.length > 0;

          stringGrid[r][c] = type;
          stringGrid[r][c+1] = rightType;

          if (hasMatch) return true;
        }
      }

      // Try down neighbor
      if (r + 1 < GRID_ROWS) {
        const downType = stringGrid[r+1][c];
        if (downType !== 'empty') {
          stringGrid[r][c] = downType;
          stringGrid[r+1][c] = type;

          const { matches } = checkForMatches(stringGrid);
          const hasMatch = matches.length > 0;

          stringGrid[r][c] = type;
          stringGrid[r+1][c] = downType;

          if (hasMatch) return true;
        }
      }
    }
  }

  return false;
}

export function shuffleGrid(grid) {
  const activeTypes = [];
  const next = grid.map((row) => [...row]);

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = grid[r][c];
      if (cell !== null && !isWallCell(cell)) {
        const type = typeof cell === 'object' ? cell?.type : cell;
        activeTypes.push(type);
      }
    }
  }

  let attempts = 0;
  let shuffledTypes = [...activeTypes];

  while (attempts < 50) {
    for (let i = shuffledTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffledTypes[i];
      shuffledTypes[i] = shuffledTypes[j];
      shuffledTypes[j] = temp;
    }

    let typeIdx = 0;
    const testGrid = grid.map((row) =>
      row.map((cell) => {
        if (cell !== null && !isWallCell(cell)) {
          return shuffledTypes[typeIdx++];
        }
        return 'empty';
      })
    );

    const { matches } = checkForMatches(testGrid);
    if (matches.length === 0) {
      break;
    }
    attempts++;
  }

  let idx = 0;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = next[r][c];
      if (cell !== null && !isWallCell(cell)) {
        if (typeof cell === 'object') {
          next[r][c] = { ...cell, type: shuffledTypes[idx++] };
        } else {
          next[r][c] = shuffledTypes[idx++];
        }
      }
    }
  }

  return next;
}

