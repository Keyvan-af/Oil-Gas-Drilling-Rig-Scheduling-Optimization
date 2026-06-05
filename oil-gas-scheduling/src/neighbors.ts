import type { Schedule, Well, Rig } from './types.js';

export function getNeighbors(schedule: Schedule, wells: Well[], rigs: Rig[]): Schedule[] {
  const neighbors: Schedule[] = [];
  const rigIds = Object.keys(schedule.rigAssignments);

  // 1. Swap two wells within the same rig
  rigIds.forEach(rigId => {
    const wellsInRig = [...schedule.rigAssignments[rigId]];
    for (let i = 0; i < wellsInRig.length; i++) {
      for (let j = i + 1; j < wellsInRig.length; j++) {
        const newSchedule = { ...schedule, rigAssignments: { ...schedule.rigAssignments } };
        newSchedule.rigAssignments[rigId] = [...wellsInRig];
        [newSchedule.rigAssignments[rigId][i], newSchedule.rigAssignments[rigId][j]] =
          [newSchedule.rigAssignments[rigId][j], newSchedule.rigAssignments[rigId][i]];
        neighbors.push(newSchedule);
      }
    }
  });

  // 2. Move a well from one rig to another
  rigIds.forEach(fromRig => {
    if (schedule.rigAssignments[fromRig].length === 0) return;
    rigIds.forEach(toRig => {
      if (fromRig === toRig) return;
      schedule.rigAssignments[fromRig].forEach((wellId, idx) => {
        const newSchedule = { ...schedule, rigAssignments: { ...schedule.rigAssignments } };
        newSchedule.rigAssignments[fromRig] = [...newSchedule.rigAssignments[fromRig]];
        newSchedule.rigAssignments[toRig] = [...(newSchedule.rigAssignments[toRig] || [])];
        const movedWell = newSchedule.rigAssignments[fromRig].splice(idx, 1)[0];
        newSchedule.rigAssignments[toRig].push(movedWell);
        neighbors.push(newSchedule);
      });
    });
  });

  return neighbors;
}