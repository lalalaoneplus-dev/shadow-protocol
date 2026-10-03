// Shared chrome + helpers for the in-game "portable terminal" tools.
import { SFX } from '../audio.js';
import { State, Difficulty } from '../state.js';

export function isHardcore() { return State.settings.difficulty === Difficulty.HARDCORE; }

// Build the standard tool window. Returns { root, body, foot, setHint, setDots, close }.
export function buildShell(host, { title, sub }) {
  const wrap = document.createElement('div');
  wrap.className = 'tool-wrap scanlines';
  wrap.innerHTML = `
    <div class="tool">
      <div class="tool-bar">
        <span class="dot"></span><span class="dot y"></span><span class="dot g"></span>
        <span class="ttl">${title}</span>
        <span class="spacer"></span>
        <span class="diff">MODE: ${isHardcore() ? 'HARDCORE' : 'NORMAL'}</span>
        <span class="x" data-x>ABORT ▷ return to field</span>
      </div>
      <div class="tool-radio hidden"><span class="who">ORACLE ▸ radio</span><span class="line"></span></div>
      <div class="tool-body"></div>
      <div class="tool-foot"><div class="tool-hint"></div><div class="progress-pips"></div></div>
    </div>`;
  host.appendChild(wrap);
  const body = wrap.querySelector('.tool-body');
  const foot = wrap.querySelector('.tool-hint');
  const pips = wrap.querySelector('.progress-pips');
  const radio = wrap.querySelector('.tool-radio');
  if (sub) foot.innerHTML = sub;

  const api = {
    root: wrap, body, foot, pips,
    setHint: (h) => { foot.innerHTML = h; },
    // Phase 4 — Handler radio hint (conceptual, never the answer)
    radio: (text) => {
      radio.querySelector('.line').innerHTML = text;
      radio.classList.remove('hidden'); radio.classList.remove('flash-good'); void radio.offsetWidth; radio.classList.add('flash-good');
      SFX.alert();
    },
    // returns a fail-counter: call .fail(conceptualHint) on each wrong attempt;
    // ORACLE breaks in on the 2nd failure.
    failTracker: () => { let n = 0; return (hint) => { n++; if (n >= 2 && hint) api.radio(hint); return n; }; },
    setDots: (done, total) => {
      pips.innerHTML = '';
      for (let i = 0; i < total; i++) {
        const p = document.createElement('div'); p.className = 'pip' + (i < done ? ' done' : ''); pips.appendChild(p);
      }
    },
    flashGood: () => { const t = wrap.querySelector('.tool'); t.classList.remove('flash-good'); void t.offsetWidth; t.classList.add('flash-good'); },
    // flashBad doubles as the Phase-4 fail counter: on the 2nd wrong attempt
    // (per stage) ORACLE breaks in with the current conceptual hint.
    flashBad: () => {
      const t = wrap.querySelector('.tool'); t.classList.remove('flash-bad'); void t.offsetWidth; t.classList.add('flash-bad');
      api._fails = (api._fails || 0) + 1;
      if (api._fails >= 2 && api._concept) api.radio(api._concept);
    },
    // set the conceptual hint for the current puzzle/stage; resets the counter
    setConcept: (text) => { api._concept = text; api._fails = 0; },
    _fails: 0, _concept: null,
    close: () => { wrap.remove(); }
  };
  wrap.querySelector('[data-x]').addEventListener('click', () => { SFX.back(); if (api.onAbort) api.onAbort(); });
  return api;
}

// ── Generic sequential task runner (used by most tools) ──────────────────
// tasks: [{ prompt, narrative?, choices:[{label,correct,tag}], answer:[..],
//           hint, success, cli?:bool }]
// Renders either choice list (NORMAL) or typed input (HARDCORE).
export function runTasks(shell, { tasks, prompt = 'shadow@op', onDone, cliStyle = false, intro = [] }) {
  let idx = 0;
  const hard = isHardcore();
  shell.setDots(0, tasks.length);

  // CLI output area shared across tasks for shell-like tools
  const out = document.createElement('div');
  out.className = 'cli-out';
  const cli = document.createElement('div');
  cli.className = 'cli';
  cli.appendChild(out);
  const interactRegion = document.createElement('div');
  cli.appendChild(interactRegion);
  shell.body.appendChild(cli);

  function print(html, cls = '') {
    const d = document.createElement('div');
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d);
    out.scrollTop = out.scrollHeight;
  }
  for (const line of intro) print(line, 'muted');

  function renderTask() {
    interactRegion.innerHTML = '';
    if (idx >= tasks.length) { return; }
    const t = tasks[idx];
    t._fail = shell.failTracker(); // Phase 4: ORACLE hint on 2nd wrong
    if (t.narrative) print(t.narrative, 'acc');
    print('▌ ' + t.prompt, 'hl');
    shell.setHint(hard ? (t.hcHint || 'Type the correct command/answer and press <b>Enter</b>.') : (t.hint || 'Select the correct option.'));

    if (hard && (t.answer || t.cli)) {
      // typed input
      const line = document.createElement('div');
      line.className = 'cli-line';
      line.innerHTML = `<span class="cli-prompt">${prompt}:~$</span>`;
      const input = document.createElement('input');
      input.className = 'cli-input'; input.autocomplete = 'off'; input.spellcheck = false;
      input.placeholder = t.placeholder || 'enter command…';
      line.appendChild(input);
      interactRegion.appendChild(line);
      input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = input.value.trim();
          if (!val) return;
          print(`<span class="cli-prompt">${prompt}:~$</span> <span class="cmd">${escapeHtml(val)}</span>`);
          input.value = '';
          checkAnswer(t, val);
        } else { SFX.type(); }
      });
    } else {
      // choice list
      const list = document.createElement('div');
      list.className = 'choices';
      t.choices.forEach((c, i) => {
        const b = document.createElement('div');
        b.className = 'choice';
        b.innerHTML = `<span class="k">${String.fromCharCode(65 + i)}</span>${c.label}`;
        b.addEventListener('click', () => {
          if (c.correct) { b.classList.add('correct'); advance(t, c); }
          else { b.classList.add('wrong'); SFX.bad(); shell.flashBad(); print('✗ ' + (c.why || 'Incorrect — reassess.'), 'err'); t._fail(t.radio); }
        });
        list.appendChild(b);
      });
      interactRegion.appendChild(list);
    }
  }

  function checkAnswer(t, val) {
    const accepts = (t.answer || []).map(a => a.toLowerCase());
    const norm = val.toLowerCase().replace(/\s+/g, ' ');
    const ok = accepts.some(a => norm === a || (t.contains && norm.includes(a)));
    if (ok) { advance(t, { label: val }); }
    else {
      SFX.bad(); shell.flashBad();
      print('✗ ' + (t.fail || 'Command rejected. ' + (t.hcHint || '')), 'err');
      t._fail(t.radio);
    }
  }

  function advance(t, choice) {
    SFX.good(); shell.flashGood();
    if (t.success) print('✓ ' + t.success, 'ok');
    idx++;
    shell.setDots(idx, tasks.length);
    if (idx >= tasks.length) {
      print('', '');
      print('━━━ OBJECTIVE COMPLETE ━━━', 'ok');
      SFX.unlock();
      setTimeout(() => onDone(true), 700);
    } else {
      setTimeout(renderTask, 250);
    }
  }

  renderTask();
  return { print };
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
