import { Hono } from 'hono'
import { wells, rigs } from './mockData.js'
import { calculateObjective, generateRandomSchedule } from './utils.js'
import { runHillClimbing } from './algorithms/hillClimbing.js'
import { runSimulatedAnnealing } from './algorithms/simulatedAnnealing.js'
import { runLocalBeam } from './algorithms/localBeam.js'
import { runGeneticAlgorithmType1, runGeneticAlgorithmType2 } from './algorithms/geneticAlgorithm.js'
import type { OptimizationResult } from './types.js'

const app = new Hono()

// ==================== MAIN DASHBOARD ====================
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RigOptima - Oil & Gas Scheduler</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
      <style>
        body { background: linear-gradient(135deg, #0f172a 0%, #1e2937 100%); color: #e2e8f0; }
        .card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card:hover { transform: translateY(-8px); box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.4); }
        table { border-collapse: collapse; }
        th, td { padding: 12px 16px; }
      </style>
    </head>
    <body class="min-h-screen">
      <div class="max-w-7xl mx-auto p-8">
        <header class="flex justify-between items-center mb-12">
          <div class="flex items-center gap-4">
            <span class="text-5xl">🛢️</span>
            <div>
              <h1 class="text-4xl font-bold text-white">RigOptima</h1>
              <p class="text-slate-400">Drilling Schedule Optimizer</p>
            </div>
          </div>
        </header>

        <!-- All cards: Wells, Rigs, 5 algorithms + Comparison -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Wells Card -->
          <div onclick="window.location.href='/wells'" class="card cursor-pointer bg-gradient-to-br from-emerald-900 to-slate-800 p-8 rounded-3xl border border-emerald-700">
            <div class="flex items-center gap-4 mb-6">
              <i class="fas fa-oil-can text-4xl text-emerald-400"></i>
              <div>
                <h3 class="text-2xl font-semibold">Wells</h3>
                <p class="text-emerald-300">${wells.length} Locations</p>
              </div>
            </div>
            <button class="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-medium text-lg">
              View All Wells →
            </button>
          </div>

          <!-- Rigs Card -->
          <div onclick="window.location.href='/rigs'" class="card cursor-pointer bg-gradient-to-br from-amber-900 to-slate-800 p-8 rounded-3xl border border-amber-700">
            <div class="flex items-center gap-4 mb-6">
              <i class="fas fa-truck-pickup text-4xl text-amber-400"></i>
              <div>
                <h3 class="text-2xl font-semibold">Rigs</h3>
                <p class="text-amber-300">${rigs.length} Active Rigs</p>
              </div>
            </div>
            <button class="w-full bg-amber-600 hover:bg-amber-500 py-4 rounded-2xl font-medium text-lg">
              View All Rigs →
            </button>
          </div>

          <!-- Hill Climbing -->
          <div onclick="runAlgorithm('hillclimbing')" class="card cursor-pointer bg-gradient-to-br from-blue-900 to-slate-800 p-8 rounded-3xl border border-blue-700">
            <div class="flex items-center gap-4 mb-6">
              <i class="fas fa-mountain text-4xl text-blue-400"></i>
              <div>
                <h3 class="text-2xl font-semibold">Hill Climbing</h3>
                <p class="text-blue-300">Greedy with restarts</p>
              </div>
            </div>
            <button class="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-medium text-lg">
              Run Now →
            </button>
          </div>

          <!-- Simulated Annealing -->
          <div onclick="runAlgorithm('simulatedannealing')" class="card cursor-pointer bg-gradient-to-br from-purple-900 to-slate-800 p-8 rounded-3xl border border-purple-700">
            <div class="flex items-center gap-4 mb-6">
              <i class="fas fa-temperature-high text-4xl text-purple-400"></i>
              <div>
                <h3 class="text-2xl font-semibold">Simulated Annealing</h3>
                <p class="text-purple-300">Escapes local optima</p>
              </div>
            </div>
            <button class="w-full bg-purple-600 hover:bg-purple-500 py-4 rounded-2xl font-medium text-lg">
              Run Now →
            </button>
          </div>

          <!-- Local Beam Search -->
          <div onclick="runAlgorithm('localbeam')" class="card cursor-pointer bg-gradient-to-br from-pink-900 to-slate-800 p-8 rounded-3xl border border-pink-700">
            <div class="flex items-center gap-4 mb-6">
              <i class="fas fa-arrow-right-arrow-left text-4xl text-pink-400"></i>
              <div>
                <h3 class="text-2xl font-semibold">Local Beam</h3>
                <p class="text-pink-300">Parallel exploration</p>
              </div>
            </div>
            <button class="w-full bg-pink-600 hover:bg-pink-500 py-4 rounded-2xl font-medium text-lg">
              Run Now →
            </button>
          </div>

          <!-- Genetic Algorithm Type 1 (Order Crossover) -->
          <div onclick="runAlgorithm('genetic1')" class="card cursor-pointer bg-gradient-to-br from-green-900 to-slate-800 p-8 rounded-3xl border border-green-700">
            <div class="flex items-center gap-4 mb-6">
              <i class="fas fa-dna text-4xl text-green-400"></i>
              <div>
                <h3 class="text-2xl font-semibold">GA Type 1 (OX)</h3>
                <p class="text-green-300">Order Crossover + Swap</p>
              </div>
            </div>
            <button class="w-full bg-green-600 hover:bg-green-500 py-4 rounded-2xl font-medium text-lg">
              Run Now →
            </button>
          </div>

          <!-- Genetic Algorithm Type 2 (PMX) -->
          <div onclick="runAlgorithm('genetic2')" class="card cursor-pointer bg-gradient-to-br from-teal-900 to-slate-800 p-8 rounded-3xl border border-teal-700">
            <div class="flex items-center gap-4 mb-6">
              <i class="fas fa-chromosome text-4xl text-teal-400"></i>
              <div>
                <h3 class="text-2xl font-semibold">GA Type 2 (PMX)</h3>
                <p class="text-teal-300">PMX + Inversion</p>
              </div>
            </div>
            <button class="w-full bg-teal-600 hover:bg-teal-500 py-4 rounded-2xl font-medium text-lg">
              Run Now →
            </button>
          </div>

          <!-- NEW: Algorithm Comparison Page -->
          <div onclick="window.location.href='/comparison'" class="card cursor-pointer bg-gradient-to-br from-indigo-900 to-slate-800 p-8 rounded-3xl border border-indigo-700">
            <div class="flex items-center gap-4 mb-6">
              <i class="fas fa-chart-line text-4xl text-indigo-400"></i>
              <div>
                <h3 class="text-2xl font-semibold">Compare Algorithms</h3>
                <p class="text-indigo-300">AIMA Chapter 4 Guide</p>
              </div>
            </div>
            <button class="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-medium text-lg">
              View Comparison →
            </button>
          </div>
        </div>

        <div id="result" class="mt-12"></div>
      </div>

      <script>
        async function runAlgorithm(alg) {
          const resDiv = document.getElementById('result');
          resDiv.innerHTML = '<div class="text-center py-20"><i class="fas fa-spinner fa-spin text-5xl"></i><p class="mt-6 text-xl">Optimizing Schedule...</p></div>';

          const res = await fetch(\`/api/optimize?algorithm=\${alg}\`);
          const data = await res.json();

          let html = \`
            <div class="bg-slate-900/70 backdrop-blur-xl rounded-3xl p-10">
              <h2 class="text-3xl font-bold mb-2">\${data.algorithm.toUpperCase()} Optimization Result</h2>
              <p class="text-6xl font-mono text-emerald-400">\${data.score}</p>
              <p class="text-slate-400 mb-8">Best Objective Score</p>
              
              <h3 class="text-xl font-semibold mb-6 flex items-center gap-3">
                <i class="fas fa-route"></i> Optimized Schedule
              </h3>
          \`;

          Object.entries(data.schedule.rigAssignments).forEach(([rigId, wells]) => {
            html += \`
              <div class="mb-8 bg-slate-800 rounded-2xl p-6">
                <div class="flex justify-between items-center mb-4">
                  <span class="text-xl font-medium">🚧 \${rigId}</span>
                  <span class="bg-slate-700 px-4 py-1 rounded-full text-sm">\${wells.length} wells</span>
                </div>
                <div class="flex flex-wrap gap-3">\`;
            
            wells.forEach(w => html += \`<span class="bg-slate-700 px-5 py-2.5 rounded-2xl text-sm">\${w}</span>\`);
            html += '</div></div>';
          });

          html += '</div>';
          resDiv.innerHTML = html;
        }
      </script>
    </body>
    </html>
  `)
})

