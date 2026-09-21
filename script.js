/* =====================================================================
   PAPERS, PLEASE — Motor de la historia
   ---------------------------------------------------------------------
   Lee STORY (story.js) y dibuja un pasaje por vez. Maneja el estado del
   inspector (día, créditos), el historial para "Volver", los finales
   descubiertos (persisten en localStorage) y el modal de contexto.
   ===================================================================== */

(function () {
  "use strict";

  const P = STORY.passages;
  Object.keys(P).forEach((id) => { P[id].id = id; });
  const LS_KEY = "papers-please-endings";

  const TYPE_LABEL = {
    inicio: "Inicio",
    situacion: "Situación",
    final: "Final",
    info: "Contexto"
  };

  /* Texto de la fundamentación (botón de la barra lateral) */
  const ABOUT = {
    title: "Fundamentación",
    text: [
      "<em>Papers, Please</em>, de 2013, es un videojuego de simulación y gestión en el que interpretás a un inspector de inmigración de un país ficticio: Arstotzka. Tu trabajo consiste en revisar pasaportes y documentos para decidir quién puede entrar y quién no.",
      "Nos ponemos en los zapatos de un ciudadano de este país autoritario, más precisamente de la región de Grestín Oriental. Deberás ganar dinero en la aduana para poder mantener a tu familia.",
      "El juego original tiene veinte finales, uno solo bueno. Esta versión resume esa estructura en siete.",
      "La historia es de una simpleza grandísima, pero el contexto en donde nos sitúa lo hace un juego de un realismo exacerbado, aun siendo pixel art. Tiene un contexto social y geopolítico ficticio muy candente que recuerda al conflicto del muro de Berlín o a los conflictos armados en los Balcanes de los 80/90.",
      "Tiene una gran diversidad de países, provincias y regiones que el jugador va aprendiendo para poder jugar mejor, las cuales el autor no desarrolla demasiado. Lo que busca este proyecto es contribuir expandiendo la historia de esa geografía ficticia: <strong>todo lo marcado en azul es contexto inventado</strong>."
    ]
  };

  /* ------------------------------------------------------------ */
  /*  Estado                                                       */
  /* ------------------------------------------------------------ */

  const state = {
    current: null,
    history: [],      // snapshots para "Volver": { id, day, credits }
    trail: [],        // ids visitados en este recorrido (para la barra lateral)
    day: 0,
    credits: 0,
    endings: loadEndings()
  };

  function loadEndings() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function saveEndings() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state.endings));
    } catch (e) { /* modo privado o storage bloqueado: seguimos sin guardar */ }
  }

  /* ------------------------------------------------------------ */
  /*  Referencias al DOM                                           */
  /* ------------------------------------------------------------ */

  const $ = (sel) => document.querySelector(sel);

  const els = {
    passage:  $("#passage"),
    back:     $("#btn-back"),
    reset:    $("#btn-reset"),
    about:    $("#btn-about"),
    newGame:  $("#btn-new-game"),
    day:      $("#stat-day"),
    credits:  $("#stat-credits"),
    endings:  $("#stat-endings"),
    endList:  $("#endings"),
    trail:    $("#trail"),
    modal:    $("#modal"),
    modalTag: $("#modal-tag"),
    modalTitle: $("#modal-title"),
    modalBody:  $("#modal-body")
  };

  /* ------------------------------------------------------------ */
  /*  Navegación                                                   */
  /* ------------------------------------------------------------ */

  function go(id) {
    const p = P[id];
    if (!p) {
      console.warn("Pasaje inexistente:", id);
      return;
    }

    if (state.current) {
      state.history.push({ id: state.current, day: state.day, credits: state.credits });
    }

    state.current = id;
    state.trail.push(id);
    if (typeof p.day === "number") state.day = p.day;
    if (typeof p.credits === "number") state.credits += p.credits;

    if (p.type === "final" && !state.endings.includes(p.final.n)) {
      state.endings.push(p.final.n);
      saveEndings();
    }

    render(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    const prev = state.history.pop();
    if (!prev) return;
    state.current = prev.id;
    state.day = prev.day;
    state.credits = prev.credits;
    state.trail.pop();
    render(P[prev.id]);
  }

  /* Retrocede hasta la última pantalla con más de una opción, salteando
     los pasajes lineales: evita el bucle "final -> pasaje de una sola
     opción -> mismo final". */
  function backToDecision() {
    const idx = lastDecisionIndex();
    if (idx < 0) return;
    const target = state.history[idx];
    state.history.length = idx;
    state.trail.length = idx + 1;
    state.current = target.id;
    state.day = target.day;
    state.credits = target.credits;
    render(P[target.id]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function lastDecisionIndex() {
    for (let i = state.history.length - 1; i >= 0; i--) {
      const p = P[state.history[i].id];
      if (p.choices && p.choices.length > 1) return i;
    }
    return -1;
  }

  /* Nueva partida: borra los finales descubiertos (memoria) y reinicia.
     Pide confirmación con un segundo clic dentro de los 4 segundos. */
  let confirmTimer = null;

  function newGame() {
    const btn = els.newGame;
    if (!btn.classList.contains("is-confirming")) {
      btn.classList.add("is-confirming");
      btn.textContent = "¿Borrar finales?";
      confirmTimer = setTimeout(cancelNewGame, 4000);
      return;
    }
    cancelNewGame();
    state.endings = [];
    try { localStorage.removeItem(LS_KEY); } catch (e) { /* sin storage */ }
    restart();
  }

  function cancelNewGame() {
    clearTimeout(confirmTimer);
    els.newGame.classList.remove("is-confirming");
    els.newGame.textContent = "Nueva partida";
  }

  function restart() {
    state.current = null;
    state.history = [];
    state.trail = [];
    state.day = 0;
    state.credits = 0;
    go(STORY.start);
  }

  /* ------------------------------------------------------------ */
  /*  Render del pasaje                                            */
  /* ------------------------------------------------------------ */

  function render(p) {
    const doc = els.passage;
    doc.className = "doc doc--" + p.type + (p.type === "final" && p.final.good ? " doc--good" : "");

    // Reinicia la animación de entrada
    doc.style.animation = "none";
    void doc.offsetHeight; // fuerza reflow
    doc.style.animation = "";

    const headLabel = p.type === "final"
      ? "Final #" + p.final.n + (p.final.good ? " · Buen final" : "")
      : TYPE_LABEL[p.type];

    const num = String(state.trail.length).padStart(3, "0");

    let html = "";
    html += '<header class="doc__head">'
         +    '<span class="doc__tag">' + headLabel + "</span>"
         +    '<span class="doc__num">Expediente Nº ' + num + "</span>"
         +  "</header>";
    html += '<h2 class="doc__title">' + p.title + "</h2>";
    html += '<div class="doc__body">' + renderParagraphs(p.text) + "</div>";

    // Contexto (azul): abre un expediente sin salir del pasaje
    if (p.info && p.info.length) {
      html += '<section class="doc__section doc__section--info">'
           +    '<h3 class="doc__section-title">Info para leer</h3>'
           +    '<div class="choice-list">';
      p.info.forEach((infoId) => {
        const info = P[infoId];
        if (!info) return;
        html += '<button class="btn btn--blue" type="button" data-info="' + infoId + '">'
             +    "◆ " + info.title
             +  "</button>";
      });
      html += "</div></section>";
    }

    // Decisiones (verde)
    if (p.choices && p.choices.length) {
      html += '<section class="doc__section doc__section--choices">'
           +    '<h3 class="doc__section-title">' + (p.choices.length > 1 ? "Decisión" : "Continuar") + "</h3>"
           +    '<div class="choice-list">';
      p.choices.forEach((c, i) => {
        html += '<button class="btn btn--olive" type="button" data-to="' + c.to + '" data-key="' + (i + 1) + '">'
             +    '<span class="key">' + (i + 1) + "</span>"
             +    "<span>" + c.label + "</span>"
             +  "</button>";
      });
      html += "</div></section>";
    }

    // Final (rojo): sello + video + acciones
    if (p.type === "final") {
      html += renderVideo(p.video, p);
      html += '<div class="stamp' + (p.final.good ? " stamp--good" : "") + '">'
           +    "Final #" + p.final.n
           +    "<small>" + (p.final.good ? "Good ending" : "Denegado") + "</small>"
           +  "</div>";
      html += '<div class="doc__final-actions">'
           +    '<button class="btn btn--red" type="button" data-restart>Volver a empezar</button>'
           +    (lastDecisionIndex() >= 0
                  ? '<button class="btn btn--brown" type="button" data-retry>Probar otra decisión</button>'
                  : "")
           +  "</div>";
    }

    doc.innerHTML = html;

    // si el MP4 local no existe, se muestra el enlace a YouTube
    const localVideo = doc.querySelector(".video video");
    if (localVideo) {
      localVideo.addEventListener("error", () => localVideo.closest(".video").classList.add("is-broken"));
      // si el navegador bloquea el autoplay con sonido, arranca silenciado
      const tryPlay = localVideo.play();
      if (tryPlay && tryPlay.catch) tryPlay.catch(() => { localVideo.muted = true; localVideo.play().catch(() => {}); });
    }

    els.back.disabled = state.history.length === 0;
    renderStats();
    renderEndings();
    renderTrail();
  }

  /* Video del final: ID de YouTube -> iframe; ruta .mp4 -> <video> local.
     YouTube rechaza embeds sin referer HTTP (error 153), así que si la página
     se abre como archivo (file://) se usa el MP4 local si lo hay, y si no,
     un enlace para verlo en YouTube. */
  function renderVideo(src, p) {
    if (!src) return "";
    const isYouTube = /^[\w-]{11}$/.test(src);
    let inner;
    if (isYouTube && location.protocol === "file:") {
      const local = p.localVideo || ("videos/out/" + p.id + ".mp4");
      inner = '<video src="' + local + '" controls autoplay preload="auto" playsinline></video>'
            + '<a class="video__fallback btn btn--red" href="https://youtu.be/' + src + '" target="_blank" rel="noopener">Ver en YouTube</a>';
    } else if (isYouTube) {
      inner = '<iframe src="https://www.youtube-nocookie.com/embed/' + src + '?autoplay=1&rel=0&modestbranding=1" '
            + 'title="Video del final" referrerpolicy="strict-origin-when-cross-origin" '
            + 'allow="autoplay; accelerometer; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    } else {
      inner = '<video src="' + src + '" controls autoplay preload="auto" playsinline></video>';
    }
    return '<section class="doc__section doc__section--video">'
         +   '<h3 class="doc__section-title">Escena final</h3>'
         +   '<div class="video">' + inner + "</div>"
         + "</section>";
  }

  /* Los párrafos que arrancan con <q> se muestran como cita (cartas, notas) */
  function renderParagraphs(list) {
    return list.map((t) => {
      if (t.startsWith("<q>")) {
        return "<blockquote>" + t.replace(/^<q>|<\/q>$/g, "") + "</blockquote>";
      }
      return "<p>" + t + "</p>";
    }).join("");
  }

  /* ------------------------------------------------------------ */
  /*  Barra de estado y lateral                                     */
  /* ------------------------------------------------------------ */

  function renderStats() {
    els.day.textContent = state.day > 0 ? String(state.day).padStart(2, "0") : "—";
    els.credits.textContent = state.credits;
    els.credits.classList.toggle("is-negative", state.credits < 0);
    els.endings.textContent = state.endings.length + "/" + STORY.totalEndings;
  }

  function renderEndings() {
    let html = "";
    for (let n = 1; n <= STORY.totalEndings; n++) {
      const found = state.endings.includes(n);
      const good = isGoodEnding(n);
      const cls = (found ? "is-found" : "") + (found && good ? " is-good" : "");
      const label = found ? "Final #" + n + " descubierto" : "Final #" + n + " sin descubrir";
      html += '<li class="' + cls.trim() + '" title="' + label + '">' + (found ? n : "?") + "</li>";
    }
    els.endList.innerHTML = html;
    els.newGame.disabled = state.endings.length === 0;
  }

  function isGoodEnding(n) {
    return Object.values(P).some((p) => p.type === "final" && p.final.n === n && p.final.good);
  }

  function renderTrail() {
    els.trail.innerHTML = state.trail.map((id, i) => {
      const p = P[id];
      const cls = [
        i === state.trail.length - 1 ? "is-current" : "",
        p.type === "final" ? "is-final" : ""
      ].join(" ").trim();
      return '<li class="' + cls + '">' + shortTitle(p) + "</li>";
    }).join("");
    els.trail.scrollTop = els.trail.scrollHeight;
  }

  function shortTitle(p) {
    // "Día 5.1 en la aduana de Grestín Oriental" -> "Día 5.1"
    const m = p.title.match(/^(Día [\d.]+)/);
    if (m) return m[1];
    return p.title.length > 34 ? p.title.slice(0, 32) + "…" : p.title;
  }

  /* ------------------------------------------------------------ */
  /*  Modal                                                         */
  /* ------------------------------------------------------------ */

  function openModal({ tag, title, text, variant }) {
    els.modal.className = "modal" + (variant ? " modal--" + variant : "");
    els.modalTag.textContent = tag;
    els.modalTitle.textContent = title;
    els.modalBody.innerHTML = renderParagraphs(text);
    els.modal.hidden = false;
    els.modal.querySelector(".modal__box").scrollTop = 0;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    els.modal.hidden = true;
    document.body.style.overflow = "";
  }

  function openInfo(id) {
    const info = P[id];
    if (!info) return;
    openModal({ tag: "Info para leer / contexto", title: info.title, text: info.text });
  }

  /* ------------------------------------------------------------ */
  /*  Eventos                                                       */
  /* ------------------------------------------------------------ */

  els.passage.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    if (btn.dataset.to)               go(btn.dataset.to);
    else if (btn.dataset.info)        openInfo(btn.dataset.info);
    else if ("restart" in btn.dataset) restart();
    else if ("retry" in btn.dataset)   backToDecision();
  });

  els.back.addEventListener("click", back);
  els.reset.addEventListener("click", restart);
  els.newGame.addEventListener("click", newGame);
  els.about.addEventListener("click", () => {
    openModal({ tag: "Sobre este proyecto", title: ABOUT.title, text: ABOUT.text, variant: "about" });
  });

  els.modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.modal.hidden) {
      closeModal();
      return;
    }
    if (!els.modal.hidden) return;
    if (e.key >= "1" && e.key <= "9") {
      const btn = els.passage.querySelector('[data-key="' + e.key + '"]');
      if (btn) btn.click();
    }
  });

  /* ------------------------------------------------------------ */
  /*  Arranque                                                      */
  /* ------------------------------------------------------------ */

  // ?p=<id> permite abrir un pasaje directo (útil mientras se edita la historia)
  const requested = new URLSearchParams(location.search).get("p");
  go(requested && P[requested] ? requested : STORY.start);
})();
