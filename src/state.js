// Central game state, settings, and progression.
export const Difficulty = { NORMAL: 'normal', HARDCORE: 'hardcore' };

export const State = {
  // settings (persisted)
  settings: {
    difficulty: Difficulty.NORMAL,
    masterVolume: 0.7,
    mouseSensitivity: 1.0,
    invertY: false
  },
  // run state
  level: 1,            // current level (1..10)
  highestUnlocked: 1,  // furthest level reached
  alerts: 0,           // times spotted this run
  takedowns: 0,
  stealthBonus: true,  // never spotted this level
  collectedFragments: {}, // Phase 3: map "level-index" -> true
  startedAt: 0,
  // transient
  scene: 'boot'        // boot|menu|brief|play|tool|pause|win|fail|debrief
};

export function resetRun() {
  State.level = 1;
  State.highestUnlocked = 1;
  State.alerts = 0;
  State.takedowns = 0;
  State.stealthBonus = true;
  State.collectedFragments = {};
}

export function serialize() {
  return {
    v: 1,
    ts: Date.now(),
    level: State.level,
    highestUnlocked: State.highestUnlocked,
    alerts: State.alerts,
    takedowns: State.takedowns,
    collectedFragments: State.collectedFragments,
    difficulty: State.settings.difficulty,
    settings: State.settings
  };
}

export function applySave(data) {
  if (!data) return false;
  State.level = data.level || 1;
  State.highestUnlocked = data.highestUnlocked || State.level;
  State.alerts = data.alerts || 0;
  State.takedowns = data.takedowns || 0;
  State.collectedFragments = data.collectedFragments || {};
  if (data.settings) Object.assign(State.settings, data.settings);
  if (data.difficulty) State.settings.difficulty = data.difficulty;
  return true;
}
