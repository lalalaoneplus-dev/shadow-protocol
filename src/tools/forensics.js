// L5 — Digital forensics & attribution. Collect indicators, then attribute the
// malware on evidence weight — not on the planted false-flag.
import { buildShell, isHardcore, escapeHtml } from './shell.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'Forensics Suite ▸ post-incident triage', sub: 'Recover every indicator before you attribute. Beware the obvious flag.' });
  const hard = isHardcore();
  shell.setConcept('Attribute on what’s <b>hard to fake</b>, Operator — reused infrastructure, custom code, repeated tradecraft. An easy clue like a foreign-language comment is exactly the false flag an attacker plants to frame someone else.');
  let stage = 0; shell.setDots(0, 2);

  const iocs = [
    { id: 'c2', t: 'C2 INFRASTRUCTURE', d: 'Beacon to a bulletproof host reused in 3 prior "Crimson Lattice" intrusions.', weight: 'lattice' },
    { id: 'packer', t: 'CODE REUSE', d: 'Custom packer + string-encryption stub unique to Crimson Lattice tooling.', weight: 'lattice' },
    { id: 'cert', t: 'BUILD ARTIFACT', d: 'PDB path & stolen signing cert overlap a known Crimson Lattice loader.', weight: 'lattice' },
    { id: 'lang', t: 'LANGUAGE ARTIFACT', d: 'Cyrillic comments in a dropped script — points at "Ember Bear".', weight: 'flag' }
  ];
  const grid = document.createElement('div'); grid.className = 'grid-cards'; shell.body.appendChild(grid);
  const collected = new Set();

  function collectStage() {
    grid.innerHTML = '';
    shell.setHint('Click each artifact to acquire it. Collect all four, then attribute.');
    iocs.forEach(io => {
      const c = document.createElement('div'); c.className = 'card';
      c.innerHTML = `<div class="ct">◍ EVIDENCE — click to acquire</div><div class="cd">${io.t}</div>`;
      c.addEventListener('click', () => {
        if (collected.has(io.id)) return;
        collected.add(io.id); SFX.ui(); c.classList.add('sel');
        c.innerHTML = `<div class="ct">${io.weight === 'flag' ? '⚑ POSSIBLE FALSE-FLAG' : '✓ ACQUIRED'}</div><div class="cd"><b>${io.t}</b><br><span class="muted">${escapeHtml(io.d)}</span></div>`;
        if (collected.size === iocs.length) { stage = 1; shell.setDots(1, 2); SFX.good(); setTimeout(attributeStage, 500); }
      });
      grid.appendChild(c);
    });
  }

  function attributeStage() {
    grid.innerHTML = '';
    shell.setHint(hard ? 'Weigh infrastructure + code reuse against the language artifact. Type the actor.' : 'Attribute on the strongest, hardest-to-fake evidence.');
    const q = document.createElement('div'); q.style.cssText = 'padding:6px 4px 14px;grid-column:1/-1';
    q.innerHTML = `<div class="hl">▌ Three independent indicators (C2 reuse, packer, build cert) converge on one actor. One indicator (language) points elsewhere and is trivially planted. Attribute the attack.</div>`;
    grid.appendChild(q);
    if (hard) {
      const region = document.createElement('div'); region.style.gridColumn = '1/-1'; grid.appendChild(region);
      const line = document.createElement('div'); line.className = 'cli-line'; line.innerHTML = `<span class="cli-prompt">attribute&gt;</span>`;
      const input = document.createElement('input'); input.className = 'cli-input'; input.placeholder = 'actor name…'; line.appendChild(input); region.appendChild(line); input.focus();
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { const v = input.value.trim().toLowerCase(); if (/crimson|lattice/.test(v)) finish(); else if (/ember|bear/.test(v)) { SFX.bad(); shell.flashBad(); shell.setHint('That’s the false flag — language is the easiest indicator to fake. Weight the technical TTPs.'); } else { SFX.bad(); shell.flashBad(); shell.setHint('Not supported by the artifacts. Three independent technical indicators name one group.'); } input.value=''; } else SFX.type(); });
    } else {
      [['Crimson Lattice — infra + code + cert overlap', true],
       ['Ember Bear — Cyrillic comments in the dropper', false, 'Language/locale is the easiest indicator to plant. Three technical indicators outweigh it.'],
       ['Lone "script kiddie" — opportunistic', false, 'Custom packer, dedicated C2 and a stolen cert indicate an organised, resourced actor.']]
        .forEach(([t, ok, why], i) => {
          const c = document.createElement('div'); c.className = 'card'; c.innerHTML = `<div class="ct">CANDIDATE ${String.fromCharCode(65 + i)}</div><div class="cd">${t}</div>`;
          c.addEventListener('click', () => { if (ok) { c.classList.add('correct'); finish(); } else { c.classList.add('wrong'); SFX.bad(); shell.flashBad(); shell.setHint('✗ ' + why); } });
          grid.appendChild(c);
        });
    }
  }

  function finish() {
    SFX.good(); shell.flashGood(); shell.setDots(2, 2);
    grid.innerHTML = `<div class="ok" style="grid-column:1/-1;padding:16px">✓ Attribution: <b>CRIMSON LATTICE</b> — supported by convergent, hard-to-fake technical indicators. False flag rejected.<br>━━━ ATTRIBUTION COMPLETE — OBJECTIVE DONE ━━━</div>`;
    SFX.unlock(); setTimeout(() => onDone(true), 900);
  }

  collectStage();
  return shell;
}
