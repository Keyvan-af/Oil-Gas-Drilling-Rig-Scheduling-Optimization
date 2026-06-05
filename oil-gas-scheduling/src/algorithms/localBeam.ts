import type { Schedule, Well, Rig, OptimizationResult } from '../types.js';
import { calculateObjective, generateRandomSchedule } from '../utils.js';
import { getNeighbors } from '../neighbors.js';

export function runLocalBeam(
  wells: Well[],
  rigs: Rig[],
  beamWidth: number = 5,
  maxIterations: number = 200
): OptimizationResult {
  // Initialize beam with random schedules
  let beam: Schedule[] = [];
  for (let i = 0; i < beamWidth; i++) {
    beam.push(generateRandomSchedule(wells, rigs));
  }

  let bestSchedule = beam[0];
  let bestScore = calculateObjective(bestSchedule, wells, rigs);
  let totalIterations = 0;

  for (let iter = 0; iter < maxIterations; iter++) {
    totalIterations++;
    // Generate all neighbors from all states in beam
    const allNeighbors: { schedule: Schedule; score: number }[] = [];
    for (const state of beam) {
      const neighbors = getNeighbors(state, wells, rigs);
      for (const neighbor of neighbors) {
        const score = calculateObjective(neighbor, wells, rigs);
        allNeighbors.push({ schedule: neighbor, score });
      }
    }

    // Sort by descending score and take best distinct beamWidth schedules
    allNeighbors.sort((a, b) => b.score - a.score);
    const uniqueSchedules: Schedule[] = [];
    const seenKeys = new Set<string>();
    for (const item of allNeighbors) {
      const key = JSON.stringify(item.schedule.rigAssignments);
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueSchedules.push(item.schedule);
        if (uniqueSchedules.length === beamWidth) break;
      }
    }

    if (uniqueSchedules.length === 0) break;

    // Update beam
    beam = uniqueSchedules;

    // Update global best
    for (const state of beam) {
      const score = calculateObjective(state, wells, rigs);
      if (score > bestScore) {
        bestScore = score;
        bestSchedule = { ...state };
      }
    }

    // Optional: check for convergence (if best score unchanged for several iterations)
  }

  return {
    schedule: bestSchedule,
    score: bestScore,
    totalTime: 0,
    totalTravel: 0,
    totalProduction: 0,
    iterations: totalIterations,
    algorithm: 'local-beam',
  };
}