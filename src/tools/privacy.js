// L7 — Information Privacy & PETs. De-identify the dataset below the
// re-identification threshold (k-anonymity) while preserving analytic utility.
// Theory: ISO/IEC 20889 de-identification techniques; Adams, "Intro to PETs".
import { buildShell, isHardcore } from './shell.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'PET Pipeline ▸ citizen dataset de-identification', sub: 'Suppress identifiers, generalise quasi-identifiers, keep the data useful. Ref: ISO/IEC 20889.' });
  const hard = isHardcore();
  shell.setConcept('Remember k-anonymity, Operator: <b>suppress</b> direct identifiers (names), <b>generalise</b> quasi-identifiers (birth date → year, postcode → district). But keep the sensitive column, or the data is useless to us.');

  const TECH = ['Keep', 'Suppress', 'Generalise', 'Pseudonymise', 'Perturb'];
  const cols = [
    { name: 'full_name', kind: 'Direct identifier', tech: 'Keep' },
    { name: 'date_of_birth', kind: 'Quasi-identifier', tech: 'Keep' },
    { name: 'postcode', kind: 'Quasi-identifier', tech: 'Keep' },
    { name: 'gender', kind: 'Quasi-identifier (low)', tech: 'Keep' },
    { name: 'diagnosis', kind: 'Sensitive attribute (utility)', tech: 'Keep' }
  ];

  // risk contribution by (column, technique)
  function risk(col) {
    const t = col.tech;
    if (col.name === 'full_name') return t === 'Keep' ? 60 : (t === 'Pseudonymise' ? 8 : 0);
    if (col.name === 'date_of_birth') return t === 'Keep' ? 20 : (t === 'Generalise' ? 3 : t === 'Perturb' ? 5 : 0);
    if (col.name === 'postcode') return t === 'Keep' ? 15 : (t === 'Generalise' ? 3 : 0);
    if (col.name === 'gender') return t === 'Keep' ? 2 : 0;
    return 0; // diagnosis carries no identifiability
  }
  const THRESHOLD = 10;
  function utilityLost() { return cols.find(c => c.name === 'diagnosis').tech === 'Suppress'; }

  const body = document.createElement('div'); body.style.cssText = 'display:flex;flex-direction:column;width:100%;padding:16px;gap:12px;overflow:auto';
  shell.body.appendChild(body);

  const meterWrap = document.createElement('div');
  meterWrap.innerHTML = `<div style="display:flex;justify-content:space-between;font-size:12px;color:#5a7488"><span>RE-IDENTIFICATION RISK</span><span id="riskVal"></span></div>
    <div class="meter-bar" style="height:12px"><div id="riskFill" class="meter-fill alert" style="transition:width .2s"></div></div>
    <div style="font-size:11px;color:#5a7488;margin-top:4px">Target: risk ≤ ${THRESHOLD} (k-anonymity) AND keep <b>diagnosis</b> for analytic utility.</div>`;
  body.appendChild(meterWrap);

  const table = document.createElement('div');
  body.appendChild(table);

  const exfil = document.createElement('button'); exfil.className = 'btn big wide'; exfil.textContent = 'EXFILTRATE DATASET';
  exfil.disabled = true; exfil.style.opacity = .4;
  body.appendChild(exfil);
  exfil.addEventListener('click', () => { if (!exfil.disabled) finish(); });

  // soft countdown for tension (non-failing)
  let t = 90; const clockEl = document.createElement('div'); clockEl.style.cssText = 'text-align:center;color:#ffb020;font-size:12px;letter-spacing:2px';
  body.appendChild(clockEl);
  const timer = setInterval(() => { t--; clockEl.textContent = `EXTRACTION WINDOW: ${String(Math.max(0, t)).padStart(2, '0')}s` + (t <= 0 ? '  — chopper holding, finish the scrub' : ''); if (t <= 0) clearInterval(timer); }, 1000);

  function renderTable() {
    table.innerHTML = '';
    cols.forEach(col => {
      const row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)';
      const info = document.createElement('div'); info.style.cssText = 'width:230px';
      info.innerHTML = `<div style="color:#c8f2ff;font-size:13px">${col.name}</div><div style="color:#5a7488;font-size:11px">${col.kind}</div>`;
      row.appendChild(info);
      const seg = document.createElement('div'); seg.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap';
      TECH.forEach(tk => {
        const b = document.createElement('div'); b.className = 'seg'; b.style.border = 'none';
        const o = document.createElement('div'); o.className = 'opt' + (col.tech === tk ? ' on' : ''); o.textContent = tk;
        o.style.fontSize = '12px';
        o.addEventListener('click', () => { col.tech = tk; SFX.ui(); renderTable(); update(); });
        b.appendChild(o); seg.appendChild(b);
      });
      row.appendChild(seg);
      if (!hard) {
        const r = risk(col); const tag = document.createElement('div'); tag.style.cssText = 'margin-left:auto;font-size:11px;color:' + (r > 5 ? '#ff3b5c' : r > 0 ? '#ffb020' : '#36e07a');
        tag.textContent = r === 0 ? 'risk 0' : `+${r} risk`;
        row.appendChild(tag);
      }
      table.appendChild(row);
    });
  }

  function update() {
    const total = cols.reduce((a, c) => a + risk(c), 0);
    const pct = Math.min(100, total);
    const fill = document.getElementById('riskFill'); fill.style.width = pct + '%';
    fill.style.background = total <= THRESHOLD ? '#36e07a' : total <= 30 ? '#ffb020' : '#ff3b5c';
    document.getElementById('riskVal').textContent = `${total}`;
    const safe = total <= THRESHOLD && !utilityLost();
    exfil.disabled = !safe; exfil.style.opacity = safe ? 1 : .4;
    if (utilityLost()) shell.setHint('Diagnosis suppressed → dataset is useless to us. Keep the sensitive attribute; protect via the quasi-identifiers.');
    else if (total > THRESHOLD) shell.setHint(hard ? 'Above threshold. Suppress the direct identifier; generalise the quasi-identifiers.' : 'Above threshold. Direct identifiers must go; generalise DOB and postcode.');
    else shell.setHint('Below the re-identification threshold and still useful. Ready to exfiltrate.');
  }

  function finish() {
    clearInterval(timer);
    SFX.good(); shell.flashGood();
    body.innerHTML = `<div class="ok" style="padding:18px;text-align:center">✓ Dataset de-identified: direct identifier suppressed, quasi-identifiers generalised to k-anonymity, sensitive attribute preserved.<br>No record is re-identifiable. Extraction authorised.<br><br>━━━ PRIVACY THRESHOLD MET — OBJECTIVE COMPLETE ━━━</div>`;
    SFX.unlock(); setTimeout(() => onDone(true), 1000);
  }

  renderTable(); update();
  return shell;
}
