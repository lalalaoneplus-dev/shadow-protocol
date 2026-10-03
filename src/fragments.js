// Phase 3 — Intel Fragments. Glowing collectibles placed in the 3D sectors.
// Each holds a literal definition / framework summary distilled from the 11
// field references. Readable any time via the Data Codex in the pause menu.
export const FRAGMENTS = {
  1: [
    { title: 'THE CIA TRIAD', body: 'The three core security properties: Confidentiality (only authorised parties read it), Integrity (it isn’t altered), Availability (it’s there when needed).', source: 'Gollmann, Computer Security' },
    { title: 'RISK = LIKELIHOOD × IMPACT', body: 'Risk management is fundamental: risk cannot be eliminated, only reduced and prioritised by how likely a threat is and how damaging it would be.', source: 'Sutton, Cyber Security: A Practitioner’s Guide' },
    { title: 'WHY STANDARDS EXIST', body: 'Security standards (e.g. the ISO/IEC 27000 series) provide a common, assured baseline so organisations manage risk consistently rather than ad hoc.', source: 'ISO/IEC 27000' }
  ],
  2: [
    { title: 'SYMMETRIC ENCRYPTION', body: 'A single shared secret key both encrypts and decrypts. Fast and strong, but the key must be distributed securely to both parties.', source: 'Martin, Everyday Cryptography' },
    { title: 'DIGITAL SIGNATURES', body: 'Provide data-origin authentication, integrity and non-repudiation: they prove who sent a message and that it wasn’t changed — services encryption alone does not give.', source: 'Martin, Everyday Cryptography' },
    { title: 'KEY MANAGEMENT', body: 'In a well-built cryptosystem the maths rarely breaks — key management does. Generation, distribution, storage and revocation of keys are the real attack surface.', source: 'Ferguson, Kohno & Schneier, Cryptography Engineering' }
  ],
  3: [
    { title: 'ACCESS CONTROL LISTS', body: 'An ACL is attached to an object and lists which subjects may perform which actions. Its dual, a capability, is a token the subject carries naming its rights.', source: 'Gollmann, Computer Security' },
    { title: 'DAC vs MAC', body: 'Discretionary Access Control lets the owner set permissions. Mandatory Access Control enforces a system-wide policy the owner cannot override.', source: 'Bishop, Computer Security: Art & Science' },
    { title: 'CONTAINERS SHARE A KERNEL', body: 'Containers are lightweight but share the host kernel — they are not a strong security boundary by default; a kernel flaw or misconfig allows escape to the host.', source: 'CyBOK — OS & Virtualisation Security' }
  ],
  4: [
    { title: 'THE OSI 7-LAYER MODEL', body: 'Networking is layered: 1 Physical, 2 Data-Link, 3 Network (IP), 4 Transport (TCP/UDP), 5 Session, 6 Presentation, 7 Application. Attacks are classified by the layer they abuse.', source: 'Kurose & Ross, Computer Networking' },
    { title: 'IP ADDRESS', body: 'An IP address is a device’s postal address on a network, used at Layer 3 to route packets from source to destination.', source: 'Peterson & Davie, Computer Networks' },
    { title: 'DEFENCE-IN-DEPTH', body: 'Non-cryptographic countermeasures — segmentation, packet filtering, intrusion detection — limit how far an intruder can move once inside, protecting Critical National Infrastructure.', source: 'Stallings, Network Security Essentials' }
  ],
  5: [
    { title: 'CHAIN OF CUSTODY', body: 'Digital evidence must be acquired and preserved so it cannot be secretly altered (imaging, hashing, documented handling); otherwise it is inadmissible.', source: 'Casey, Digital Evidence and Computer Crime' },
    { title: 'ATTRIBUTION & FALSE FLAGS', body: 'Attribute on convergent technical evidence — reused infrastructure, code, TTPs. Easy clues like a code-comment language are trivially planted false flags.', source: 'MITRE ATT&CK; Casey' },
    { title: 'CYBERCRIME MECHANISMS', body: 'Denial-of-service, malware distribution, phishing, spam, fraud and hacking are the recurring mechanisms of cybercrime, often sold "as-a-service".', source: 'Wall, Cybercrime' }
  ],
  6: [
    { title: 'OWASP TOP 10 — INJECTION', body: 'Injection (e.g. SQL injection) occurs when untrusted input is interpreted as a command. Classic example: \' OR \'1\'=\'1 turning a check always-true.', source: 'OWASP Top 10' },
    { title: 'THE FIX: PARAMETERISATION', body: 'Injection is fixed at the root by parameterised queries / prepared statements — keeping data strictly separate from code, not by blocklisting characters.', source: 'Stuttard & Pinto, Web Application Hacker’s Handbook' },
    { title: 'SECURE SDLC', body: 'Security must be built in across the whole software development lifecycle — requirements, design, code, test — not bolted on after a breach.', source: 'Howard & Lipner, The Security Development Lifecycle' }
  ],
  7: [
    { title: 'k-ANONYMITY', body: 'A dataset is k-anonymous if every record is indistinguishable from at least k−1 others on its quasi-identifiers, so no individual can be singled out.', source: 'ISO/IEC 20889' },
    { title: 'DE-IDENTIFICATION', body: 'Suppress direct identifiers (names); generalise quasi-identifiers (birth date → year, postcode → district). Preserve the sensitive attribute’s utility.', source: 'Adams, Introduction to Privacy Enhancing Technologies' },
    { title: 'PETs & HOMOMORPHIC ENCRYPTION', body: 'Privacy-Enhancing Technologies protect data in use. Homomorphic encryption even allows computation on data while it remains encrypted.', source: 'Adams, Intro to PETs; ISO/IEC 29100' }
  ],
  8: [
    { title: 'NUDGE / CHOICE ARCHITECTURE', body: 'Small changes to how choices are presented predictably steer behaviour without removing options. Defaults, framing and friction are powerful levers.', source: 'Thaler & Sunstein, Nudge' },
    { title: 'FOGG BEHAVIOUR MODEL (B=MAP)', body: 'A behaviour happens when Motivation, Ability and a Prompt converge at the same moment. Lower the friction (raise Ability) and well-timed prompts succeed.', source: 'Fogg, A Behavior Model for Persuasive Design' },
    { title: 'WHY AWARENESS FAILS', body: 'Knowing is not doing. Campaigns fail when they push facts but ignore habit, culture and usability. Blaming users is the failed mindset, not the fix.', source: 'Bada, Sasse & Nurse' }
  ],
  9: [
    { title: 'ISO/IEC 27001 — THE ISMS', body: 'Specifies the requirements for an Information Security Management System: a risk-based, documented, continually-improved way to manage security by policy.', source: 'ISO/IEC 27001' },
    { title: 'RISK-BASED CONTROLS', body: 'Controls (Annex A / ISO 27002) must be selected from a documented risk assessment to treat identified risks — not chosen by cost or fashion. An untreated risk is an open door.', source: 'ISO/IEC 27002' },
    { title: 'GOVERNANCE: PEOPLE & PROCESS', body: 'An ISMS binds technology, process and people: policies, incident response, business continuity, audit, and staff training and awareness.', source: 'Taylor et al., Information Security Management Principles' }
  ],
  10: [
    { title: 'SYNTHESIS', body: 'Combining analysed evidence into a single evaluated, defensible conclusion — the capstone skill: application, analysis, synthesis and evaluation together.', source: 'CyBOK; Cyber Security Project' },
    { title: 'CONVERGENT EVIDENCE', body: 'Weigh independent, convergent sources over a single loud signal. Triangulation — multiple methods agreeing — is stronger than any one repeated claim.', source: 'Edgar & Manz, Research Methods for Cyber Security' },
    { title: 'RESEARCH ETHICS', body: 'Operate within authorisation and consent and minimise harm to third parties. Capability is bounded by responsibility.', source: 'Vallor, An Introduction to Cybersecurity Ethics' }
  ]
};

export function getFragments(n) { return FRAGMENTS[n] || []; }
