/* =====================================================================
   Las siete escenas de final. Cada una define:
     n, id, duration, title (líneas), good, draw(c, t), audio(m)
   Todas las figuras son siluetas sin rostro.
   ===================================================================== */

const E = require("./engine");
const { C, W, H, figure, snow, stamp, endCard, titleCard, wall, span, clamp, lerp, mix, easeOut, easeIn, hash } = E;

/* ---------- helpers compartidos ------------------------------------ */

function typed(c, str, x, y, col, t, t0, speed = 18, opts = {}) {
  if (t < t0) return;
  c.typewriter(str, x, y, col, (t - t0) * speed / str.length, opts);
}

function star(c, cx, cy, col) {
  // estrella de cinco puntas dibujada a mano (EZIC), 9x9
  const rows = [
    "....#....", "....#....", "...###...", "#########", ".#######.",
    "..#####..", "..#...#..", ".##...##.", "#.......#"
  ];
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === "#") c.px(cx - 4 + x, cy - 4 + y, col); });
}

function newspaper(c, t, t0, headline, sub) {
  c.clear(C.ink);
  const k = clamp((t - t0) / 0.3, 0, 1);
  const y0 = Math.round(lerp(H, 10, easeOut(k)));
  c.rect(24, y0, 272, 170, C.cream);
  c.frame(24, y0, 272, 170, C.black, 2);
  c.rect(32, y0 + 8, 256, 1, C.brownDark);
  c.text("LA VOZ DE GRESTÍN", 160, y0 + 12, C.brownDark, { align: "center" });
  c.rect(32, y0 + 22, 256, 1, C.brownDark);
  headline.forEach((ln, i) => typed(c, ln, 160, y0 + 32 + i * 20, C.black, t, t0 + 0.4 + i * 0.7, 20, { scale: 2, align: "center" }));
  if (sub) c.text(sub, 160, y0 + 32 + headline.length * 20 + 4, C.maroon, { align: "center" });
  // columnas de texto gris
  if (t > t0 + 0.4 + headline.length * 0.7) {
    for (let col = 0; col < 3; col++) {
      for (let yy = y0 + 92; yy < y0 + 160; yy += 3) {
        c.dither(36 + col * 86, yy, 74 - (hash(yy + col) * 12 | 0), 1, C.oliveMid, 0.75, yy);
      }
    }
  }
}

/* Cabina de control vista de costado (exterior) */
function checkpoint(c, t, opts = {}) {
  c.clear(opts.sky || C.ink2);
  wall(c, 0, 30, W, 80);
  c.rect(0, 110, W, 70, C.oliveDark);
  c.rect(0, 110, W, 2, C.olive);
  // cabina
  c.rect(20, 56, 64, 74, C.brownDark);
  c.frame(20, 56, 64, 74, C.black, 1);
  c.rect(28, 66, 48, 26, opts.lightOff ? C.ink2 : C.khaki);
  c.frame(28, 66, 48, 26, C.black, 1);
  c.rect(84, 100, 30, 6, C.brown); // mostrador
  c.rect(84, 106, 4, 24, C.brown);
  c.text("1", 52, 58, C.cream);
  // barrera
  c.rect(118, 96, 3, 34, C.cream);
  c.rect(121, 98, 40, 3, C.red);
  c.rect(121, 98, 8, 3, C.cream);
  c.rect(137, 98, 8, 3, C.cream);
  c.rect(153, 98, 8, 3, C.cream);
  // cartel
  c.rect(186, 40, 120, 14, C.cream);
  c.frame(186, 40, 120, 14, C.black, 1);
  c.text("GLORIA A ARSTOTZKA", 246, 44, C.redDark, { align: "center" });
}

/* ===================================================================== */
/*  FINAL 1 — Arrestado por faltar al servicio                            */
/* ===================================================================== */

