// Procedural audio via Web Audio API — zero shipped audio files.
import { State } from './state.js';

let ctx = null;
let masterGain = null;
let droneNodes = null;

function ensure() {
  if (ctx) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = State.settings.masterVolume;
    masterGain.connect(ctx.destination);
  } catch (_) { ctx = null; }
}

export function resume() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); }
export function setVolume(v) { if (masterGain) masterGain.gain.value = v; }

function blip(freq, dur, type = 'square', vol = 0.2, slideTo = null) {
  ensure(); if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type; o.frequency.value = freq;
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
  g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  o.connect(g); g.connect(masterGain);
  o.start(); o.stop(ctx.currentTime + dur);
}

function noise(dur, vol = 0.15, filterFreq = 1200) {
  ensure(); if (!ctx) return;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = filterFreq;
  const g = ctx.createGain(); g.gain.value = vol;
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  src.connect(f); f.connect(g); g.connect(masterGain);
  src.start(); src.stop(ctx.currentTime + dur);
}

export const SFX = {
  ui: () => blip(660, 0.05, 'square', 0.12),
  confirm: () => { blip(540, 0.06, 'square', 0.14); setTimeout(() => blip(820, 0.08, 'square', 0.14), 50); },
  back: () => blip(300, 0.07, 'square', 0.12),
  step: () => noise(0.05, 0.05, 600),
  good: () => { blip(520, 0.08, 'sine', 0.18); setTimeout(() => blip(700, 0.1, 'sine', 0.18), 70); setTimeout(() => blip(950, 0.14, 'sine', 0.18), 150); },
  bad: () => { blip(220, 0.18, 'sawtooth', 0.2, 90); },
  alert: () => { blip(880, 0.12, 'square', 0.2, 1200); },
  caught: () => { blip(160, 0.5, 'sawtooth', 0.25, 60); noise(0.5, 0.12, 400); },
  takedown: () => { noise(0.12, 0.18, 300); blip(120, 0.12, 'square', 0.12); },
  type: () => blip(1200 + Math.random() * 300, 0.02, 'square', 0.04),
  unlock: () => { [440, 554, 660, 880].forEach((f, i) => setTimeout(() => blip(f, 0.12, 'sine', 0.16), i * 90)); },
  hack: () => { for (let i = 0; i < 5; i++) setTimeout(() => blip(400 + i * 120, 0.04, 'square', 0.08), i * 40); }
};

// Ambient drone for the 3D sectors.
export function startDrone() {
  ensure(); if (!ctx || droneNodes) return;
  const o1 = ctx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55;
  const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 82.5;
  const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain(); lfoGain.gain.value = 6;
  const g = ctx.createGain(); g.gain.value = 0.05;
  lfo.connect(lfoGain); lfoGain.connect(o2.frequency);
  o1.connect(g); o2.connect(g); g.connect(masterGain);
  o1.start(); o2.start(); lfo.start();
  droneNodes = { o1, o2, lfo, g };
}
export function stopDrone() {
  if (!droneNodes) return;
  try { droneNodes.o1.stop(); droneNodes.o2.stop(); droneNodes.lfo.stop(); } catch (_) {}
  droneNodes = null;
}
