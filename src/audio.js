// Sound: effects synthesised with Web Audio (no files to download) and short English voice
// lines spoken by the device's own speech voice. Settings persist in localStorage.
const store = { get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* private mode */ } } };

// Simple A1-A2 English, said by the player's own people.
export const LINES = {
  selectWorker: ['Yes?', 'Ready to work!', 'What can I do?', 'I am listening.'],
  selectSoldier: ['Ready!', 'Yes, chief?', 'At your command!', 'I am ready to fight.'],
  move: ['On my way!', 'Right away!', 'Okay, I am going.', 'Moving now.'],
  gatherLumber: ['I will cut some wood.', 'Chopping trees!', 'Wood, coming up!'],
  gatherFood: ['I will pick some berries.', 'Food for the village!', 'Time to gather food.'],
  gatherGold: ['To the gold mine!', 'I will dig for gold.', 'Shiny gold!'],
  farm: ['I will work on the farm.'],
  build: ['Let us build it!', 'I can build that.', 'Building now!'],
  attack: ['Charge!', 'Attack!', 'For our team!', 'Follow me!'],
  hold: ['We will stay here.', 'Holding this place.'],
  built: { house: 'The house is ready.', farm: 'The farm is ready.', storehouse: 'The storehouse is ready.', barracks: 'The barracks are ready.', watchtower: 'The watchtower is ready.' },
  underAttack: ['We are under attack!', 'Enemies are here!'],
  wave: ['The enemy army is coming!'],
  bell: ['Everybody, go inside!'],
  allClear: ['It is safe now. Back to work!'],
  house: ['We need more houses.'],
  victory: ['We won! Great job!'],
  defeat: ['We lost this time. Try again!'],
};
const pick = l => (Array.isArray(l) ? l[Math.floor(Math.random() * l.length)] : l);

export class Audio {
  constructor() {
    this.settings = { sfx: store.get('genom.sfx', 0.7), voice: store.get('genom.voice', 0.9), muted: store.get('genom.muted', false) };
    this.ctx = null; this.lastLine = 0; this.lastSfx = {}; this.voice = null;
    this.speech = typeof speechSynthesis !== 'undefined' ? speechSynthesis : null;
    if (this.speech) { const choose = () => { this.voice = this.pickVoice(); }; choose(); this.speech.addEventListener?.('voiceschanged', choose); }
  }

