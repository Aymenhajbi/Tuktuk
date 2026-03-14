const { spawn } = require('child_process');

const processes = [
  ['node', ['apps/ai-engine/src/workers/ai-scoring.worker.js']],
  ['node', ['apps/scraper-service/src/workers/scraper.worker.js']],
  ['node', ['apps/orchestrator/src/workers/orchestrator.worker.js']],
];

for (const [cmd, args] of processes) {
  const child = spawn(cmd, args, { stdio: 'inherit' });
  child.on('exit', (code) => {
    console.log(JSON.stringify({ worker: args[0], code }));
  });
}
