// L3 — Linux shell simulation. Navigate, fix ACLs, escape a container.
// HARDCORE: type real commands. NORMAL: pick the next command.
import { buildShell, isHardcore, escapeHtml } from './shell.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'bash ▸ root@mainframe (sandboxed)', sub: 'Enumerate, fix the ACL, then break out of the container.' });
  const hard = isHardcore();
  shell.setConcept('Shell basics, Operator: <b>ls</b> lists, <b>cat</b> reads, and you change a file’s access-control list to grant <b>yourself</b> rights — you don’t destroy the system. Grant access on the object you need, then escape the container.');

  // Mutable virtual filesystem state
  const fs = {
    cwd: '/srv',
    vaultAcl: 'denied',           // becomes 'granted' after setfacl
    inContainer: true,
    sockFound: false,
    escaped: false
  };

  const steps = [
    {
      key: 'enum',
      instruct: 'Enumerate the service directory and its permissions.',
      accept: [/^ls(\s+-l(a)?)?\s+\/srv\/?$/, /^ls(\s+-l(a)?)?$/],
      choice: 'ls -la /srv',
      distractors: ['rm -rf /srv', 'cd /'],
      out: () =>
`total 16
drwxr-xr-x  4 root root 4096 srv .
drwx------  2 root root 4096 <span class="hl">vault</span>   ← owner root, no access for 'specter'
drwxr-xr-x  3 root root 4096 web
-rw-r--r--  1 root root  280 access.conf`,
      ok: 'Vault directory found — locked to root. You need an ACL entry.'
    },
    {
      key: 'acl',
      instruct: 'Grant your operative account access to /srv/vault via an ACL.',
      accept: [/setfacl\s+-m\s+u:specter:rwx\s+\/srv\/vault\/?/, /chmod\s+(0?777|o\+rwx|a\+rwx)\s+\/srv\/vault\/?/],
      choice: 'setfacl -m u:specter:rwx /srv/vault',
      distractors: ['chmod 000 /srv/vault', 'chown specter /etc/shadow'],
      run: () => { fs.vaultAcl = 'granted'; },
      out: () => `setfacl: applied  →  user:specter:rwx on /srv/vault\n<span class="muted"># getfacl now lists: user:specter:rwx</span>`,
      ok: 'ACL updated. Discretionary access control bent in your favour.'
    },
    {
      key: 'detect',
      instruct: 'Before escalating to the host, confirm whether this shell is containerised.',
      accept: [/^cat\s+\/proc\/1\/cgroup$/, /^cat\s+\/proc\/self\/cgroup$/],
      choice: 'cat /proc/1/cgroup',
      distractors: ['uname -a', 'whoami'],
      out: () =>
`12:cpuset:/<span class="hl">docker</span>/4f9a1c0b8e...
11:memory:/docker/4f9a1c0b8e...
 0::/docker/4f9a1c0b8e...`,
      ok: 'PID 1 lives in a docker cgroup — you are inside a container. Find the boundary weakness.'
    },
    {
      key: 'sock',
      instruct: 'Look for an over-permissive mount that crosses the container boundary.',
      accept: [/^ls(\s+-l(a)?)?\s+\/var\/run\/?$/, /^mount$/, /^ls(\s+-l(a)?)?\s+\/var\/run\/docker\.sock$/],
      choice: 'ls -la /var/run',
      distractors: ['ping 8.8.8.8', 'cd /root'],
      run: () => { fs.sockFound = true; },
      out: () =>
`srw-rw----  1 root docker 0 <span class="hl">docker.sock</span>   ← host Docker socket mounted INTO the container
drwxr-xr-x  2 root root  40 lock`,
      ok: 'The host Docker socket is exposed inside the container — a classic escape primitive.'
    },
    {
      key: 'escape',
      instruct: 'Use the exposed socket to spawn a host-root container and break out.',
      accept: [/docker\s+(-H\s+\S+\s+)?run.*-v\s+\/:\/host/, /docker\s+run.*-v\s+\/:\/host.*chroot\s+\/host/, /chroot\s+\/host/],
      choice: 'docker -H unix:///var/run/docker.sock run -v /:/host -it alpine chroot /host sh',
      distractors: ['sudo su', 'exit'],
      run: () => { fs.escaped = true; fs.inContainer = false; },
      out: () =>
`Unable to find image 'alpine' locally → pulled from host cache
mounting host / at /host …
<span class="acc">chroot /host sh</span>
# id
uid=0(root) gid=0(root) groups=0(root)
<span class="ok"># you are now root on the MAINFRAME HOST</span>`,
      ok: 'Container escaped. Host root achieved via the exposed Docker socket.'
    }
  ];

  let stepIdx = 0;
  // CLI dom
  const cli = document.createElement('div'); cli.className = 'cli';
  const out = document.createElement('div'); out.className = 'cli-out';
  cli.appendChild(out);
  const region = document.createElement('div'); cli.appendChild(region);
  shell.body.appendChild(cli);
  shell.setDots(0, steps.length);

  function print(html, cls) { const d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; }

  // free-explore command outputs (don't advance)
  function explore(cmd) {
    const c = cmd.trim();
    if (/^help$/.test(c)) return 'commands: ls, cd, pwd, cat, whoami, id, getfacl, setfacl, chmod, mount, docker, clear';
    if (/^pwd$/.test(c)) return fs.cwd;
    if (/^whoami$/.test(c)) return 'specter';
    if (/^id$/.test(c)) return fs.escaped ? 'uid=0(root) gid=0(root)' : 'uid=1000(specter) gid=1000(specter) groups=1000(specter)';
    if (/^getfacl\s+\/srv\/vault/.test(c)) return fs.vaultAcl === 'granted' ? '# file: /srv/vault\nuser::rwx\nuser:specter:rwx\ngroup::---\nother::---' : '# file: /srv/vault\nuser::rwx\ngroup::---\nother::---  ← specter has no entry';
    if (/^cat\s+\/srv\/vault\/keys\.db/.test(c)) return fs.vaultAcl === 'granted' ? 'AES256:9f3a...  RSA-2048:priv...  <span class="ok">[harvested]</span>' : 'cat: /srv/vault/keys.db: Permission denied';
    if (/^cat\s+\/srv\/access\.conf/.test(c) || /^cat\s+\/etc\/access\.conf/.test(c)) return 'policy: deny all; allow root; # ACL enforced on /srv/vault';
    if (/^ls/.test(c)) return 'srv  etc  proc  var  root  flag.txt';
    if (/^cd\s+/.test(c)) { fs.cwd = '/' + c.split(/\s+/)[1].replace(/^\//, ''); return ''; }
    if (/^clear$/.test(c)) { out.innerHTML = ''; return ''; }
    if (/^cat\s+flag\.txt$/.test(c)) return 'HELIX{enumerate_before_you_escalate}';
    return null;
  }

  function renderStep() {
    region.innerHTML = '';
    if (stepIdx >= steps.length) return;
    const s = steps[stepIdx];
    print('▌ ' + s.instruct, 'hl');
    shell.setHint(hard ? 'Type the command and press <b>Enter</b>. (<b>help</b> for available commands)' : 'Select the correct next command.');

    if (hard) {
      const line = document.createElement('div'); line.className = 'cli-line';
      line.innerHTML = `<span class="cli-prompt">${fs.escaped ? 'root@host' : 'specter@ctr'}:${fs.cwd}$</span>`;
      const input = document.createElement('input'); input.className = 'cli-input'; input.autocomplete = 'off'; input.spellcheck = false; input.placeholder = 'command…';
      line.appendChild(input); region.appendChild(line); input.focus();
      input.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') { SFX.type(); return; }
        const val = input.value.trim(); if (!val) return;
        print(`<span class="cli-prompt">${fs.escaped ? 'root@host' : 'specter@ctr'}:${fs.cwd}$</span> <span class="cmd">${escapeHtml(val)}</span>`);
        input.value = '';
        handle(val);
      });
    } else {
      const list = document.createElement('div'); list.className = 'choices';
      const opts = shuffle([{ cmd: s.choice, correct: true }, ...s.distractors.map(d => ({ cmd: d, correct: false }))]);
      opts.forEach((o, i) => {
        const b = document.createElement('div'); b.className = 'choice';
        b.innerHTML = `<span class="k">${String.fromCharCode(65 + i)}</span><code>${escapeHtml(o.cmd)}</code>`;
        b.addEventListener('click', () => {
          print(`<span class="cli-prompt">$</span> <span class="cmd">${escapeHtml(o.cmd)}</span>`);
          if (o.correct) { b.classList.add('correct'); succeed(s); }
          else { b.classList.add('wrong'); SFX.bad(); shell.flashBad(); print('✗ ' + dangerNote(o.cmd), 'err'); }
        });
        list.appendChild(b);
      });
      region.appendChild(list);
    }
  }

  function handle(val) {
    const s = steps[stepIdx];
    if (s.accept.some(rx => rx.test(val.trim()))) { if (s.run) s.run(); succeed(s); return; }
    const ex = explore(val);
    if (ex !== null) { if (ex) print(ex); return; }
    SFX.bad(); shell.flashBad();
    print(`bash: ${escapeHtml(val.split(/\s+/)[0])}: not the move here — ${s.instruct.toLowerCase()}`, 'err');
  }

  function succeed(s) {
    if (s.run) s.run();
    SFX.good(); shell.flashGood();
    if (s.out) print(s.out());
    print('✓ ' + s.ok, 'ok');
    stepIdx++;
    shell.setDots(stepIdx, steps.length);
    if (stepIdx >= steps.length) {
      print('\n━━━ HOST COMPROMISED — OBJECTIVE COMPLETE ━━━', 'ok');
      SFX.unlock();
      setTimeout(() => onDone(true), 800);
    } else setTimeout(renderStep, 250);
  }

  function dangerNote(cmd) {
    if (/rm -rf/.test(cmd)) return 'Destructive and noisy — would corrupt the target and alert the SOC.';
    if (/chmod 000/.test(cmd)) return 'That removes all access, including yours.';
    if (/chown specter \/etc\/shadow/.test(cmd)) return 'Touching /etc/shadow trips file-integrity monitoring.';
    if (/^cd \//.test(cmd)) return 'Navigation only — does not progress the objective.';
    if (/sudo su|exit/.test(cmd)) return 'No sudo rights in this container, and exiting drops your session.';
    if (/ping/.test(cmd)) return 'Generates outbound traffic an IDS will flag.';
    return 'Not the correct next action.';
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  print('mainframe shell — sandboxed session. PID1 cgroup looks suspicious.', 'muted');
  print('objective: fix the vault ACL, confirm the container, escape to the host.\n', 'muted');
  renderStep();
  return shell;
}
