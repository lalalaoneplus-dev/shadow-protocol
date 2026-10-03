// Shadow Protocol — UI layer (menus, HUD, briefings, codex, pause, save/load).
import { State, Difficulty } from './state.js';
import { SFX, setVolume } from './audio.js';
import { getCodex } from './codex.js';
import { getFragments, FRAGMENTS } from './fragments.js';
import { LEVELS } from './content.js';

const overlay = () => document.getElementById('overlay');
const hud = () => document.getElementById('hud');

export function showOverlay(html) {
  const o = overlay(); o.innerHTML = html; o.classList.add('active');
  return o;
}
export function hideOverlay() { const o = overlay(); o.classList.remove('active'); o.innerHTML = ''; }
export function showHUD(on) { hud().classList.toggle('hidden', !on); }

// ---------------- HUD updates ----------------
export const HUD = {
  setLevel: (t) => { document.getElementById('hud-level').textContent = t; },
  setObjective: (t) => { document.getElementById('hud-objective').textContent = t; },
  setVisibility: (v) => {
    const f = document.getElementById('vis-fill'); f.style.width = Math.round(v * 100) + '%';
    f.style.background = v > 0.66 ? '#ff3b5c' : v > 0.33 ? '#ffb020' : '#19e6c8';
  },
  setAlert: (v, seeing) => {
    const f = document.getElementById('alert-fill'); f.style.width = Math.round(v * 100) + '%';
    hud().classList.toggle('alarm', v > 0.5);
  },
  setStance: (s) => { document.getElementById('stance').textContent = s; },
  prompt: (kind) => {
    const p = document.getElementById('hud-prompt');
    if (!kind) { p.classList.add('hidden'); return; }
    p.classList.remove('hidden');
    if (kind === 'terminal') p.innerHTML = 'Hold position · press <span class="key">E</span> to jack into terminal';
    else if (kind === 'takedown') p.innerHTML = 'Behind target · press <span class="key">F</span> to take down sentry';
  },
  toast: (msg, dur = 1600) => {
    const t = document.getElementById('hud-toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), dur);
  },
  setFrag: (got, total) => { document.getElementById('hud-frag').innerHTML = `◈ INTEL FRAGMENTS ${got}/${total}`; }
};

// ---------------- Main menu ----------------
export function mainMenu(h) {
  const canContinue = State.highestUnlocked > 1 || State.level > 1;
  showOverlay(`
    <div class="screen scanlines">
      <div class="title-big">SHADOW PROTOCOL</div>
      <div class="title-sub">A TACTICAL CYBER-INFILTRATION</div>
      <div class="tagline">Ten fortified sectors. One Shadow Operator. Slip through the dark, master the operator's toolkit, and dismantle Helix Corp from the inside.</div>
      <div class="menu">
        <div class="menu-item" data-a="new">NEW OPERATION</div>
        <div class="menu-item ${canContinue ? '' : 'disabled'}" data-a="continue">CONTINUE</div>
        <div class="menu-item" data-a="select">SELECT SECTOR</div>
        <div class="menu-item" data-a="codex">FIELD CODEX</div>
        <div class="menu-item" data-a="settings">SETTINGS</div>
        <div class="menu-item" data-a="quit">EXIT</div>
      </div>
      <div class="menu-foot">v1.0 · 100% OFFLINE · ${State.settings.difficulty === Difficulty.HARDCORE ? 'HARDCORE' : 'NORMAL'} MODE</div>
    </div>`);
  bindMenu(h);
}
function bindMenu(h) {
  overlay().querySelectorAll('.menu-item').forEach(el => {
    el.addEventListener('click', () => {
      if (el.classList.contains('disabled')) return;
      SFX.confirm();
      h[el.dataset.a] && h[el.dataset.a]();
    });
    el.addEventListener('mouseenter', () => SFX.ui());
  });
}

// ---------------- Settings ----------------
export function settings(onBack) {
  const s = State.settings;
  showOverlay(`
    <div class="screen scanlines">
      <div class="panel">
        <h2>SETTINGS</h2><div class="sub">configuration · saved locally</div>
        <div class="set-row">
          <div><div class="lbl">DIFFICULTY</div><div class="desc">Normal: multiple-choice hacking · Hardcore: type real commands, sharper sentries</div></div>
          <div class="seg" data-seg="difficulty">
            <div class="opt ${s.difficulty === 'normal' ? 'on' : ''}" data-v="normal">NORMAL</div>
            <div class="opt ${s.difficulty === 'hardcore' ? 'on' : ''}" data-v="hardcore">HARDCORE</div>
          </div>
        </div>
        <div class="set-row">
          <div><div class="lbl">MASTER VOLUME</div></div>
          <input type="range" min="0" max="1" step="0.05" value="${s.masterVolume}" data-r="masterVolume">
        </div>
        <div class="set-row">
          <div><div class="lbl">MOUSE SENSITIVITY</div></div>
          <input type="range" min="0.3" max="2.5" step="0.1" value="${s.mouseSensitivity}" data-r="mouseSensitivity">
        </div>
        <div class="set-row">
          <div><div class="lbl">INVERT Y-AXIS</div></div>
          <div class="seg" data-seg="invertY">
            <div class="opt ${!s.invertY ? 'on' : ''}" data-v="off">OFF</div>
            <div class="opt ${s.invertY ? 'on' : ''}" data-v="on">ON</div>
          </div>
        </div>
        <div class="row" style="margin-top:20px;justify-content:flex-end"><button class="btn" data-back>◂ BACK</button></div>
      </div>
    </div>`);
  overlay().querySelectorAll('[data-seg] .opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const seg = opt.closest('[data-seg]').dataset.seg; const v = opt.dataset.v;
      opt.parentElement.querySelectorAll('.opt').forEach(o => o.classList.remove('on')); opt.classList.add('on');
      if (seg === 'difficulty') State.settings.difficulty = v;
      if (seg === 'invertY') State.settings.invertY = (v === 'on');
      SFX.ui();
    });
  });
  overlay().querySelectorAll('input[type=range]').forEach(r => {
    r.addEventListener('input', () => {
      State.settings[r.dataset.r] = parseFloat(r.value);
      if (r.dataset.r === 'masterVolume') setVolume(parseFloat(r.value));
    });
  });
  overlay().querySelector('[data-back]').addEventListener('click', () => { SFX.back(); onBack(); });
}