const final1 = {
  n: 1, id: "final1", duration: 18.5, good: false,
  title: ["ARRESTADO POR FALTAR", "AL SERVICIO"],
  draw(c, t) {
    if (titleCard(c, t, 0, 2.2, "24 NOV 1982", "09:40 — BLOQUE OBRERO 14")) return;

    // habitación
    c.clear(C.brownDark);
    c.rect(0, 130, W, 50, C.ink2);
    c.rect(0, 128, W, 2, C.black);
    // ventana con el muro afuera
    c.rect(214, 38, 76, 62, C.ink);
    wall(c, 214, 60, 76, 40);
    snow(c, t, 30, C.cream, { x: 214, y: 38, w: 76, h: 62 }, 10);
    c.frame(214, 38, 76, 62, C.black, 3);
    c.rect(251, 38, 3, 62, C.black);
    // reloj
    c.rect(150, 44, 34, 12, C.cream);
    c.frame(150, 44, 34, 12, C.black, 1);
    c.text("09:4" + (t > 9 ? "1" : "0"), 167, 47, C.black, { align: "center" });
    // estufa
    c.rect(268, 104, 22, 26, C.ink);
    c.frame(268, 104, 22, 26, C.black, 1);
    const glow = 0.5 + 0.5 * Math.sin(t * 9);
    c.dither(272, 112, 14, 14, mix(C.redDeep, C.red, glow), 0.6 + glow * 0.3, (t * 10) | 0);
    // mesa y silla
    c.rect(120, 100, 60, 4, C.brown);
    c.rect(124, 104, 3, 26, C.brown);
    c.rect(173, 104, 3, 26, C.brown);
    // taza sobre la mesa
    c.rect(140, 94, 6, 6, C.khaki);
    // puerta
    const knockPhase = [3.5, 4.0, 4.5, 6.0, 6.4, 6.8].find((k) => t >= k && t < k + 0.12);
    const shake = knockPhase ? Math.round(Math.sin(t * 120) * 1.5) : 0;
    const open = clamp((t - 8.0) / 0.9, 0, 1);
    const doorX = 40 + shake;
    if (open > 0) {
      // luz del pasillo
      c.rect(40, 50, 52, 80, mix(C.khaki, C.cream, 0.4));
      c.dither(40, 50, 52, 80, C.khaki, 0.3, 5);
    }
    // hoja de puerta girando (se angosta)
    const dw = Math.round(52 * (1 - open * 0.85));
    c.rect(doorX, 50, dw, 80, C.brown);
    c.frame(doorX, 50, dw, 80, C.black, 1);
    if (open < 0.3) c.rect(doorX + dw - 8, 90, 3, 3, C.khaki); // picaporte
    c.frame(38, 48, 56, 84, C.black, 2); // marco

    // protagonista: sentado hasta el segundo golpe, después de pie
    if (t < 6.0) {
      figure(c, 150, 130, 36, C.ink, { arms: false });
      c.rect(120, 100, 60, 4, C.brown); // la mesa tapa parte del cuerpo: sentado
      c.rect(140, 94, 6, 6, C.khaki);
    } else {
      figure(c, 150 + (t > 8.5 ? Math.round((t - 8.5) * 6) : 0), 130, 40, C.ink);
    }

    // golpes: "TOC" acumulados
    const knocks = [3.5, 4.0, 4.5].filter((k) => t >= k && t < 5.8).length;
    const knocks2 = [6.0, 6.4, 6.8].filter((k) => t >= k && t < 8.0).length;
    for (let i = 0; i < Math.max(knocks, knocks2); i++) {
      c.text("TOC", 100 + i * (knocks2 ? 42 : 22), 60 - i * 2, C.cream, { scale: knocks2 ? 2 : 1 });
    }

    // agentes entran
    [[8.6, 70], [9.2, 100]].forEach(([t0, endX], i) => {
      if (t < t0) return;
      const p = clamp((t - t0) / 1.6, 0, 1);
      const x = Math.round(lerp(44, endX, easeOut(p)));
      figure(c, x, 130, 44, C.black, { cap: true, coat: true, walk: p < 1 ? t * 2.2 : null });
    });

    // texto
    typed(c, "MINISTERIO DE INFORMACIÓN", 160, 150, C.cream, t, 10.0, 22, { align: "center" });
    typed(c, "«RECHAZAR AL ESTADO ES DESERTAR DEL ESTADO»", 160, 162, C.khaki, t, 10.8, 34, { align: "center" });

    c.vignette(0.45);
    if (t > 12.6) c.fade(C.black, clamp((t - 12.6) / 0.8, 0, 1));
    endCard(c, t, 13.6, 1, this.title);
  },
  audio(m) {
    m.drone(2.2, 11.5, 50, 0.1);
    m.tick(2.4, 10, 1, 0.12);
    m.fire(2.2, 11, 0.08);
    [3.5, 4.0, 4.5].forEach((k) => m.knock(k, 0.7));
    [6.0, 6.4, 6.8].forEach((k) => m.knock(k, 1.0, 80));
    m.creak(8.0, 0.35);
    m.footsteps(8.7, 6, 0.4, 0.4);
    m.drone(10.5, 3.5, 40, 0.16, 0.5, 1.5);
    m.stamp(14.5);
  }
};

/* ===================================================================== */
/*  FINAL 2 — Arrestado por fondos ilícitos                                */
/* ===================================================================== */

