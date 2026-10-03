// Shadow Protocol — 3D engine (Three.js).
// Mid-2000s console-stealth profile: low-poly BSP geometry, baked-look flat
// lighting, sharp shadow maps, exponential fog, and a light/shadow visibility
// meter as the core stealth mechanic.
import * as THREE from '../vendor/three.module.js';
import { State } from './state.js';
import { SFX } from './audio.js';
import { getFragments } from './fragments.js';

const PLAYER_HEIGHT = 1.7;
const CROUCH_HEIGHT = 0.95;
const PLAYER_RADIUS = 0.35;
const WALK = 3.4, SPRINT = 6.2, CROUCH_SPEED = 1.9;

// --- procedural low-res textures (canvas, <=256px, no shipped image files) ---
const texCache = {};
function makeTexture(kind) {
  if (texCache[kind]) return texCache[kind];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d');
  if (kind === 'floor') {
    x.fillStyle = '#0b1016'; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = '#13202a'; x.lineWidth = 2;
    for (let i = 0; i <= 128; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 128); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); }
    x.fillStyle = '#0e1822'; for (let i = 0; i < 40; i++) x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  } else if (kind === 'wall') {
    x.fillStyle = '#0d141c'; x.fillRect(0, 0, 128, 128);
    x.strokeStyle = '#10202c'; x.lineWidth = 1;
    for (let i = 0; i < 128; i += 16) { x.beginPath(); x.moveTo(0, i); x.lineTo(128, i); x.stroke(); }
    x.fillStyle = '#0a3340'; for (let i = 0; i < 6; i++) x.fillRect(8 + Math.random() * 100, 8 + Math.random() * 100, 3, 3);
  } else if (kind === 'rack') {
    x.fillStyle = '#080c11'; x.fillRect(0, 0, 128, 128);
    for (let r = 0; r < 16; r++) { x.fillStyle = r % 2 ? '#0c141c' : '#0a1118'; x.fillRect(4, r * 8, 120, 6);
      x.fillStyle = ['#19e6c8', '#2bb7ff', '#ff3b5c', '#36e07a'][Math.floor(Math.random() * 4)];
      if (Math.random() > 0.4) x.fillRect(110, r * 8 + 1, 3, 3); }
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.magFilter = THREE.NearestFilter; // crunchy retro filtering
  texCache[kind] = t; return t;
}

export class Engine {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // low-res era look
    // Three r155+ defaults to physically-based light units, which render the
    // pre-r155 intensity tuning below almost black. Restore legacy light
    // behaviour so the moody-but-visible lighting reads as designed.
    if ('useLegacyLights' in this.renderer) this.renderer.useLegacyLights = true;
    this.renderer.toneMapping = THREE.NoToneMapping;
    if ('outputColorSpace' in this.renderer) this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap; // hard stencil-style shadows
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(72, 16 / 9, 0.1, 200);
    this.clock = new THREE.Clock();

    this.keys = {};
    this.yaw = 0; this.pitch = 0;
    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.crouching = false;
    this.height = PLAYER_HEIGHT;
    this.running = false;
    this.locked = false;

    this.walls = [];      // {box: Box3, mesh}
    this.lights = [];     // {pos:Vector3, radius, intensity}
    this.sentries = [];
    this.terminal = null;
    this.bounds = { w: 40, d: 40 };
    this.visibility = 0;
    this.alert = 0;
    this.caught = false;
    this.cb = {};
    this.raycaster = new THREE.Raycaster();
    this._tmp = new THREE.Vector3();

