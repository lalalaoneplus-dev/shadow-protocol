// Portable-terminal host: shifts from the 3D field to the 2D tool stages and
// runs a level's challenge stages in order. Resolves true when all complete.
import { SFX } from './audio.js';

const TOOLS = {
  teach: () => import('./tools/teach.js'),
  risk: () => import('./tools/risk.js'),
  cryptool: () => import('./tools/cryptool.js'),
  nmap: () => import('./tools/nmap.js'),
  bash: () => import('./tools/bash.js'),
  wireshark: () => import('./tools/wireshark.js'),
  forensics: () => import('./tools/forensics.js'),
  burp: () => import('./tools/burp.js'),
  privacy: () => import('./tools/privacy.js'),
  phish: () => import('./tools/phish.js'),
  isms: () => import('./tools/isms.js'),
  dataviz: () => import('./tools/dataviz.js'),
  knowledge: () => import('./tools/knowledge.js')
};

// host: DOM element (the #overlay). Returns a promise<boolean> (true=complete).
export function openTerminal(host, level) {
  return new Promise((resolve) => {
    // Teach → Test loop: every sector opens with a SANDBOX tutorial (Phase 1/2),
    // runs the LIVE tool(s), then a MANDATORY codex knowledge gate (Phase: "no
    // concept left behind" — theory must be demonstrated to clear the level).
    const stages = [{ tool: 'teach' }, ...(level.stages || []), { tool: 'knowledge' }];
    let stageIdx = 0;
    let aborted = false;

    function runStage() {
      if (aborted) return;
      if (stageIdx >= stages.length) { cleanup(); resolve(true); return; }
      const stage = stages[stageIdx];
      const loader = TOOLS[stage.tool];
      if (!loader) { console.error('unknown tool', stage.tool); stageIdx++; runStage(); return; }
      SFX.hack();
      loader().then(mod => {
        host.innerHTML = '';
        const shell = mod.run(host, { level, stage }, (success) => {
          if (success) { stageIdx++; setTimeout(runStage, 300); }
        });
        // allow abort from inside the tool
        if (shell && typeof shell === 'object') {
          // shell.onAbort handled by buildShell consumer; we patch via host
        }
        // Wire abort: each tool's shell exposes root with [data-x]; intercept here
        const x = host.querySelector('[data-x]');
        if (x) x.addEventListener('click', () => { aborted = true; cleanup(); resolve(false); });
      });
    }

    function cleanup() { host.innerHTML = ''; }
    runStage();
  });
}