const final2 = {
  n: 2, id: "final2", duration: 18.5, good: false,
  title: ["ARRESTADO POR", "FONDOS ILÍCITOS"],
  draw(c, t) {
    if (titleCard(c, t, 0, 2.2, "DÍA 5", "17:30 — DEPARTAMENTO CLASE 8")) return;

    c.clear(C.brownDark);
    c.rect(0, 136, W, 44, C.ink2);
    c.rect(0, 134, W, 2, C.black);
    c.dither(0, 0, W, 134, C.brown, 0.08, 1);
    // calefactor
    const hx = 110, hy = 92;
    c.rect(hx, hy, 100, 44, C.oliveDark);
    for (let i = 0; i < 10; i++) c.rect(hx + 4 + i * 10, hy + 4, 6, 36, C.oliveMid);
    c.frame(hx, hy, 100, 44, C.black, 1);
    c.rect(hx + 100, hy + 30, 14, 3, C.oliveMid); // caño

    // agente del Ministerio (traje gris) entra y se agacha
    const walk = span(t, 2.6, 4.6);
    const ax = walk != null ? Math.round(lerp(330, 250, easeOut(walk))) : 250;
    if (t < 5.2) figure(c, ax, 136, 44, C.ink, { coat: true, walk: walk != null ? t * 2.2 : null });
    else figure(c, 232, 136, 44, C.ink, { coat: true, raise: t < 7.5 }); // señala el calefactor

    // sobre saliendo de atrás del calefactor
    const pull = span(t, 5.6, 7.0);
    if (pull != null || t >= 7.0) {
      const p = pull == null ? 1 : easeOut(pull);
      const ey = Math.round(lerp(hy + 10, 50, p));
      const ex = Math.round(lerp(hx + 40, 150, p));
      c.rect(ex, ey, 30, 18, C.cream);
      c.frame(ex, ey, 30, 18, C.brownDark, 1);
      c.px(ex + 15, ey + 9, C.brownDark);
      c.rect(ex + 1, ey + 1, 14, 8, C.cream); c.rect(ex + 15, ey + 1, 14, 8, C.cream);
      for (let k = 0; k < 8; k++) { c.px(ex + 1 + k, ey + 1 + k, C.brownDark); c.px(ex + 28 - k, ey + 1 + k, C.brownDark); }
    }

    // billetes cayendo
    if (t > 7.2) {
      for (let i = 0; i < 16; i++) {
        const born = 7.2 + i * 0.18;
        if (t < born) continue;
        const age = t - born;
        const bx = 150 + Math.sin(age * 3 + i) * 10 + hash(i) * 30;
        const by = Math.min(60 + age * 34, 128 + (hash(i * 3) * 6 | 0));
        c.rect(bx, by, 12, 6, C.khaki);
        c.frame(bx, by, 12, 6, C.oliveDark, 1);
        c.px(bx + 6, by + 3, C.oliveDark);
      }
    }

    typed(c, "1000 CRÉDITOS", 160, 20, C.cream, t, 8.2, 18, { align: "center", scale: 2 });
    typed(c, "SUELDO NETO DE LA SEMANA: 45", 160, 150, C.khaki, t, 9.4, 28, { align: "center" });
    typed(c, "«EXPLÍQUEME ESTO, INSPECTOR.»", 160, 162, C.cream, t, 10.6, 30, { align: "center" });

    c.vignette(0.45);
    if (t > 12.6) c.fade(C.black, clamp((t - 12.6) / 0.8, 0, 1));
    endCard(c, t, 13.6, 2, this.title);
  },
  audio(m) {
    m.drone(2.2, 11.5, 55, 0.1);
    m.footsteps(2.7, 4, 0.5, 0.35);
    m.knock(5.3, 0.4, 60);
    m.paper(5.7); m.paper(6.4, 0.4);
    for (let i = 0; i < 16; i++) m.paper(7.2 + i * 0.18, 0.15);
    m.heartbeat(9.6, 4, 66, 0.35);
    m.siren(10.5, 4, 0.06);
    m.stamp(14.5);
  }
};

/* ===================================================================== */
/*  FINAL 3 — Mataste al diplomático                                       */
/* ===================================================================== */

