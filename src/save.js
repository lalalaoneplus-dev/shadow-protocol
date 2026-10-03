// Persistence layer. Uses Electron disk API when available, else localStorage.
import { serialize, applySave } from './state.js';

const hasNative = typeof window !== 'undefined' && window.gameAPI && window.gameAPI.isElectron;
const LS_KEY = 'shadow-protocol-save-';

export async function writeSlot(slot, data) {
  const payload = data || serialize();
  if (hasNative) {
    return window.gameAPI.saveGame(slot, payload);
  }
  localStorage.setItem(LS_KEY + slot, JSON.stringify(payload));
  return { ok: true };
}

export async function readSlot(slot) {
  if (hasNative) {
    const r = await window.gameAPI.loadGame(slot);
    return r && r.ok ? r.data : null;
  }
  const raw = localStorage.getItem(LS_KEY + slot);
  return raw ? JSON.parse(raw) : null;
}

export async function listSlots() {
  if (hasNative) {
    return await window.gameAPI.listSaves();
  }
  const out = {};
  for (const slot of ['auto', '1', '2', '3']) {
    const raw = localStorage.getItem(LS_KEY + slot);
    if (raw) {
      try {
        const d = JSON.parse(raw);
        out[slot] = { level: d.level, difficulty: d.difficulty, ts: d.ts };
      } catch (_) {}
    }
  }
  return out;
}

export async function loadInto(slot) {
  const d = await readSlot(slot);
  if (!d) return false;
  return applySave(d);
}

export async function autosave() {
  return writeSlot('auto');
}