// ==================== WELLS PAGE ====================
app.get('/wells', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wells - RigOptima</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    </head>
    <body class="bg-slate-950 text-slate-200">
      <div class="max-w-7xl mx-auto p-8">
        <a href="/" class="text-blue-400 hover:text-blue-300 mb-8 inline-flex items-center gap-2">
          ← Back to Dashboard
        </a>
        <h1 class="text-4xl font-bold mb-8 flex items-center gap-4">
          <i class="fas fa-oil-can text-emerald-400"></i> All Wells (${wells.length})
        </h1>
        
        <div class="bg-slate-900 rounded-3xl overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-800">
              <tr>
                <th class="text-left">Well ID</th>
                <th class="text-left">Name</th>
                <th class="text-left">Type</th>
                <th class="text-right">Production</th>
                <th class="text-right">Drilling Time</th>
                <th class="text-right">Priority</th>
                <th class="text-right">Deadline</th>
                <th class="text-center">Location</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-700">
              ${wells.map(w => `
                <tr class="hover:bg-slate-800 transition">
                  <td class="font-mono">${w.id}</td>
                  <td class="font-medium">${w.name}</td>
                  <td><span class="px-3 py-1 rounded-full text-xs ${w.type === 'drilling' ? 'bg-blue-900 text-blue-300' : 'bg-amber-900 text-amber-300'}">${w.type}</span></td>
                  <td class="text-right font-mono">${w.expectedProduction}</td>
                  <td class="text-right">${w.drillingTime} days</td>
                  <td class="text-right">${w.priority}/10</td>
                  <td class="text-right">${w.deadline || '—'} days</td>
                  <td class="text-center font-mono text-xs">(${w.x}, ${w.y})</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </body>
    </html>
  `)
})

