// Phase 1/2 — Safe sandbox tutorial. The Handler explains the theory in plain
// language, then walks the player through a guided practice with the correct
// step HIGHLIGHTED and INFINITE retries. No fail state here — this is training
// on the handheld before the live objective.
import { buildShell, escapeHtml } from './shell.js';
import { getTeach } from '../teachdata.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const data = getTeach(ctx.level.id);
  const shell = buildShell(host, { title: 'TRAINING SIM ▸ handheld sandbox', sub: 'Safe practice · infinite retries · no alarms. Learn it here, do it live next.' });
  if (!data) { onDone(true); return shell; }

  const banner = document.createElement('div'); banner.className = 'teach-banner';
  banner.innerHTML = `◈ TUTORIAL — ${escapeHtml(data.concept)} · the Handler will walk you through this. Take your time.`;
  shell.body.appendChild(banner);
  const region = document.createElement('div'); region.style.cssText = 'flex:1;overflow:auto'; shell.body.appendChild(region);

  let phase = 0; // 0..intro.length-1 = narration, then steps
  const total = data.steps.length; shell.setDots(0, total);
  let stepIdx = 0;

  function say(who, line, btnLabel, onNext) {
    region.innerHTML = `<div class="teach-say"><div class="who">${who} ▸ radio</div><div class="line">${escapeHtml(line)}</div></div>`;
    const b = document.createElement('button'); b.className = 'btn'; b.style.margin = '0 16px'; b.textContent = btnLabel;
    b.addEventListener('click', () => { SFX.ui(); onNext(); });
    region.appendChild(b);
  }

  function runIntro() {
    if (phase < data.intro.length) {
      const last = phase === data.intro.length - 1;
      say('ORACLE', data.intro[phase], last ? 'BEGIN PRACTICE ▷' : 'NEXT ▷', () => { phase++; runIntro(); });
    } else { renderStep(); }
  }

  function renderStep() {
    if (stepIdx >= total) { return finish(); }
    const s = data.steps[stepIdx];
    region.innerHTML = `<div class="teach-say"><div class="who">ORACLE ▸ guidance</div><div class="line">${escapeHtml(s.say)}</div></div>`;
    const list = document.createElement('div'); list.className = 'choices'; list.style.padding = '0 16px';
    // present options; the CORRECT one is visually highlighted (guided)
    s.options.forEach((o, i) => {
      const b = document.createElement('div'); b.className = 'choice' + (o[1] ? ' guided' : '');
      b.innerHTML = `<span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(o[0])}`;
      b.addEventListener('click', () => {
        if (o[1]) {
          b.classList.add('correct'); SFX.good(); shell.flashGood();
          stepIdx++; shell.setDots(stepIdx, total);
          say('ORACLE', s.ok, stepIdx >= total ? 'FINISH TRAINING ▷' : 'NEXT ▷', renderStep);
        } else {
          b.classList.add('wrong'); SFX.bad(); shell.flashBad();
          shell.setHint('Not quite — no penalty here. The highlighted option is the one to pick. Try again.');
        }
      });
      list.appendChild(b);
    });
    region.appendChild(list);
    shell.setHint('Practice — follow the highlighted ◄ recommended step. Infinite retries.');
  }

  function finish() {
    region.innerHTML = `<div class="ok" style="padding:18px;text-align:center">✓ Training complete — you’ve got the concept.<br><br>━━━ PROCEEDING TO LIVE OBJECTIVE ━━━<br><span class="muted" style="font-size:12px">From here, mistakes have consequences. Stay sharp.</span></div>`;
    SFX.unlock(); setTimeout(() => onDone(true), 1100);
  }

  runIntro();
  return shell;
}
