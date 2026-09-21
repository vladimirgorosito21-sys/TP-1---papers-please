# Videos de los finales

Animaciones pixel-art generadas por código (sin imágenes externas, sin rostros),
con la misma paleta y fuente del sitio. Salida: `out/finalN.mp4`, 1920x1080,
30 fps, H.264 + AAC, ~20 s cada uno.

## Regenerar

Requiere Node y `ffmpeg` en el PATH.

    node render.js                # los siete
    node render.js final3         # uno solo
    node render.js final3 --preview 4,8,12 --out /tmp/prev   # PNGs de esos segundos

## Archivos

- `engine.js` — buffer de píxeles, primitivas, figuras (siluetas), sellos, tarjetas.
- `font.js`   — fuente pixel 5x7 con acentos.
- `sfx.js`    — efectos de sonido sintetizados (golpes, sello, viento, sirena, etc.).
- `scenes.js` — guion y timeline de cada final (`draw(c, t)` y `audio(m)`).
- `render.js` — CLI: renderiza frames → ffmpeg.

## Conectar con el sitio

En `story.js`, cada final tiene un campo `video`. Acepta:

- una ruta local: `"videos/out/final1.mp4"` (se usa `<video>`), o
- un ID de YouTube de 11 caracteres: `"dQw4w9WgXcQ"` (se usa `<iframe>` de youtube-nocookie).

Para la entrega: subir los MP4 a YouTube (como "no listados" alcanza),
copiar el ID de cada URL (`youtube.com/watch?v=<ID>`) y reemplazar la ruta.
