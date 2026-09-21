/* =====================================================================
   Motor de dibujo pixel-art (sin dependencias).
   Un frame es un buffer RGB de W x H que ffmpeg escala x6 con "neighbor".
   ===================================================================== */

const zlib = require("zlib");
const font = require("./font");

const W = 320;
const H = 180;
const FPS = 30;

/* Paleta del sitio (misma que style.css) */
const C = {
  khaki:     [0x94, 0x96, 0x7B],
  cream:     [0xE4, 0xE6, 0xBD],
  brown:     [0x57, 0x48, 0x48],
  red:       [0xCC, 0x2E, 0x2E],
  olive:     [0x5F, 0x61, 0x4D],
  redDark:   [0x85, 0x1F, 0x1F],
  blue:      [0x2C, 0x48, 0x8E],
  oliveMid:  [0x7B, 0x7D, 0x63],
  ink:       [0x1A, 0x1A, 0x1A],
  ink2:      [0x24, 0x24, 0x24],
  oliveDark: [0x43, 0x44, 0x36],
  maroon:    [0x70, 0x3B, 0x3B],
  black:     [0x00, 0x00, 0x00],
  blueDark:  [0x28, 0x33, 0x50],
  brownDark: [0x3B, 0x30, 0x30],
  redDeep:   [0x60, 0x27, 0x27],
  green:     [0x4F, 0x8A, 0x3C],
  greenDark: [0x2F, 0x5A, 0x24]
};

/* ------------------------------------------------------------------ */
/*  Utilidades numéricas                                                */
/* ------------------------------------------------------------------ */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (c1, c2, t) => [
  Math.round(lerp(c1[0], c2[0], t)),
  Math.round(lerp(c1[1], c2[1], t)),
  Math.round(lerp(c1[2], c2[2], t))
];

/* Progreso 0..1 de t dentro de [a, b]; null si está fuera */
function span(t, a, b) {
  if (t < a || t > b) return null;
  return (t - a) / (b - a);
}
const easeOut = (x) => 1 - (1 - x) * (1 - x);
const easeIn = (x) => x * x;