// ---------------- Sector select ----------------
export function sectorSelect(onPick, onBack) {
  const items = LEVELS.map(l => {
    const locked = l.id > State.highestUnlocked;
    return `<div class="slot ${locked ? '' : ''}">
      <div class="info"><div class="nm">${String(l.id).padStart(2, '0')} · ${l.codename}${locked ? ' 🔒' : ''}</div>
      <div class="meta">${l.sector} — ${l.domain}</div></div>
      <div class="acts">${locked ? '<span class="meta">LOCKED</span>' : `<button class="btn" data-go="${l.id}">INFILTRATE</button>`}</div></div>`;
  }).join('');
  showOverlay(`<div class="screen scanlines"><div class="panel" style="max-width:760px;max-height:80vh;overflow:auto">
    <h2>SELECT SECTOR</h2><div class="sub">cleared sectors stay unlocked</div>${items}
    <div class="row" style="justify-content:flex-end;margin-top:16px"><button class="btn ghost" data-back>◂ BACK</button></div></div></div>`);
  overlay().querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { SFX.confirm(); onPick(parseInt(b.dataset.go)); }));
  overlay().querySelector('[data-back]').addEventListener('click', () => { SFX.back(); onBack(); });
}

// ---------------- Field Codex (reference library + outcome coverage) ----------------
export function codexScreen(onBack, levelId) {
  const id = levelId || 1;
  const tabs = LEVELS.map(l => `<div class="menu-item" style="padding:8px 10px;font-size:12px;${l.id === id ? 'background:var(--accent);color:var(--bg)' : ''}" data-tab="${l.id}">${String(l.id).padStart(2, '0')} ${l.codename}</div>`).join('');
  const c = getCodex(id); const lvl = LEVELS[id - 1];
  const lib = c.library.map(x => `<li><b>${x.ref}</b> <span class="muted">— ${x.note}</span></li>`).join('');
  const outs = c.outcomes.map(o => `<li>${o}</li>`).join('');
  showOverlay(`<div class="screen scanlines"><div class="panel" style="max-width:900px;max-height:84vh;display:flex;gap:16px">
    <div style="width:200px;border-right:1px solid rgba(25,230,200,.2);padding-right:12px;overflow:auto;max-height:78vh">${tabs}</div>
    <div style="flex:1;overflow:auto;max-height:78vh">
      <h2>${lvl.codename}</h2><div class="sub">${lvl.sector} · ${c.discipline}</div>
      <div class="brief-tag">FIELD REFERENCE LIBRARY</div>
      <ul style="line-height:1.8;font-size:13px;color:#a9ccd8">${lib}</ul>
      <div class="brief-tag" style="margin-top:14px">LEARNING-OUTCOME COVERAGE — every concept maps to a mandatory objective</div>
      <ol style="line-height:1.7;font-size:12.5px;color:#a9ccd8">${outs}</ol>
      <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn ghost" data-back>◂ BACK</button></div>
    </div></div></div>`);
  overlay().querySelectorAll('[data-tab]').forEach(t => t.addEventListener('click', () => { SFX.ui(); codexScreen(onBack, parseInt(t.dataset.tab)); }));
  overlay().querySelector('[data-back]').addEventListener('click', () => { SFX.back(); onBack(); });
}

