// L4 — Wireshark-style capture analysis. Flag the malicious flow in a live
// SCADA capture, pin it to its OSI layer, and block it.
import { buildShell, isHardcore, escapeHtml } from './shell.js';
import { SFX } from '../audio.js';

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'Wireshark ▸ live capture — plant SCADA segment', sub: 'Spot the anomaly. The plant runs on Modbus/TCP reads — anything else is suspect.' });
  shell.setConcept('Operator — find the packet that breaks the <b>normal pattern</b>. The plant only READS sensors; a WRITE to a breaker is the anomaly, and an application command like that rides at OSI <b>Layer 7</b>.');
  const hard = isHardcore();
  const ROGUE = '10.0.7.66';
  let stage = 0; shell.setDots(0, 3);

  // packet set: benign Modbus reads + noise, plus malicious breaker writes
  const packets = [
    p(1, '0.001', '10.0.0.5', '10.0.0.10', 'Modbus', 66, 'Read Holding Registers: addr 0x0008 qty 4'),
    p(2, '0.014', '10.0.0.10', '10.0.0.5', 'Modbus', 71, 'Response: 4 registers'),
    p(3, '0.220', '10.0.0.6', '10.0.0.10', 'Modbus', 66, 'Read Input Registers: addr 0x0010 qty 2'),
    p(4, '0.402', ROGUE, '10.0.0.10', 'Modbus', 64, 'Write Single Coil: addr 0x0001 (MAIN BREAKER) = OFF', true),
    p(5, '0.500', '10.0.0.5', '10.0.0.10', 'Modbus', 66, 'Read Holding Registers: addr 0x0008 qty 4'),
    p(6, '0.733', '10.0.0.7', '10.0.0.10', 'Modbus', 66, 'Read Coils: addr 0x0000 qty 8'),
    p(7, '0.901', ROGUE, '10.0.0.10', 'Modbus', 64, 'Write Single Coil: addr 0x0002 (TURBINE TRIP) = ON', true),
    p(8, '1.110', '10.0.0.6', '10.0.0.10', 'Modbus', 71, 'Response: 2 registers'),
    p(9, '1.244', '10.0.0.5', '10.0.0.10', 'TCP', 60, '50312 → 502 [ACK] Seq=1 Ack=1'),
    p(10, '1.390', ROGUE, '10.0.0.10', 'Modbus', 64, 'Write Multiple Coils: addr 0x0001 qty 3 = OFF', true),
    p(11, '1.520', '10.0.0.8', '10.0.0.10', 'Modbus', 66, 'Read Holding Registers: addr 0x0020 qty 6'),
    p(12, '1.690', '10.0.0.5', '255.255.255.255', 'ARP', 42, 'Who has 10.0.0.10? Tell 10.0.0.5'),
    p(13, '1.870', ROGUE, '10.0.0.10', 'Modbus', 64, 'Write Single Register: 0x0005 = 9999 (OVERSPEED)', true),
    p(14, '2.020', '10.0.0.7', '10.0.0.10', 'Modbus', 71, 'Response: 8 coils'),
    p(15, '2.210', '10.0.0.6', '10.0.0.10', 'Modbus', 66, 'Read Input Registers: addr 0x0010 qty 2')
  ];
  function p(no, time, src, dst, proto, len, info, mal = false) { return { no, time, src, dst, proto, len, info, mal }; }
  const malCount = packets.filter(p => p.mal).length;

  const body = document.createElement('div'); body.style.cssText = 'display:flex;flex-direction:column;width:100%;height:100%';
  const scroll = document.createElement('div'); scroll.className = 'pk-scroll';
  const region = document.createElement('div'); region.style.padding = '0';
  body.appendChild(scroll); body.appendChild(region);
  shell.body.appendChild(body);

  function renderTable() {
    const flagged = new Set();
    const tbl = document.createElement('table'); tbl.className = 'pk-table';
    tbl.innerHTML = `<thead><tr><th>No.</th><th>Time</th><th>Source</th><th>Destination</th><th>Proto</th><th>Len</th><th>Info</th></tr></thead>`;
    const tb = document.createElement('tbody');
    packets.forEach(pk => {
      const tr = document.createElement('tr'); tr.className = 'pk-row';
      tr.innerHTML = `<td>${pk.no}</td><td>${pk.time}</td><td>${pk.src}</td><td>${pk.dst}</td><td>${pk.proto}</td><td>${pk.len}</td><td>${escapeHtml(pk.info)}</td>`;
      tr.addEventListener('click', () => {
        if (flagged.has(pk.no)) { flagged.delete(pk.no); tr.classList.remove('flagged'); }
        else { flagged.add(pk.no); tr.classList.add('flagged'); SFX.ui(); }
        updateHint();
      });
      tb.appendChild(tr);
    });
    tbl.appendChild(tb); scroll.innerHTML = ''; scroll.appendChild(tbl);

    function updateHint() {
      shell.setHint(`Flagged <b>${flagged.size}</b>. Mark every packet that doesn’t belong, then confirm.`);
    }
    updateHint();

    region.innerHTML = '';
    const btn = mkBtn('CONFIRM FLAGGED PACKETS', () => {
      const good = packets.filter(p => p.mal && flagged.has(p.no)).length;
      const bad = packets.filter(p => !p.mal && flagged.has(p.no)).length;
      if (good === malCount && bad === 0) {
        SFX.good(); shell.flashGood(); stage = 1; shell.setDots(1, 3);
        scroll.querySelectorAll('.pk-row').forEach((r, i) => { if (packets[i].mal) r.classList.add('flagged'); });
        layerStage();
      } else {
        SFX.bad(); shell.flashBad();
        shell.setHint(`Not quite — ${good}/${malCount} malicious found, ${bad} false positive(s). Benign traffic is <b>Read</b>; the attack <b>writes</b> to breaker/turbine coils from ${ROGUE}.`);
      }
    });
    region.appendChild(btn);
  }

  function layerStage() {
    region.innerHTML = '';
    const q = document.createElement('div'); q.style.cssText = 'padding:12px 16px';
    q.innerHTML = `<div class="hl" style="margin-bottom:8px">▌ The malicious packets are Modbus function-code writes. Which OSI layer is the attack operating at?</div>`;
    region.appendChild(q);
    shell.setHint('Modbus function codes are application semantics riding over TCP/IP.');
    if (hard) {
      mkInput('layer number or name…', region, (v) => {
        if (/\b7\b/.test(v) || /application/i.test(v)) blockStage();
        else { SFX.bad(); shell.flashBad(); shell.setHint('Not the transport or network layer — the abuse is in the Modbus command semantics. Think application.'); }
      });
    } else {
      choices(region, [
        { t: 'Layer 7 — Application (malicious Modbus write commands)', ok: true },
        { t: 'Layer 4 — Transport (it’s a TCP SYN flood)', ok: false, why: 'No half-open flood here; payloads are well-formed Modbus writes.' },
        { t: 'Layer 3 — Network (IP spoofing / routing)', ok: false, why: 'The source is odd, but the weapon is the application-layer write command itself.' },
        { t: 'Layer 2 — Data link (ARP poisoning)', ok: false, why: 'One benign ARP is present, but it isn’t the attack.' }
      ], (ok, why) => ok ? blockStage() : (SFX.bad(), shell.flashBad(), shell.setHint('✗ ' + why)));
    }
  }

  function blockStage() {
    SFX.good(); shell.flashGood(); stage = 2; shell.setDots(2, 3);
    region.innerHTML = '';
    const q = document.createElement('div'); q.style.cssText = 'padding:12px 16px';
    q.innerHTML = `<div class="hl" style="margin-bottom:8px">▌ Block the attack without browning out the plant. Choose the surgical action.</div>`;
    region.appendChild(q);
    shell.setHint(hard ? 'Type the source IP to drop at the firewall.' : 'Pick the most surgical mitigation.');
    if (hard) {
      mkInput('source IP to block…', region, (v) => {
        if (v.trim() === ROGUE) finish();
        else { SFX.bad(); shell.flashBad(); shell.setHint(`That isn’t the rogue master. The unauthorized writes all originate from one host.`); }
      });
    } else {
      choices(region, [
        { t: `Drop traffic from ${ROGUE} and deny Modbus writes from non-HMI hosts`, ok: true },
        { t: 'Pull the plant network cable (kill all SCADA traffic)', ok: false, why: 'That trips the very outage you’re preventing.' },
        { t: 'Reboot the PLC', ok: false, why: 'The rogue master just re-issues the writes after reboot.' },
        { t: 'Block all port 502 traffic', ok: false, why: 'Legitimate HMIs need Modbus/502 — this halts operations.' }
      ], (ok, why) => ok ? finish() : (SFX.bad(), shell.flashBad(), shell.setHint('✗ ' + why)));
    }
  }

  function finish() {
    SFX.good(); shell.flashGood(); shell.setDots(3, 3);
    region.innerHTML = `<div class="ok" style="padding:14px 16px">✓ Rogue master ${ROGUE} dropped. Write-protect rule applied. Breakers holding.<br>━━━ ATTACK CONTAINED — OBJECTIVE COMPLETE ━━━</div>`;
    SFX.unlock();
    setTimeout(() => onDone(true), 900);
  }

  function mkBtn(label, cb) { const b = document.createElement('button'); b.className = 'btn'; b.style.margin = '10px 16px'; b.textContent = label; b.addEventListener('click', cb); return b; }
  function mkInput(ph, parent, cb) {
    const line = document.createElement('div'); line.className = 'cli-line';
    line.innerHTML = `<span class="cli-prompt">analyst$</span>`;
    const input = document.createElement('input'); input.className = 'cli-input'; input.placeholder = ph; input.autocomplete = 'off';
    line.appendChild(input); parent.appendChild(line); input.focus();
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const v = input.value.trim(); if (v) { input.value = ''; cb(v); } } else SFX.type(); });
  }
  function choices(parent, opts, cb) {
    const list = document.createElement('div'); list.className = 'choices';
    opts.forEach((o, i) => { const b = document.createElement('div'); b.className = 'choice'; b.innerHTML = `<span class="k">${String.fromCharCode(65 + i)}</span>${escapeHtml(o.t)}`; b.addEventListener('click', () => { if (o.ok) { b.classList.add('correct'); cb(true); } else { b.classList.add('wrong'); cb(false, o.why); } }); list.appendChild(b); });
    parent.appendChild(list);
  }

  renderTable();
  return shell;
}
