/* =====================================================================
   Efectos de sonido sintetizados (sin samples). Devuelve un WAV mono
   16 bit a 44.1 kHz con todos los eventos mezclados.
   ===================================================================== */

const SR = 44100;

class Mixer {
  constructor(duration) {
    this.n = Math.ceil(duration * SR);
    this.buf = new Float32Array(this.n);
  }

  /* Agrega un generador fn(localTime, i) durante dur segundos desde t0 */
  add(t0, dur, fn) {
    const start = Math.floor(t0 * SR);
    const len = Math.floor(dur * SR);
    let state = {};
    for (let i = 0; i < len; i++) {
      const idx = start + i;
      if (idx < 0 || idx >= this.n) continue;
      this.buf[idx] += fn(i / SR, i, state);
    }
  }

  /* ---- generadores de alto nivel -------------------------------- */

  /* Golpe seco (puerta, pisada): thump grave + ruido corto */
  knock(t0, amp = 0.8, tone = 90) {
    this.add(t0, 0.18, (t) => {
      const env = Math.exp(-t * 28);
      return amp * env * (Math.sin(2 * Math.PI * tone * t) * 0.8 + (Math.random() * 2 - 1) * 0.35 * Math.exp(-t * 90));
    });
  }

  /* Sello: clac metálico + golpe sobre madera */
  stamp(t0, amp = 0.9) {
    this.add(t0, 0.3, (t) => {
      const click = (Math.random() * 2 - 1) * Math.exp(-t * 220) * 0.9;
      const thump = Math.sin(2 * Math.PI * 130 * t) * Math.exp(-t * 18) * 0.7;
      const ring = Math.sin(2 * Math.PI * 1900 * t) * Math.exp(-t * 60) * 0.15;
      return amp * (click + thump + ring);
    });
  }

