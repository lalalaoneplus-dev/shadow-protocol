// L10 — Synthesis & Intelligence. Correlate the intel from all nine sectors on
// the analysis grid; the master server is the node with convergent, independent
// support — not the loudest. Theory: data viz, weighing evidence, synthesis.
import { buildShell, isHardcore, escapeHtml } from './shell.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'Intelligence Grid ▸ correlate & neutralise', sub: 'Let convergent, independent evidence name the target. Don’t chase the loud signal.' });
  const hard = isHardcore();
  shell.setConcept('Weigh the evidence, Operator. A single source shouting the same thing isn’t corroboration. The master server is the node that <b>independent sectors converge on</b> — not the loudest beacon.');
  let stage = 0; shell.setDots(0, 2);

  // intel signals collected across the campaign, each pointing at a node
  const signals = [
    { from: 'L2 Cipher', node: 'NODE-7', txt: 'Decrypted order routed traffic to NODE-7.' },
    { from: 'L3 Mainframe', node: 'NODE-7', txt: 'Container escaped to a host that syncs to NODE-7.' },
    { from: 'L4 Grid', node: 'NODE-3', txt: 'SCADA attack’s C2 beacon resolved to NODE-3 (loud, repeated).' },
    { from: 'L5 Breach', node: 'NODE-7', txt: 'Crimson Lattice infra overlaps NODE-7 registration.' },
    { from: 'L6 Patch', node: 'NODE-7', txt: 'Admin session token issued by NODE-7’s auth service.' },
    { from: 'L7 Anonymizer', node: 'NODE-3', txt: 'Exfil drop pointed at NODE-3 (single beacon, likely a relay).' },
    { from: 'L9 Auditor', node: 'NODE-7', txt: 'SOC policy lists NODE-7 as the undocumented “core” asset.' }
  ];
  const tally = {}; signals.forEach(s => tally[s.node] = (tally[s.node] || 0) + 1);

  const body = document.createElement('div'); body.style.cssText = 'display:flex;flex-direction:column;width:100%;padding:16px;gap:10px;overflow:auto';
  shell.body.appendChild(body);

  function correlate() {
    body.innerHTML = '';
    const h = document.createElement('div'); h.className = 'hl'; h.innerHTML = '▌ Convergence matrix — independent signals per candidate node:'; body.appendChild(h);
    const grid = document.createElement('div'); grid.style.cssText = 'display:flex;gap:12px;flex-wrap:wrap;margin:8px 0';
    ['NODE-7', 'NODE-3', 'NODE-9'].forEach(n => {
      const sigs = signals.filter(s => s.node === n);
      const card = document.createElement('div'); card.className = 'card'; card.style.flex = '1'; card.style.minWidth = '220px';
      card.innerHTML = `<div class="ct">${n}</div><div class="cd"><b style="color:${sigs.length >= 4 ? '#36e07a' : '#ffb020'}">${sigs.length}</b> independent signal(s)<br><span class="muted" style="font-size:11px">${sigs.map(s => s.from).join(', ') || '—'}</span></div>`;
      card.addEventListener('click', () => pick(n, card));
      grid.appendChild(card);
    });
    body.appendChild(grid);
    const log = document.createElement('div'); log.style.cssText = 'font-size:11.5px;color:#5a7488;line-height:1.7;border-top:1px dashed rgba(90,116,136,.3);padding-top:10px';
    log.innerHTML = signals.map(s => `<span class="acc">${s.from}</span> → ${s.node}: ${escapeHtml(s.txt)}`).join('<br>');
    body.appendChild(log);
    shell.setHint(hard ? 'Select the master server: the node with the most convergent, independent intel.' : 'NODE-3 is loud but mostly relays. Pick the node multiple independent sources converge on.');
  }

  function pick(n, card) {
    if (n === 'NODE-7') {
      card.classList.add('correct'); SFX.good(); shell.flashGood(); stage = 1; shell.setDots(1, 2);
      neutralize();
    } else {
      card.classList.add('wrong'); SFX.bad(); shell.flashBad();
      shell.setHint(n === 'NODE-3' ? 'NODE-3 is a noisy relay — repetition isn’t corroboration. Weigh independent sources.' : 'Insufficient convergent support for that node. Re-read the matrix.');
      setTimeout(() => card.classList.remove('wrong'), 600);
    }
  }

  function neutralize() {
    body.innerHTML = `<div class="ok" style="padding:10px 0">✓ Target confirmed: <b>NODE-7</b> — five independent sectors converge. NODE-3 was a decoy relay.</div>`;
    const warn = document.createElement('div'); warn.className = 'hl'; warn.innerHTML = '▌ Arm the takedown of the master server.'; body.appendChild(warn);
    shell.setHint(hard ? 'Type EXECUTE to neutralise NODE-7.' : 'Confirm to neutralise the master server.');
    if (hard) {
      const line = document.createElement('div'); line.className = 'cli-line'; line.innerHTML = `<span class="cli-prompt">core&gt;</span>`;
      const input = document.createElement('input'); input.className = 'cli-input'; input.placeholder = 'type EXECUTE…'; line.appendChild(input); body.appendChild(line); input.focus();
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { if (/^execute$/i.test(input.value.trim())) finish(); else { SFX.bad(); shell.flashBad(); shell.setHint('Type EXECUTE exactly to confirm.'); } } else SFX.type(); });
    } else {
      const b = document.createElement('button'); b.className = 'btn big wide danger'; b.textContent = '⚠ NEUTRALISE NODE-7'; b.style.marginTop = '10px';
      b.addEventListener('click', finish); body.appendChild(b);
    }
  }

  function finish() {
    SFX.good(); shell.flashGood(); shell.setDots(2, 2);
    body.innerHTML = `<div class="ok" style="padding:18px;text-align:center">✓ NODE-7 dark. The antagonist’s master server is down — and the correlated picture left them nowhere to fail over.<br><br>━━━ MASTER SERVER NEUTRALISED — OPERATION COMPLETE ━━━</div>`;
    SFX.unlock(); setTimeout(() => onDone(true), 1200);
  }

  correlate();
  return shell;
}
