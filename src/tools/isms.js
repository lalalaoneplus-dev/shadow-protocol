// L9 — Security Management & Governance. Build a risk-based control set:
// match each risk to the ISO/IEC 27001 Annex A control that treats it.
// Theory: ISO/IEC 27001 (requirements) + 27002 (controls); risk-based selection.
import { buildShell, isHardcore, escapeHtml } from './shell.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'ISMS Builder ▸ ISO/IEC 27001 control mapping', sub: 'Treat every risk with the right Annex A control. Gaps = the door an intruder walks through.' });
  const hard = isHardcore();
  shell.setConcept('Match the control to the <b>actual risk</b>, Operator (ISO 27001 Annex A): training treats phishing, MFA treats stolen credentials, encryption treats a lost device. A bigger firewall doesn’t fix a human problem.');

  const pairs = [
    { risk: 'Stolen/reused credentials grant entry', ctrl: 'Multi-factor authentication & access control (A.5.15–5.17)' },
    { risk: 'Lost laptop exposes stored data', ctrl: 'Cryptography — encryption at rest (A.8.24)' },
    { risk: 'Staff fall for phishing', ctrl: 'Security awareness & training (A.6.3)' },
    { risk: 'Unpatched server is exploited', ctrl: 'Technical vulnerability / patch management (A.8.8)' },
    { risk: 'No coordinated response to a breach', ctrl: 'Incident management & response (A.5.24–5.26)' }
  ];
  // distractor controls (Hardcore makes mismatches tempting)
  const distractors = ['Physical perimeter fencing (A.7.1)', 'Supplier relationship security (A.5.19)', 'Clock synchronisation (A.8.17)'];

  const body = document.createElement('div'); body.style.cssText = 'display:flex;gap:16px;width:100%;padding:16px;overflow:auto';
  shell.body.appendChild(body);
  const colR = document.createElement('div'); colR.style.flex = '1'; colR.innerHTML = '<h4 style="color:#19e6c8;font-size:12px;letter-spacing:2px">RISKS (from the assessment)</h4>';
  const colC = document.createElement('div'); colC.style.flex = '1'; colC.innerHTML = '<h4 style="color:#19e6c8;font-size:12px;letter-spacing:2px">ANNEX A CONTROLS</h4>';
  body.appendChild(colR); body.appendChild(colC);

  let selectedRisk = null, matched = 0;
  const ctrls = shuffle(pairs.map(p => p.ctrl).concat(hard ? distractors : []));

  const riskEls = {}, ctrlEls = {};
  pairs.forEach((p, i) => {
    const c = document.createElement('div'); c.className = 'card'; c.style.marginBottom = '8px';
    c.innerHTML = `<div class="ct">RISK ${i + 1}</div><div class="cd">${escapeHtml(p.risk)}</div>`;
    c.addEventListener('click', () => {
      if (c.classList.contains('correct')) return;
      Object.values(riskEls).forEach(e => e.classList.remove('sel'));
      selectedRisk = p; c.classList.add('sel'); SFX.ui();
      shell.setHint('Now choose the control that treats this risk.');
    });
    riskEls[p.risk] = c; colR.appendChild(c);
  });
  ctrls.forEach(ct => {
    const c = document.createElement('div'); c.className = 'card'; c.style.marginBottom = '8px';
    c.innerHTML = `<div class="ct">CONTROL</div><div class="cd">${escapeHtml(ct)}</div>`;
    c.addEventListener('click', () => {
      if (c.classList.contains('correct')) return;
      if (!selectedRisk) { shell.setHint('Select a risk first, then its control.'); SFX.bad(); return; }
      if (selectedRisk.ctrl === ct) {
        c.classList.add('correct'); riskEls[selectedRisk.risk].classList.add('correct'); riskEls[selectedRisk.risk].classList.remove('sel');
        SFX.good(); shell.flashGood(); matched++; selectedRisk = null;
        shell.setHint(`Mapped ${matched}/${pairs.length}. Risk-based control selection in action.`);
        if (matched === pairs.length) finish();
      } else {
        c.classList.add('wrong'); SFX.bad(); shell.flashBad();
        shell.setHint('That control doesn’t treat this risk — an unbalanced control set leaves a gap. Re-map.');
        setTimeout(() => c.classList.remove('wrong'), 500);
      }
    });
    ctrlEls[ct] = c; colC.appendChild(c);
  });

  function finish() {
    body.innerHTML = `<div class="ok" style="padding:18px;text-align:center;width:100%">✓ Every risk treated by a justified Annex A control. The ISMS is balanced and defensible — and the reinforcement doors now answer to policy, locked.<br><br>━━━ ISMS CERTIFIED — REINFORCEMENTS LOCKED OUT — OBJECTIVE COMPLETE ━━━</div>`;
    SFX.unlock(); setTimeout(() => onDone(true), 1000);
  }
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

  shell.setHint('Select a risk, then the control that treats it. Map all five with no gaps.');
  return shell;
}