// ---------------- Briefing ----------------
export function briefing(level, onStart, onCodex) {
  const c = getCodex(level.id);
  const dlg = level.dialogue.map(d => `<div style="margin:6px 0"><span style="color:var(--accent);font-size:11px;letter-spacing:2px">${d.who}</span><div style="color:#c8f2ff">“${d.line}”</div></div>`).join('');
  showOverlay(`<div class="screen scanlines"><div class="panel" style="max-width:820px;max-height:86vh;overflow:auto">
    <div class="brief-tag">SECTOR ${String(level.id).padStart(2, '0')} / 10 · ${c.discipline}</div>
    <h2>${level.codename}</h2><div class="sub">${level.sector}</div>
    <p>${level.brief}</p>
    <div class="intel"><b>INTEL:</b> ${level.intel}</div>
    <div style="margin-top:12px;border-top:1px dashed rgba(90,116,136,.3);padding-top:10px">${dlg}</div>
    <div class="objective-box"><div class="lbl">PRIMARY OBJECTIVE</div><div class="txt">${level.objective}</div>
      <div class="desc" style="color:#5a7488;font-size:11px;margin-top:6px">Sector locks until the objective AND its knowledge gate are cleared.</div></div>
    <div class="row" style="justify-content:space-between;margin-top:18px">
      <button class="btn ghost" data-codex>⌕ FIELD CODEX</button>
      <button class="btn big" data-start>BEGIN INFILTRATION ▷</button>
    </div></div></div>`);
  overlay().querySelector('[data-start]').addEventListener('click', () => { SFX.confirm(); onStart(); });
  overlay().querySelector('[data-codex]').addEventListener('click', () => { SFX.ui(); onCodex(); });
}

// ---------------- Click to engage (pointer lock gesture) ----------------
export function clickToEngage(onEngage) {
  showOverlay(`<div class="screen" style="background:rgba(3,5,8,.6)">
    <div style="text-align:center">
      <div class="title-sub" style="font-size:18px">CLICK TO ENGAGE</div>
      <div class="tagline">WASD move · Mouse look · <span class="kbd">Shift</span> sprint · <span class="kbd">C</span> crouch · <span class="kbd">F</span> takedown · <span class="kbd">E</span> interact · <span class="kbd">Esc</span> pause</div>
    </div></div>`);
  const o = overlay();
  const handler = () => { o.removeEventListener('click', handler); hideOverlay(); SFX.confirm(); onEngage(); };
  o.addEventListener('click', handler);
}

// ---------------- Data Codex (collected Intel Fragments) ----------------
export function dataCodex(onBack) {
  let got = 0, total = 0;
  const sections = LEVELS.map(l => {
    const frags = getFragments(l.id);
    const cards = frags.map((f, i) => {
      total++;
      const have = !!(State.collectedFragments && State.collectedFragments[l.id + '-' + i]);
      if (have) got++;
      return have
        ? `<div class="frag-card"><div class="ft">◈ ${f.title}</div><div class="fb">${f.body}</div><div class="fs">source: ${f.source}</div></div>`
        : `<div class="frag-card locked"><div class="ft">◈ ENCRYPTED FRAGMENT</div><div class="fb">— locate this glowing fragment in Sector ${String(l.id).padStart(2, '0')} to decrypt —</div></div>`;
    }).join('');
    const unlocked = l.id <= State.highestUnlocked;
    return `<div style="margin-bottom:14px"><div class="brief-tag" style="border-color:var(--accent-blue);color:var(--accent-blue)">SECTOR ${String(l.id).padStart(2, '0')} · ${l.codename}${unlocked ? '' : ' 🔒'}</div>${cards}</div>`;
  }).join('');
  showOverlay(`<div class="screen scanlines"><div class="panel" style="max-width:780px;max-height:86vh;display:flex;flex-direction:column">
    <h2>DATA CODEX</h2><div class="sub">Intel Fragments — literal field definitions you’ve recovered · <b id="fragcount">${got}/${total}</b></div>
    <div style="overflow:auto;flex:1;margin-top:10px">${sections}</div>
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn ghost" data-back>◂ BACK</button></div></div></div>`);
  overlay().querySelector('[data-back]').addEventListener('click', () => { SFX.back(); onBack(); });
}