const final3 = {
  n: 3, id: "final3", duration: 19.5, good: false,
  title: ["MATASTE AL DIPLOMÁTICO", "IMPORTANTE"],
  draw(c, t) {
    if (titleCard(c, t, 0, 2.2, "DÍA 7", "11:00 — PUESTO DE CONTROL")) return;

    if (t < 10.8) {
      checkpoint(c, t);
      // fila
      const queue = [150, 178, 206, 234, 262];
      queue.forEach((qx, i) => {
        if (i === 2) return; // el terrorista se dibuja aparte
        let x = qx, walk = null;
        if (t > 8.6) { x = qx + Math.round((t - 8.6) * 40); walk = t * 3; }
        figure(c, x, 130, 36 + (i % 2) * 4, C.ink, { walk });
        if (walk == null) c.px(x, 130 - 36 - (i % 2) * 4 + Math.round(Math.sin(t * 2 + i)), C.ink);
      });
      // diplomático en el mostrador
      const dead = t > 7.85;
      if (!dead) {
        figure(c, 104, 130, 40, C.ink, { coat: true });
        c.rect(110, 118, 8, 10, C.brownDark); // maletín
        c.frame(110, 118, 8, 10, C.black, 1);
      } else {
        const fall = clamp((t - 7.85) / 0.35, 0, 1);
        c.rect(96, Math.round(lerp(90, 124, easeIn(fall))), Math.round(lerp(10, 36, fall)), Math.round(lerp(40, 8, fall)), C.ink);
        c.rect(120, 124, 10, 6, C.brownDark);
        if (t > 8.3) c.dither(92, 128, 44, 3, C.redDark, 0.7, 3);
      }
      // terrorista: corre, salta la barrera
      const run = span(t, 4.4, 6.0);
      let tx = 206, ty = 130;
      if (run != null) {
        tx = Math.round(lerp(206, 132, run));
        if (run > 0.55 && run < 0.85) ty = 130 - Math.round(Math.sin((run - 0.55) / 0.3 * Math.PI) * 16);
      } else if (t >= 6.0) {
        tx = t > 8.4 ? Math.round(lerp(132, -40, clamp((t - 8.4) / 1.4, 0, 1))) : 132;
      }
      figure(c, tx, ty, 38, C.ink, { walk: (run != null || t > 8.4) ? t * 4 : null, raise: t > 5.2 });
      if (t > 5.2 && t < 8.4) c.rect(tx + 11, ty - 30, 3, 3, C.red); // granada

      // mira
      const aim = span(t, 6.0, 7.8);
      if (aim != null) {
        const from = { x: 132, y: 110 }, to = { x: 104, y: 110 };
        const k = clamp((aim - 0.25) / 0.6, 0, 1);
        const mx = Math.round(lerp(from.x, to.x, easeOut(k))) + Math.round(Math.sin(t * 17) * 1.2);
        const my = from.y + Math.round(Math.cos(t * 13) * 1.2);
        c.frame(mx - 12, my - 12, 24, 24, C.cream, 1);
        c.rect(mx - 16, my, 8, 1, C.cream); c.rect(mx + 9, my, 8, 1, C.cream);
        c.rect(mx, my - 16, 1, 8, C.cream); c.rect(mx, my + 9, 1, 8, C.cream);
        c.px(mx, my, C.red);
      }
      // disparo
      if (t > 7.8 && t < 7.9) c.fade(C.cream, 0.9);
      if (t > 7.9 && t < 8.1) c.fade(C.cream, 0.4);

      if (t < 8.4) typed(c, "«UN SOLO DISPARO.»", 160, 150, C.cream, t, 6.2, 18, { align: "center" });
      if (t > 8.4) c.text("EL EMBAJADOR NO SE LEVANTA.", 160, 150, C.red, { align: "center" });
      if (t > 9.4) c.text("EL TERRORISTA ESCAPA.", 160, 162, C.khaki, { align: "center" });
      c.vignette(0.4);
    } else {
      newspaper(c, t, 10.8, ["INSPECTOR MATA A", "EMBAJADOR DE ANTEGRIA"], "ANTEGRIA RETIRA A SU CUERPO DIPLOMÁTICO");
    }

    if (t > 13.6) c.fade(C.black, clamp((t - 13.6) / 0.8, 0, 1));
    endCard(c, t, 14.6, 3, this.title);
  },
  audio(m) {
    m.wind(2.2, 9, 0.12);
    m.crowd(2.2, 8.6, 0.07);
    m.beep(2.6, 660, 0.2); m.beep(2.85, 880, 0.25);
    m.footsteps(4.4, 8, 0.19, 0.45);
    m.knock(5.4, 0.8, 120); // salto/barrera
    m.heartbeat(6.0, 3, 80, 0.5);
    m.shot(7.8, 1);
    m.crowd(8.2, 3, 0.2);
    m.footsteps(8.4, 7, 0.2, 0.35);
    m.siren(9.0, 5, 0.07);
    m.paper(10.9, 0.5);
    m.tick(11.2, 26, 0.05, 0.1);
    m.stamp(15.5);
  }
};

/* ===================================================================== */
/*  FINAL 4 — Condecorado (buen final)                                    */
/* ===================================================================== */

function medal(c, x, y) {
  // cinta
  c.rect(x - 7, y - 22, 6, 18, C.red); c.rect(x + 1, y - 22, 6, 18, C.red);
  c.rect(x - 7, y - 22, 6, 3, C.cream); c.rect(x + 1, y - 22, 6, 3, C.cream);
  // medalla
  c.rectRound(x - 9, y - 6, 18, 18, C.khaki);
  c.frame(x - 9, y - 6, 18, 18, C.oliveDark, 1);
  c.px(x - 9, y - 6, C.cream); c.px(x + 8, y - 6, C.cream); c.px(x - 9, y + 11, C.cream); c.px(x + 8, y + 11, C.cream);
  star(c, x, y + 3, C.redDark);
}

