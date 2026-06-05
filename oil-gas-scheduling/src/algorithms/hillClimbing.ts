import type { Schedule, Well, Rig, OptimizationResult } from '../types.js'
import { calculateObjective, generateRandomSchedule } from '../utils.js'
import { getNeighbors } from '../neighbors.js'   // new import

/**
 * Hill Climbing with Random Restarts
 */
export function runHillClimbing(
  wells: Well[], 
  rigs: Rig[], 
  maxRestarts: number = 20,
  maxIterationsPerRestart: number = 100
): OptimizationResult {
  let bestSchedule: Schedule = generateRandomSchedule(wells, rigs)
  let bestScore = calculateObjective(bestSchedule, wells, rigs)
  let totalIterations = 0

  const bestScoreHistory: number[] = [bestScore]

  for (let restart = 0; restart < maxRestarts; restart++) {
    let currentSchedule: Schedule = generateRandomSchedule(wells, rigs)
    let currentScore = calculateObjective(currentSchedule, wells, rigs)

    for (let iter = 0; iter < maxIterationsPerRestart; iter++) {
      totalIterations++
      const neighbors = getNeighbors(currentSchedule, wells, rigs)
      
      let bestNeighbor = currentSchedule
      let bestNeighborScore = currentScore

      for (const neighbor of neighbors) {
        const score = calculateObjective(neighbor, wells, rigs)
        if (score > bestNeighborScore) {
          bestNeighbor = neighbor
          bestNeighborScore = score
        }
      }

      if (bestNeighborScore <= currentScore) {
        break // Local maximum reached
      }

      currentSchedule = bestNeighbor
      currentScore = bestNeighborScore

      if (currentScore > bestScore) {
        bestScore = currentScore
        bestSchedule = { ...currentSchedule }
      }
      bestScoreHistory.push(bestScore)
    }
  }

  return {
    schedule: bestSchedule,
    score: bestScore,
    totalTime: 0,
    totalTravel: 0,
    totalProduction: 0,
    iterations: totalIterations,
    algorithm: 'hillclimbing',
    bestScoreHistory
  }
}