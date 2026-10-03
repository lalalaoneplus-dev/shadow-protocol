// L2 — CrypTool-style decryption. Drag the right operation to recover the
// plaintext (real Caesar math), then verify the digital signature.
import { buildShell, isHardcore } from './shell.js';
import { SFX } from '../audio.js';

const PLAIN = 'MEET AT RELAY SEVEN BEFORE MIDNIGHT';
const SHIFT = 7;
function caesar(t, s) {
  return t.replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 + s + 26) % 26 + 65));
}
const CIPHER = caesar(PLAIN, SHIFT);

export function run(host, ctx, onDone) {
  const shell = buildShell(host, { title: 'CrypTool ▸ symmetric decrypt + signature', sub: 'Drag an operation onto the pipeline to recover the message, then verify its signature.' });
  const hard = isHardcore();
  let stage = 0; shell.setDots(0, 2);
  shell.setConcept('Symmetric crypto uses <b>one shared key</b> both ways, Operator. To undo a letter-shift you shift back by the same key. And once decrypted — a signature only earns trust if it <b>matches</b>; a mismatch means forged.');

  const wrap = document.createElement('div'); wrap.className = 'crypt';
  shell.body.appendChild(wrap);

  function decryptStage() {
    stage = 0; shell.setDots(0, 2);
    wrap.innerHTML = '';
    shell.setHint(hard ? 'Symmetric stream. Work out the key and drag the matching operation.' : 'It’s a mono-alphabetic shift cipher. Drag the correct shift onto DECRYPT.');

    const ops = hard
      ? [['c-3', 'Caesar shift −3'], ['c-7', 'Caesar shift −7'], ['c-11', 'Caesar shift −11'], ['rot13', 'ROT-13'], ['xor', 'XOR 0x2A']]
      : [['c-7', 'Caesar shift −7'], ['rot13', 'ROT-13'], ['xor', 'XOR 0x2A']];
    shuffle(ops);

    const left = document.createElement('div'); left.className = 'crypt-col';
    left.innerHTML = `<h4>INTERCEPTED CIPHERTEXT</h4>
      <div class="cipher-block">${CIPHER}</div>
      <h4 style="margin-top:14px">DECRYPTION PIPELINE</h4>`;
    const zone = document.createElement('div'); zone.className = 'dropzone'; zone.textContent = 'drop an operation here';
    left.appendChild(zone);
    const outp = document.createElement('div'); outp.className = 'crypt-output'; outp.textContent = '— awaiting valid key —';
    left.appendChild(outp);

    const right = document.createElement('div'); right.className = 'crypt-col';
    right.innerHTML = `<h4>OPERATIONS</h4>`;
    ops.forEach(([id, label]) => {
      const b = document.createElement('div'); b.className = 'op-block'; b.textContent = label; b.draggable = true; b.dataset.id = id;
      b.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', id); SFX.ui(); });
      right.appendChild(b);
    });

    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault(); zone.classList.remove('over');
      const id = e.dataTransfer.getData('text/plain');
      applyOp(id, zone, outp);
    });

    wrap.appendChild(left); wrap.appendChild(right);
  }

  function applyOp(id, zone, outp) {
    let result, ok = false;
    if (id === 'c-7') { result = caesar(CIPHER, -SHIFT); ok = true; }
    else if (id === 'c-3') result = caesar(CIPHER, -3);
    else if (id === 'c-11') result = caesar(CIPHER, -11);
    else if (id === 'rot13') result = caesar(CIPHER, -13);
    else result = CIPHER.replace(/[A-Z]/g, c => String.fromCharCode(c.charCodeAt(0) ^ 0x2A)).replace(/[^ -~]/g, '·');
    zone.classList.add('filled'); zone.textContent = ({ 'c-7': 'Caesar −7', 'c-3': 'Caesar −3', 'c-11': 'Caesar −11', rot13: 'ROT-13', xor: 'XOR 0x2A' })[id];
    outp.textContent = result;
    if (ok) {
      outp.classList.add('flash-good'); SFX.good(); shell.flashGood();
      shell.setHint('Plaintext recovered. Confidentiality broken — now establish trust.');
      stage = 1; shell.setDots(1, 2);
      setTimeout(() => sigStage(result), 900);
    } else {
      SFX.bad(); shell.flashBad();
      shell.setHint('Output is gibberish — wrong key. Try another operation.');
      zone.classList.remove('filled'); setTimeout(() => { zone.textContent = 'drop an operation here'; }, 600);
    }
  }

  function sigStage(plaintext) {
    wrap.innerHTML = '';
    const digest = 'A1F3-9C20-77E4-BB08';
    // signature verifies to the SAME digest → authentic
    const sigDigest = 'A1F3-9C20-77E4-BB08';
    shell.setHint(hard ? 'Compare the message digest with the signature-derived digest. Drag your verdict.' : 'If the two digests match, the signature is valid. Drag the right verdict.');

    const left = document.createElement('div'); left.className = 'crypt-col';
    left.innerHTML = `<h4>AUTHENTICATED MESSAGE</h4>
      <div class="cipher-block">${plaintext}</div>
      <div style="margin-top:12px;font-size:12px;line-height:1.9">
        SHA-256(message) → <span class="acc">${digest}</span><br>
        sender public key → <span class="muted">RSA-2048 (on file, trusted)</span><br>
        signature decrypts to → <span class="acc">${sigDigest}</span>
      </div>
      <h4 style="margin-top:14px">VERDICT</h4>`;
    const zone = document.createElement('div'); zone.className = 'dropzone'; zone.textContent = 'drop your verdict';
    left.appendChild(zone);

    const right = document.createElement('div'); right.className = 'crypt-col';
    right.innerHTML = `<h4>VERDICTS</h4>`;
    [['valid', 'Signature VALID — digests match'], ['forged', 'Signature FORGED — reject message']].forEach(([id, label]) => {
      const b = document.createElement('div'); b.className = 'op-block'; b.textContent = label; b.draggable = true; b.dataset.id = id;
      b.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', id); SFX.ui(); });
      right.appendChild(b);
    });
    shuffleChildren(right, 1);

    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault(); zone.classList.remove('over');
      const id = e.dataTransfer.getData('text/plain');
      if (id === 'valid') {
        zone.classList.add('filled'); zone.textContent = 'SIGNATURE VALID ✓'; SFX.good(); shell.flashGood();
        shell.setHint('Origin authenticated and integrity intact. The order is genuine.');
        setTimeout(() => { SFX.unlock(); onDone(true); }, 800);
      } else {
        SFX.bad(); shell.flashBad();
        shell.setHint('The digests match — rejecting a valid order loses us the intel. Re-examine.');
      }
    });

    wrap.appendChild(left); wrap.appendChild(right);
  }

  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
  function shuffleChildren(parent, from) { const kids = Array.from(parent.children).slice(from); shuffle(kids); kids.forEach(k => parent.appendChild(k)); }

  decryptStage();
  return shell;
}