// ==================== RIGS PAGE ====================
app.get('/rigs', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rigs - RigOptima</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    </head>
    <body class="bg-slate-950 text-slate-200">
      <div class="max-w-7xl mx-auto p-8">
        <a href="/" class="text-blue-400 hover:text-blue-300 mb-8 inline-flex items-center gap-2">
          ← Back to Dashboard
        </a>
        <h1 class="text-4xl font-bold mb-8 flex items-center gap-4">
          <i class="fas fa-truck-pickup text-amber-400"></i> Available Rigs (${rigs.length})
        </h1>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          ${rigs.map(rig => `
            <div class="bg-slate-900 rounded-3xl p-8 border border-amber-800">
              <div class="flex items-center gap-4 mb-6">
                <i class="fas fa-truck-pickup text-4xl text-amber-400"></i>
                <div>
                  <h3 class="text-2xl font-semibold">${rig.name}</h3>
                  <p class="text-slate-400 font-mono">${rig.id}</p>
                </div>
              </div>
              <div class="space-y-4">
                <div><span class="text-slate-400">Daily Cost:</span> <span class="font-mono text-xl">$${rig.dailyCost.toLocaleString()}</span></div>
                <div><span class="text-slate-400">Base Location:</span> <span class="font-mono">(${rig.baseX}, ${rig.baseY})</span></div>
                <div>
                  <span class="text-slate-400">Capabilities:</span><br>
                  ${rig.capabilities.map(cap => `<span class="inline-block mt-2 px-4 py-1 bg-slate-800 rounded-full text-sm">${cap}</span>`).join(' ')}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </body>
    </html>
  `)
})

