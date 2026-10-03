// L1 — Risk Management & Access Control. Teaches likelihood × impact and
// least-residual-risk bypass of a biometric control.
import { buildShell, runTasks } from './shell.js';

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'RISKCALC ▸ perimeter threat model', sub: 'Assess vectors by <b>likelihood × impact</b>. Pick the path that gets in with the smallest blast radius.' });

  const tasks = [
    {
      prompt: 'Four breach vectors are on the board. Choose the most favourable RISK profile.',
      narrative: 'VECTOR MATRIX  (likelihood / impact → risk)\n  A  Ram the vehicle gate ......... L5 × I5 = 25  (catastrophic, certain alarm)\n  B  Cut mains power ............... L3 × I5 = 15  (fail-secure locks engage)\n  C  Clone a cached biometric ...... L2 × I2 =  4  (quiet, contained)\n  D  Tailgate a staffer ............ L3 × I3 =  9  (human variable)',
      choices: [
        { label: 'Ram the vehicle gate (risk 25)', correct: false, why: 'Maximum impact and guaranteed detection. Worst profile.' },
        { label: 'Cut mains power (risk 15)', correct: false, why: 'Fail-secure controls lock down on power loss. Raises the alarm.' },
        { label: 'Clone a cached biometric template (risk 4)', correct: true },
        { label: 'Tailgate a staffer (risk 9)', correct: false, why: 'Workable, but the human variable makes it higher-risk than cloning.' }
      ],
      answer: ['c', 'vector c', 'clone'],
      placeholder: 'enter chosen vector (e.g. C)…',
      hint: 'Lowest likelihood × impact that still achieves entry.',
      hcHint: 'Type the letter of the lowest-risk viable vector.',
      radio: 'Operator — risk is <b>likelihood × impact</b>. Don’t weigh how clever a vector is; weigh how likely it trips an alarm and how bad that is. The smallest product wins.',
      success: 'Vector C selected. Lowest residual risk, full entry. Risk-based thinking confirmed.'
    },
    {
      prompt: 'The scanner caches the last valid template. Which bypass carries the least residual risk?',
      choices: [
        { label: 'Replay the cached template to the reader', correct: true },
        { label: 'Brute-force the minutiae hash on-site', correct: false, why: 'Slow, noisy, and lockout-prone. High likelihood of detection.' },
        { label: 'Shatter the housing and short the sensor', correct: false, why: 'Tamper switch → instant alarm. High impact.' }
      ],
      answer: ['replay', 'replay cached template', 'replay template'],
      placeholder: 'name the technique…',
      hint: 'Reuse what the control already trusts.',
      hcHint: 'One word: what do you do with the cached template?',
      radio: 'Remember the principle, Operator: don’t break a control you can <b>reuse</b>. The scanner already trusts its own cached template — replaying trusted data is quieter than forcing anything.',
      success: 'Template replayed. The reader trusts its own cache — the weakest link in the control.'
    },
    {
      prompt: 'Set the lock’s failure mode so it opens for you without tripping monitoring.',
      narrative: 'A door can FAIL-SECURE (locks on fault) or FAIL-OPEN (unlocks on fault). The SOC only logs forced entries.',
      choices: [
        { label: 'Force a sensor fault and configure FAIL-OPEN', correct: true },
        { label: 'Leave it FAIL-SECURE and pick the cylinder', correct: false, why: 'Mechanical bypass is logged as forced entry.' },
        { label: 'Disable the lock entirely', correct: false, why: 'Heartbeat loss alerts the SOC — high likelihood of response.' }
      ],
      answer: ['fail-open', 'fail open', 'failopen'],
      placeholder: 'set failure mode…',
      hint: 'You want the fault state to grant access, not deny it.',
      hcHint: 'Type the failure mode that unlocks on fault.',
      radio: 'Think about failure modes, Operator. <b>Fail-secure</b> locks on a fault; <b>fail-open</b> unlocks on a fault. The SOC only logs forced entry — so make the fault open the door for you.',
      success: 'Door set FAIL-OPEN under a benign fault. No forced-entry log. Perimeter is yours.'
    }
  ];

  runTasks(shell, {
    tasks, prompt: 'specter@gate',
    intro: ['RISKCALC v3.1 — residual-risk advisor', 'Reminder: a control you can reuse beats a control you must break.\n'],
    onDone
  });
  return shell;
}
