// MANDATORY knowledge gate (appended to every sector). Each question is tagged
// to a learning outcome and its source text/standard. The level cannot be
// cleared until every underlying concept is demonstrated — the addendum's
// "no concept left behind" / puzzle-dependency requirement, enforced.
import { buildShell, isHardcore, escapeHtml } from './shell.js';
import { getCodex } from '../codex.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const codex = getCodex(ctx.level.id);
  const checks = (codex && codex.checks) || [];
  const hard = isHardcore();
  const shell = buildShell(host, { title: 'INTEL CODEX ▸ knowledge verification', sub: 'Field-reference check. Demonstrate the theory to disengage the lock.' });

  const body = document.createElement('div'); body.style.cssText = 'display:flex;flex-direction:column;width:100%;padding:18px;gap:8px;overflow:auto';
  shell.body.appendChild(body);
  let idx = 0; shell.setDots(0, checks.length);

  if (!checks.length) { onDone(true); return shell; }

  function render() {
    body.innerHTML = '';
    if (idx >= checks.length) return;
    const c = checks[idx];
    const head = document.createElement('div');
    head.innerHTML = `<div style="color:#5a7488;font-size:11px;letter-spacing:2px">VERIFICATION ${idx + 1}/${checks.length} · ${escapeHtml(c.principle)}</div>
      <div class="hl" style="margin:6px 0;font-size:15px">▌ ${escapeHtml(c.q)}</div>
      <div style="color:#2bb7ff;font-size:11px;margin-bottom:8px">source: ${escapeHtml(c.ref)}</div>`;
    body.appendChild(head);
    shell.setHint(hard ? 'Type your answer and press <b>Enter</b>. Concept must be demonstrated.' : 'Select the correct answer to proceed.');

    if (hard) {
      const line = document.createElement('div'); line.className = 'cli-line';
      line.innerHTML = `<span class="cli-prompt">codex&gt;</span>`;
      const input = document.createElement('input'); input.className = 'cli-input'; input.placeholder = 'answer…'; input.autocomplete = 'off';
      line.appendChild(input); body.appendChild(line); input.focus();
      const fb = document.createElement('div'); fb.style.cssText = 'font-size:12px;color:#ff3b5c;margin-top:6px'; body.appendChild(fb);
      input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') { SFX.type(); return; }
        const v = input.value.trim().toLowerCase().replace(/\s+/g, ' ');
        const ok = (c.answer || []).some(a => v === a.toLowerCase() || (v.length > 3 && v.includes(a.toLowerCase())) || a.toLowerCase().includes(v) && v.length > 4);
        if (ok) { good(); } else { SFX.bad(); shell.flashBad(); fb.textContent = '✗ Not demonstrated. Recall the source: ' + c.ref; }
      });
    } else {
      const list = document.createElement('div'); list.className = 'choices';
      const opts = shuffle(c.choices.map((ch, i) => ({ t: ch[0], ok: ch[1], why: ch[2], i })));
      opts.forEach((o, i) => {
        const b = document.createElement('div'); b.className = 'choice';
        b.innerHTML = `<span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(o.t)}`;
        b.addEventListener('click', () => {
          if (o.ok) { b.classList.add('correct'); good(); }
          else { b.classList.add('wrong'); SFX.bad(); shell.flashBad(); shell.setHint('✗ ' + (o.why || 'Incorrect.') + '  (source: ' + c.ref + ')'); }
        });
        list.appendChild(b);
      });
      body.appendChild(list);
    }
  }

  function good() {
    SFX.good(); shell.flashGood(); idx++; shell.setDots(idx, checks.length);
    if (idx >= checks.length) {
      body.innerHTML = `<div class="ok" style="padding:16px;text-align:center">✓ All field-reference concepts demonstrated.<br>━━━ KNOWLEDGE VERIFIED — SECTOR CLEARED ━━━</div>`;
      SFX.unlock(); setTimeout(() => onDone(true), 900);
    } else setTimeout(render, 250);
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  render();
  return shell;
}
