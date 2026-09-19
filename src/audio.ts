// Procedural UI sounds via Web Audio. Keyless and asset-free.
let ctx: AudioContext | null = null;
let focusMusic: HTMLAudioElement | null = null;

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

// ---- focus music (Outer Wilds theme) ----
export function startFocusMusic() {
  if (!focusMusic) {
    focusMusic = new Audio('/outer-wilds-theme.mp3');
    focusMusic.loop = true;
    focusMusic.volume = 0.45;
  }
  void focusMusic.play().catch(() => {});
}

export function stopFocusMusic() {
  if (!focusMusic) return;
  focusMusic.pause();
  focusMusic.currentTime = 0;
}

// ---- interaction sounds ----
function blip(
  t: number,
  f0: number,
  f1: number,
  dur: number,
  peak = 0.12,
  type: OscillatorType = 'sine',
  out?: AudioNode,
) {
  const c = ac();
  const osc = c.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(f0, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(out ?? c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

export function tap() {
  blip(ac().currentTime + 0.02, 740, 620, 0.05, 0.06);
}

export function taskDone() {
  const t = ac().currentTime + 0.02;
  blip(t, 523, 784, 0.1, 0.1);
  blip(t + 0.08, 659, 1046, 0.16, 0.08);
}

export function taskUndo() {
  blip(ac().currentTime + 0.02, 520, 300, 0.1, 0.07);
}

export function pluck() {
  blip(ac().currentTime + 0.02, 660, 440, 0.12, 0.09, 'triangle');
}

export function toss() {
  blip(ac().currentTime + 0.02, 200, 80, 0.14, 0.1, 'triangle');
}

export function bellOn() {
  const t = ac().currentTime + 0.02;
  blip(t, 880, 880, 0.25, 0.09);
  blip(t + 0.12, 1174, 1174, 0.3, 0.06);
}

export function bellOff() {
  blip(ac().currentTime + 0.02, 700, 500, 0.12, 0.05);
}

export function read() {
  blip(ac().currentTime + 0.02, 950, 1250, 0.08, 0.07);
}

export function swish() {
  const c = ac();
  const t = c.currentTime + 0.02;
  const dur = 0.22;
  const src = c.createBufferSource();
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.setValueAtTime(400, t);
  bp.frequency.exponentialRampToValueAtTime(2200, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.07, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(bp);
  bp.connect(g);
  g.connect(c.destination);
  src.start(t);
}
