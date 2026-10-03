// FIELD REFERENCE LIBRARY + learning-outcome coverage map.
// Every objective is sourced from the professional canon (texts, ISO/IEC
// standards, OWASP, CyBOK, NIST/MITRE) — never from any institution/course.
// `outcomes` lists, per sector, every learning outcome distilled from the
// reference fragments and the objective that demonstrates it (auditable:
// "no concept left behind"). `checks` are MANDATORY knowledge gates.

export const CODEX = {
  1: {
    discipline: 'Risk Management & Security Foundations',
    library: [
      { ref: 'D. Sutton, Cyber Security: A Practitioner’s Guide (BCS, 2017)', note: 'risk-based security' },
      { ref: 'D. Gollmann, Computer Security (Wiley)', note: 'core concepts, CIA triad' },
      { ref: 'ISO/IEC 27000 series', note: 'role of standards' }
    ],
    outcomes: [
      'Perceive key cyber-security concepts and definitions → CIA-triad knowledge gate',
      'Why risk management is fundamental → likelihood × impact vector choice',
      'How cryptography provides basic security services → carried into Sector 2',
      'How network/computer security build cyber security → carried across campaign',
      'Role of standards in cyber security → standards knowledge gate',
      'Role and importance of security in society → fail-open vs forced-entry ethics choice'
    ],
    checks: [
      { q: 'The CIA triad — the three core security properties — is:', principle: 'Concepts (LO1)', ref: 'Gollmann, Computer Security',
        choices: [['Confidentiality, Integrity, Availability', true], ['Control, Identity, Access', false, 'Not the canonical triad.'], ['Cryptography, Internet, Authentication', false, 'These are mechanisms, not the triad.']],
        answer: ['confidentiality integrity availability', 'cia', 'confidentiality, integrity, availability'] },
      { q: 'Why is risk management fundamental to security?', principle: 'Risk (LO2)', ref: 'Sutton, Practitioner’s Guide',
        choices: [['Risk can’t be eliminated, so it’s prioritised by likelihood × impact', true], ['Because every system can be made 100% secure', false, 'Perfect security is unattainable; residual risk always remains.'], ['Because compliance forbids any risk', false, 'Standards manage risk, they don’t forbid it.']],
        answer: ['likelihood x impact', 'likelihood times impact', 'cannot eliminate risk', 'prioritise risk'] },
      { q: 'What is the primary role of security standards (e.g. the ISO/IEC 27000 series)?', principle: 'Standards (LO5)', ref: 'ISO/IEC 27000',
        choices: [['Provide a common, assured baseline of practice', true], ['Guarantee a system can never be breached', false, 'Standards reduce risk; they don’t guarantee invulnerability.'], ['Replace the need for risk assessment', false, '27001 is built around risk assessment.']],
        answer: ['common baseline', 'baseline of practice', 'assurance'] }
    ]
  },
  2: {
    discipline: 'Applied Cryptography',
    library: [
      { ref: 'K. M. Martin, Everyday Cryptography, 2nd ed. (OUP, 2017)', note: 'core text' },
      { ref: 'Ferguson, Kohno & Schneier, Cryptography Engineering (Wiley, 2010)', note: 'mechanisms' },
      { ref: 'J.-P. Aumasson, Serious Cryptography (No Starch, 2017)', note: 'modern primitives' },
      { ref: 'Tooling: CrypTool', note: 'practical decryption' }
    ],
    outcomes: [
      'Precise role of cryptography in a digital system → decrypt + verify stage',
      'Compare mechanisms (confidentiality, integrity, origin auth, non-repudiation) → signature gate',
      'Assess crypto points of vulnerability → key-management gate',
      'Analyse crypto in real applications → symmetric-stream task',
      'Informed opinion on societal use of crypto → intel log',
      'Future developments in cryptography → intel log'
    ],
    checks: [
      { q: 'A symmetric cipher uses which key arrangement?', principle: 'Mechanisms (LO1)', ref: 'Martin, Everyday Cryptography',
        choices: [['The same secret key to encrypt and decrypt', true], ['A public key to encrypt, private to decrypt', false, 'That describes public-key (asymmetric) crypto.'], ['No key at all', false, 'A keyless cipher provides no real confidentiality.']],
        answer: ['same key', 'same secret key', 'shared key', 'one key'] },
      { q: 'A digital signature provides which service that encryption alone does NOT?', principle: 'Mechanisms (LO2)', ref: 'Martin, Everyday Cryptography',
        choices: [['Data-origin authentication & non-repudiation', true], ['Confidentiality of the message body', false, 'That is encryption’s job, not the signature’s.'], ['Faster transmission', false, 'Signatures add overhead; they’re about trust, not speed.']],
        answer: ['non-repudiation', 'origin authentication', 'data origin authentication', 'authentication and integrity'] },
      { q: 'In a well-designed cryptosystem, the most common real-world point of failure is:', principle: 'Vulnerability (LO3)', ref: 'Ferguson/Kohno/Schneier',
        choices: [['Key management', true], ['The mathematics of AES', false, 'Modern primitives rarely break; their key handling does.'], ['The length of the plaintext', false, 'Not a primary failure mode.']],
        answer: ['key management', 'keys', 'key handling'] }
    ]
  },
  3: {
    discipline: 'Computer Systems Security',
    library: [
      { ref: 'D. Gollmann, Computer Security (Wiley, 2011)', note: 'access control, OS' },
      { ref: 'R. Anderson, Security Engineering (Wiley)', note: 'least privilege, models' },
      { ref: 'M. Bishop, Computer Security: Art & Science', note: 'policy/models' },
      { ref: 'CyBOK — Operating Systems & Virtualisation Security', note: 'containers' }
    ],
    outcomes: [
      'Role of security mechanisms (HW & SW) → host enumeration + shell',
      'Mechanisms implementing security policies → ACL task',
      'Access-control mechanisms (ACL, capability, DAC/MAC) → ACL knowledge gate',
      'User authentication mechanisms (passwords, biometrics, tokens) → carried from Sector 1/8',
      'Virtualisation & container security → container-escape gate',
      'Selecting computer-systems security controls → least-privilege gate'
    ],
    checks: [
      { q: 'An Access Control List (ACL) is best described as:', principle: 'Access control (LO3)', ref: 'Gollmann, Computer Security',
        choices: [['A list, attached to an object, of which subjects may do what', true], ['A key the subject carries that names its rights', false, 'That’s a capability — the dual of an ACL.'], ['A firewall rule set', false, 'ACL here is OS access control, not packet filtering.']],
        answer: ['list attached to object', 'subjects per object', 'permissions on an object', 'object permission list'] },
      { q: 'Discretionary (DAC) vs Mandatory (MAC) access control differ in that:', principle: 'Models (LO2)', ref: 'Bishop, Art & Science',
        choices: [['DAC lets owners set permissions; MAC enforces a system-wide policy', true], ['They are identical', false, 'They are distinct models.'], ['MAC means “Media Access Control”', false, 'Different MAC — that’s the L2 address.']],
        answer: ['dac owner mac policy', 'owner discretion vs system policy', 'dac discretionary mac mandatory'] },
      { q: 'Why is a container NOT a strong security boundary by default?', principle: 'Virtualisation (LO5)', ref: 'CyBOK OS & Virtualisation',
        choices: [['Containers share the host kernel, so a kernel/escape flaw crosses the boundary', true], ['Containers use more RAM than VMs', false, 'Resource use isn’t a security boundary.'], ['Containers can’t run Linux', false, 'They typically run Linux.']],
        answer: ['shared kernel', 'share the host kernel', 'same kernel'] }
    ]
  },
  4: {
    discipline: 'Network & Infrastructure Security',
    library: [
      { ref: 'Kurose & Ross, Computer Networking: A Top-Down Approach', note: 'OSI/TCP-IP' },
      { ref: 'W. Stallings, Network Security Essentials', note: 'countermeasures' },
      { ref: 'T. Wilhelm, Professional Penetration Testing + PTES', note: 'authorised testing' },
      { ref: 'CyBOK — Network Security & Cyber-Physical Systems; MITRE ATT&CK', note: 'CNI' }
    ],
    outcomes: [
      'Understand OSI 7-layer & TCP/IP → OSI-layer gate',
      'Network threats & countermeasures → surgical-block task',
      'Network security architecture & design → segmentation knowledge gate',
      'Attack models, vuln analysis, pen-test methodology & legal aspects → authorisation gate',
      'Exploit vulnerabilities to penetrate → carried from Sector 3/6',
      'Cyber-physical systems & CNI → SCADA capture scenario'
    ],
    checks: [
      { q: 'Abuse of Modbus function codes (writing to breaker coils) operates at which OSI layer?', principle: 'OSI (LO1)', ref: 'Kurose & Ross',
        choices: [['Layer 7 — Application', true], ['Layer 4 — Transport', false, 'TCP carries it, but the weapon is the application command.'], ['Layer 1 — Physical', false, 'No physical-medium attack here.']],
        answer: ['7', 'layer 7', 'application'] },
      { q: 'A non-cryptographic countermeasure that limits an attacker’s lateral movement in a plant network is:', principle: 'Countermeasures (LO2/3)', ref: 'Stallings, Network Security Essentials',
        choices: [['Network segmentation', true], ['Using a longer Wi-Fi password', false, 'Doesn’t contain lateral movement once inside.'], ['Disabling logging', false, 'That harms defence, not helps it.']],
        answer: ['segmentation', 'network segmentation'] },
      { q: 'Before any professional penetration test, the essential legal prerequisite is:', principle: 'Pen-test/legal (LO4)', ref: 'Wilhelm / PTES',
        choices: [['Written authorisation and an agreed scope (rules of engagement)', true], ['A fast internet connection', false, 'Irrelevant to legality.'], ['Nothing — testing is always permitted', false, 'Unauthorised testing is a crime.']],
        answer: ['authorisation', 'written authorisation', 'scope', 'rules of engagement', 'permission'] }
    ]
  },
  5: {
    discipline: 'Cybercrime & Digital Forensics',
    library: [
      { ref: 'E. Casey, Digital Evidence and Computer Crime', note: 'forensic method' },
      { ref: 'D. Wall, Cybercrime: The Transformation of Crime', note: 'typology' },
      { ref: 'Hunton, Stages of Cybercrime Investigation', note: 'process' },
      { ref: 'MITRE ATT&CK', note: 'TTP attribution' }
    ],
    outcomes: [
      'Civil/criminal law & the international cybercrime convention → intel log',
      'Mechanisms to prevent/investigate/mitigate cybercrime → evidence collection',
      'Attacker motivation & methodology (incl. state-sponsored) → attribution gate',
      'Assess mechanisms: DoS, malware, phishing, fraud → mechanisms knowledge gate',
      'Identify & evaluate cybercrime trends → intel log',
      'Forensic principles (evidence integrity) → chain-of-custody gate'
    ],
    checks: [
      { q: 'The most reliable basis for attributing an intrusion is:', principle: 'Attribution (LO3)', ref: 'Casey; MITRE ATT&CK',
        choices: [['Convergent technical TTPs, infrastructure and code reuse', true], ['The human language found in a code comment', false, 'Language is trivially planted — a classic false flag.'], ['The time of day of the attack', false, 'Easily spoofed and weakly indicative.']],
        answer: ['ttps', 'technical ttps', 'infrastructure and code reuse', 'tradecraft'] },
      { q: 'To keep digital evidence admissible, an investigator must preserve:', principle: 'Forensics (LO2)', ref: 'Casey, Digital Evidence',
        choices: [['Chain of custody and evidence integrity (hashes, imaging)', true], ['Only a screenshot of the screen', false, 'Insufficient and alterable.'], ['Nothing — originals can be edited freely', false, 'Editing originals destroys admissibility.']],
        answer: ['chain of custody', 'evidence integrity', 'integrity of evidence'] },
      { q: 'DoS, malware distribution, phishing and fraud are all examples of:', principle: 'Mechanisms (LO4)', ref: 'Wall, Cybercrime',
        choices: [['Cybercrime mechanisms / methods', true], ['Security controls', false, 'They are attacks, not controls.'], ['Encryption schemes', false, 'Unrelated to those mechanisms.']],
        answer: ['cybercrime mechanisms', 'attack mechanisms', 'methods of cybercrime'] }
    ]
  },
  6: {
    discipline: 'Software & Application Security',
    library: [
      { ref: 'OWASP Top 10 (owasp.org)', note: 'vuln classes' },
      { ref: 'Stuttard & Pinto, The Web Application Hacker’s Handbook', note: 'exploitation' },
      { ref: 'Howard & Lipner, The Security Development Lifecycle (Microsoft)', note: 'secure SDLC' },
      { ref: 'M. Zalewski, The Tangled Web', note: 'web security model' }
    ],
    outcomes: [
      'Importance of security in development → patch step',
      'Apply the secure software development lifecycle → SDLC knowledge gate',
      'Main software-security issues & effects → injection classify gate',
      'How vulnerabilities manipulate execution → exploit step',
      'Threat of malicious software & techniques → intel log',
      'Trends influencing software security → intel log'
    ],
    checks: [
      { q: 'A login bypassed by  `\' OR \'1\'=\'1\' --`  is which OWASP Top-10 class?', principle: 'Vuln class (LO3/4)', ref: 'OWASP Top 10',
        choices: [['A03: Injection (SQL injection)', true], ['A02: Cryptographic Failures', false, 'No crypto is involved in the bypass.'], ['A09: Logging Failures', false, 'Logging isn’t the flaw exploited.']],
        answer: ['a03', 'injection', 'sql injection', 'sqli'] },
      { q: 'The correct root-cause fix for SQL injection is:', principle: 'Issues (LO3)', ref: 'Web App Hacker’s Handbook',
        choices: [['Parameterised queries / prepared statements', true], ['Blocking the apostrophe at a WAF', false, 'Bypassable; doesn’t fix the cause.'], ['A longer admin password', false, 'Irrelevant to the injection.']],
        answer: ['parameterised queries', 'parameterized queries', 'prepared statements', 'bind variables'] },
      { q: 'The “secure SDLC” principle says security should be:', principle: 'SDLC (LO2)', ref: 'Howard & Lipner, SDL',
        choices: [['Built in across the whole lifecycle, not bolted on at the end', true], ['Added only after release if a breach occurs', false, 'Reactive, costly, and the very anti-pattern SDL warns against.'], ['Handled solely by the firewall team', false, 'Software security is a development responsibility.']],
        answer: ['built in', 'throughout the lifecycle', 'by design', 'shift left'] }
    ]
  },
  7: {
    discipline: 'Information Privacy & PETs',
    library: [
      { ref: 'C. Adams, Introduction to Privacy Enhancing Technologies (Springer, 2021)', note: 'PETs' },
      { ref: 'ISO/IEC 20889 — de-identification terminology & techniques', note: 'k-anonymity' },
      { ref: 'ISO/IEC 29100 — Privacy framework; ISO/IEC 27701', note: 'governance' }
    ],
    outcomes: [
      'Meaning of data privacy; how PII is acquired/stored/processed → dataset task',
      'Privacy & risk management → risk-threshold task',
      'Plan/develop a Privacy Impact Assessment → PIA knowledge gate',
      'Relevance of privacy standards → standards gate (29100/20889)',
      'De-identification techniques & limits → k-anonymity gate',
      'Use case studies to evaluate privacy → intel log'
    ],
    checks: [
      { q: 'k-anonymity protects individuals by ensuring that:', principle: 'De-identification (LO5)', ref: 'ISO/IEC 20889; Adams, PETs',
        choices: [['Each record is indistinguishable from at least k−1 others on its quasi-identifiers', true], ['Every value is encrypted with a k-bit key', false, 'k-anonymity is about indistinguishability, not key length.'], ['Exactly k records are deleted', false, 'No records need deleting.']],
        answer: ['indistinguishable', 'k-1 others', 'indistinguishable from k-1', 'at least k records alike'] },
      { q: 'A Privacy Impact Assessment (PIA) is:', principle: 'PIA (LO3)', ref: 'ISO/IEC 29134 / Sutton',
        choices: [['A proactive evaluation of privacy risks in a processing activity', true], ['A post-breach press release', false, 'A PIA is proactive, before processing.'], ['A marketing consent form', false, 'Not an assessment of risk.']],
        answer: ['privacy impact assessment', 'proactive privacy risk evaluation', 'assess privacy risk'] },
      { q: 'A Privacy-Enhancing Technology that allows computation on data while it stays encrypted is:', principle: 'PETs (LO5)', ref: 'Adams, Intro to PETs',
        choices: [['Homomorphic encryption', true], ['Base64 encoding', false, 'Encoding is not encryption or privacy.'], ['Plaintext logging', false, 'The opposite of a PET.']],
        answer: ['homomorphic encryption', 'homomorphic'] }
    ]
  },
  8: {
    discipline: 'Security Behaviour & Behaviour Change',
    library: [
      { ref: 'Thaler & Sunstein, Nudge (2008)', note: 'choice architecture' },
      { ref: 'B. J. Fogg, A Behavior Model for Persuasive Design (B=MAP)', note: 'behaviour model' },
      { ref: 'Dolan et al., MINDSPACE', note: 'behavioural levers' },
      { ref: 'Bada, Sasse & Nurse — why awareness campaigns fail', note: 'limits of training' }
    ],
    outcomes: [
      'Role of individuals in security goals → pretext build',
      'Societal dynamics of security perception → social-proof step',
      'Methods of behaviour change & their theories → Fogg B=MAP gate',
      'Limitations of policy/training/interventions → awareness-failure gate',
      'Design usable security mitigating biases → authority/urgency steps',
      'Develop awareness programmes → intel log'
    ],
    checks: [
      { q: 'A spoofed email from “Facilities Security” works mainly through which influence principle?', principle: 'Behaviour change (LO3/5)', ref: 'Cialdini; Thaler & Sunstein, Nudge',
        choices: [['Authority', true], ['Scarcity of bandwidth', false, 'Not the lever in play.'], ['Reciprocity of payment', false, 'No exchange is offered.']],
        answer: ['authority'] },
      { q: 'Fogg’s behaviour model says a behaviour occurs when which factors converge?', principle: 'Theory (LO3)', ref: 'Fogg, B=MAP',
        choices: [['Motivation, Ability and a Prompt (B = MAP)', true], ['Money, Access, Power', false, 'Not Fogg’s model.'], ['Malware, APT, Phishing', false, 'Unrelated acronym.']],
        answer: ['motivation ability prompt', 'b=map', 'motivation, ability, prompt', 'map'] },
      { q: 'Why do many security-awareness campaigns fail to change behaviour?', principle: 'Limits (LO4)', ref: 'Bada, Sasse & Nurse',
        choices: [['Knowing is not doing — behaviour needs habit, culture and usable design', true], ['Because users are simply too stupid to learn', false, 'Blaming users is exactly the failed mindset the research critiques.'], ['Because training is illegal', false, 'It isn’t.']],
        answer: ['knowledge is not behaviour', 'knowing is not doing', 'habit and culture', 'usability'] }
    ]
  },
  9: {
    discipline: 'Security Management & Governance',
    library: [
      { ref: 'ISO/IEC 27001 — ISMS Requirements', note: 'the standard' },
      { ref: 'ISO/IEC 27002 — Code of practice for controls', note: 'Annex A controls' },
      { ref: 'ISO/IEC 27000 — Overview & vocabulary', note: 'definitions' },
      { ref: 'Taylor et al., Information Security Management Principles (BCS, 2020)', note: 'practice' }
    ],
    outcomes: [
      'Develop an ISMS per ISO/IEC 27001 & evaluate it → control-mapping task',
      'Create security policies underlying an ISMS → policy lock-out',
      'Generate a risk assessment as ISMS input → risk-first knowledge gate',
      'Select/coordinate controls on a risk basis → risk→control matching',
      'Design & document ISMS processes → 27002 knowledge gate',
      'Develop staff training & awareness → links to Sector 8'
    ],
    checks: [
      { q: 'ISO/IEC 27001 is the standard that specifies:', principle: 'ISMS (LO1)', ref: 'ISO/IEC 27001',
        choices: [['The requirements for an Information Security Management System (ISMS)', true], ['A programming language', false, 'It’s a management standard.'], ['A firewall configuration', false, 'It’s management, not a device config.']],
        answer: ['isms requirements', 'requirements for an isms', 'information security management system'] },
      { q: 'Under a risk-based ISMS, security controls must be selected on the basis of:', principle: 'Risk-based (LO3/4)', ref: 'ISO/IEC 27001/27002',
        choices: [['A documented risk assessment', true], ['Whatever is cheapest', false, 'Cost alone ignores the treated risk.'], ['The newest gadget on the market', false, 'Controls follow risk, not fashion.']],
        answer: ['risk assessment', 'documented risk assessment', 'the risk assessment'] },
      { q: 'ISO/IEC 27002 provides:', principle: 'Controls (LO4/5)', ref: 'ISO/IEC 27002',
        choices: [['A code of practice / reference set of information-security controls', true], ['Penalties for non-compliance', false, 'That’s law/regulation, not 27002.'], ['Network cabling standards', false, 'Wrong domain entirely.']],
        answer: ['code of practice', 'controls', 'reference controls', 'control catalogue'] }
    ]
  },
  10: {
    discipline: 'Research, Synthesis & Intelligence',
    library: [
      { ref: 'Edgar & Manz, Research Methods for Cyber Security (Syngress, 2017)', note: 'methods, analysis' },
      { ref: 'S. Vallor, An Introduction to Cybersecurity Ethics', note: 'research ethics' },
      { ref: 'CyBOK — the Cyber Security Body of Knowledge', note: 'breadth/synthesis' }
    ],
    outcomes: [
      'Breadth of research & ethics → ethics knowledge gate',
      'Evaluate & select research methods → evidence-weighting task',
      'Critical literature review; referencing & citing → convergence matrix',
      'Quantitative/qualitative analysis & data representation → data-viz correlation',
      'Plan a project; risks & dependencies → synthesis/neutralise step',
      'Synthesis, analysis & evaluation (capstone) → final target isolation'
    ],
    checks: [
      { q: 'When several independent sources point to one conclusion, the strongest analytic move is to:', principle: 'Analysis (LO4)', ref: 'Edgar & Manz',
        choices: [['Weight convergent, independent evidence over a single loud signal', true], ['Trust the noisiest, most-repeated signal', false, 'Repetition by one source isn’t corroboration.'], ['Pick at random', false, 'Not analysis at all.']],
        answer: ['convergent evidence', 'weigh independent evidence', 'triangulation', 'convergent independent evidence'] },
      { q: 'A core principle of responsible security research/operations is to:', principle: 'Ethics (LO1)', ref: 'Vallor, Cybersecurity Ethics',
        choices: [['Minimise harm and act within authorisation/consent', true], ['Cause maximum disruption for impact', false, 'Unethical and out of scope.'], ['Ignore consequences to third parties', false, 'Directly violates research ethics.']],
        answer: ['minimise harm', 'minimize harm', 'do no harm', 'within authorisation', 'consent'] },
      { q: 'In intelligence work, “synthesis” means:', principle: 'Synthesis (LO6)', ref: 'CyBOK; Security Project',
        choices: [['Combining analysed evidence into an evaluated, defensible conclusion', true], ['Collecting raw data and stopping there', false, 'Collection is not synthesis.'], ['Deleting inconvenient evidence', false, 'That’s falsification.']],
        answer: ['combine evidence into a conclusion', 'integrate findings', 'combine analysis into conclusion', 'evaluate and conclude'] }
    ]
  }
};

export function getCodex(n) { return CODEX[n]; }