const final4 = {
  n: 4, id: "final4", duration: 20.5, good: true,
  title: ["CONDECORADO POR TU", "EXCELENTE SERVICIO"],
  draw(c, t) {
    if (titleCard(c, t, 0, 2.2, "23 DIC 1982", "FIN DE MES — PUESTO DE CONTROL")) return;

    if (t < 8.0) {
      checkpoint(c, t, { sky: C.blueDark });
      // banderín ondeando
      c.rect(190, 30, 2, 80, C.khaki);
      for (let i = 0; i < 14; i++) c.rect(192 + i, 32 + Math.round(Math.sin(t * 6 + i * 0.5) * 1.5), 1, 8, C.red);
      snow(c, t, 70, C.cream, { x: 0, y: 0, w: W, h: 130 }, 14);
      figure(c, 52, 100, 18, C.ink, { arms: false }); // inspector en la cabina
      c.rect(28, 92, 48, 8, C.brownDark);
      typed(c, "10 DÍAS. 0 COLABORACIONES.", 160, 140, C.cream, t, 3.4, 20, { align: "center" });
      typed(c, "1 INFRACCIÓN, PAGADA.", 160, 154, C.khaki, t, 5.4, 20, { align: "center" });
      c.vignette(0.35);
    } else if (t < 13.6) {
      // carta con medalla
      c.clear(C.ink);
      c.rect(30, 14, 260, 152, C.cream);
      c.frame(30, 14, 260, 152, C.black, 2);
      c.rect(30, 14, 260, 14, C.olive);
      c.text("MINISTERIO DE ADMISIÓN", 160, 18, C.cream, { align: "center" });
      c.text("MEDALLA AL SERVICIO", 160, 36, C.brownDark, { align: "center", scale: 2 });
      c.text("DE GRESTÍN", 160, 54, C.brownDark, { align: "center", scale: 2 });
      const drop = clamp((t - 8.3) / 0.6, 0, 1);
      const my = Math.round(lerp(-30, 110, easeIn(drop))) + (drop === 1 && t < 9.2 ? Math.round(Math.sin((t - 8.9) * 30) * 2) : 0);
      medal(c, 160, my);
      typed(c, "SUELDO FIJO. DEPARTAMENTO CLASE 6.", 160, 132, C.oliveDark, t, 9.6, 26, { align: "center" });
      typed(c, "VACUNAS PARA TODA LA FAMILIA.", 160, 144, C.oliveDark, t, 11.0, 26, { align: "center" });
      if (t < 8.6) c.fade(C.black, 1 - (t - 8.0) / 0.6);
    } else {
      // ventana de la familia
      c.clear(C.ink);
      c.rect(0, 0, W, 130, C.brownDark);
      c.dither(0, 0, W, 130, C.ink2, 0.2, 9);
      c.rect(0, 130, W, 50, C.ink2);
      // otras ventanas apagadas
      [[30, 30], [30, 80], [240, 30], [240, 80]].forEach(([x, y]) => { c.rect(x, y, 40, 30, C.ink); c.frame(x, y, 40, 30, C.black, 2); });
      // ventana iluminada
      const glow = 0.85 + 0.15 * Math.sin(t * 5);
      c.rect(110, 30, 100, 80, mix(C.khaki, C.cream, glow));
      // familia (siluetas) — cuatro alturas
      [[135, 46, true], [160, 40], [182, 26], [200, 34]].forEach(([x, h, cap]) => figure(c, x, 110, h, C.ink, { arms: false }));
      c.frame(110, 30, 100, 80, C.black, 3);
      c.rect(159, 30, 3, 80, C.black);
      c.rect(110, 68, 100, 3, C.black);
      snow(c, t, 80, C.cream, { x: 0, y: 0, w: W, h: 130 }, 12);
      typed(c, "TU FAMILIA PASA EL INVIERNO.", 160, 148, C.cream, t, 14.2, 20, { align: "center" });
      typed(c, "EN GRESTÍN, ESO YA ES UNA VICTORIA.", 160, 162, C.khaki, t, 15.8, 26, { align: "center" });
      c.vignette(0.4);
      if (t < 14.0) c.fade(C.black, 1 - (t - 13.6) / 0.4);
    }

    if (t > 17.4) c.fade(C.black, clamp((t - 17.4) / 0.8, 0, 1));
    endCard(c, t, 18.4, 4, this.title, true);
  },
  audio(m) {
    m.wind(2.2, 6.2, 0.18);
    m.tick(3.4, 26, 0.05, 0.08); m.tick(5.4, 22, 0.05, 0.08);
    m.paper(8.1, 0.5);
    m.knock(8.9, 0.6, 140);
    m.chime(9.0);
    m.tick(9.6, 34, 0.04, 0.06); m.tick(11.0, 30, 0.04, 0.06);
    m.drone(13.6, 5, 110, 0.07, 1, 1);
    m.wind(13.6, 4.5, 0.1);
    m.tick(14.2, 28, 0.05, 0.06); m.tick(15.8, 34, 0.04, 0.06);
    m.stamp(19.3, 0.8);
    m.chime(19.5, [392, 523.25, 659.25, 783.99], 0.18, 0.25);
  }
};

/* ===================================================================== */
/*  FINAL 5 — Arrestado por acelerar la epidemia de polio                  */
/* ===================================================================== */

