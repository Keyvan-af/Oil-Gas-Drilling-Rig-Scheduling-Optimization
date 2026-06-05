import type { Well, Rig } from './types.js';

export const wells: Well[] = [
  { id: 'W1', name: 'Well Alpha', x: 10, y: 20, type: 'drilling', expectedProduction: 450, drillingTime: 5, priority: 9, deadline: 12 },
  { id: 'W2', name: 'Well Beta', x: 15, y: 25, type: 'workover', expectedProduction: 320, drillingTime: 3, priority: 8, deadline: 10 },
  { id: 'W3', name: 'Well Gamma', x: 30, y: 40, type: 'drilling', expectedProduction: 680, drillingTime: 7, priority: 10, deadline: 15 },
  { id: 'W4', name: 'Well Delta', x: 5, y: 35, type: 'workover', expectedProduction: 280, drillingTime: 4, priority: 7, deadline: 8 },
  { id: 'W5', name: 'Well Epsilon', x: 45, y: 10, type: 'drilling', expectedProduction: 520, drillingTime: 6, priority: 9, deadline: 14 },
  { id: 'W6', name: 'Well Zeta', x: 25, y: 15, type: 'workover', expectedProduction: 390, drillingTime: 3, priority: 6, deadline: 9 },
  { id: 'W7', name: 'Well Eta', x: 12, y: 50, type: 'drilling', expectedProduction: 610, drillingTime: 8, priority: 10, deadline: 18 },
  { id: 'W8', name: 'Well Theta', x: 38, y: 28, type: 'workover', expectedProduction: 240, drillingTime: 4, priority: 5, deadline: 11 },
  { id: 'W9', name: 'Well Iota', x: 22, y: 8, type: 'drilling', expectedProduction: 470, drillingTime: 5, priority: 8, deadline: 13 },
  { id: 'W10', name: 'Well Kappa', x: 18, y: 45, type: 'workover', expectedProduction: 310, drillingTime: 3, priority: 7, deadline: 7 },
  { id: 'W11', name: 'Well Lambda', x: 50, y: 30, type: 'drilling', expectedProduction: 550, drillingTime: 6, priority: 9, deadline: 16 },
  { id: 'W12', name: 'Well Mu', x: 8, y: 12, type: 'workover', expectedProduction: 260, drillingTime: 4, priority: 6, deadline: 10 },
  { id: 'W13', name: 'Well Nu', x: 35, y: 22, type: 'drilling', expectedProduction: 590, drillingTime: 7, priority: 10, deadline: 17 },
  { id: 'W14', name: 'Well Xi', x: 28, y: 38, type: 'workover', expectedProduction: 330, drillingTime: 3, priority: 8, deadline: 9 },
  { id: 'W15', name: 'Well Omicron', x: 42, y: 5, type: 'drilling', expectedProduction: 480, drillingTime: 5, priority: 7, deadline: 12 },
];

export const rigs: Rig[] = [
  {
    id: 'R1',
    name: 'Rig Pioneer',
    baseX: 20,
    baseY: 25,
    capabilities: ['drilling', 'workover'],
    dailyCost: 12000
  },
  {
    id: 'R2',
    name: 'Rig Explorer',
    baseX: 35,
    baseY: 15,
    capabilities: ['drilling'],
    dailyCost: 15000
  },
  {
    id: 'R3',
    name: 'Rig Vanguard',
    baseX: 10,
    baseY: 40,
    capabilities: ['workover'],
    dailyCost: 9000
  }
];