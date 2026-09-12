// Procedural "morning coffee" lofi via Web Audio: warm continuous chord pad +
// soft bass, a gentle panned melody, brushed percussion and vinyl crackle.
// Self-contained (no audio assets) so it works offline and in publish.
let ctx: AudioContext | null = null;
let bus: BiquadFilterNode | null = null;
let master: GainNode | null = null;
let timer: number | null = null;
let chordIdx = 0;

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
const rand = (a: number, b: number) => a + Math.random() * (b - a);

const CHORDS: number[][] = [
  [36, 48, 55, 60, 64], // Cmaj7: C2 bass + C3 G3 C4 E4
  [33, 45, 52, 57, 60], // Am7: A1 bass + A2 E3 A3 C4
  [29, 41, 48, 53, 57], // Fmaj7: F1 bass + F2 C3 F3 A3
  [31, 43, 50, 55, 59], // G: G1 bass + G2 D3 G3 B3
];

// Simple warm melodic phrase over the progression (sine, panned)
const MELODY: number[][] = [
  [72, 76], // C5, E5
  [76, 72],
  [72, 69],
  [71, 67],
];

const CHORD_MS = 4000;
const FADE_IN_S = 1.5;
const FADE_OUT_S = 0.8;

interface NoteOpts {
  t: number;
  m: number;
  peak: number;
  dur: number;
  type?: OscillatorType;
  pan?: number;
  attack?: number;
}

function scheduleNote({ t, m, peak, dur, type = 'triangle', pan = 0, attack = 1.2 }: NoteOpts) {
  if (!ctx || !bus) return;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = midi(m);
  osc.detune.value = rand(-8, 8);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.linearRampToValueAtTime(peak, t + attack);
  g.gain.setValueAtTime(peak, t + Math.max(attack, dur * 0.65));
  g.gain.linearRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  if (pan !== 0 && ctx.createStereoPanner) {
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    g.connect(p);
    p.connect(bus);
  } else {
    g.connect(bus);
  }
  osc.start(t);
  osc.stop(t + dur + 0.1);
}

function scheduleHatTick(t: number, peak: number) {
  if (!ctx || !bus) return;
  const dur = 0.05;
  const src = ctx.createBufferSource();
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  src.buffer = buf;
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 6500;
  const g = ctx.createGain();
  g.gain.value = peak;
  src.connect(hp);
  hp.connect(g);
  g.connect(bus);
  src.start(t);
}

function scheduleKick(t: number) {
  if (!ctx || !bus) return;
  const dur = 0.22;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(115, t);
  osc.frequency.exponentialRampToValueAtTime(45, t + dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.16, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g);
  g.connect(bus);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function scheduleChord() {
  if (!ctx) return;
  const idx = chordIdx++ % CHORDS.length;
  const t = ctx.currentTime + 0.05;

  // continuous warmth: 4.6s tails overlap the next chord (scheduled at +4s)
  CHORDS[idx].forEach((m, i) =>
    scheduleNote({
      t,
      m,
      peak: i === 0 ? 0.42 : i === 1 ? 0.26 : 0.18,
      dur: 4.6,
      type: i === 0 ? 'sine' : 'triangle',
      pan: rand(-0.12, 0.12),
      attack: i === 0 ? 0.9 : 1.3,
    }),
  );

  // gentle melody notes from the phrase
  const phrase = MELODY[idx];
  scheduleNote({ t: t + 1.9, m: phrase[0], peak: 0.12, dur: 1.7, type: 'sine', pan: 0.3, attack: 0.5 });
  scheduleNote({ t: t + 2.8, m: phrase[1], peak: 0.1, dur: 1.6, type: 'sine', pan: -0.3, attack: 0.4 });

  // soft brushed percussion (very low volume, swing feel)
  scheduleKick(t);
  scheduleHatTick(t + 1 + 0.14, 0.035);
  scheduleKick(t + 2);
  scheduleHatTick(t + 3 + 0.14, 0.035);
  scheduleHatTick(t + 1.6, 0.022);
  scheduleHatTick(t + 3.6, 0.022);
}

function makeCrackleBuffer(c: AudioContext): AudioBuffer {
  const dur = 4;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() < 0.0003 ? (Math.random() * 2 - 1) * 0.35 : 0;
  }
  return buf;
}

export function startLofi() {
  if (!ctx || !master || !bus) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.0001;
    bus = ctx.createBiquadFilter();
    bus.type = 'lowpass';
    bus.frequency.value = 900;
    bus.Q.value = 0.3;
    bus.connect(master);
    master.connect(ctx.destination);
    const crackle = ctx.createBufferSource();
    crackle.buffer = makeCrackleBuffer(ctx);
    crackle.loop = true;
    const crackleGain = ctx.createGain();
    crackleGain.gain.value = 0.05;
    crackle.connect(crackleGain);
    crackleGain.connect(master);
    crackle.start();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  if (!master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
  master.gain.linearRampToValueAtTime(0.24, now + FADE_IN_S);
  scheduleChord();
  if (timer === null) timer = window.setInterval(scheduleChord, CHORD_MS);
}

// Alarm chime: 3 bell double-beeps. Plays independently of the lofi pad.
export function playAlarmChime() {
  if (typeof AudioContext === 'undefined') return;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
  const t0 = ctx.currentTime + 0.05;
  for (let rep = 0; rep < 3; rep++) {
    const t = t0 + rep * 0.55;
    [880, 1174].forEach((f, i) => {
      const osc = ctx!.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx!.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(i === 0 ? 0.2 : 0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(g);
      g.connect(ctx!.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }
}

export function stopLofi() {
  if (!ctx || !master) return;
  const now = ctx.currentTime;
  master.gain.cancelScheduledValues(now);
  master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
  master.gain.linearRampToValueAtTime(0.0001, now + FADE_OUT_S);
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
}