const final5 = {
  n: 5, id: "final5", duration: 19.5, good: false,
  title: ["ARRESTADO POR ACELERAR", "LA EPIDEMIA DE POLIO"],
  draw(c, t) {
    if (titleCard(c, t, 0, 2.2, "DÍA 8", "14:00 — BROTE DE POLIO")) return;

    if (t < 7.4) {
      // vista desde la cabina: ventanilla + mostrador
      c.clear(C.oliveDark);
      c.dither(0, 0, W, 110, C.olive, 0.15, 2);
      // madre y dos hijos del otro lado del vidrio
      figure(c, 130, 104, 60, C.ink, { coat: true });
      figure(c, 166, 104, 34, C.ink);
      figure(c, 100, 104, 28, C.ink);
      // uno de los chicos tose (se sacude)
      if (Math.sin(t * 14) > 0.7 && t > 3) figure(c, 167, 103, 34, C.ink, { arms: false });
      // marco de ventanilla
      c.frame(0, 0, W, 112, C.black, 6);
      c.rect(0, 108, W, 72, C.khaki);
      c.rect(0, 108, W, 3, C.oliveDark);
      // certificado sobre el mostrador
      const slide = clamp((t - 2.6) / 0.6, 0, 1);
      const cy = Math.round(lerp(190, 118, easeOut(slide)));
      c.rect(70, cy, 180, 54, C.cream);
      c.frame(70, cy, 180, 54, C.brownDark, 1);
      c.text("CERTIFICADO DE VACUNACIÓN", 160, cy + 6, C.brownDark, { align: "center" });
      c.rect(80, cy + 16, 160, 1, C.oliveMid);
      c.text("POLIO   DOSIS 3/3", 80, cy + 22, C.oliveDark);
      c.text("FECHA:  198", 80, cy + 34, C.oliveDark);
      c.dither(146, cy + 32, 22, 11, C.oliveMid, 0.5, 7); // borrón sobre el año
      c.text("?", 152, cy + 34, C.maroon);
      // sello APROBADO cae
      stamp(c, t, 5.4, 150, cy + 20, 90, 26, C.green, ["APROBADO"], { scale: 1 });
      typed(c, "PODRÍA SER DE ESTE AÑO. O DEL ANTERIOR.", 160, 14, C.cream, t, 3.2, 30, { align: "center" });
      c.vignette(0.3);
    } else if (t < 12.2) {
      // mapa de casos
      c.clear(C.ink);
      typed(c, "+3 DÍAS", 160, 14, C.cream, t, 7.4, 12, { align: "center", scale: 2 });
      const count = t < 8.6 ? 0 : Math.min(20, Math.floor((t - 8.6) / 2.4 * 20));
      c.text("GRESTÍN ORIENTAL", 160, 40, C.khaki, { align: "center" });
      for (let i = 0; i < 50; i++) {
        const bx = 60 + (i % 10) * 20, by = 54 + Math.floor(i / 10) * 16;
        const order = Math.floor(hash(i * 11) * 50);
        const infected = count > 0 && order < count * 2.5;
        c.rect(bx, by, 16, 12, infected ? C.red : C.oliveDark);
        if (infected) c.frame(bx, by, 16, 12, C.redDark, 1);
      }
      if (t > 8.6) {
        c.text("CASOS CONFIRMADOS: " + count, 160, 140, count >= 20 ? C.red : C.cream, { align: "center", scale: count >= 20 ? 2 : 1 });
      }
      if (t > 11.2) c.text("PRIMER CASO: EL NIÑO DE LA FILA.", 160, 164, C.khaki, { align: "center" });
    } else {
      newspaper(c, t, 12.2, ["NEGLIGENCIA", "SANITARIA AGRAVADA"], "EL MINISTERIO SEÑALA A UN INSPECTOR");
    }

    if (t > 14.6) c.fade(C.black, clamp((t - 14.6) / 0.8, 0, 1));
    endCard(c, t, 15.6, 5, this.title);
  },
  audio(m) {
    m.crowd(2.2, 5.2, 0.09);
    m.drone(2.2, 5.2, 60, 0.06);
    // toses (ruido corto agudo)
    [3.1, 3.4, 4.9, 6.2].forEach((k) => m.paper(k, 0.35));
    m.paper(2.7, 0.4);
    m.stamp(5.4, 0.9);
    m.drone(7.4, 5, 45, 0.12, 0.5, 0.5);
    m.tick(8.6, 20, 0.12, 0.2);
    m.heartbeat(10.4, 3, 90, 0.4);
    m.paper(12.3, 0.5);
    m.tick(12.6, 24, 0.05, 0.1);
    m.siren(12.5, 3.5, 0.06);
    m.stamp(16.5);
  }
};

/* ===================================================================== */
/*  FINAL 6 — Preso por colaborar con EZIC                                 */
/* ===================================================================== */