  /* Disparo / explosión pequeña */
  shot(t0, amp = 1) {
    this.add(t0, 0.7, (t) => {
      const crack = (Math.random() * 2 - 1) * Math.exp(-t * 40);
      const boom = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 6) * 0.8;
      return amp * (crack * 0.9 + boom);
    });
  }

  /* Zumbido ambiental grave (interiores, tensión) */
  drone(t0, dur, freq = 55, amp = 0.12, fadeIn = 1, fadeOut = 1) {
    this.add(t0, dur, (t) => {
      const env = Math.min(1, t / fadeIn, (dur - t) / fadeOut);
      const w = Math.sin(2 * Math.PI * freq * t) + Math.sin(2 * Math.PI * (freq * 1.005) * t) * 0.6
              + Math.sin(2 * Math.PI * freq * 2 * t) * 0.15;
      return amp * env * w * 0.5;
    });
  }

  /* Viento: ruido filtrado con LFO lento */
  wind(t0, dur, amp = 0.25) {
    this.add(t0, dur, (t, i, st) => {
      if (st.lp == null) { st.lp = 0; st.lp2 = 0; }
      const n = Math.random() * 2 - 1;
      st.lp += (n - st.lp) * 0.035;
      st.lp2 += (st.lp - st.lp2) * 0.035;
      const lfo = 0.6 + 0.4 * Math.sin(2 * Math.PI * 0.17 * t) * Math.sin(2 * Math.PI * 0.05 * t + 1);
      const env = Math.min(1, t / 1.5, (dur - t) / 1.5);
      return amp * env * lfo * st.lp2 * 8;
    });
  }

  /* Pasos: serie de golpes suaves */
  footsteps(t0, count, interval = 0.5, amp = 0.35) {
    for (let i = 0; i < count; i++) this.knock(t0 + i * interval, amp * (i % 2 ? 0.9 : 1), 70 + (i % 2) * 15);
  }

  /* Sirena lejana de dos tonos */
  siren(t0, dur, amp = 0.08) {
    this.add(t0, dur, (t) => {
      const f = (Math.floor(t / 0.6) % 2) ? 620 : 470;
      const env = Math.min(1, t / 1, (dur - t) / 1.5);
      const sq = Math.sign(Math.sin(2 * Math.PI * f * t)) * 0.4 + Math.sin(2 * Math.PI * f * t) * 0.6;
      return amp * env * sq;
    });
  }

  /* Crujido de puerta: barrido descendente */
  creak(t0, amp = 0.3) {
    this.add(t0, 0.7, (t) => {
      const f = 240 - t * 90;
      const env = Math.sin(Math.PI * Math.min(1, t / 0.7));
      const saw = 2 * ((t * f) % 1) - 1;
      return amp * env * saw * 0.4 * (0.7 + 0.3 * Math.sin(2 * Math.PI * 23 * t));
    });
  }

  /* Papel / sobre */
  paper(t0, amp = 0.3) {
    this.add(t0, 0.25, (t, i, st) => {
      if (st.hp == null) st.hp = 0;
      const n = Math.random() * 2 - 1;
      st.hp = n - st.hp * 0.5;
      return amp * st.hp * Math.sin(Math.PI * Math.min(1, t / 0.25)) * 0.6;
    });
  }

  /* Altoparlante: tono corto tipo timbre */
  beep(t0, freq = 880, dur = 0.16, amp = 0.25) {
    this.add(t0, dur, (t) => {
      const env = Math.min(1, t / 0.01, (dur - t) / 0.03);
      return amp * env * (Math.sign(Math.sin(2 * Math.PI * freq * t)) * 0.3 + Math.sin(2 * Math.PI * freq * t) * 0.7);
    });
  }

  /* Fuego: chisporroteo */
  fire(t0, dur, amp = 0.2) {
    this.add(t0, dur, (t, i, st) => {
      if (st.lp == null) { st.lp = 0; st.pop = 0; }
      const n = Math.random() * 2 - 1;
      st.lp += (n - st.lp) * 0.08;
      if (Math.random() < 0.0004) st.pop = 1;
      st.pop *= 0.995;
      const env = Math.min(1, t / 1, (dur - t) / 1);
      return amp * env * (st.lp * 3 + st.pop * (Math.random() * 2 - 1) * 0.8);
    });
  }

  /* Rejas metálicas cerrándose */
  bars(t0, amp = 0.9) {
    this.add(t0, 1.4, (t) => {
      const hit = (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.7;
      const ring = (Math.sin(2 * Math.PI * 310 * t) + Math.sin(2 * Math.PI * 470 * t) * 0.6
                  + Math.sin(2 * Math.PI * 890 * t) * 0.3) * Math.exp(-t * 3.5) * 0.5;
      const low = Math.sin(2 * Math.PI * 70 * t) * Math.exp(-t * 8) * 0.6;
      return amp * (hit + ring + low);
    });
  }

  /* Motor de vehículo (llegada / partida) */
  engine(t0, dur, amp = 0.2, from = 40, to = 40) {
    this.add(t0, dur, (t, i, st) => {
      if (st.lp == null) st.lp = 0;
      const f = from + (to - from) * (t / dur);
      const saw = 2 * ((t * f) % 1) - 1;
      const n = Math.random() * 2 - 1;
      st.lp += (n - st.lp) * 0.05;
      const env = Math.min(1, t / 1.2, (dur - t) / 1.2);
      return amp * env * (saw * 0.5 + st.lp * 1.5);
    });
  }

  /* Acorde / arpegio (buen final) */
  chime(t0, notes = [523.25, 659.25, 783.99, 1046.5], gap = 0.22, amp = 0.28) {
    notes.forEach((f, k) => {
      this.add(t0 + k * gap, 1.8, (t) => {
        const env = Math.exp(-t * 2.2) * Math.min(1, t / 0.01);
        return amp * env * (Math.sin(2 * Math.PI * f * t) + Math.sin(2 * Math.PI * f * 2 * t) * 0.25);
      });
    });
  }

  /* Latido */
  heartbeat(t0, count, bpm = 72, amp = 0.5) {
    const per = 60 / bpm;
    for (let i = 0; i < count; i++) {
      this.knock(t0 + i * per, amp, 55);
      this.knock(t0 + i * per + 0.18, amp * 0.6, 50);
    }
  }

  /* Tic de reloj */
  tick(t0, count, interval = 1, amp = 0.18) {
    for (let i = 0; i < count; i++) {
      this.add(t0 + i * interval, 0.03, (t) => amp * (Math.random() * 2 - 1) * Math.exp(-t * 400) * Math.sin(2 * Math.PI * 2400 * t));
    }
  }

  /* Murmullo de multitud lejana */
  crowd(t0, dur, amp = 0.08) {
    this.add(t0, dur, (t, i, st) => {
      if (st.lp == null) st.lp = 0;
      const n = Math.random() * 2 - 1;
      st.lp += (n - st.lp) * 0.02;
      const env = Math.min(1, t / 1, (dur - t) / 1);
      const mod = 0.7 + 0.3 * Math.sin(2 * Math.PI * 0.9 * t) * Math.sin(2 * Math.PI * 2.3 * t);
      return amp * env * st.lp * 10 * mod;
    });
  }

  /* ---- salida ---------------------------------------------------- */

  toWav() {
    const out = Buffer.alloc(44 + this.n * 2);
    out.write("RIFF", 0); out.writeUInt32LE(36 + this.n * 2, 4); out.write("WAVE", 8);
    out.write("fmt ", 12); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
    out.writeUInt32LE(SR, 24); out.writeUInt32LE(SR * 2, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34);
    out.write("data", 36); out.writeUInt32LE(this.n * 2, 40);
    for (let i = 0; i < this.n; i++) {
      const v = Math.tanh(this.buf[i] * 1.2) * 0.9; // limitador suave
      out.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
    }
    return out;
  }
}

module.exports = { Mixer, SR };