  // Browsers only allow sound after a tap, so this runs on the Start button.
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
      this.noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.apply();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }
  set(key, value) { this.settings[key] = value; store.set(`genom.${key}`, value); this.apply(); if (key !== 'voice' && this.settings.muted) this.speech?.cancel(); }
  apply() { if (this.master) this.master.gain.value = this.settings.muted ? 0 : this.settings.sfx; }

  pickVoice() {
    const vs = this.speech.getVoices().filter(v => /^en[-_]/i.test(v.lang));
    const pref = [/en-GB/i, /en-US/i];
    for (const p of pref) { const v = vs.find(x => p.test(x.lang) && /natural|google|samantha|daniel|serena|female|male/i.test(x.name)) || vs.find(x => p.test(x.lang)); if (v) return v; }
    return vs[0] || null;
  }

  // A voice line. Key lines (alerts, results) jump the queue; chatter waits its turn.
  say(key, sub, urgent = false) {
    if (!this.speech || this.settings.muted || this.settings.voice <= 0) return;
    const now = performance.now();
    if (!urgent && (now - this.lastLine < 2200 || this.speech.speaking)) return;
    const table = LINES[key], text = sub !== undefined ? table?.[sub] : pick(table);
    if (!text) return;
    this.utter(text, urgent, key.startsWith('select') || key === 'move' ? 1.15 : 1);
  }
  // Any line of text, for example "A Hive Guard is ready."
  speak(text, urgent = false) {
    if (!this.speech || this.settings.muted || this.settings.voice <= 0) return;
    if (!urgent && (performance.now() - this.lastLine < 2200 || this.speech.speaking)) return;
    this.utter(text, urgent, 1);
  }
  utter(text, urgent, pitch) {
    if (urgent) this.speech.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = this.voice?.lang || 'en-GB'; if (this.voice) u.voice = this.voice;
    u.volume = this.settings.voice; u.rate = 1.02; u.pitch = pitch;
    this.speech.speak(u);
    this.lastLine = performance.now();
  }

  // ---------- synthesised effects ----------
  tone({ f = 440, f2, type = 'sine', t = 0.15, v = 0.3, delay = 0, attack = 0.005 }) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(), at = c.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(f, at); if (f2) o.frequency.exponentialRampToValueAtTime(f2, at + t);
    g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(v, at + attack); g.gain.exponentialRampToValueAtTime(0.0001, at + t);
    o.connect(g); g.connect(this.master); o.start(at); o.stop(at + t + 0.02);
  }
  noise({ t = 0.1, v = 0.3, f = 1200, q = 1, type = 'bandpass', delay = 0 }) {
    const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(), at = c.currentTime + delay;
    s.buffer = this.noiseBuf; fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    g.gain.setValueAtTime(v, at); g.gain.exponentialRampToValueAtTime(0.0001, at + t);
    s.connect(fl); fl.connect(g); g.connect(this.master); s.start(at, Math.random() * 0.5); s.stop(at + t + 0.02);
  }
  sfx(name, gap = 0.06) {
    if (!this.ctx || this.settings.muted || this.settings.sfx <= 0) return;
    const now = this.ctx.currentTime;
    if (now - (this.lastSfx[name] || 0) < gap) return;
    this.lastSfx[name] = now;
    const S = {
      tap: () => this.tone({ f: 880, f2: 660, type: 'triangle', t: 0.07, v: 0.18 }),
      select: () => { this.tone({ f: 520, type: 'triangle', t: 0.08, v: 0.2 }); this.tone({ f: 780, type: 'triangle', t: 0.1, v: 0.16, delay: 0.05 }); },
      order: () => this.tone({ f: 640, f2: 900, type: 'sine', t: 0.09, v: 0.18 }),
      deny: () => { this.tone({ f: 220, type: 'square', t: 0.12, v: 0.08 }); this.tone({ f: 180, type: 'square', t: 0.14, v: 0.08, delay: 0.09 }); },
      chop: () => { this.noise({ t: 0.06, v: 0.35, f: 900, q: 2 }); this.tone({ f: 160, f2: 90, type: 'triangle', t: 0.08, v: 0.25 }); },
      mine: () => { this.tone({ f: 1800, f2: 1500, type: 'triangle', t: 0.12, v: 0.12 }); this.noise({ t: 0.04, v: 0.2, f: 3000, q: 3 }); },
      pick: () => this.noise({ t: 0.05, v: 0.15, f: 2400, q: 1 }),
      hammer: () => { this.noise({ t: 0.05, v: 0.3, f: 600, q: 3 }); this.tone({ f: 300, f2: 180, type: 'square', t: 0.05, v: 0.06 }); },
      place: () => { this.noise({ t: 0.25, v: 0.25, f: 400, q: 0.7, type: 'lowpass' }); this.tone({ f: 120, f2: 70, t: 0.2, v: 0.3 }); },
      deposit: () => { this.tone({ f: 1320, type: 'sine', t: 0.08, v: 0.08 }); this.tone({ f: 1760, type: 'sine', t: 0.1, v: 0.06, delay: 0.05 }); },
      arrow: () => this.noise({ t: 0.12, v: 0.12, f: 2500, q: 4 }),
      clash: () => { this.noise({ t: 0.08, v: 0.25, f: 3500, q: 6 }); this.tone({ f: 2400, f2: 2000, type: 'square', t: 0.06, v: 0.04 }); },
      crumble: () => { this.noise({ t: 0.9, v: 0.45, f: 300, q: 0.5, type: 'lowpass' }); this.noise({ t: 0.5, v: 0.2, f: 900, q: 1, delay: 0.15 }); },
      built: () => [523, 659, 784].forEach((f, i) => this.tone({ f, type: 'triangle', t: 0.25, v: 0.16, delay: i * 0.09 })),
      trained: () => { this.tone({ f: 660, type: 'triangle', t: 0.12, v: 0.15 }); this.tone({ f: 990, type: 'triangle', t: 0.16, v: 0.13, delay: 0.08 }); },
      alarm: () => { for (let i = 0; i < 3; i++) this.tone({ f: 330, f2: 300, type: 'sawtooth', t: 0.22, v: 0.09, delay: i * 0.28 }); },
      bell: () => { for (let i = 0; i < 3; i++) { this.tone({ f: 880, type: 'sine', t: 1.2, v: 0.22, delay: i * 0.45 }); this.tone({ f: 2093, type: 'sine', t: 0.8, v: 0.07, delay: i * 0.45 }); } },
      clear: () => [392, 523].forEach((f, i) => this.tone({ f, type: 'sine', t: 0.6, v: 0.18, delay: i * 0.2 })),
      // The age-up: a low swell that rises into a bright chord and a run of bells.
      ascend: () => {
        for (const [f, d] of [[65.4, 0], [98, 0.05], [130.8, 0.1]]) this.tone({ f, f2: f * 2, type: 'sawtooth', t: 1.5, v: 0.05, delay: d, attack: 1.2 });
        this.noise({ t: 1.5, v: 0.12, f: 500, q: 0.6, type: 'lowpass' });
        [261.6, 329.6, 392, 523.3, 659.3, 784].forEach((f, i) => this.tone({ f, type: 'triangle', t: 3.2, v: 0.12, delay: 1.4 + i * 0.03, attack: 0.02 }));
        [130.8, 196].forEach(f => this.tone({ f, type: 'sine', t: 3.5, v: 0.2, delay: 1.4 }));
        [1047, 1319, 1568, 2093, 1568, 2093, 2637].forEach((f, i) => this.tone({ f, type: 'sine', t: 0.9, v: 0.07, delay: 1.6 + i * 0.13 }));
        [349.2, 440, 523.3, 698.5].forEach((f, i) => this.tone({ f, type: 'triangle', t: 2.6, v: 0.1, delay: 4.2 + i * 0.04 }));
        [392, 493.9, 587.3, 784, 987.8].forEach((f, i) => this.tone({ f, type: 'triangle', t: 3, v: 0.11, delay: 5.4 + i * 0.04 }));
      },
      whoosh: () => { this.noise({ t: 0.5, v: 0.18, f: 900, q: 1.2 }); this.tone({ f: 300, f2: 900, type: 'sine', t: 0.45, v: 0.05 }); },
      chime: () => this.tone({ f: 1568 + Math.random() * 600, type: 'sine', t: 0.35, v: 0.05 }),
      victory: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone({ f, type: 'triangle', t: i === 5 ? 0.8 : 0.22, v: 0.18, delay: i * 0.16 })),
      defeat: () => [392, 330, 262, 196].forEach((f, i) => this.tone({ f, type: 'triangle', t: 0.45, v: 0.16, delay: i * 0.3 })),
    };
    S[name]?.();
  }
}