const final6 = {
  n: 6, id: "final6", duration: 19.5, good: false,
  title: ["PRESO POR COLABORAR", "CON EZIC"],
  draw(c, t) {
    if (titleCard(c, t, 0, 2.2, "DÍA 10", "05:55 — CONTROL DEL PERSONAL")) return;

    if (t < 8.2) {
      // pasillo con guardias
      c.clear(C.brownDark);
      c.rect(0, 120, W, 60, C.ink2);
      c.rect(0, 118, W, 2, C.black);
      c.dither(0, 0, W, 118, C.ink2, 0.15, 4);
      // puerta al fondo
      c.rect(140, 46, 40, 74, C.oliveDark);
      c.frame(140, 46, 40, 74, C.black, 2);
      c.text("ADMIN.", 160, 36, C.khaki, { align: "center" });
      // altoparlante
      c.rect(280, 20, 16, 10, C.ink); c.rect(296, 18, 4, 14, C.ink);
      if (t > 2.4 && t < 4.4 && Math.sin(t * 30) > 0) { c.px(303, 24, C.cream); c.px(306, 22, C.cream); c.px(306, 26, C.cream); }
      // guardias a los costados (fila)
      [30, 70, 110, 210, 250, 290].forEach((gx, i) => {
        figure(c, gx, 120, 44, C.black, { cap: true });
        // uno de ellos baja la cabeza (no te mira) — se lo dibuja apenas más bajo
        if (i === 3 && t > 5.5) c.rect(gx - 5, 76, 10, 3, C.brownDark);
      });
      // protagonista camina hacia la puerta
      const p = clamp((t - 3.0) / 4.6, 0, 1);
      const px = Math.round(lerp(-20, 160, p));
      const ph = Math.round(lerp(44, 34, p));
      figure(c, px, 120 - Math.round(p * 6), ph, C.ink, { walk: p < 1 ? t * 2.4 : null });
      typed(c, "TODOS LOS INSPECTORES", 160, 140, C.cream, t, 2.5, 20, { align: "center" });
      typed(c, "AL CONTROL DE PERSONAL.", 160, 152, C.cream, t, 3.6, 20, { align: "center" });
      typed(c, "ACTIVIDAD SUBVERSIVA DETECTADA.", 160, 166, C.red, t, 5.0, 24, { align: "center" });
      c.vignette(0.5);
    } else if (t < 14.8) {
      // carpeta sobre el escritorio
      c.clear(C.ink2);
      c.rect(0, 150, W, 30, C.brownDark);
      const open = clamp((t - 8.4) / 0.5, 0, 1);
      c.rect(40, 20, 240, 130, C.khaki);
      c.frame(40, 20, 240, 130, C.oliveDark, 2);
      c.text("EXPEDIENTE  INSPECTOR  CABINA 1", 160, 26, C.brownDark, { align: "center" });
      // solapa
      c.rect(40, 20, Math.round(120 * (1 - open)), 130, C.oliveMid);
      if (open === 1) {
        // 1) nota con estrella
        if (t > 8.9) { c.rect(56, 44, 60, 44, C.cream); c.frame(56, 44, 60, 44, C.brownDark, 1); star(c, 86, 60, C.ink); c.text("DÍA 3", 86, 74, C.brownDark, { align: "center" }); }
        // 2) foto en la parada
        if (t > 9.9) {
          c.rect(128, 44, 64, 44, C.cream); c.frame(128, 44, 64, 44, C.brownDark, 1);
          c.rect(132, 48, 56, 32, C.ink2);
          figure(c, 150, 80, 22, C.black); figure(c, 168, 80, 26, C.black, { coat: true });
          c.rect(160, 58, 10, 1, C.black); // sombrero
          c.text("TRANVÍA", 160, 82, C.brownDark, { align: "center" });
        }
        // 3) declaración firmada
        if (t > 10.9) {
          c.rect(204, 44, 62, 44, C.cream); c.frame(204, 44, 62, 44, C.brownDark, 1);
          c.text("DECLARA-", 235, 48, C.brownDark, { align: "center" }); c.text("CIÓN", 235, 58, C.brownDark, { align: "center" });
          for (let yy = 68; yy < 84; yy += 3) c.dither(208, yy, 54, 1, C.oliveMid, 0.8, yy);
          c.rect(230, 82, 24, 1, C.ink);
        }
        typed(c, "USTED NO INFORMÓ NADA.", 160, 104, C.brownDark, t, 11.6, 22, { align: "center" });
        typed(c, "EN ARSTOTZKA, CALLAR ES COLABORAR.", 160, 118, C.redDark, t, 12.6, 26, { align: "center" });
      }
      if (t < 8.6) c.fade(C.black, 1 - (t - 8.2) / 0.4);
      // rejas bajan
      const bars = span(t, 13.6, 14.3);
      const by = bars != null ? Math.round(lerp(-H, 0, easeIn(bars))) : (t >= 14.3 ? 0 : -H);
      if (by > -H) {
        for (let x = 8; x < W; x += 22) { c.rect(x, by, 6, H, C.ink); c.rect(x + 1, by, 1, H, C.ink2); }
        c.rect(0, by + 40, W, 5, C.ink); c.rect(0, by + 130, W, 5, C.ink);
      }
    }

    if (t > 14.8) c.fade(C.black, clamp((t - 14.8) / 0.6, 0, 1));
    endCard(c, t, 15.5, 6, this.title);
  },
  audio(m) {
    m.drone(2.2, 12.5, 48, 0.12);
    m.beep(2.4, 700, 0.35, 0.22); m.beep(2.85, 700, 0.35, 0.22);
    m.footsteps(3.1, 10, 0.46, 0.4);
    m.tick(2.5, 20, 0.05, 0.06); m.tick(3.6, 22, 0.05, 0.06);
    m.paper(8.4, 0.5); m.paper(8.9, 0.35); m.paper(9.9, 0.35); m.paper(10.9, 0.35);
    m.tick(11.6, 22, 0.045, 0.08); m.tick(12.6, 32, 0.04, 0.08);
    m.heartbeat(12.4, 2, 70, 0.4);
    m.bars(14.2, 0.9);
    m.stamp(16.4);
  }
};

