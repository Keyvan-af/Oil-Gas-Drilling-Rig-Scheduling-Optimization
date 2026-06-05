import type { Well, Rig, Schedule } from './types.js';

export function euclideanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function calculateObjective(schedule: Schedule, wells: Well[], rigs: Rig[]): number {
  let totalProduction = 0;
  let totalTime = 0;
  let totalTravel = 0;
  let penalty = 0;

  const wellMap = new Map(wells.map(w => [w.id, w]));

  Object.entries(schedule.rigAssignments).forEach(([rigId, wellSequence]) => {
    const rig = rigs.find(r => r.id === rigId);
    if (!rig) return;

    let currentX = rig.baseX;
    let currentY = rig.baseY;
    let currentDay = 0;

    wellSequence.forEach((wellId, index) => {
      const well = wellMap.get(wellId);
      if (!well) return;

      // Travel to well
      const travel = euclideanDistance(currentX, currentY, well.x, well.y);
      totalTravel += travel * 50; // arbitrary cost per unit distance

      currentX = well.x;
      currentY = well.y;
      currentDay += travel * 0.2 + well.drillingTime; // travel time + drilling

      // Production value (diminishing if delayed)
      const delay = Math.max(0, currentDay - (well.deadline || 999));
      penalty += delay * 200;

      totalProduction += well.expectedProduction * (1 - delay * 0.05);
      totalTime += well.drillingTime;
    });

    // Return to base
    const returnTravel = euclideanDistance(currentX, currentY, rig.baseX, rig.baseY);
    totalTravel += returnTravel * 50;
  });

  const score = totalProduction - totalTime * 800 - totalTravel - penalty;
  return Math.round(score);
}

// Helper to generate random initial schedule
export function generateRandomSchedule(wells: Well[], rigs: Rig[]): Schedule {
  const wellIds = [...wells.map(w => w.id)];
  wellIds.sort(() => Math.random() - 0.5);

  const rigAssignments: Record<string, string[]> = {};
  rigs.forEach(rig => {
    rigAssignments[rig.id] = [];
  });

  // Distribute wells
  let rigIndex = 0;
  const rigIds = Object.keys(rigAssignments);
  wellIds.forEach(wellId => {
    const rigId = rigIds[rigIndex % rigIds.length];
    rigAssignments[rigId].push(wellId);
    rigIndex++;
  });

  // Shuffle order in each rig
  Object.keys(rigAssignments).forEach(rigId => {
    rigAssignments[rigId].sort(() => Math.random() - 0.5);
  });

  return { rigAssignments };
}