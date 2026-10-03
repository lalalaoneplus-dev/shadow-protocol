// L6 — Burp-style intercept. Classify the OWASP flaw, exploit it, then patch.
import { buildShell, isHardcore, escapeHtml } from './shell.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'Burp ▸ intercept — portal.helix-corp.com', sub: 'One request. One classic flaw. Exploit it, then close it behind you.' });
  const hard = isHardcore();
  let stage = 0; shell.setDots(0, 3);
  shell.setConcept('Injection, Operator: when input is glued straight into a query it becomes <b>code</b>. A tautology like <b>\' OR \'1\'=\'1</b> forces the check always-true. The real fix is <b>parameterised queries</b> — separate data from commands.');

  const wrap = document.createElement('div'); wrap.className = 'burp'; shell.body.appendChild(wrap);
  const reqCol = document.createElement('div'); reqCol.className = 'burp-col';
  const sideCol = document.createElement('div'); sideCol.className = 'burp-col';
  wrap.appendChild(reqCol); wrap.appendChild(sideCol);

  const baseReq =
`POST /api/login HTTP/1.1
Host: portal.helix-corp.com
Content-Type: application/x-www-form-urlencoded

username=admin&password=hunter2`;

  function classifyStage() {
    reqCol.innerHTML = `<h4>INTERCEPTED REQUEST</h4>`;
    const pane = document.createElement('div'); pane.className = 'burp-pane'; pane.textContent = baseReq; reqCol.appendChild(pane);
    sideCol.innerHTML = `<h4>ANALYSIS — server query</h4>`;
    const note = document.createElement('div'); note.className = 'burp-pane';
    note.innerHTML = `Backend builds the auth query by <span class="hl">string concatenation</span>:<br><br><code>SELECT * FROM users WHERE user='$u' AND pass='$p';</code><br><br>▌ Which OWASP Top-10 class does this enable?`;
    sideCol.appendChild(note);
    shell.setHint(hard ? 'Type the OWASP class (e.g. A03 / injection).' : 'Identify the vulnerability class.');
    if (hard) {
      mkInput(sideCol, 'OWASP class…', v => { if (/a0?3|inject|sql/i.test(v)) { SFX.good(); shell.flashGood(); stage = 1; shell.setDots(1, 3); exploitStage(); } else { SFX.bad(); shell.flashBad(); shell.setHint('Unsanitised input concatenated into a SQL query → think Injection.'); }});
    } else {
      choices(sideCol, [
        ['A03:2021 — Injection (SQL injection)', true],
        ['A05:2021 — Security Misconfiguration', false, 'The flaw is untrusted input in a query, not a config default.'],
        ['A02:2021 — Cryptographic Failure', false, 'No crypto is involved in the bypass itself.'],
        ['A07:2021 — Identification/Auth Failures (weak password)', false, 'The password strength is irrelevant — the query itself is injectable.']
      ], (ok, why) => { if (ok) { SFX.good(); shell.flashGood(); stage = 1; shell.setDots(1, 3); exploitStage(); } else { SFX.bad(); shell.flashBad(); shell.setHint('✗ ' + why); } });
    }
  }

  function exploitStage() {
    reqCol.innerHTML = `<h4>EDIT REQUEST — bypass authentication</h4>`;
    shell.setHint(hard ? 'Edit the password parameter into a SQL-injection auth bypass, then SEND.' : 'Choose the payload that bypasses the login.');
    if (hard) {
      const ta = document.createElement('textarea'); ta.className = 'burp-edit'; ta.value = baseReq; reqCol.appendChild(ta);
      const send = document.createElement('button'); send.className = 'btn'; send.style.margin = '8px 12px'; send.textContent = 'SEND ▷';
      reqCol.appendChild(send);
      send.addEventListener('click', () => {
        const v = ta.value.toLowerCase();
        // accept a classic tautology injection in the password (or username) field
        if (/(password|username)=[^&\n]*('|%27)\s*or\s*('?\s*1'?\s*=\s*'?1|'[^']*'='|true)/i.test(v) || /'\s*or\s*'1'\s*=\s*'1/i.test(v) || /or\s*1\s*=\s*1\s*--/i.test(v)) {
          sideResp(true);
        } else { SFX.bad(); shell.flashBad(); shell.setHint("Tautology not detected. Try a classic like  password=' OR '1'='1' --"); }
      });
    } else {
      sideCol.innerHTML = `<h4>PAYLOAD CANDIDATES</h4>`;
      choices(sideCol, [
        [`password=' OR '1'='1' --`, true],
        [`password=admin123`, false, 'Just another guess — the query still requires the real password.'],
        [`username=<script>alert(1)</script>`, false, 'That’s XSS — wrong flaw for an auth bypass here.'],
        [`password=%00`, false, 'A null byte won’t satisfy the WHERE clause.']
      ], (ok, why) => { if (ok) sideResp(true); else { SFX.bad(); shell.flashBad(); shell.setHint('✗ ' + why); } });
    }
  }

  function sideResp(ok) {
    SFX.good(); shell.flashGood(); stage = 2; shell.setDots(2, 3);
    sideCol.innerHTML = `<h4>RESPONSE</h4><div class="burp-pane"><span class="ok">HTTP/1.1 200 OK</span>\n{ "auth": true, "role": "<span class="hl">administrator</span>", "session": "eyJhbGciOi..." }\n\n✓ Tautology made WHERE always true — logged in as admin without the password.</div>`;
    patchStage();
  }

  function patchStage() {
    reqCol.innerHTML = `<h4>REMEDIATION — leave it safer than you found it</h4>`;
    const pane = document.createElement('div'); pane.className = 'burp-pane';
    pane.innerHTML = `▌ Apply the correct fix for the injection class.`;
    reqCol.appendChild(pane);
    shell.setHint(hard ? 'Type the correct remediation (one phrase).' : 'Pick the fix that actually removes the vulnerability.');
    if (hard) {
      mkInput(reqCol, 'remediation…', v => { if (/param(eteri|etri)z|prepared\s*statement|bind variable|bound param/i.test(v)) finish(); else { SFX.bad(); shell.flashBad(); shell.setHint('Stop building queries from strings — use parameterised/prepared statements.'); }});
    } else {
      choices(reqCol, [
        ['Use parameterised queries / prepared statements (bind variables)', true],
        ['Add a WAF rule blocking the apostrophe character', false, 'Bypassable and brittle — it doesn’t fix the root cause.'],
        ['Escape quotes in client-side JavaScript', false, 'Client-side checks are trivially skipped; the server is still injectable.'],
        ['Force a longer admin password', false, 'Password length is irrelevant to an injection that ignores the password.']
      ], (ok, why) => { if (ok) finish(); else { SFX.bad(); shell.flashBad(); shell.setHint('✗ ' + why); } });
    }
  }

  function finish() {
    SFX.good(); shell.flashGood(); shell.setDots(3, 3);
    sideCol.innerHTML = `<h4>RESULT</h4><div class="burp-pane ok">Admin session captured. Prepared-statement patch deployed — the injection is closed.\n\n━━━ EXPLOITED & REMEDIATED — OBJECTIVE COMPLETE ━━━</div>`;
    SFX.unlock(); setTimeout(() => onDone(true), 900);
  }

  function mkInput(parent, ph, cb) { const line = document.createElement('div'); line.className = 'cli-line'; line.innerHTML = `<span class="cli-prompt">burp$</span>`; const input = document.createElement('input'); input.className = 'cli-input'; input.placeholder = ph; line.appendChild(input); parent.appendChild(line); input.focus(); input.addEventListener('keydown', e => { if (e.key === 'Enter') { const v = input.value.trim(); if (v) { input.value=''; cb(v); } } else SFX.type(); }); }
  function choices(parent, opts, cb) { const list = document.createElement('div'); list.className = 'choices'; opts.forEach(([t, ok, why], i) => { const b = document.createElement('div'); b.className = 'choice'; b.innerHTML = `<span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(t)}`; b.addEventListener('click', () => { if (ok) { b.classList.add('correct'); cb(true); } else { b.classList.add('wrong'); cb(false, why); } }); list.appendChild(b); }); parent.appendChild(list); }

  classifyStage();
  return shell;
}