/* ===================================================================== */
/*  FINAL 7 — Huir a Obristán solo, sin familia                            */
/* ===================================================================== */

const final7 = {
  n: 7, id: "final7", duration: 20.5, good: false,
  title: ["HUIR A OBRISTÁN", "SOLO, SIN FAMILIA"],
  draw(c, t) {
    if (titleCard(c, t, 0, 2.2, "DÍA 10", "06:00 — CABINA 2")) return;

    if (t < 6.4) {
      // pasaporte sobre el mostrador
      c.clear(C.oliveDark);
      c.dither(0, 0, W, 100, C.olive, 0.12, 6);
      c.frame(0, 0, W, 100, C.black, 6);
      c.rect(0, 96, W, 84, C.khaki);
      c.rect(0, 96, W, 3, C.oliveDark);
      const slide = clamp((t - 2.5) / 0.6, 0, 1);
      const px = Math.round(lerp(-90, 110, easeOut(slide)));
      c.rect(px, 106, 100, 64, C.blue);
      c.frame(px, 106, 100, 64, C.blueDark, 2);
      c.text("OBRISTÁN", px + 50, 116, C.cream, { align: "center" });
      c.rect(px + 8, 128, 30, 34, C.ink2); // foto: silueta sin rostro
      figure(c, px + 23, 162, 26, C.black, { arms: false });
      c.frame(px + 8, 128, 30, 34, C.blueDark, 1);
      c.text("PASAPORTE", px + 44, 132, C.cream);
      c.rect(px + 44, 142, 48, 1, C.cream); c.rect(px + 44, 150, 40, 1, C.cream); c.rect(px + 44, 158, 44, 1, C.cream);
      stamp(c, t, 4.2, px + 40, 146, 58, 20, C.green, ["APROBADO"], { scale: 1 });
      typed(c, "UN INSPECTOR NUEVO TE MIRA DOS SEGUNDOS.", 160, 70, C.cream, t, 3.0, 30, { align: "center" });
      if (t > 5.2) c.text("Y SELLA.", 160, 84, C.khaki, { align: "center" });
    } else {
      // ruta al norte
      const dark = clamp((t - 9) / 8, 0, 0.8);
      c.clear(mix(C.blueDark, C.black, dark));
      c.dither(0, 0, W, 90, C.ink2, 0.3, 8);
      c.rect(0, 92, W, 88, mix(C.khaki, C.oliveDark, dark * 0.6));
      c.rect(0, 92, W, 2, C.cream);
      // muro que queda atrás (izquierda) y se aleja
      const wx = Math.round(lerp(0, -140, clamp((t - 6.4) / 9, 0, 1)));
      wall(c, wx, 60, 130, 34);
      // figura caminando, achicándose
      const p = clamp((t - 6.4) / 9.5, 0, 1);
      const fx = Math.round(lerp(60, 292, easeOut(p)));
      const fh = Math.round(lerp(44, 6, p));
      const fy = Math.round(lerp(150, 100, p));
      figure(c, fx, fy, fh, C.ink, { coat: true, walk: p < 1 ? t * 2 : null });
      // huellas
      for (let k = 0; k < 40; k++) {
        const kp = k / 40;
        if (kp < p) { const hx = Math.round(lerp(60, 292, easeOut(kp))); const hy = Math.round(lerp(150, 100, kp)); if (kp < 0.85) c.px(hx - 2 + (k % 2) * 4, hy + 1, C.oliveDark); }
      }
      snow(c, t, 120, C.cream, { x: 0, y: 0, w: W, h: 175 }, 26);
      typed(c, "DIEZ DÍAS A PIE HASTA OBRISTÁN.", 160, 20, C.cream, t, 8.6, 20, { align: "center" });
      typed(c, "NUNCA VOLVÉS A ARSTOTZKA.", 160, 34, C.khaki, t, 11.4, 20, { align: "center" });
      if (t > 14.6) c.text("SOLO.", 160, 60, C.cream, { align: "center", scale: 2 });
      c.vignette(0.35);
      if (t < 6.8) c.fade(C.black, 1 - (t - 6.4) / 0.4);
    }

    if (t > 17.4) c.fade(C.black, clamp((t - 17.4) / 0.8, 0, 1));
    endCard(c, t, 18.4, 7, this.title, false, "HUIDA");
  },
  audio(m) {
    m.drone(2.2, 4.4, 60, 0.07);
    m.paper(2.6, 0.45);
    m.tick(3.0, 40, 0.04, 0.06);
    m.stamp(4.2, 0.9);
    m.wind(6.2, 12.4, 0.32);
    for (let i = 0; i < 16; i++) m.knock(6.6 + i * 0.55, 0.3 * (1 - i / 18), 65);
    m.drone(9, 9, 41, 0.1, 3, 2);
    m.tick(8.6, 30, 0.05, 0.06); m.tick(11.4, 26, 0.05, 0.06);
    m.stamp(19.3);
  }
};

module.exports = [final1, final2, final3, final4, final5, final6, final7];
