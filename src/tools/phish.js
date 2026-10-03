// L8 — Security Behaviour & Social Engineering. Build a pretext that exploits
// cognitive levers (authority, urgency, social proof, ease — Cialdini; Fogg B=MAP;
// MINDSPACE). Raise believability past the guard's threshold.
import { buildShell, isHardcore, escapeHtml } from './shell.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'Pretext Composer ▸ target: Gate-3 guard', sub: 'Pick the levers that bend behaviour. Refs: Cialdini influence; Fogg B=MAP; Thaler & Sunstein, "Nudge".' });
  const hard = isHardcore();
  shell.setConcept('People bend to <b>authority</b> and <b>urgency</b>, and act only when it’s <b>easy</b> (Fogg: Motivation, Ability, Prompt). A threat or a blunt demand triggers alarm, not compliance — nudge, don’t shove.');

  const steps = [
    {
      label: 'SENDER (authority)', principle: 'Authority',
      opts: [
        { t: 'facilities-security@helix-corp.com (internal authority)', ok: true },
        { t: 'totally-not-a-scam@freemail.ru', ok: false, why: 'No authority, obvious spoof — credibility collapses instantly.' },
        { t: 'anonymous@protonmail.com', ok: false, why: 'Anonymity removes the authority cue the target defers to.' }
      ]
    },
    {
      label: 'SUBJECT (urgency / scarcity)', principle: 'Urgency',
      opts: [
        { t: 'ACTION REQUIRED: badge re-validation closes in 15 min', ok: true },
        { t: 'hello (read whenever)', ok: false, why: 'No urgency → no action. Fogg: a trigger needs motivation now.' },
        { t: 'FREE PRIZE CLICK NOW!!!', ok: false, why: 'Triggers the spam heuristic; raises suspicion, not compliance.' }
      ]
    },
    {
      label: 'PRETEXT (plausibility / social proof)', principle: 'Social proof',
      opts: [
        { t: '“Per the rollout the rest of your shift already completed, re-validate your card at Reader B.”', ok: true },
        { t: '“Give me your password and PIN right now.”', ok: false, why: 'Direct credential requests trip training. Nudge, don’t demand.' },
        { t: '“There is a bomb in the building.”', ok: false, why: 'Threat triggers alarm + response, the opposite of quiet compliance.' }
      ]
    },
    {
      label: 'CALL TO ACTION (make it easy — Fogg)', principle: 'Ability/ease',
      opts: [
        { t: 'One tap at Reader B (by the east stairwell) re-validates instantly', ok: true },
        { t: 'Fill in this 12-page form and mail it to head office', ok: false, why: 'High friction kills the behaviour — Fogg: ability must be high.' },
        { t: 'Drive to another site to re-validate', ok: false, why: 'Maximum friction; the target abandons the action.' }
      ]
    }
  ];

  let idx = 0, belief = 0;
  shell.setDots(0, steps.length);
  const body = document.createElement('div'); body.style.cssText = 'display:flex;flex-direction:column;width:100%;padding:16px;gap:10px;overflow:auto';
  shell.body.appendChild(body);
  const meter = document.createElement('div');
  meter.innerHTML = `<div style="display:flex;justify-content:space-between;font-size:12px;color:#5a7488"><span>BELIEVABILITY</span><span id="bv">0%</span></div><div class="meter-bar" style="height:12px"><div id="bf" class="meter-fill" style="width:0%"></div></div>`;
  body.appendChild(meter);
  const region = document.createElement('div'); body.appendChild(region);

  function render() {
    region.innerHTML = '';
    if (idx >= steps.length) return;
    const s = steps[idx];
    const h = document.createElement('div'); h.className = 'hl'; h.style.margin = '10px 0 4px';
    h.innerHTML = `▌ ${s.label}`;
    region.appendChild(h);
    shell.setHint(hard ? `Choose the option that best exploits: ${s.principle}.` : `Lever: <b>${s.principle}</b>. Pick the most effective option.`);
    const list = document.createElement('div'); list.className = 'choices';
    const opts = shuffle(s.opts.slice());
    opts.forEach((o, i) => {
      const b = document.createElement('div'); b.className = 'choice';
      b.innerHTML = `<span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(o.t)}`;
      b.addEventListener('click', () => {
        if (o.ok) { b.classList.add('correct'); belief = Math.min(100, belief + 25); SFX.good(); shell.flashGood(); idx++; shell.setDots(idx, steps.length); updateMeter(); setTimeout(render, 350); }
        else { b.classList.add('wrong'); belief = Math.max(0, belief - 10); SFX.bad(); shell.flashBad(); updateMeter(); shell.setHint('✗ ' + o.why); }
      });
      list.appendChild(b);
    });
    region.appendChild(list);
  }
  function updateMeter() {
    document.getElementById('bv').textContent = belief + '%';
    const f = document.getElementById('bf'); f.style.width = belief + '%';
    f.style.background = belief >= 90 ? '#36e07a' : belief >= 50 ? '#ffb020' : '#ff3b5c';
    if (idx >= steps.length && belief >= 90) finish();
  }
  function finish() {
    region.innerHTML = `<div class="ok" style="padding:14px">✓ Pretext sent. The guard — deferring to authority, under time pressure, with a one-tap action — re-validates at Reader B, steps off his route, and the biometric vault unlocks behind him.<br><br>━━━ TARGET NUDGED — OBJECTIVE COMPLETE ━━━</div>`;
    SFX.unlock(); setTimeout(() => onDone(true), 1000);
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  render();
  return shell;
}
