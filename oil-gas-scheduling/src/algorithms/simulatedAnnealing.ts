import type { Schedule, Well, Rig, OptimizationResult } from '../types.js';
import { calculateObjective, generateRandomSchedule } from '../utils.js';
import { getNeighbors } from '../neighbors.js';

export function runSimulatedAnnealing(
  wells: Well[],
  rigs: Rig[],
  maxIterations: number = 5000,
  initialTemp: number = 1000,
  coolingRate: number = 0.995
): OptimizationResult {
  let currentSchedule = generateRandomSchedule(wells, rigs);
  let currentScore = calculateObjective(currentSchedule, wells, rigs);
  let bestSchedule = { ...currentSchedule };
  let bestScore = currentScore;
  let temperature = initialTemp;
  let totalIterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    totalIterations++;
    const neighbors = getNeighbors(currentSchedule, wells, rigs);
    if (neighbors.length === 0) break;

    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    const neighborScore = calculateObjective(randomNeighbor, wells, rigs);
    const delta = neighborScore - currentScore;

    // Accept if better, or with probability exp(delta / temperature) if worse
    if (delta > 0 || Math.random() < Math.exp(delta / temperature)) {
      currentSchedule = randomNeighbor;
      currentScore = neighborScore;
      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestSchedule = { ...currentSchedule };
      }
    }

    temperature *= coolingRate;
    if (temperature < 0.01) break;
  }

  return {
    schedule: bestSchedule,
    score: bestScore,
    totalTime: 0,
    totalTravel: 0,
    totalProduction: 0,
    iterations: totalIterations,
    algorithm: 'simulated-annealing',
  };
}