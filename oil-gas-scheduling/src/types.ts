export interface Well {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'drilling' | 'workover';
  expectedProduction: number; // barrels/day or NPV score
  drillingTime: number; // days
  priority: number; // 1-10
  deadline: number; // days from now
}

export interface Rig {
  id: string;
  name: string;
  baseX: number;
  baseY: number;
  dailyCost: number;
  capabilities: ('drilling' | 'workover')[];
}

export interface Schedule {
  rigAssignments: Record<string, string[]>; // rigId -> array of wellIds (in sequence)
}

export interface OptimizationResult {
  schedule: Schedule;
  score: number; // higher is better
  totalTime: number;
  totalTravel: number;
  totalProduction: number;
  iterations: number;
  algorithm: string;
  bestScoreHistory?: number[]; // for visualization
}