/* Ruido determinista (para nieve, temblores, etc.) */
function hash(n) {
  let x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ------------------------------------------------------------------ */
/*  Canvas                                                              */
/* ------------------------------------------------------------------ */

class Canvas {
  constructor() {
    this.buf = Buffer.alloc(W * H * 3);
  }

  clear(c) {
    for (let i = 0; i < W * H; i++) {
      this.buf[i * 3] = c[0];
      this.buf[i * 3 + 1] = c[1];
      this.buf[i * 3 + 2] = c[2];
    }
  }

  px(x, y, c) {
    x |= 0; y |= 0;
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 3;
    this.buf[i] = c[0];
    this.buf[i + 1] = c[1];
    this.buf[i + 2] = c[2];
  }

  rect(x, y, w, h, c) {
    x |= 0; y |= 0; w |= 0; h |= 0;
    const x0 = clamp(x, 0, W), x1 = clamp(x + w, 0, W);
    const y0 = clamp(y, 0, H), y1 = clamp(y + h, 0, H);
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        const i = (yy * W + xx) * 3;
        this.buf[i] = c[0];
        this.buf[i + 1] = c[1];
        this.buf[i + 2] = c[2];
      }
    }
  }

  /* Borde de grosor t */
  frame(x, y, w, h, c, t = 1) {
    this.rect(x, y, w, t, c);
    this.rect(x, y + h - t, w, t, c);
    this.rect(x, y, t, h, c);
    this.rect(x + w - t, y, t, h, c);
  }

  /* Rectángulo con esquinas "recortadas" (estilo pixel) */
  rectRound(x, y, w, h, c) {
    this.rect(x + 1, y, w - 2, h, c);
    this.rect(x, y + 1, w, h - 2, c);
  }

  /* Tramado: pinta cada píxel con probabilidad d (determinista) */
  dither(x, y, w, h, c, d, seed = 0) {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        if (hash(xx * 7 + yy * 131 + seed) < d) this.px(xx, yy, c);
      }
    }
  }

  /* Mezcla toda la imagen hacia un color (fundidos) */
  fade(c, amount) {
    if (amount <= 0) return;
    amount = clamp(amount, 0, 1);
    for (let i = 0; i < W * H * 3; i += 3) {
      this.buf[i] = Math.round(lerp(this.buf[i], c[0], amount));
      this.buf[i + 1] = Math.round(lerp(this.buf[i + 1], c[1], amount));
      this.buf[i + 2] = Math.round(lerp(this.buf[i + 2], c[2], amount));
    }
  }

  /* Viñeta: oscurece bordes */
  vignette(strength = 0.5) {
    const cx = W / 2, cy = H / 2;
    const maxD = Math.sqrt(cx * cx + cy * cy);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2) / maxD;
        const k = 1 - strength * easeIn(d);
        const i = (y * W + x) * 3;
        this.buf[i] = Math.round(this.buf[i] * k);
        this.buf[i + 1] = Math.round(this.buf[i + 1] * k);
        this.buf[i + 2] = Math.round(this.buf[i + 2] * k);
      }
    }
  }

  /* Scanlines suaves cada 2 px */
  scanlines(amount = 0.12) {
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 3;
        this.buf[i] = Math.round(this.buf[i] * (1 - amount));
        this.buf[i + 1] = Math.round(this.buf[i + 1] * (1 - amount));
        this.buf[i + 2] = Math.round(this.buf[i + 2] * (1 - amount));
      }
    }
  }

  /* Texto con la fuente pixel. opts: scale, spacing, align ("left"|"center"|"right") */
  text(str, x, y, c, opts = {}) {
    const scale = opts.scale || 1;
    const spacing = opts.spacing == null ? 1 : opts.spacing;
    const wTotal = font.measure(str, spacing) * scale;
    let cx = x;
    if (opts.align === "center") cx = Math.round(x - wTotal / 2);
    if (opts.align === "right") cx = Math.round(x - wTotal);

    for (const ch of str) {
      const g = font.glyph(ch);
      const rows = g.base.rows;
      for (let r = 0; r < rows.length; r++) {
        for (let k = 0; k < rows[r].length; k++) {
          if (rows[r][k] === "#") this.rect(cx + k * scale, y + r * scale, scale, scale, c);
        }
      }
      if (g.accent === "acute") {
        const off = Math.floor(g.base.w / 2);
        this.rect(cx + off * scale, y - 2 * scale, scale, scale, c);
        this.rect(cx + (off - 1) * scale, y - 1 * scale, scale, scale, c);
      } else if (g.accent === "tilde") {
        this.rect(cx + 1 * scale, y - 1 * scale, scale, scale, c);
        this.rect(cx + 2 * scale, y - 2 * scale, scale, scale, c);
        this.rect(cx + 3 * scale, y - 1 * scale, scale, scale, c);
      }
      cx += (g.base.w + spacing) * scale;
    }
    return wTotal;
  }

  /* Texto que aparece letra por letra (máquina de escribir) */
  typewriter(str, x, y, c, progress, opts = {}) {
    const n = Math.floor(clamp(progress, 0, 1) * str.length);
    // mantiene el ancho total para no "saltar" cuando está centrado
    if (opts.align === "center") {
      const full = font.measure(str, opts.spacing == null ? 1 : opts.spacing) * (opts.scale || 1);
      this.text(str.slice(0, n), Math.round(x - full / 2), y, c, { ...opts, align: "left" });
    } else {
      this.text(str.slice(0, n), x, y, c, opts);
    }
  }

  /* PNG (solo para previews) */
  toPNG() {
    const raw = Buffer.alloc((W * 3 + 1) * H);
    for (let y = 0; y < H; y++) {
      raw[y * (W * 3 + 1)] = 0;
      this.buf.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, (y + 1) * W * 3);
    }
    const chunk = (type, data) => {
      const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
      const td = Buffer.concat([Buffer.from(type), data]);
      const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
      return Buffer.concat([len, td, crc]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
    ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
      chunk("IHDR", ihdr),
      chunk("IDAT", zlib.deflateSync(raw)),
      chunk("IEND", Buffer.alloc(0))
    ]);
  }
}

