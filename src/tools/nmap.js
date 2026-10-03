// L3 stage 1 — Nmap port-scan simulation. Enumerate the host before the shell.
import { buildShell, isHardcore, escapeHtml } from './shell.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'nmap ▸ host enumeration', sub: 'Scan the rack’s management interface. Find the service you can ride.' });
  const hard = isHardcore();
  shell.setConcept('Enumerate first, Operator. A port scan lists which <b>services</b> a host exposes; each open port maps to a service. Read the scan, then pick the exposed service you can ride in on.');
  const TARGET = '10.20.6.14';

  const cli = document.createElement('div'); cli.className = 'cli';
  const out = document.createElement('div'); out.className = 'cli-out'; cli.appendChild(out);
  const region = document.createElement('div'); cli.appendChild(region);
  shell.body.appendChild(cli);
  let step = 0; shell.setDots(0, 2);
  const print = (h, c) => { const d = document.createElement('div'); if (c) d.className = c; d.innerHTML = h; out.appendChild(d); out.scrollTop = out.scrollHeight; };

  print(`target acquired: <span class="acc">${TARGET}</span>  (mainframe OOB management)`, 'muted');
  print('objective: run a version scan, then identify the exploitable service.\n', 'muted');

  function stepScan() {
    region.innerHTML = '';
    print('▌ Run a service/version scan against the host.', 'hl');
    shell.setHint(hard ? 'Type an nmap version scan, e.g. <b>nmap -sV ' + TARGET + '</b>' : 'Choose the scan that reveals service versions.');
    if (hard) {
      mkInput('nmap …', (val) => {
        if (/nmap\s+.*-sv/i.test(val) || /nmap\s+-a\b/i.test(val)) { doScan(); }
        else if (/nmap/i.test(val)) { print('scan ran, but without <span class="hl">-sV</span> you get no version banners — you need versions to pick a target.', 'err'); SFX.bad(); }
        else { print('nmap: command not recognised.', 'err'); SFX.bad(); }
      });
    } else {
      choices([
        { t: 'nmap -sV ' + TARGET + '   (service + version detection)', ok: true },
        { t: 'nmap -sn ' + TARGET + '   (ping sweep only)', ok: false, why: 'Host discovery only — no ports, no services.' },
        { t: 'nmap -p- -T5 ' + TARGET + '   (all ports, max speed)', ok: false, why: 'Loud and slow; -T5 is likely to trip the IDS, and still no versions.' }
      ], (ok, why) => ok ? doScan() : (print('✗ ' + why, 'err'), SFX.bad(), shell.flashBad()));
    }
  }

  function doScan() {
    region.innerHTML = '';
    print('<span class="cmd">nmap -sV ' + TARGET + '</span>');
    const lines = [
      'Starting Nmap 7.94 ( https://nmap.org )',
      'Nmap scan report for ' + TARGET,
      'Host is up (0.0009s latency).',
      'PORT      STATE SERVICE      VERSION',
      '22/tcp    open  ssh          OpenSSH 9.6 (current)',
      '80/tcp    open  http         nginx 1.25.3',
      '443/tcp   open  ssl/http     nginx 1.25.3',
      '<span class="hl">2375/tcp  open  docker       Docker Engine REST API 24.0 (UNAUTHENTICATED)</span>',
      '5432/tcp  filtered postgresql',
      'Service detection performed. 5 ports scanned.'
    ];
    let i = 0;
    SFX.hack();
    const iv = setInterval(() => {
      if (i >= lines.length) {
        clearInterval(iv);
        print('✓ Scan complete. One service is wide open and unauthenticated.', 'ok');
        SFX.good(); shell.flashGood(); step = 1; shell.setDots(1, 2);
        setTimeout(stepIdentify, 400);
        return;
      }
      print(lines[i], lines[i].includes('hl') ? '' : 'muted'); i++;
    }, 130);
  }

  function stepIdentify() {
    region.innerHTML = '';
    print('▌ Which exposed service is the cleanest path to host control?', 'hl');
    shell.setHint(hard ? 'Type the port number of the exploitable service.' : 'Pick the exploitable service.');
    if (hard) {
      mkInput('port…', (val) => {
        if (/2375/.test(val) || /docker/i.test(val)) finish();
        else { print('✗ ' + portWhy(val) , 'err'); SFX.bad(); shell.flashBad(); }
      });
    } else {
      choices([
        { t: '2375/tcp — unauthenticated Docker Engine API', ok: true },
        { t: '22/tcp — OpenSSH 9.6', ok: false, why: 'Current, patched, and key-only. No quick win.' },
        { t: '80/tcp — nginx 1.25.3', ok: false, why: 'Up to date; no known unauth RCE.' }
      ], (ok, why) => ok ? finish() : (print('✗ ' + why, 'err'), SFX.bad(), shell.flashBad()));
    }
  }

  function portWhy(v) {
    if (/22/.test(v)) return 'OpenSSH 9.6 is current and key-only.';
    if (/80|443/.test(v)) return 'nginx 1.25.3 is patched.';
    if (/5432/.test(v)) return 'PostgreSQL is filtered — unreachable.';
    return 'Not the open, unauthenticated service.';
  }

  function finish() {
    print('✓ Target locked: <span class="hl">2375/tcp Docker API</span> — unauthenticated. Drop to the shell and ride it.', 'ok');
    print('\n━━━ ENUMERATION COMPLETE ━━━', 'ok');
    SFX.unlock();
    setTimeout(() => onDone(true), 700);
  }

  function mkInput(ph, cb) {
    const line = document.createElement('div'); line.className = 'cli-line';
    line.innerHTML = `<span class="cli-prompt">specter@op:~$</span>`;
    const input = document.createElement('input'); input.className = 'cli-input'; input.placeholder = ph; input.autocomplete = 'off'; input.spellcheck = false;
    line.appendChild(input); region.appendChild(line); input.focus();
    input.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') { SFX.type(); return; }
      const v = input.value.trim(); if (!v) return;
      print(`<span class="cli-prompt">specter@op:~$</span> <span class="cmd">${escapeHtml(v)}</span>`); input.value = ''; cb(v);
    });
  }
  function choices(opts, cb) {
    const list = document.createElement('div'); list.className = 'choices';
    opts.forEach((o, i) => {
      const b = document.createElement('div'); b.className = 'choice';
      b.innerHTML = `<span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(o.t)}`;
      b.addEventListener('click', () => { if (o.ok) { b.classList.add('correct'); cb(true); } else { b.classList.add('wrong'); cb(false, o.why); } });
      list.appendChild(b);
    });
    region.appendChild(list);
  }

  stepScan();
  return shell;
}