    this._onResize = () => this.resize();
    window.addEventListener('resize', this._onResize);
    this._bindInput();
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
  }

  _bindInput() {
    this._kd = (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyC') this.toggleCrouch();
      if (e.code === 'KeyF') this.tryTakedown();
      if (e.code === 'KeyE') this.tryInteract();
    };
    this._ku = (e) => { this.keys[e.code] = false; };
    this._mm = (e) => {
      if (!this.locked) return;
      const s = 0.0022 * State.settings.mouseSensitivity;
      this.yaw -= e.movementX * s;
      this.pitch -= e.movementY * s * (State.settings.invertY ? -1 : 1);
      this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch));
    };
    this._lockChange = () => {
      this.locked = (document.pointerLockElement === this.canvas);
    };
    document.addEventListener('keydown', this._kd);
    document.addEventListener('keyup', this._ku);
    document.addEventListener('mousemove', this._mm);
    document.addEventListener('pointerlockchange', this._lockChange);
  }

  requestLock() { if (this.canvas.requestPointerLock) this.canvas.requestPointerLock(); }
  releaseLock() { if (document.exitPointerLock) document.exitPointerLock(); }

  toggleCrouch() {
    this.crouching = !this.crouching;
    if (this.cb.onStance) this.cb.onStance(this.crouching ? 'CROUCHING' : 'STANDING');
  }

  // ---------- Level build ----------
  clearLevel() {
    while (this.scene.children.length) this.scene.remove(this.scene.children[0]);
    this.walls = []; this.lights = []; this.sentries = []; this.terminal = null;
    this.fragments = [];
    this.alert = 0; this.caught = false;
  }

  loadLevel(spec, cb) {
    this.cb = cb || {};
    this.clearLevel();
    const S = this.scene;
    this.bounds = { w: spec.bounds[0], d: spec.bounds[1] };

    // fog + ambient darkness. Ambient is lifted ~1.8x over the per-level base so
    // shadowed areas stay readable for the player (stealth detection keys off the
    // light-pool meter, not ambient, so this doesn't change difficulty balance).
    S.fog = new THREE.FogExp2(0x05080c, spec.fog != null ? spec.fog : 0.045);
    S.background = new THREE.Color(0x070b11);
    const amb = new THREE.AmbientLight(0x33465c, (spec.ambient != null ? spec.ambient : 0.18) * 1.8);
    S.add(amb);
    // soft sky/ground fill so geometry reads in 3D even away from light pools
    S.add(new THREE.HemisphereLight(0x2a3850, 0x0a0e14, 0.5));

    // single shadow-casting directional light (sharp) — gives actors hard shadows
    const dir = new THREE.DirectionalLight(0x9fc8ff, 0.5);
    dir.position.set(spec.bounds[0] * 0.4, 22, spec.bounds[1] * 0.3);
    dir.castShadow = true;
    dir.shadow.mapSize.set(1024, 1024);
    const d = Math.max(spec.bounds[0], spec.bounds[1]);
    Object.assign(dir.shadow.camera, { left: -d, right: d, top: d, bottom: -d, near: 1, far: 80 });
    S.add(dir);

    // floor
    const floorTex = makeTexture('floor');
    floorTex.repeat.set(spec.bounds[0] / 4, spec.bounds[1] / 4);
    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(spec.bounds[0], 1, spec.bounds[1]),
      new THREE.MeshLambertMaterial({ map: floorTex })
    );
    floor.position.set(0, -0.5, 0); floor.receiveShadow = true; S.add(floor);

    // ceiling (dark)
    const ceil = new THREE.Mesh(
      new THREE.BoxGeometry(spec.bounds[0], 1, spec.bounds[1]),
      new THREE.MeshBasicMaterial({ color: 0x03060a })
    );
    ceil.position.set(0, (spec.wallH || 4) + 0.5, 0); S.add(ceil);

    // perimeter walls
    const W = spec.bounds[0] / 2, D = spec.bounds[1] / 2, H = spec.wallH || 4;
    this._addWall(0, -D, spec.bounds[0], 0.4, H);
    this._addWall(0, D, spec.bounds[0], 0.4, H);
    this._addWall(-W, 0, 0.4, spec.bounds[1], H);
    this._addWall(W, 0, 0.4, spec.bounds[1], H);

    // interior walls (BSP-style boxes)
    for (const w of (spec.walls || [])) this._addWall(w[0], w[1], w[2], w[3], w[4] || H);

    // light pools (cheap PointLights + analytic meter data + lamp mesh)
    for (const L of (spec.lights || [])) {
      const [lx, lz, radius, intensity, color] = L;
      const pl = new THREE.PointLight(color || 0xffd9a0, intensity * 1.4, radius * 2.4, 2);
      pl.position.set(lx, (spec.wallH || 4) - 0.6, lz);
      S.add(pl);
      this.lights.push({ pos: new THREE.Vector3(lx, 1, lz), radius, intensity });
      // emissive lamp panel
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.1, 0.8), new THREE.MeshBasicMaterial({ color: color || 0xffd9a0 }));
      lamp.position.set(lx, (spec.wallH || 4) - 0.55, lz); S.add(lamp);
      // floor light disc for readability
      const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 20), new THREE.MeshBasicMaterial({ color: color || 0xffd9a0, transparent: true, opacity: 0.06 }));
      disc.rotation.x = -Math.PI / 2; disc.position.set(lx, 0.02, lz); S.add(disc);
    }

    // props
    for (const p of (spec.props || [])) this._addProp(p);

    // objective terminal
    if (spec.terminal) {
      this.terminal = this._addTerminal(spec.terminal[0], spec.terminal[1]);
    }

    // sentries
    for (const sp of (spec.sentries || [])) this._addSentry(sp);

    // player start
    this.pos.set(spec.start[0], PLAYER_HEIGHT, spec.start[1]);
    this.yaw = spec.startYaw || 0; this.pitch = 0;
    this.crouching = false; this.height = PLAYER_HEIGHT;
    this.alert = 0; this.caught = false;
    this._startPos = [spec.start[0], spec.start[1]];
    this._startYaw = spec.startYaw || 0;

    // Phase 3 — scatter Intel Fragments at validated open positions
    this._spawnFragments();
  }

  _spawnFragments() {
    const defs = getFragments(State.level);
    if (!defs.length) return;
    const collected = State.collectedFragments || {};
    const pts = this._fragmentPositions(defs.length);
    defs.forEach((def, i) => {
      if (collected[State.level + '-' + i]) return; // already picked up
      const p = pts[i]; if (!p) return;
      const grp = new THREE.Group();
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.28, 0),
        new THREE.MeshBasicMaterial({ color: 0x2bb7ff }));
      grp.add(core);
      const shell = new THREE.Mesh(new THREE.OctahedronGeometry(0.45, 0),
        new THREE.MeshBasicMaterial({ color: 0x2bb7ff, wireframe: true, transparent: true, opacity: 0.5 }));
      grp.add(shell);
      const halo = new THREE.PointLight(0x2bb7ff, 1.1, 4, 2); halo.position.y = 0; grp.add(halo);
      grp.position.set(p[0], 1.1, p[1]);
      this.scene.add(grp);
      this.fragments.push({ grp, core, shell, index: i, collected: false });
    });
  }

  _fragmentPositions(n) {
    // candidate grid points that don't collide with geometry, spread out,
    // and away from the player start and the objective terminal.
    const bx = this.bounds.w / 2 - 2, bz = this.bounds.d / 2 - 2;
    const cands = [];
    for (let gx = -bx; gx <= bx; gx += 2.5) {
      for (let gz = -bz; gz <= bz; gz += 2.5) {
        if (this._collides(gx, gz)) continue;
        const dStart = Math.hypot(gx - this._startPos[0], gz - this._startPos[1]);
        const dTerm = this.terminal ? Math.hypot(gx - this.terminal.pos.x, gz - this.terminal.pos.z) : 99;
        if (dStart < 4 || dTerm < 3) continue;
        cands.push([gx, gz, dStart]);
      }
    }
    // spread: greedily pick points maximally separated
    const chosen = [];
    cands.sort((a, b) => b[2] - a[2]);
    for (const c of cands) {
      if (chosen.every(ch => Math.hypot(ch[0] - c[0], ch[1] - c[1]) > 5)) chosen.push(c);
      if (chosen.length >= n) break;
    }
    while (chosen.length < n && cands.length) chosen.push(cands[chosen.length % cands.length]);
    return chosen;
  }

  _updateFragments(dt) {
    if (!this.fragments.length) return;
    const t = performance.now() * 0.002;
    for (const f of this.fragments) {
      if (f.collected) continue;
      f.grp.rotation.y += dt * 1.4;
      f.shell.rotation.y -= dt * 0.8; f.shell.rotation.x += dt * 0.5;
      f.grp.position.y = 1.1 + Math.sin(t + f.index) * 0.12;
      const d = Math.hypot(this.pos.x - f.grp.position.x, this.pos.z - f.grp.position.z);
      if (d < 1.5) {
        f.collected = true; f.grp.visible = false;
        if (this.cb.onFragment) this.cb.onFragment(f.index);
      }
    }
  }

  _addWall(cx, cz, w, d, h) {
    const tex = makeTexture('wall');
    tex.repeat.set(Math.max(1, w / 2), Math.max(1, h / 2));
    const mat = new THREE.MeshLambertMaterial({ map: tex });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(cx, h / 2, cz); mesh.castShadow = true; mesh.receiveShadow = true;
    this.scene.add(mesh);
    // neon trim
    const trim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.02, 0.06, d + 0.02), new THREE.MeshBasicMaterial({ color: 0x123b44 }));
    trim.position.set(cx, 0.2, cz); this.scene.add(trim);
    const box = new THREE.Box3().setFromObject(mesh);
    this.walls.push({ box, mesh });
  }

  _addProp(p) {
    const S = this.scene;
    if (p.type === 'rack') {
      const tex = makeTexture('rack');
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.4, 1.2), new THREE.MeshLambertMaterial({ map: tex, emissive: 0x0a1a1a, emissiveIntensity: 0.4 }));
      m.position.set(p.x, 1.2, p.z); if (p.ry) m.rotation.y = p.ry; m.castShadow = true; m.receiveShadow = true; S.add(m);
      const box = new THREE.Box3().setFromObject(m); this.walls.push({ box, mesh: m });
    } else if (p.type === 'crate') {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), new THREE.MeshLambertMaterial({ color: 0x1a2530 }));
      m.position.set(p.x, 0.6, p.z); m.castShadow = true; m.receiveShadow = true; S.add(m);
      this.walls.push({ box: new THREE.Box3().setFromObject(m), mesh: m });
    } else if (p.type === 'console') {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.7), new THREE.MeshLambertMaterial({ color: 0x10202a, emissive: 0x0a2a30, emissiveIntensity: 0.6 }));
      m.position.set(p.x, 0.5, p.z); if (p.ry) m.rotation.y = p.ry; m.castShadow = true; S.add(m);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.5), new THREE.MeshBasicMaterial({ color: 0x19e6c8, transparent: true, opacity: 0.5 }));
      scr.position.set(p.x, 0.9, p.z + 0.36); if (p.ry) { scr.position.x = p.x + Math.sin(p.ry) * 0.36; scr.position.z = p.z + Math.cos(p.ry) * 0.36; scr.rotation.y = p.ry; } S.add(scr);
      this.walls.push({ box: new THREE.Box3().setFromObject(m), mesh: m });
    } else if (p.type === 'pillar') {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, p.h || 4, 0.8), new THREE.MeshLambertMaterial({ map: makeTexture('wall') }));
      m.position.set(p.x, (p.h || 4) / 2, p.z); m.castShadow = true; S.add(m);
      this.walls.push({ box: new THREE.Box3().setFromObject(m), mesh: m });
    }
  }

  _addTerminal(x, z) {
    const grp = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, 0.5), new THREE.MeshLambertMaterial({ color: 0x0c1820, emissive: 0x06222a, emissiveIntensity: 0.7 }));
    base.position.y = 0.65; base.castShadow = true; grp.add(base);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.7), new THREE.MeshBasicMaterial({ color: 0x19e6c8 }));
    screen.position.set(0, 1.05, 0.26); grp.add(screen);
    const halo = new THREE.PointLight(0x19e6c8, 1.2, 6, 2); halo.position.set(0, 1.4, 0.4); grp.add(halo);
    grp.position.set(x, 0, z);
    this.scene.add(grp);
    this.walls.push({ box: new THREE.Box3().setFromObject(base).expandByScalar(-0.05), mesh: base });
    return { pos: new THREE.Vector3(x, 1, z), mesh: grp, screen };
  }

  _addSentry(sp) {
    const grp = new THREE.Group();
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0x161e26, emissive: 0x0a0e14, emissiveIntensity: 0.5 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 1.2, 8), bodyMat);
    body.position.y = 0.95; body.castShadow = true; grp.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), bodyMat);
    head.position.y = 1.75; head.castShadow = true; grp.add(head);
    // glowing optic / eye
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff3b5c });
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), eyeMat);
    eye.position.set(0, 1.78, 0.22); grp.add(eye);
    // vision cone (translucent)
    const coneLen = sp.range || 9, coneRad = Math.tan((sp.fov || 0.6)) * (sp.range || 9);
    const coneGeo = new THREE.ConeGeometry(coneRad, coneLen, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({ color: 0xff3b5c, transparent: true, opacity: 0.07, side: THREE.DoubleSide, depthWrite: false });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.rotation.x = -Math.PI / 2; cone.position.set(0, 1.5, coneLen / 2); grp.add(cone);

    this.scene.add(grp);
    const sentry = {
      grp, eye, eyeMat, cone, coneMat,
      path: sp.path.map(p => new THREE.Vector3(p[0], 0, p[1])),
      i: 0, speed: sp.speed || 1.6, range: sp.range || 9, fov: sp.fov || 0.6,
      wait: 0, facing: 0, disabled: false, see: 0, static: sp.path.length < 2
    };
    sentry.grp.position.copy(sentry.path[0]);
    this.sentries.push(sentry);
  }

  // ---------- Stealth ----------
  computeVisibility() {
    // base from light pools + stance; clamped 0..1
    let v = 0;
    for (const L of this.lights) {
      const dx = this.pos.x - L.pos.x, dz = this.pos.z - L.pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist < L.radius) {
        const f = (1 - dist / L.radius);
        v = Math.max(v, f * Math.min(1, L.intensity));
      }
    }
    // crouching halves exposure; sprinting raises it
    let stance = this.crouching ? 0.5 : 1.0;
    if (this.running && !this.crouching) stance = 1.25;
    v = Math.min(1, v * stance + 0.04); // tiny ambient floor
    this.visibility = v;
    return v;
  }

  losClear(from, to) {
    this._tmp.copy(to).sub(from);
    const dist = this._tmp.length();
    this._tmp.normalize();
    this.raycaster.set(from, this._tmp);
    this.raycaster.far = dist;
    const meshes = this.walls.map(w => w.mesh);
    const hits = this.raycaster.intersectObjects(meshes, false);
    return hits.length === 0;
  }

  updateSentries(dt) {
    const playerHead = this._tmp2 || (this._tmp2 = new THREE.Vector3());
    playerHead.set(this.pos.x, this.crouching ? CROUCH_HEIGHT : 1.4, this.pos.z);
    let anySeeing = false;

    for (const s of this.sentries) {
      if (s.disabled) continue;

      // movement along path
      if (!s.static) {
        const target = s.path[s.i];
        const d = new THREE.Vector3().subVectors(target, s.grp.position); d.y = 0;
        const dist = d.length();
        if (dist < 0.15) {
          s.i = (s.i + 1) % s.path.length;
        } else {
          d.normalize();
          s.grp.position.addScaledVector(d, s.speed * dt);
          s.facing = Math.atan2(d.x, d.z);
        }
      } else {
        s.facing += dt * 0.5; // slow scan for static cameras
      }
      s.grp.rotation.y = s.facing;

      // detection
      const eyePos = new THREE.Vector3(s.grp.position.x, 1.78, s.grp.position.z);
      const toPlayer = new THREE.Vector3().subVectors(playerHead, eyePos);
      const dist = toPlayer.length();
      let detected = false;
      if (dist < s.range) {
        const dirToPlayer = toPlayer.clone().normalize();
        const facingVec = new THREE.Vector3(Math.sin(s.facing), 0, Math.cos(s.facing));
        const ang = facingVec.angleTo(new THREE.Vector3(dirToPlayer.x, 0, dirToPlayer.z));
        if (ang < s.fov) {
          if (this.losClear(eyePos, playerHead)) {
            // visibility & distance scale how fast we are noticed
            const distFactor = 1 - (dist / s.range) * 0.6;
            const hardFactor = (State.settings.difficulty === 'hardcore') ? 1.35 : 1.0;
            const seeRate = this.visibility * distFactor * hardFactor;
            if (seeRate > 0.12) { detected = true; s.see = Math.min(1, s.see + seeRate * dt * 1.6); }
          }
        }
      }
      if (!detected) s.see = Math.max(0, s.see - dt * 0.6);

      // visualize eye/cone heat
      const heat = s.see;
      s.eyeMat.color.setRGB(1, 0.23 + 0.5 * (1 - heat), 0.36 * (1 - heat));
      s.coneMat.opacity = 0.05 + heat * 0.18;
      if (s.see > 0.01) anySeeing = true;

      if (s.see >= 1 && !this.caught) {
        this.caught = true;
        SFX.caught();
        if (this.cb.onCaught) this.cb.onCaught();
      }
    }

    // aggregate alert meter = max sentry "see"
    let maxSee = 0;
    for (const s of this.sentries) if (!s.disabled) maxSee = Math.max(maxSee, s.see);
    this.alert = maxSee;
    if (this.cb.onAlert) this.cb.onAlert(maxSee, anySeeing);
  }

  tryTakedown() {
    if (!this.locked) return;
    for (const s of this.sentries) {
      if (s.disabled) continue;
      const d = Math.hypot(this.pos.x - s.grp.position.x, this.pos.z - s.grp.position.z);
      if (d < 2.0) {
        // must be roughly behind it
        const toP = new THREE.Vector3(this.pos.x - s.grp.position.x, 0, this.pos.z - s.grp.position.z).normalize();
        const facing = new THREE.Vector3(Math.sin(s.facing), 0, Math.cos(s.facing));
        const ang = facing.angleTo(toP);
        if (ang > 1.5) { // behind
          s.disabled = true;
          s.grp.rotation.z = Math.PI / 2.4; // slump
          s.grp.position.y = -0.3;
          s.coneMat.opacity = 0; s.eyeMat.color.setHex(0x223040);
          State.takedowns++;
          SFX.takedown();
          if (this.cb.onTakedown) this.cb.onTakedown();
          return;
        } else {
          if (this.cb.onToast) this.cb.onToast('Must approach from behind');
        }
      }
    }
  }

  nearTerminal() {
    if (!this.terminal) return false;
    const d = Math.hypot(this.pos.x - this.terminal.pos.x, this.pos.z - this.terminal.pos.z);
    return d < 2.4;
  }

  tryInteract() {
    if (!this.locked) return;
    if (this.nearTerminal()) {
      if (this.cb.onInteract) this.cb.onInteract();
    }
  }

  respawn() {
    this.pos.set(this._startPos[0], PLAYER_HEIGHT, this._startPos[1]);
    this.yaw = this._startYaw; this.pitch = 0;
    this.caught = false;
    for (const s of this.sentries) s.see = 0;
  }

  // ---------- Movement ----------
  updatePlayer(dt) {
    const f = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const r = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
    let mx = 0, mz = 0;
    if (this.keys['KeyW']) { mx += f.x; mz += f.z; }
    if (this.keys['KeyS']) { mx -= f.x; mz -= f.z; }
    if (this.keys['KeyD']) { mx += r.x; mz += r.z; }
    if (this.keys['KeyA']) { mx -= r.x; mz -= r.z; }
    const len = Math.hypot(mx, mz);
    this.running = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) && !this.crouching && len > 0;
    let speed = this.crouching ? CROUCH_SPEED : (this.running ? SPRINT : WALK);
    if (len > 0) { mx /= len; mz /= len; }

    const nx = this.pos.x + mx * speed * dt;
    const nz = this.pos.z + mz * speed * dt;
    // collide X then Z (slide)
    if (!this._collides(nx, this.pos.z)) this.pos.x = nx;
    if (!this._collides(this.pos.x, nz)) this.pos.z = nz;

    // bounds
    const bx = this.bounds.w / 2 - 0.6, bz = this.bounds.d / 2 - 0.6;
    this.pos.x = Math.max(-bx, Math.min(bx, this.pos.x));
    this.pos.z = Math.max(-bz, Math.min(bz, this.pos.z));

    // smooth crouch height
    const targetH = this.crouching ? CROUCH_HEIGHT : PLAYER_HEIGHT;
    this.height += (targetH - this.height) * Math.min(1, dt * 12);

    // footstep audio
    if (len > 0 && this.locked) {
      this._stepT = (this._stepT || 0) + dt * speed;
      if (this._stepT > 1.6) { this._stepT = 0; SFX.step(); }
    }

    // camera
    this.camera.position.set(this.pos.x, this.height, this.pos.z);
    const dirv = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    );
    this.camera.lookAt(this.camera.position.clone().add(dirv));
  }

  _collides(x, z) {
    const r = PLAYER_RADIUS;
    for (const w of this.walls) {
      const b = w.box;
      const cx = Math.max(b.min.x, Math.min(x, b.max.x));
      const cz = Math.max(b.min.z, Math.min(z, b.max.z));
      const dx = x - cx, dz = z - cz;
      if (dx * dx + dz * dz < r * r) return true;
    }
    return false;
  }

  // ---------- Loop ----------
  frame() {
    const dt = Math.min(0.05, this.clock.getDelta());
    if (this.locked && !this.caught) {
      this.updatePlayer(dt);
      this.computeVisibility();
      this.updateSentries(dt);
      this._updateFragments(dt);
      // pulse terminal screen
      if (this.terminal) {
        const t = performance.now() * 0.004;
        this.terminal.screen.material.color.setRGB(0.1, 0.7 + 0.3 * Math.sin(t), 0.78);
      }
      // HUD callbacks
      if (this.cb.onVisibility) this.cb.onVisibility(this.visibility);
      // interaction prompt
      if (this.cb.onPrompt) this.cb.onPrompt(this.nearTerminal() ? 'terminal' : this._nearSentry());
    }
    this.renderer.render(this.scene, this.camera);
  }

  _nearSentry() {
    for (const s of this.sentries) {
      if (s.disabled) continue;
      const d = Math.hypot(this.pos.x - s.grp.position.x, this.pos.z - s.grp.position.z);
      if (d < 2.0) {
        const toP = new THREE.Vector3(this.pos.x - s.grp.position.x, 0, this.pos.z - s.grp.position.z).normalize();
        const facing = new THREE.Vector3(Math.sin(s.facing), 0, Math.cos(s.facing));
        if (facing.angleTo(toP) > 1.5) return 'takedown';
      }
    }
    return null;
  }

  start() {
    this._running = true;
    const loop = () => { if (!this._running) return; this.frame(); this._raf = requestAnimationFrame(loop); };
    this.clock.getDelta();
    loop();
  }
  stop() { this._running = false; if (this._raf) cancelAnimationFrame(this._raf); }

  dispose() {
    this.stop();
    window.removeEventListener('resize', this._onResize);
    document.removeEventListener('keydown', this._kd);
    document.removeEventListener('keyup', this._ku);
    document.removeEventListener('mousemove', this._mm);
    document.removeEventListener('pointerlockchange', this._lockChange);
  }
}
