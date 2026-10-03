// Shadow Protocol — boot + master state machine.
import { State, resetRun, serialize } from './state.js';
import { Engine } from './engine.js';
import { getLevel, LEVELS } from './content.js';
import { getFragments } from './fragments.js';
import { openTerminal } from './terminal.js';
import * as UI from './ui.js';
import * as Save from './save.js';
import { SFX, resume as resumeAudio, setVolume, startDrone, stopDrone } from './audio.js';

let engine = null;
let scene = 'boot';
let current = null;     // { level, detected }
let pauseSub = null;    // sub-screen flag during pause

function setScene(s) { scene = s; State.scene = s; }

// ---------- boot ----------
async function boot() {
  // load settings from autosave if present (for menu display)
  try { const a = await Save.readSlot('auto'); if (a && a.settings) Object.assign(State.settings, a.settings); } catch (_) {}
  setVolume(State.settings.masterVolume);

  const canvas = document.getElementById('viewport');
  engine = new Engine(canvas);
  engine.start();

  // debug handles (harmless; aids automated verification)
  window.__SP = { engine, State, get scene() { return scene; }, startLevel, openTool, toMenu };

  // first gesture resumes audio
  window.addEventListener('pointerdown', () => resumeAudio(), { once: true });

  // pointer lock loss → pause (only while actively in the field)
  document.addEventListener('pointerlockchange', () => {
    const locked = document.pointerLockElement === canvas;
    if (!locked && scene === 'field') openPause();
  });
  // ESC inside a tool returns handled by tool; ESC in field handled by lock loss

  setTimeout(() => {
    const b = document.getElementById('boot'); b.style.opacity = '0';
    setTimeout(() => { b.style.display = 'none'; toMenu(); }, 600);
  }, 900);
}

// ---------- menu ----------
function toMenu() {
  setScene('menu'); UI.showHUD(false); stopDrone();
  UI.mainMenu({
    new: () => startRun(),
    continue: async () => { const ok = await Save.loadInto('auto'); if (ok) startLevel(State.level); else startRun(); },
    select: () => UI.sectorSelect(n => startLevel(n), toMenu),
    codex: () => UI.codexScreen(toMenu, 1),
    settings: () => UI.settings(toMenu),
    quit: () => { if (window.gameAPI && window.gameAPI.quit) window.gameAPI.quit(); else UI.HUD.toast('Close the window to exit.'); }
  });
}

function startRun() { resetRun(); startLevel(1); }

// ---------- level lifecycle ----------
async function startLevel(n) {
  State.level = n;
  if (n > State.highestUnlocked) State.highestUnlocked = n;
  current = { level: getLevel(n), detected: 0 };
  await Save.autosave();
  setScene('brief'); UI.showHUD(false); stopDrone();
  UI.briefing(current.level, () => engageField(), () => UI.codexScreen(() => UI.briefing(current.level, engageField, () => UI.codexScreen(toMenu, n)), n));
}

function engageField() {
  setScene('engage');
  // build the 3D sector
  engine.loadLevel(current.level.env, {
    onInteract: openTool,
    onCaught: onCaught,
    onTakedown: () => UI.HUD.toast('Sentry neutralised', 1000),
    onVisibility: (v) => UI.HUD.setVisibility(v),
    onAlert: (v, seeing) => UI.HUD.setAlert(v, seeing),
    onStance: (s) => UI.HUD.setStance(s),
    onPrompt: (k) => UI.HUD.prompt(k),
    onToast: (m) => UI.HUD.toast(m, 1200),
    onFragment: onFragment
  });
  UI.HUD.setLevel(`SECTOR ${String(current.level.id).padStart(2, '0')} · ${current.level.codename}`);
  UI.HUD.setObjective(current.level.objective);
  UI.HUD.setStance('STANDING');
  updateFragHud();
  UI.showHUD(true);
  startDrone();
  UI.clickToEngage(() => { setScene('field'); engine.requestLock(); });
}

function updateFragHud() {
  const total = getFragments(current.level.id).length;
  let got = 0; for (let i = 0; i < total; i++) if (State.collectedFragments[current.level.id + '-' + i]) got++;
  UI.HUD.setFrag(got, total);
}

function onFragment(index) {
  const frags = getFragments(current.level.id);
  State.collectedFragments[current.level.id + '-' + index] = true;
  SFX.unlock();
  UI.HUD.toast('◈ INTEL FRAGMENT RECOVERED — ' + (frags[index] ? frags[index].title : ''), 2200);
  updateFragHud();
  Save.autosave();
}

function onCaught() {
  current.detected++; State.alerts++;
  UI.HUD.toast('⚠ DETECTED — RELOCATING TO SHADOW', 1800);
  setTimeout(() => { if (scene === 'field') { engine.respawn(); UI.HUD.toast('Repositioned. Stay in the dark.', 1400); } }, 1300);
}

// ---------- tool (2D hack) ----------
function openTool() {
  if (scene !== 'field') return;
  setScene('tool');
  engine.releaseLock();
  UI.showHUD(false);
  openTerminal(document.getElementById('overlay'), current.level).then(success => {
    UI.hideOverlay();
    if (success) { onObjectiveComplete(); }
    else { // aborted — back to field
      setScene('field'); UI.showHUD(true);
      UI.clickToEngage(() => { setScene('field'); engine.requestLock(); });
    }
  });
}

async function onObjectiveComplete() {
  setScene('debrief'); stopDrone();
  if (current.level.id >= State.highestUnlocked && current.level.id < 10) State.highestUnlocked = current.level.id + 1;
  await Save.autosave();
  UI.debrief(current.level, { detected: current.detected }, () => {
    if (current.level.id === 10) { setScene('win'); UI.victory(toMenu); }
    else startLevel(current.level.id + 1);
  });
}

// ---------- pause ----------
function openPause() {
  if (scene !== 'field') return;
  setScene('pause');
  UI.showHUD(false);
  UI.pause({
    resume: () => { UI.hideOverlay(); setScene('field'); UI.showHUD(true); UI.clickToEngage(() => { setScene('field'); engine.requestLock(); }); },
    datacodex: () => UI.dataCodex(openPause),
    save: async () => { const slots = await Save.listSlots(); UI.saveLoad('save', slots, async (s) => { await Save.writeSlot(s); SFX.good(); openPause(); }, openPause); },
    load: async () => { const slots = await Save.listSlots(); UI.saveLoad('load', slots, async (s) => { const ok = await Save.loadInto(s); if (ok) startLevel(State.level); }, openPause); },
    settings: () => UI.settings(openPause),
    abort: () => { stopDrone(); toMenu(); }
  });
}

boot();
