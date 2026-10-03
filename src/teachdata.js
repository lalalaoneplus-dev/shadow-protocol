// Phase 1/2 — "Teach, then Test". Plain-language tutorials the Handler walks the
// player through in a safe sandbox BEFORE the live objective. Written for a
// player with zero prior computer-science knowledge. Correct step is highlighted;
// infinite retries; no fail state. Theory is sourced from the field references.
export const TEACH = {
  1: {
    concept: 'Risk = how likely × how bad',
    intro: [
      'Welcome to the field, Operator. Before any lock, learn to think in RISK.',
      'Risk is simply: how LIKELY is something to go wrong, multiplied by how BAD it is if it does. Low likelihood and low impact = low risk. We always take the lowest-risk path that still works.'
    ],
    steps: [
      { say: 'Practice: two ways past a fence. Option A is loud and certain to be seen (high likelihood, high impact). Option B is quiet (low, low). Pick the lower-risk path.',
        options: [['Quiet path — low likelihood, low impact', true], ['Loud path — high likelihood, high impact', false]],
        ok: 'Exactly. Lowest risk that still gets you through. That instinct keeps you alive.' },
      { say: 'A control you can REUSE beats one you must BREAK — breaking things is noisy (high impact). Which is safer?',
        options: [['Reuse a credential the system already trusts', true], ['Smash the reader open', false]],
        ok: 'Right. Reuse over force. Now apply it to the live gate.' }
    ]
  },
  2: {
    concept: 'Secret keys & signatures',
    intro: [
      'This sector is about CRYPTOGRAPHY — secret codes. Two ideas only.',
      'One: a SYMMETRIC key is a single shared secret — the same key locks AND unlocks the message. Two: a DIGITAL SIGNATURE proves WHO sent it and that nobody changed it. Encryption hides; signatures prove trust.'
    ],
    steps: [
      { say: 'A message is scrambled with a shift cipher (each letter moved along the alphabet). To read it you apply the SAME key in reverse. That is symmetric crypto. Which describes it?',
        options: [['One shared key locks and unlocks', true], ['A different key for everyone', false]],
        ok: 'Correct — same secret both ways. That is what you will do to the intercept.' },
      { say: 'After decrypting, you check the SIGNATURE. If the message’s fingerprint matches the one the signature carries, it is genuine. If they differ?',
        options: [['Reject it — it was forged or altered', true], ['Trust it anyway', false]],
        ok: 'Right. No matching signature, no trust. Onward.' }
    ]
  },
  3: {
    concept: 'Files, permissions & containers',
    intro: [
      'Now a LINUX TERMINAL — typing commands to a computer. Don’t panic; a few words do the work.',
      '`ls` lists files. Permissions decide WHO may read/write a file — an ACL is the guest-list on a door. A CONTAINER is a sealed box a program runs in; if the box is mis-sealed, you can step out onto the real machine.'
    ],
    steps: [
      { say: 'Practice: to see what is in a folder, you type a two-letter command. Which one?',
        options: [['ls  (list)', true], ['go  (there is no such command)', false]],
        ok: '`ls` lists the folder. Simple as that.' },
      { say: 'A vault folder won’t let you in. You change its ACL (its guest-list) to add YOUR name with access. Conceptually, that is:',
        options: [['Editing the access-control list to grant yourself rights', true], ['Deleting the whole computer', false]],
        ok: 'Yes — change the guest-list, walk in. The live shell expects exactly this.' }
    ]
  },
  4: {
    concept: 'Networks, packets & the OSI layers',
    intro: [
      'Computers talk by sending PACKETS — little envelopes of data — across a network.',
      'Every device has an IP ADDRESS, like a postal address. Communication is built in 7 LAYERS (the OSI model): the bottom is wires, the top (Layer 7) is the actual app message. To spot an attack you find the packet that does not belong, and name which layer it abuses.'
    ],
    steps: [
      { say: 'Practice: the plant normally only READS sensor values. Suddenly one device sends WRITE commands to a breaker. Which packet is suspicious?',
        options: [['The unexpected WRITE to a breaker', true], ['A normal READ of a sensor', false]],
        ok: 'Right — the odd one out. Anomaly = it breaks the normal pattern.' },
      { say: 'That malicious command is an application instruction (the top of the stack). Which OSI layer is that?',
        options: [['Layer 7 — Application', true], ['Layer 1 — the physical wire', false]],
        ok: 'Correct, Layer 7. Now read the live capture the same way.' }
    ]
  },
  5: {
    concept: 'Digital forensics & attribution',
    intro: [
      'A break-in happened here. FORENSICS means following the evidence the attacker left behind.',
      'Clues (we call them indicators) include reused servers, signature code, and stolen certificates. WARNING: attackers plant FALSE FLAGS — easy clues like a foreign language — to frame someone else. Weigh hard technical evidence over easy-to-fake clues.'
    ],
    steps: [
      { say: 'Practice: which is HARDER for an attacker to fake, and so more trustworthy for attribution?',
        options: [['Reused attack infrastructure and custom code', true], ['A comment written in another language', false]],
        ok: 'Exactly. Language is trivial to plant; infrastructure and tooling are not.' },
      { say: 'To keep evidence usable, you must preserve its integrity — its “chain of custody”. That means:',
        options: [['Record and protect the evidence so it can’t be secretly altered', true], ['Edit it to look tidy', false]],
        ok: 'Right. Untampered evidence only. Now work the real scene.' }
    ]
  },
  6: {
    concept: 'Web apps & the OWASP flaws',
    intro: [
      'Websites take INPUT (what you type) and send it to a database using a QUERY.',
      'If the site glues your text straight into that query, you can smuggle in commands — that is INJECTION, the classic OWASP Top-10 flaw. The fix is to keep data and commands strictly separate (“parameterised queries”).'
    ],
    steps: [
      { say: 'Practice: a login builds  SELECT ... WHERE pass = \'[your text]\'. If you type  \' OR \'1\'=\'1  the condition becomes always-true. What did you just do?',
        options: [['Injected logic to bypass the password', true], ['Guessed the password by luck', false]],
        ok: 'Yes — injection. You changed the query’s meaning, not the password.' },
      { say: 'A professional also FIXES it afterwards. The real fix for injection is:',
        options: [['Parameterised queries — separate data from commands', true], ['Just ask users to be nicer', false]],
        ok: 'Correct. Exploit, then patch. That is the live task.' }
    ]
  },
  7: {
    concept: 'Privacy & de-identification',
    intro: [
      'We are taking citizen data — but we protect the people in it. That means DE-IDENTIFICATION.',
      'A DIRECT identifier (a name) must be removed. QUASI-identifiers (birth date, postcode) can combine to re-identify someone, so we GENERALISE them (e.g. age-band instead of exact date). The goal is k-ANONYMITY: each person blends in with at least k−1 others.'
    ],
    steps: [
      { say: 'Practice: a column holds full NAMES. What should you do with a direct identifier?',
        options: [['Suppress it — remove it entirely', true], ['Leave it exactly as-is', false]],
        ok: 'Right. Names go. They identify a person on their own.' },
      { say: 'Exact birth DATE is a quasi-identifier. Instead of deleting it (losing all value), you can:',
        options: [['Generalise it to a year or age-band', true], ['Post it publicly', false]],
        ok: 'Correct — generalise to stay useful but safe. Now scrub the live drive.' }
    ]
  },
  8: {
    concept: 'Human behaviour & nudges',
    intro: [
      'The strongest lock is a person — and people can be NUDGED. This is social engineering.',
      'People defer to AUTHORITY, act under URGENCY, follow the crowd (SOCIAL PROOF), and take the EASIEST path (Fogg’s model: a behaviour needs Motivation, Ability and a Prompt). A good pretext makes helping you the path of least resistance.'
    ],
    steps: [
      { say: 'Practice: which email is a guard more likely to obey?',
        options: [['“Facilities Security: re-validate your badge in 15 min”', true], ['“random stranger: give me your password”', false]],
        ok: 'Right — authority plus urgency, no scary demand. People comply with that.' },
      { say: 'To make the action happen, Fogg says you must make it EASY. Best call-to-action?',
        options: [['One tap at a nearby reader', true], ['Fill a 12-page form and post it', false]],
        ok: 'Correct — low friction wins. Now craft the live pretext.' }
    ]
  },
  9: {
    concept: 'Governance & ISO 27001 controls',
    intro: [
      'This is MANAGEMENT — running security by policy. The standard is ISO/IEC 27001.',
      'You list your RISKS, then pick a CONTROL to treat each one (MFA for stolen passwords, encryption for lost laptops, training for phishing). Controls must be chosen from a RISK ASSESSMENT, not at random. An unmatched risk is an open door.'
    ],
    steps: [
      { say: 'Practice: the risk is “staff get phished”. Which control best treats THAT risk?',
        options: [['Security awareness training', true], ['Buy a bigger firewall', false]],
        ok: 'Right — match the control to the actual risk. Phishing is a people problem.' },
      { say: 'How should controls be selected in a proper management system?',
        options: [['Based on a documented risk assessment', true], ['Whatever is cheapest or newest', false]],
        ok: 'Correct — risk-driven. Now build the live control set.' }
    ]
  },
  10: {
    concept: 'Synthesis — letting evidence converge',
    intro: [
      'The finale is SYNTHESIS: combining everything you gathered into one conclusion.',
      'When many INDEPENDENT sources point at the same answer, that is strong (convergence). One loud source repeating itself is weak. Weigh the evidence; let the best-supported answer — not the noisiest — name the target.'
    ],
    steps: [
      { say: 'Practice: Node A is named once, very loudly, by a single relay. Node B is named by five different sectors independently. Which is the real target?',
        options: [['Node B — many independent sources converge', true], ['Node A — it shouted the loudest', false]],
        ok: 'Exactly. Convergence beats volume. Now isolate the master server for real.' },
      { say: 'And the ethical rule for the whole operation, even now?',
        options: [['Act within authorisation and minimise harm', true], ['Cause maximum damage for its own sake', false]],
        ok: 'Correct. We end this cleanly. Go.' }
    ]
  }
};

export function getTeach(n) { return TEACH[n]; }
