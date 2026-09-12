// Procedural UI sounds + fireplace ambience via Web Audio. Keyless and
// asset-free: works offline and passes hosting checks.
let ctx: AudioContext | null = null;

function ac(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

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

// ---- interaction sounds ----
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

// ---- fireplace ambience (sombra) ----
let amb: { gain: GainNode } | null = null;
let ambTimer: number | null = null;

function crackleLoop(c: AudioContext, out: GainNode) {
  const dur = 5;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  // sparse estalos (~1/s): each is 3 samples with decay, not a raw spike
  // (isolated spikes at high rate sound like continuous static sizzle)
  let i = 1;
  while (i < data.length - 3) {
    if (Math.random() < 0.0002) {
      const a = (Math.random() * 2 - 1) * 0.25;
      data[i] = a;
      data[i + 1] = a * 0.5;
      data[i + 2] = a * 0.2;
      i += 3;
    }
    i++;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2200;
  const g = c.createGain();
  g.gain.value = 0.2;
  src.connect(lp);
  lp.connect(g);
  g.connect(out);
  src.start();
}

export function startMorningAmbience() {
  const c = ac();
  if (!amb) {
    const out = c.createGain();
    out.gain.value = 0.0001;
    out.connect(c.destination);
    crackleLoop(c, out);
    amb = { gain: out };
  }
  const now = c.currentTime;
  amb.gain.gain.cancelScheduledValues(now);
  amb.gain.gain.setValueAtTime(Math.max(amb.gain.gain.value, 0.0001), now);
  amb.gain.gain.linearRampToValueAtTime(0.42, now + 1);
}

export function stopMorningAmbience() {
  if (!amb) return;
  const now = ctx!.currentTime;
  amb.gain.gain.cancelScheduledValues(now);
  amb.gain.gain.setValueAtTime(Math.max(amb.gain.gain.value, 0.0001), now);
  amb.gain.gain.linearRampToValueAtTime(0.0001, now + 0.8);
  if (ambTimer !== null) {
    window.clearTimeout(ambTimer);
    ambTimer = null;
  }
}