// ---------------- Pause ----------------
export function pause(h) {
  showOverlay(`<div class="screen" style="background:rgba(3,5,8,.85)"><div class="panel" style="max-width:420px">
    <h2>PAUSED</h2><div class="sub">operation suspended</div>
    <div class="center-col">
      <button class="btn wide big" data-a="resume">RESUME</button>
      <button class="btn wide" data-a="datacodex">DATA CODEX ◈</button>
      <button class="btn wide" data-a="save">SAVE</button>
      <button class="btn wide" data-a="load">LOAD</button>
      <button class="btn wide" data-a="settings">SETTINGS</button>
      <button class="btn wide ghost" data-a="abort">ABORT TO MENU</button>
    </div></div></div>`);
  overlay().querySelectorAll('[data-a]').forEach(b => b.addEventListener('click', () => { SFX.confirm(); h[b.dataset.a] && h[b.dataset.a](); }));
}

// ---------------- Save / Load ----------------
export function saveLoad(mode, slots, onSlot, onBack) {
  const names = { auto: 'AUTOSAVE', '1': 'SLOT 1', '2': 'SLOT 2', '3': 'SLOT 3' };
  const order = mode === 'save' ? ['1', '2', '3'] : ['auto', '1', '2', '3'];
  const rows = order.map(s => {
    const d = slots[s];
    const meta = d ? `Sector ${String(d.level).padStart(2, '0')} · ${d.difficulty || 'normal'} · ${new Date(d.ts).toLocaleString()}` : 'empty';
    const can = mode === 'save' ? true : !!d;
    return `<div class="slot"><div class="info"><div class="nm">${names[s]}</div><div class="meta">${meta}</div></div>
      <div class="acts">${can ? `<button class="btn" data-slot="${s}">${mode === 'save' ? 'SAVE HERE' : 'LOAD'}</button>` : '<span class="meta">—</span>'}</div></div>`;
  }).join('');
  showOverlay(`<div class="screen" style="background:rgba(3,5,8,.85)"><div class="panel" style="max-width:560px">
    <h2>${mode === 'save' ? 'SAVE OPERATION' : 'LOAD OPERATION'}</h2><div class="sub">local save state</div>
    ${rows}
    <div class="row" style="justify-content:flex-end;margin-top:14px"><button class="btn ghost" data-back>◂ BACK</button></div></div></div>`);
  overlay().querySelectorAll('[data-slot]').forEach(b => b.addEventListener('click', () => { SFX.confirm(); onSlot(b.dataset.slot); }));
  overlay().querySelector('[data-back]').addEventListener('click', () => { SFX.back(); onBack(); });
}

// ---------------- Debrief ----------------
export function debrief(level, stats, onNext) {
  const last = level.id === 10;
  showOverlay(`<div class="screen scanlines"><div class="panel" style="max-width:720px">
    <div class="brief-tag" style="border-color:var(--good);color:var(--good)">SECTOR ${String(level.id).padStart(2, '0')} CLEARED</div>
    <h2 style="color:var(--good)">${level.codename} — SECURE</h2>
    <p>${level.debrief}</p>
    <div class="intel" style="margin-top:14px">
      <b>OP STATS:</b> times detected this sector: ${stats.detected} · total takedowns: ${State.takedowns} · ${stats.detected === 0 ? '<span style="color:var(--good)">GHOST BONUS — never spotted</span>' : 'stay darker next time'}
    </div>
    <div class="row" style="justify-content:flex-end;margin-top:18px">
      <button class="btn big" data-next>${last ? 'FINALISE OPERATION ▷' : 'PROCEED TO NEXT SECTOR ▷'}</button>
    </div></div></div>`);
  overlay().querySelector('[data-next]').addEventListener('click', () => { SFX.confirm(); onNext(); });
}

// ---------------- Victory ----------------
export function victory(onMenu) {
  showOverlay(`<div class="screen scanlines win-screen">
    <div class="title-big">OPERATION COMPLETE</div>
    <div class="title-sub">HELIX CORP NEUTRALISED</div>
    <div class="tagline">Ten sectors. Every lock, every cipher, every human bias — turned against them. The master server is dark and the Shadow Operator is a ghost once more.<br><br>You cleared every objective and every knowledge gate across the full operator curriculum: risk, cryptography, systems, networks, forensics, app-sec, privacy, behaviour, governance, and synthesis.</div>
    <div class="menu"><div class="menu-item" data-a="menu">RETURN TO MAIN MENU</div></div>
  </div>`);
  overlay().querySelector('[data-a]').addEventListener('click', () => { SFX.confirm(); onMenu(); });
}
