// ---------------------------------------------------------------------------
// src/config/levels.js
// ---------------------------------------------------------------------------

import { generateLevelData } from '../utils/LevelGenerator';

export const worlds = [
  { id: 1, name: "Old Garage", levels: Array.from({ length: 5 }) },
  { id: 2, name: "Modern Workshop", levels: Array.from({ length: 5 }) },
  { id: 3, name: "Luxury Studio", levels: Array.from({ length: 5 }) },
];

export function getLevelConfig(levelNumber) {
  return generateLevelData(levelNumber);
}