const COMPARISON_PAGE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Local Search Algorithms Comparison | RigOptima</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 40px 20px;
      background: linear-gradient(135deg, #f5f7fa 0%, #e9edf2 100%);
      color: #1e2a3a;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      box-shadow: 0 20px 35px -10px rgba(0,0,0,0.15);
      padding: 30px;
    }
    h1 {
      color: #0f3b2c;
      border-left: 6px solid #2c7a4b;
      padding-left: 20px;
      margin-top: 0;
    }
    h2 {
      color: #1e4663;
      margin-top: 40px;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 25px 0;
      font-size: 0.95rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    th {
      background-color: #1e4663;
      color: white;
      padding: 14px 12px;
      font-weight: 600;
      text-align: center;
    }
    td {
      border: 1px solid #ddd;
      padding: 12px;
      vertical-align: top;
      background-color: #fff;
    }
    tr:nth-child(even) td {
      background-color: #f9fafb;
    }
    .algo-name {
      font-weight: 700;
      background-color: #eef2ff;
    }
    .badge {
      display: inline-block;
      background: #2c7a4b20;
      color: #1e4620;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    .note {
      background: #fef9e3;
      padding: 15px 20px;
      border-left: 5px solid #f59e0b;
      margin: 25px 0;
      border-radius: 12px;
    }
    footer {
      margin-top: 40px;
      text-align: center;
      font-size: 0.8rem;
      color: #5b6e8c;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    @media (max-width: 800px) {
      table, thead, tbody, th, td, tr { display: block; }
      th { display: none; }
      tr { margin-bottom: 20px; border: 1px solid #ccc; border-radius: 16px; }
      td { display: flex; justify-content: space-between; align-items: center; border: none; border-bottom: 1px solid #eee; }
      td:before { content: attr(data-label); font-weight: bold; width: 40%; }
    }
  </style>
</head>
<body>
<div class="container">
  <h1>🛢️ RigOptima – Local Search & Optimization Algorithms</h1>
  <p>Based on <strong>Artificial Intelligence: A Modern Approach (3rd Ed., Chapter 4)</strong> – applied to drilling schedule optimisation.</p>

  <h2>📊 Algorithm Comparison Table</h2>
  <table>
    <thead>
      <tr><th>Feature</th><th>Hill-Climbing</th><th>Simulated Annealing</th><th>Local Beam Search</th><th>Genetic Algorithms (2 types)</th</tr>
    </thead>
    <tbody>
      <tr><td data-label="Feature"><strong>Type</strong></td><td data-label="Hill-Climbing">Single‑state, greedy</td><td data-label="Simulated Annealing">Single‑state, probabilistic</td><td data-label="Local Beam Search">Multi‑state (k parallel)</td><td data-label="Genetic Algorithms">Population‑based (evolutionary)</td></tr>
      <tr><td data-label="Feature"><strong>Memory</strong></td><td data-label="Hill-Climbing">O(1) – current state only</td><td data-label="Simulated Annealing">O(1) – current state + temperature</td><td data-label="Local Beam Search">O(k) – k states</td><td data-label="Genetic Algorithms">O(population size)</td></tr>
      <tr><td data-label="Feature"><strong>Exploration strategy</strong></td><td data-label="Hill-Climbing">No exploration – moves only to better neighbors</td><td data-label="Simulated Annealing">Accepts worse moves with decreasing probability</td><td data-label="Local Beam Search">Generates all neighbors of k states, keeps best k</td><td data-label="Genetic Algorithms">Selection, crossover, mutation</td></tr>
      <tr><td data-label="Feature"><strong>Risk of local optimum</strong></td><td data-label="Hill-Climbing">Very high – gets stuck easily</td><td data-label="Simulated Annealing">Low – can escape if temperature high enough</td><td data-label="Local Beam Search">Medium – information sharing helps, but can converge prematurely</td><td data-label="Genetic Algorithms">Low – maintains diversity via population</td></tr>
      <tr><td data-label="Feature"><strong>Convergence speed</strong></td><td data-label="Hill-Climbing">Very fast</td><td data-label="Simulated Annealing">Slow (needs many iterations)</td><td data-label="Local Beam Search">Fast (parallel evaluation)</td><td data-label="Genetic Algorithms">Medium (generations)</td></tr>
      <tr><td data-label="Feature"><strong>Parallelism</strong></td><td data-label="Hill-Climbing">No</td><td data-label="Simulated Annealing">No</td><td data-label="Local Beam Search">Yes – k states</td><td data-label="Genetic Algorithms">Yes – population</td></tr>
      <tr><td data-label="Feature"><strong>Parameter tuning</strong></td><td data-label="Hill-Climbing">Minimal (restarts)</td><td data-label="Simulated Annealing">Yes – cooling schedule, initial temp</td><td data-label="Local Beam Search">Yes – beam width</td><td data-label="Genetic Algorithms">Yes – pop size, mutation/crossover rates</td></tr>
      <tr><td data-label="Feature"><strong>Application in RigOptima</strong></td><td data-label="Hill-Climbing">20 random restarts, 100 iter each. Fast baseline.</td><td data-label="Simulated Annealing">5000 iter, temp 1000→0.01. Better for complex landscapes.</td><td data-label="Local Beam Search">Beam width 5, 200 iter. Good balance.</td><td data-label="Genetic Algorithms">Two variants: OX+swap / PMX+inversion. Best for large problems.</td></tr>
    </tbody>
  </table>

  <h2>🧬 Genetic Algorithm – Two Implementations</h2>
  <table>
    <thead><tr><th>Feature</th><th>GA Type 1 (Order Crossover + Swap)</th><th>GA Type 2 (PMX + Inversion)</th></tr></thead>
    <tbody>
      <tr><td data-label="Feature"><strong>Crossover</strong></td><td data-label="Type 1">Order Crossover (OX) – preserves relative order</td><td data-label="Type 2">Partially Mapped Crossover (PMX) – preserves absolute positions</td></tr>
      <tr><td data-label="Feature"><strong>Mutation</strong></td><td data-label="Type 1">Swap two random wells</td><td data-label="Type 2">Inversion – reverse a random subsequence</td></tr>
      <tr><td data-label="Feature"><strong>When to use</strong></td><td data-label="Type 1">When sequence order matters more than absolute index</td><td data-label="Type 2">When absolute positions in permutation are important</td></tr>
      <tr><td data-label="Feature"><strong>Performance in scheduling</strong></td><td data-label="Type 1">Good for routing‑like problems</td><td data-label="Type 2">Often better for permutation problems with heavy constraints</td></tr>
    </tbody>
  </table>

  <h2>📈 Recommendation for Drilling Schedule Optimisation</h2>
  <div class="note">
    ✅ <strong>Try this order:</strong><br>
    1. <strong>Hill Climbing</strong> – for very fast baseline (seconds).<br>
    2. <strong>Local Beam Search</strong> – if you need better quality but still fast.<br>
    3. <strong>Simulated Annealing</strong> – when the solution landscape is rugged (many deadlines).<br>
    4. <strong>Genetic Algorithm Type 2 (PMX)</strong> – for large‑scale problems (many wells/rigs).<br>
    <br>
    🚀 All four are already implemented in your RigOptima backend and can be tested directly from the <a href="/">dashboard →</a>
  </div>

  <footer>
    Based on AIMA 3rd Edition, Chapter 4 (Beyond Classical Search) • Implemented in Hono + TypeScript • RigOptima
  </footer>
</div>
</body>
</html>`; 

app.get('/comparison', (c) => {
  return c.html(COMPARISON_PAGE);
});

// API Endpoints (for optimization)
app.get('/api/wells', (c) => c.json(wells))
app.get('/api/rigs', (c) => c.json(rigs))

app.get('/api/optimize', async (c) => {
  const algorithm = c.req.query('algorithm') || 'hillclimbing'
  let result: OptimizationResult

  switch (algorithm) {
    case 'hillclimbing':
      result = runHillClimbing(wells, rigs, 20, 100)
      break
    case 'simulatedannealing':
      result = runSimulatedAnnealing(wells, rigs, 5000, 1000, 0.995)
      break
    case 'localbeam':
      result = runLocalBeam(wells, rigs, 5, 200)
      break
    case 'genetic1':
      result = runGeneticAlgorithmType1(wells, rigs, 50, 100)
      break
    case 'genetic2':
      result = runGeneticAlgorithmType2(wells, rigs, 50, 100)
      break
    default:
      // fallback to random schedule
      const schedule = generateRandomSchedule(wells, rigs)
      result = {
        schedule,
        score: calculateObjective(schedule, wells, rigs),
        totalTime: 0,
        totalTravel: 0,
        totalProduction: 0,
        iterations: 50,
        algorithm: 'random'
      }
  }
  return c.json(result)
})

export default app