let CRC_TABLE = null;
function crc32(buf) {
  if (!CRC_TABLE) {
    CRC_TABLE = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

/* ------------------------------------------------------------------ */
/*  Elementos reutilizables                                             */
/* ------------------------------------------------------------------ */

/* Silueta humana sin rostro. x = centro, y = línea de los pies, h = alto.
   opts: cap (gorra de agente), walk (fase 0..1 de caminata), coat, arms */
function figure(c, x, y, h, col, opts = {}) {
  const head = Math.max(3, Math.round(h * 0.2));
  const torsoH = Math.round(h * 0.42);
  const legH = h - head - torsoH;
  const torsoW = Math.max(4, Math.round(h * 0.28));
  const legW = Math.max(2, Math.round(torsoW / 2) - 1);

  const top = y - h;
  // cabeza
  c.rectRound(x - Math.floor(head / 2), top, head, head, col);
  if (opts.cap) {
    c.rect(x - Math.floor(head / 2) - 1, top, head + 2, 2, col);
    c.rect(x - Math.floor(head / 2) - 2, top + 1, head + 4, 1, col);
  }
  // torso (abrigo más largo si coat)
  const tY = top + head;
  const tH = opts.coat ? torsoH + Math.round(legH * 0.4) : torsoH;
  c.rectRound(x - Math.floor(torsoW / 2), tY, torsoW, tH, col);
  // brazos
  if (opts.arms !== false) {
    const armY = tY + 2;
    const armH = Math.round(torsoH * 0.8);
    c.rect(x - Math.floor(torsoW / 2) - 2, armY, 2, armH, col);
    c.rect(x + Math.ceil(torsoW / 2), armY, 2, armH, col);
  }
  if (opts.raise) { // brazo derecho levantado (apunta / sostiene algo)
    c.rect(x + Math.ceil(torsoW / 2), tY - 2, 2, Math.round(torsoH * 0.5), col);
    c.rect(x + Math.ceil(torsoW / 2), tY - 3, 6, 2, col);
  }
  // piernas
  const lY = tY + tH;
  const lH = y - lY;
  let swing = 0;
  if (opts.walk != null) swing = Math.round(Math.sin(opts.walk * Math.PI * 2) * Math.max(1, legW));
  c.rect(x - legW - 0 + swing, lY, legW, lH, col);
  c.rect(x + 0 - swing, lY, legW, lH, col);
}

/* Nieve cayendo (n copos), determinista por tiempo */
function snow(c, t, n, col, area = { x: 0, y: 0, w: W, h: H }, speed = 18) {
  for (let i = 0; i < n; i++) {
    const sx = hash(i * 3 + 1) * area.w;
    const drift = Math.sin(t * 1.3 + i) * 6;
    const sy = (hash(i * 5 + 2) * area.h + t * speed * (0.6 + hash(i) * 0.8)) % area.h;
    c.px(area.x + sx + drift, area.y + sy, col);
  }
}

/* Sello rectangular: aparece con "golpe" (2 frames escalado) y queda fijo */
function stamp(c, t, t0, x, y, w, h, col, lines, opts = {}) {
  if (t < t0) return;
  const age = t - t0;
  const grow = age < 0.08 ? 3 : age < 0.14 ? 1 : 0;
  const shake = age < 0.25 ? Math.round(Math.sin(age * 90) * 1.5) : 0;
  const X = x - grow + shake, Y = y - grow, Wd = w + grow * 2, Hd = h + grow * 2;
  c.frame(X, Y, Wd, Hd, col, 2);
  c.frame(X + 4, Y + 4, Wd - 8, Hd - 8, col, 1);
  const scale = opts.scale || 2;
  const lh = 7 * scale + 4;
  const total = lines.length * lh - 4;
  let ty = Y + Math.round((Hd - total) / 2);
  lines.forEach((ln, i) => {
    const s = (opts.scales && opts.scales[i]) || scale;
    c.text(ln, X + Wd / 2, ty, col, { scale: s, align: "center" });
    ty += 7 * s + 4;
  });
}

/* Tarjeta final común: fondo oscuro, sello con FINAL #N y título */
function endCard(c, t, t0, n, titleLines, good = false, word = null) {
  if (t < t0) return;
  const k = clamp((t - t0) / 0.4, 0, 1);
  c.fade(C.ink, k);
  if (k < 1) return;
  const col = good ? C.green : C.red;
  const dim = good ? C.greenDark : C.redDark;
  // documento
  c.rect(30, 26, 260, 128, C.cream);
  c.frame(30, 26, 260, 128, C.black, 2);
  c.rect(30, 26, 260, 14, col);
  c.text(good ? "APROBADO" : "DENEGADO", 38, 30, C.cream, { scale: 1 });
  c.text("MINISTERIO DE ADMISIÓN", 282, 30, C.cream, { scale: 1, align: "right" });
  // título
  let ty = 50;
  titleLines.forEach((ln) => { c.text(ln, 160, ty, C.brownDark, { scale: 1, align: "center" }); ty += 11; });
  // sello
  stamp(c, t, t0 + 0.9, 90, 92, 140, 40, col, ["FINAL #" + n, word || (good ? "GOOD ENDING" : "ARRESTADO")], { scale: 2, scales: [2, 1] });
  if (t > t0 + 1.6) c.text("GLORIA A ARSTOTZKA", 160, 142, dim, { align: "center" });
}

/* Cartel de apertura estilo "día X": fecha y hora sobre negro */
function titleCard(c, t, t0, t1, big, small) {
  const p = span(t, t0, t1);
  if (p == null) return false;
  c.clear(C.black);
  const k = p < 0.15 ? p / 0.15 : p > 0.85 ? (1 - p) / 0.15 : 1;
  c.text(big, 160, 74, mix(C.black, C.cream, k), { scale: 2, align: "center" });
  if (small) c.text(small, 160, 100, mix(C.black, C.khaki, k), { scale: 1, align: "center" });
  return true;
}

/* Muro de Grestín con alambre, para exteriores */
function wall(c, x, y, w, h) {
  c.rect(x, y, w, h, C.oliveDark);
  for (let yy = y + 4; yy < y + h; yy += 8) {
    c.rect(x, yy, w, 1, C.ink2);
    for (let xx = x + ((yy / 8) | 0) % 2 * 8; xx < x + w; xx += 16) c.rect(xx, yy, 1, 8, C.ink2);
  }
  // alambre
  for (let xx = x; xx < x + w; xx += 4) {
    c.px(xx, y - 2, C.khaki); c.px(xx + 2, y - 3, C.khaki); c.px(xx + 1, y - 1, C.khaki);
  }
}

module.exports = {
  W, H, FPS, C, Canvas, figure, snow, stamp, endCard, titleCard, wall,
  clamp, lerp, mix, span, easeOut, easeIn, hash
};
