import type { Schedule, Well, Rig, OptimizationResult } from '../types';
import { calculateObjective } from '../utils';

// Helper: decode an order of well IDs into a Schedule (assign wells to rigs sequentially)
function decodeOrder(order: string[], wells: Well[], rigs: Rig[]): Schedule {
  const rigAssignments: Record<string, string[]> = {};
  rigs.forEach(rig => { rigAssignments[rig.id] = []; });
  
  // Keep track of last used rig index for round-robin
  let rigIndex = 0;
  const suitableRigsForWell = (well: Well) => rigs.filter(rig => rig.capabilities.includes(well.type));
  
  for (const wellId of order) {
    const well = wells.find(w => w.id === wellId)!;
    const suitable = suitableRigsForWell(well);
    if (suitable.length === 0) continue; // should not happen in valid data
    // Round-robin among suitable rigs
    const selectedRig = suitable[rigIndex % suitable.length];
    rigAssignments[selectedRig.id].push(wellId);
    rigIndex++;
  }
  return { rigAssignments };
}

// Helper: generate random order (permutation)
function randomOrder(wells: Well[]): string[] {
  const order = wells.map(w => w.id);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

// Type 1: Order Crossover (OX)
function crossoverOX(parent1: string[], parent2: string[]): string[] {
  const size = parent1.length;
  const start = Math.floor(Math.random() * size);
  const end = Math.floor(Math.random() * (size - start)) + start;
  const child = new Array(size).fill(null);
  // Copy segment from parent1
  for (let i = start; i <= end; i++) {
    child[i] = parent1[i];
  }
  // Fill remaining from parent2 in order
  let currentIndex = 0;
  for (let i = 0; i < size; i++) {
    if (child[i] !== null) continue;
    while (child.includes(parent2[currentIndex])) currentIndex++;
    child[i] = parent2[currentIndex];
    currentIndex++;
  }
  return child;
}

// Type 2: Partially Mapped Crossover (PMX)
function crossoverPMX(parent1: string[], parent2: string[]): string[] {
  const size = parent1.length;
  const start = Math.floor(Math.random() * size);
  const end = Math.floor(Math.random() * (size - start)) + start;
  const child = [...parent1];
  const mapping = new Map<string, string>();
  // Build mapping
  for (let i = start; i <= end; i++) {
    mapping.set(parent1[i], parent2[i]);
    mapping.set(parent2[i], parent1[i]);
  }
  // Apply mapping outside segment
  for (let i = 0; i < size; i++) {
    if (i >= start && i <= end) {
      child[i] = parent2[i];
    } else {
      let val = parent1[i];
      while (mapping.has(val)) {
        val = mapping.get(val)!;
      }
      child[i] = val;
    }
  }
  return child;
}

// Mutation: swap two random positions (for Type 1)
function mutateSwap(order: string[], mutationRate: number): string[] {
  const mutated = [...order];
  if (Math.random() < mutationRate) {
    const i = Math.floor(Math.random() * mutated.length);
    let j = Math.floor(Math.random() * mutated.length);
    while (j === i) j = Math.floor(Math.random() * mutated.length);
    [mutated[i], mutated[j]] = [mutated[j], mutated[i]];
  }
  return mutated;
}

// Mutation: inversion (reverse a subsequence) for Type 2
function mutateInversion(order: string[], mutationRate: number): string[] {
  const mutated = [...order];
  if (Math.random() < mutationRate) {
    let start = Math.floor(Math.random() * mutated.length);
    let end = Math.floor(Math.random() * mutated.length);
    if (start > end) [start, end] = [end, start];
    const reversed = mutated.slice(start, end + 1).reverse();
    for (let i = start; i <= end; i++) mutated[i] = reversed[i - start];
  }
  return mutated;
}

// Common GA driver
function runGeneticAlgorithm(
  wells: Well[],
  rigs: Rig[],
  populationSize: number,
  generations: number,
  crossoverFn: (a: string[], b: string[]) => string[],
  mutationFn: (order: string[], rate: number) => string[],
  mutationRate: number,
  elitismCount: number = 2
): OptimizationResult {
  // Initialize population
  let population: string[][] = [];
  for (let i = 0; i < populationSize; i++) {
    population.push(randomOrder(wells));
  }

  let bestSchedule: Schedule | null = null;
  let bestScore = -Infinity;
  let totalIterations = 0;

  for (let gen = 0; gen < generations; gen++) {
    totalIterations++;
    // Evaluate fitness
    const fitness: { order: string[]; score: number }[] = population.map(order => {
      const schedule = decodeOrder(order, wells, rigs);
      const score = calculateObjective(schedule, wells, rigs);
      return { order, score };
    });
    fitness.sort((a, b) => b.score - a.score);

    // Update global best
    if (fitness[0].score > bestScore) {
      bestScore = fitness[0].score;
      bestSchedule = decodeOrder(fitness[0].order, wells, rigs);
    }

    // Build next generation
    const nextGen: string[][] = [];
    // Elitism
    for (let i = 0; i < elitismCount && i < fitness.length; i++) {
      nextGen.push([...fitness[i].order]);
    }

    // Selection (roulette wheel based on fitness)
    const totalFitness = fitness.reduce((sum, f) => sum + Math.max(0, f.score), 0);
    const select = () => {
      let rand = Math.random() * totalFitness;
      let accum = 0;
      for (const f of fitness) {
        accum += Math.max(0, f.score);
        if (rand <= accum) return f.order;
      }
      return fitness[0].order;
    };

    while (nextGen.length < populationSize) {
      const parent1 = select();
      const parent2 = select();
      let child = crossoverFn(parent1, parent2);
      child = mutationFn(child, mutationRate);
      nextGen.push(child);
    }
    population = nextGen;
  }

  return {
    schedule: bestSchedule!,
    score: bestScore,
    totalTime: 0,
    totalTravel: 0,
    totalProduction: 0,
    iterations: totalIterations,
    algorithm: 'genetic',
  };
}

// Type 1 GA (Order Crossover + Swap Mutation)
export function runGeneticAlgorithmType1(
  wells: Well[],
  rigs: Rig[],
  populationSize: number = 50,
  generations: number = 100
): OptimizationResult {
  return runGeneticAlgorithm(
    wells, rigs, populationSize, generations,
    crossoverOX, mutateSwap, 0.1, 2
  );
}

// Type 2 GA (PMX + Inversion Mutation)
export function runGeneticAlgorithmType2(
  wells: Well[],
  rigs: Rig[],
  populationSize: number = 50,
  generations: number = 100
): OptimizationResult {
  return runGeneticAlgorithm(
    wells, rigs, populationSize, generations,
    crossoverPMX, mutateInversion, 0.1, 2
  );
}