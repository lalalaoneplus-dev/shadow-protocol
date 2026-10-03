// Shadow Protocol — campaign content.
// 10 gated sectors. Each enforces a real cyber-security learning objective
// (distilled from the reference field manuals) as its completion gate.
// No academic references anywhere — framed entirely as field operations.

export const PLAYER = 'SPECTER';
export const HANDLER = 'ORACLE';

export const LEVELS = [
  // ───────────────────────────────────────── 1 ─────────────────────────────
  {
    id: 1, codename: 'THE PERIMETER', sector: 'Northgate Biometric Checkpoint',
    domain: 'Risk Management & Access Control',
    brief: 'Helix Corp’s outer ring is guarded by biometric gates and roving sentries. Brute force trips every alarm. Get in by choosing the lowest-risk vector — think in likelihood × impact, not bravado.',
    intel: 'Security is risk management, not perfection. Every control has a residual risk. Rank each attack path by likelihood × impact and exploit the weakest control with the smallest blast radius.',
    objective: 'Reach the gate terminal and bypass the biometric lock using a risk-based approach.',
    dialogue: [
      { who: HANDLER, line: 'Specter, Helix’s perimeter is layered. Don’t be a hero — pick the vector with the best risk profile.' },
      { who: PLAYER, line: 'Copy. Staying in the dark. Moving to the gate.' }
    ],
    env: {
      bounds: [34, 30], wallH: 4, ambient: 0.16, fog: 0.05, start: [-14, -11], startYaw: 0.7,
      walls: [ [0, -3, 0.5, 14, 4], [6, 4, 12, 0.5, 4], [-7, 6, 0.5, 10, 4] ],
      lights: [ [-14, 9, 6, 0.9, 0xffd9a0], [2, -10, 5.5, 0.8, 0xbfe0ff], [12, 2, 5, 0.85, 0xffd9a0] ],
      props: [ { type: 'console', x: -10, z: 8, ry: 0.4 }, { type: 'crate', x: 4, z: -6 }, { type: 'crate', x: 5.4, z: -6 }, { type: 'pillar', x: 0, z: 10, h: 4 } ],
      terminal: [13, 10],
      sentries: [
        { path: [[-6, -8], [-6, 8], [8, 8], [8, -8]], speed: 1.9, range: 9, fov: 0.55 },
        { path: [[10, 9], [10, -9]], speed: 2.2, range: 8, fov: 0.5 }
      ]
    },
    stages: [ { tool: 'risk' } ],
    debrief: 'Gate spoofed. You treated the perimeter as a risk surface, not a wall. That mindset carries the whole op.'
  },

  // ───────────────────────────────────────── 2 ─────────────────────────────
  {
    id: 2, codename: 'THE CIPHER', sector: 'Relay Station 7 — Signals Loft',
    domain: 'Applied Cryptography',
    brief: 'We’re intercepting Helix’s encrypted radio chatter. Recover the plaintext from the symmetric stream, then verify the command’s digital signature before we trust a word of it.',
    intel: 'Confidentiality comes from encryption; trust comes from signatures. A decrypted message you can’t authenticate is just a convincing forgery. Always verify origin and integrity.',
    objective: 'Decrypt the intercepted transmission and validate its digital signature.',
    dialogue: [
      { who: HANDLER, line: 'The chatter is symmetric-encrypted — same key both ways. Recover the key, then check the signature.' },
      { who: PLAYER, line: 'If the signature fails, the order is spoofed. Understood.' }
    ],
    env: {
      bounds: [28, 24], wallH: 4, ambient: 0.15, fog: 0.06, start: [-11, -9], startYaw: 0.6,
      walls: [ [-2, 0, 0.5, 12, 4], [5, -4, 8, 0.5, 4] ],
      lights: [ [-10, 7, 5, 0.85, 0xbfe0ff], [8, 6, 5, 0.9, 0xffd9a0], [2, -8, 4.5, 0.7, 0xbfe0ff] ],
      props: [ { type: 'console', x: -8, z: 6, ry: 0.2 }, { type: 'rack', x: 6, z: 7 }, { type: 'crate', x: 0, z: -7 } ],
      terminal: [10, 8],
      sentries: [ { path: [[-6, -7], [-6, 7], [4, 7]], speed: 1.8, range: 8.5, fov: 0.55 } ]
    },
    stages: [ { tool: 'cryptool' } ],
    debrief: 'Plaintext recovered and signature valid. The order is genuine — Helix is moving assets to the Mainframe. That’s our next stop.'
  },

  // ───────────────────────────────────────── 3 ─────────────────────────────
  {
    id: 3, codename: 'THE MAINFRAME', sector: 'Sub-Level Server Vault',
    domain: 'Computer Systems Security',
    brief: 'Jack into the rack directly. Map the host with a port scan, then drop to a shell: fix the access-control lists in your favour and break out of the container sandbox to reach the host.',
    intel: 'Access control decides who touches what. Misconfigured ACLs and a soft container boundary are a gift — enumerate first (scan), then escalate (ACLs, then escape the namespace to the host).',
    objective: 'Scan the host, correct the ACLs, and escape the container to root the mainframe.',
    dialogue: [
      { who: HANDLER, line: 'Physical access to the rack. Scan it first — know the host before you touch the shell.' },
      { who: PLAYER, line: 'Enumerate, then escalate. The container won’t hold.' }
    ],
    env: {
      bounds: [34, 34], wallH: 4.5, ambient: 0.13, fog: 0.05, start: [-15, -14], startYaw: 0.6,
      walls: [ [-4, 0, 0.5, 20, 4.5], [6, -6, 14, 0.5, 4.5], [6, 8, 14, 0.5, 4.5] ],
      lights: [ [-13, 11, 5, 0.8, 0xbfe0ff], [10, 0, 4.5, 0.75, 0xffd9a0], [-2, -12, 4.5, 0.7, 0xbfe0ff], [13, 12, 4.5, 0.8, 0xffd9a0] ],
      props: [
        { type: 'rack', x: 2, z: 4 }, { type: 'rack', x: 4, z: 4 }, { type: 'rack', x: 6, z: 4 },
        { type: 'rack', x: 2, z: -2 }, { type: 'rack', x: 4, z: -2 }, { type: 'rack', x: 10, z: 6 },
        { type: 'crate', x: -10, z: -6 }, { type: 'pillar', x: 0, z: 12 }
      ],
      terminal: [13, -10],
      sentries: [
        { path: [[-2, -10], [-2, 12], [12, 12]], speed: 2.0, range: 9, fov: 0.5 },
        { path: [[12, -8], [12, 8]], speed: 2.1, range: 9, fov: 0.5 },
        { path: [[-12, 6]], speed: 0, range: 10, fov: 0.7 } // static optic
      ]
    },
    stages: [ { tool: 'nmap' }, { tool: 'bash' } ],
    debrief: 'Container escaped, host owned. You enumerated before you escalated — textbook systems tradecraft. The credentials onward are yours.'
  },

  // ───────────────────────────────────────── 4 ─────────────────────────────
  {
    id: 4, codename: 'THE GRID', sector: 'Ravenscar Power Plant — Control Room',
    domain: 'Network & Infrastructure Security',
    brief: 'Helix is riding a live attack into the grid’s SCADA network. Read the packet capture scrolling on the wall, pin the malicious flow to its OSI layer, and block it before the breakers trip.',
    intel: 'The OSI 7-layer model localises an attack. A flood at L3/4 looks nothing like an L7 injection. Identify the layer, identify the anomaly, drop the flow — surgically, so the plant keeps running.',
    objective: 'Analyse the live capture, identify the malicious packets and their OSI layer, and block the attack.',
    dialogue: [
      { who: HANDLER, line: 'This is critical infrastructure — a wrong block browns out a city. Find the anomaly in the capture.' },
      { who: PLAYER, line: 'Reading the flows now. The malicious traffic won’t match the baseline.' }
    ],
    env: {
      bounds: [32, 30], wallH: 4, ambient: 0.17, fog: 0.05, start: [-13, -12], startYaw: 0.7,
      walls: [ [0, 2, 0.5, 16, 4], [-6, -6, 10, 0.5, 4] ],
      lights: [ [-11, 9, 5, 0.85, 0xbfe0ff], [9, -8, 5, 0.8, 0xffd9a0], [9, 9, 5, 0.85, 0xff6a6a] ],
      props: [ { type: 'console', x: -8, z: 7, ry: 0.3 }, { type: 'console', x: 6, z: -8, ry: -0.4 }, { type: 'rack', x: 8, z: 8 }, { type: 'crate', x: -3, z: -3 } ],
      terminal: [11, 8],
      sentries: [
        { path: [[-4, -9], [-4, 9], [6, 9], [6, -9]], speed: 2.0, range: 9, fov: 0.5 },
        { path: [[10, -6]], speed: 0, range: 11, fov: 0.7 }
      ]
    },
    stages: [ { tool: 'wireshark' } ],
    debrief: 'Malicious flow dropped, breakers holding. You isolated the attack to its layer instead of pulling the plug on everything. The city never noticed.'
  },

  // ───────────────────────────────────────── 5 ─────────────────────────────
  {
    id: 5, codename: 'THE BREACH', sector: 'Datacenter 12 — Aftermath',
    domain: 'Digital Forensics & Attribution',
    brief: 'Someone hit this site before us and left malware behind. Walk the scene, collect the digital footprints, and attribute the attack to the right actor. Evidence over hunches.',
    intel: 'Attribution is built from artifacts: timestamps, hashes, C2 domains, TTPs. Chain the indicators into a timeline and match them to a known actor profile — don’t leap to the obvious flag.',
    objective: 'Recover the digital footprints and correctly attribute the malware to its operator.',
    dialogue: [
      { who: HANDLER, line: 'This wasn’t us. Collect the artifacts and tell me who got here first — with evidence.' },
      { who: PLAYER, line: 'Building the timeline. The indicators will name them.' }
    ],
    env: {
      bounds: [30, 30], wallH: 4, ambient: 0.12, fog: 0.07, start: [-12, -12], startYaw: 0.7,
      walls: [ [2, -2, 0.5, 14, 4], [-5, 5, 10, 0.5, 4] ],
      lights: [ [-10, 8, 4.5, 0.7, 0xff6a6a], [8, 7, 4.5, 0.75, 0xbfe0ff], [6, -9, 4.5, 0.7, 0xffd9a0] ],
      props: [ { type: 'rack', x: 4, z: 3 }, { type: 'rack', x: 6, z: 3 }, { type: 'crate', x: -6, z: -4 }, { type: 'console', x: -9, z: 7, ry: 0.3 } ],
      terminal: [10, -9],
      sentries: [
        { path: [[-3, -9], [-3, 9]], speed: 1.7, range: 8.5, fov: 0.55 },
        { path: [[9, 9], [9, -5]], speed: 1.9, range: 8.5, fov: 0.5 }
      ]
    },
    stages: [ { tool: 'forensics' } ],
    debrief: 'Attribution locked and defensible. You followed the artifacts, not the bait — the false-flag almost worked. Now we know who’s really hunting Helix’s data.'
  },

  // ───────────────────────────────────────── 6 ─────────────────────────────
  {
    id: 6, codename: 'THE PATCH', sector: 'Helix Web Tier — DMZ',
    domain: 'Software & Application Security',
    brief: 'Their customer portal is our way in. Intercept a request, find an OWASP-class flaw, exploit it for the admin session — then patch the hole behind you so no one else rides it.',
    intel: 'Most breaches are old, known bug classes: injection, broken access control, XSS. Find the flaw, prove it, then fix it. A professional leaves the system safer than they found it.',
    objective: 'Intercept the request, exploit the OWASP Top-10 vulnerability, then apply the patch.',
    dialogue: [
      { who: HANDLER, line: 'Web tier’s exposed. Intercept, exploit, and — this matters — patch it so Helix can’t blame the next intruder on us.' },
      { who: PLAYER, line: 'Exploit, then remediate. Clean in, clean out.' }
    ],
    env: {
      bounds: [30, 28], wallH: 4, ambient: 0.15, fog: 0.05, start: [-12, -11], startYaw: 0.7,
      walls: [ [-2, -1, 0.5, 14, 4], [5, 5, 10, 0.5, 4] ],
      lights: [ [-10, 8, 5, 0.85, 0xbfe0ff], [8, -7, 5, 0.8, 0xffd9a0], [9, 8, 4.5, 0.8, 0xbfe0ff] ],
      props: [ { type: 'rack', x: 3, z: 3 }, { type: 'console', x: -8, z: 6, ry: 0.3 }, { type: 'crate', x: 0, z: -6 }, { type: 'crate', x: 1.3, z: -6 } ],
      terminal: [10, -8],
      sentries: [
        { path: [[-4, -9], [-4, 9], [7, 9]], speed: 2.0, range: 9, fov: 0.5 },
        { path: [[9, 8], [9, -4]], speed: 1.8, range: 8.5, fov: 0.5 }
      ]
    },
    stages: [ { tool: 'burp' } ],
    debrief: 'Admin session captured and the hole sealed behind you. Exploited and remediated — that’s the difference between a vandal and an operator.'
  },

  // ───────────────────────────────────────── 7 ─────────────────────────────
  {
    id: 7, codename: 'THE ANONYMIZER', sector: 'Cold Storage — Citizen Records',
    domain: 'Information Privacy & PETs',
    brief: 'You’re lifting a drive of citizen data — but we are not the villains. De-identify it with privacy-enhancing techniques before the extraction bird lands. Raw PII does not leave this room.',
    intel: 'Privacy is engineered, not promised. Apply de-identification — suppress direct identifiers, generalise quasi-identifiers to k-anonymity, perturb the rest. Done right, the data stays useful and no person is re-identifiable.',
    objective: 'Run the de-identification pipeline to a safe privacy threshold before exfiltration.',
    dialogue: [
      { who: HANDLER, line: 'Two minutes to pickup. Scrub the dataset — if it can re-identify a single citizen, you’ve failed even if you escape.' },
      { who: PLAYER, line: 'Suppress, generalise, perturb. Nobody in this file gets burned.' }
    ],
    env: {
      bounds: [32, 30], wallH: 4, ambient: 0.13, fog: 0.06, start: [-13, -12], startYaw: 0.7,
      walls: [ [0, 0, 0.5, 16, 4], [-6, -7, 10, 0.5, 4], [7, 7, 10, 0.5, 4] ],
      lights: [ [-11, 9, 4.5, 0.8, 0xbfe0ff], [10, -8, 4.5, 0.75, 0xffd9a0], [10, 9, 4.5, 0.8, 0xbfe0ff], [-2, -11, 4, 0.7, 0xffd9a0] ],
      props: [ { type: 'rack', x: 4, z: 3 }, { type: 'rack', x: 6, z: 3 }, { type: 'rack', x: -4, z: 4 }, { type: 'crate', x: -8, z: -4 }, { type: 'console', x: 9, z: -6, ry: -0.3 } ],
      terminal: [12, -9],
      sentries: [
        { path: [[-4, -10], [-4, 10], [8, 10], [8, -10]], speed: 2.2, range: 9, fov: 0.5 },
        { path: [[11, 8], [11, -6]], speed: 2.0, range: 8.5, fov: 0.5 },
        { path: [[-11, 4]], speed: 0, range: 10, fov: 0.7 }
      ]
    },
    stages: [ { tool: 'privacy' } ],
    debrief: 'Dataset de-identified below the re-identification threshold and clear of the building. Intelligence preserved, citizens protected. That’s the line we don’t cross.'
  },

  // ───────────────────────────────────────── 8 ─────────────────────────────
  {
    id: 8, codename: 'THE NUDGE', sector: 'Helix HQ — Personnel Wing',
    domain: 'Security Behaviour & Social Engineering',
    brief: 'The biometric vault won’t yield to code — it yields to people. Craft a pretext that nudges a guard off his route and gets a keycard volunteered. Exploit the bias, not the lock.',
    intel: 'Humans are the largest attack surface. Authority, urgency, and social proof bend behaviour predictably. A well-built nudge makes the target choose to help you — and feel good doing it.',
    objective: 'Build a phishing pretext that diverts the guard and yields the biometric keycard.',
    dialogue: [
      { who: HANDLER, line: 'Forget the lock. Pick the right cognitive levers and the guard opens it for you.' },
      { who: PLAYER, line: 'Authority and urgency. I’ll make helping me the path of least resistance.' }
    ],
    env: {
      bounds: [28, 26], wallH: 4, ambient: 0.16, fog: 0.05, start: [-11, -10], startYaw: 0.7,
      walls: [ [-2, 2, 0.5, 12, 4], [5, -5, 8, 0.5, 4] ],
      lights: [ [-9, 7, 5, 0.85, 0xffd9a0], [8, 6, 5, 0.9, 0xbfe0ff], [3, -8, 4.5, 0.75, 0xffd9a0] ],
      props: [ { type: 'console', x: -7, z: 6, ry: 0.3 }, { type: 'crate', x: 4, z: -3 }, { type: 'rack', x: 7, z: 7 } ],
      terminal: [9, 7],
      sentries: [
        { path: [[-5, -8], [-5, 8], [5, 8]], speed: 1.9, range: 8.5, fov: 0.55 },
        { path: [[8, -7], [8, 4]], speed: 1.8, range: 8, fov: 0.5 }
      ]
    },
    stages: [ { tool: 'phish' } ],
    debrief: 'Guard rerouted, keycard volunteered, vault open. You didn’t break the human — you steered them. The most reliable exploit in the building.'
  },

  // ───────────────────────────────────────── 9 ─────────────────────────────
  {
    id: 9, codename: 'THE AUDITOR', sector: 'Helix Security Operations Center',
    domain: 'Security Management & Governance',
    brief: 'You hold their security console. Turn their own governance against them: stand up a compliant management system — right controls against the right risks — and lock reinforcements out by policy.',
    intel: 'Governance is leverage. A management system maps risks to controls under a recognised standard. Match each control to the risk it treats; an unbalanced control set leaves a gap an auditor — or an intruder — will find.',
    objective: 'Assemble a standards-compliant control set that closes every risk and locks out reinforcements.',
    dialogue: [
      { who: HANDLER, line: 'Their SOC runs on policy. Build the management system correctly and the doors answer to you, not them.' },
      { who: PLAYER, line: 'Map every risk to a control. No gaps. Reinforcements stay outside.' }
    ],
    env: {
      bounds: [30, 30], wallH: 4.5, ambient: 0.15, fog: 0.05, start: [-12, -12], startYaw: 0.7,
      walls: [ [0, -2, 0.5, 14, 4.5], [-6, 6, 10, 0.5, 4.5], [7, 5, 10, 0.5, 4.5] ],
      lights: [ [-10, 9, 5, 0.85, 0xbfe0ff], [9, -8, 5, 0.8, 0xffd9a0], [9, 9, 4.5, 0.8, 0xbfe0ff] ],
      props: [ { type: 'console', x: -8, z: 8, ry: 0.3 }, { type: 'console', x: 7, z: -8, ry: -0.3 }, { type: 'rack', x: 6, z: 8 }, { type: 'crate', x: -4, z: -5 } ],
      terminal: [11, -9],
      sentries: [
        { path: [[-4, -10], [-4, 10], [8, 10]], speed: 2.0, range: 9, fov: 0.5 },
        { path: [[10, 8], [10, -5]], speed: 1.9, range: 8.5, fov: 0.5 }
      ]
    },
    stages: [ { tool: 'isms' } ],
    debrief: 'Management system certified-clean and reinforcements locked out by their own policy. You beat Helix with governance — the weapon they thought was theirs.'
  },

  // ───────────────────────────────────────── 10 ────────────────────────────
  {
    id: 10, codename: 'THE MASTERMIND', sector: 'The Core — Master Server',
    domain: 'Synthesis & Intelligence',
    brief: 'Everything ends here. Synthesise the intel from all nine sectors on the analysis grid, correlate the signals, and isolate the antagonist’s master server. Then take it down for good.',
    intel: 'Raw intelligence is noise until it’s correlated. Visualise the relationships, weigh the evidence, and let the strongest-supported hypothesis — not the loudest — point to the target. Then act.',
    objective: 'Correlate all collected intel on the data-visualisation grid and neutralise the master server.',
    dialogue: [
      { who: HANDLER, line: 'This is it, Specter. Nine sectors of intel converge here. Find the node they all point to.' },
      { who: PLAYER, line: 'Let the data speak. The master server can’t hide from a correlated picture.' },
      { who: HANDLER, line: 'When you’re sure — end it.' }
    ],
    env: {
      bounds: [36, 34], wallH: 5, ambient: 0.12, fog: 0.05, start: [-16, -14], startYaw: 0.7,
      walls: [ [-5, 0, 0.5, 22, 5], [6, -7, 16, 0.5, 5], [6, 9, 16, 0.5, 5] ],
      lights: [ [-13, 11, 5, 0.8, 0xbfe0ff], [11, 0, 5, 0.85, 0xff6a6a], [-3, -12, 4.5, 0.7, 0xbfe0ff], [13, 12, 4.5, 0.8, 0xffd9a0], [13, -10, 4.5, 0.8, 0xff6a6a] ],
      props: [
        { type: 'rack', x: 3, z: 5 }, { type: 'rack', x: 5, z: 5 }, { type: 'rack', x: 7, z: 5 },
        { type: 'rack', x: 3, z: -3 }, { type: 'rack', x: 5, z: -3 }, { type: 'pillar', x: 0, z: 13 },
        { type: 'console', x: -12, z: 8, ry: 0.3 }, { type: 'crate', x: -8, z: -8 }
      ],
      terminal: [14, -11],
      sentries: [
        { path: [[-3, -11], [-3, 13], [12, 13]], speed: 2.1, range: 9.5, fov: 0.5 },
        { path: [[12, -9], [12, 9]], speed: 2.2, range: 9.5, fov: 0.5 },
        { path: [[-13, 5]], speed: 0, range: 11, fov: 0.7 },
        { path: [[8, -10], [14, -4]], speed: 2.0, range: 9, fov: 0.5 }
      ]
    },
    stages: [ { tool: 'dataviz' } ],
    debrief: 'Master server dark. The picture you built from nine sectors of intel held — and the antagonist had nowhere left to run. Operation Shadow Protocol: complete.'
  }
];

export function getLevel(n) { return LEVELS[n - 1]; }
