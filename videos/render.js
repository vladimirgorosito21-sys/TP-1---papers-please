/* =====================================================================
   Renderiza los videos de los finales.

     node render.js                 -> todos los finales a videos/out/*.mp4
     node render.js final1 final4   -> solo esos
     node render.js final1 --preview 3,8,12 --out /tmp/x
                                    -> PNGs de esos segundos (sin video)

   Requiere ffmpeg en el PATH. Salida: 1920x1080, 30 fps, H.264 + AAC.
   ===================================================================== */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { W, H, FPS, Canvas } = require("./engine");
const { Mixer } = require("./sfx");
const SCENES = require("./scenes");

const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const ids = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
const preview = flag("--preview");
const outDir = flag("--out") || path.join(__dirname, "out");
const scale = Number(flag("--scale") || 6);

const scenes = ids.length ? SCENES.filter((s) => ids.includes(s.id)) : SCENES;
if (!scenes.length) { console.error("No hay escenas para esos ids:", ids); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });

function renderPreviews(scene) {
  const c = new Canvas();
  preview.split(",").map(Number).forEach((t) => {
    c.clear([0, 0, 0]);
    scene.draw(c, t);
    const file = path.join(outDir, `${scene.id}_${t.toFixed(1)}s.png`);
    fs.writeFileSync(file, c.toPNG());
    console.log("preview", file);
  });
}

function renderVideo(scene) {
  return new Promise((resolve, reject) => {
    const wav = path.join(outDir, scene.id + ".wav");
    const mp4 = path.join(outDir, scene.id + ".mp4");

    // audio
    const m = new Mixer(scene.duration);
    scene.audio(m);
    fs.writeFileSync(wav, m.toWav());

    // video
    const ff = spawn("ffmpeg", [
      "-y", "-loglevel", "error",
      "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${W}x${H}`, "-r", String(FPS), "-i", "pipe:0",
      "-i", wav,
      "-vf", `scale=${W * scale}:${H * scale}:flags=neighbor`,
      "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
      "-c:a", "aac", "-b:a", "160k",
      "-movflags", "+faststart", "-shortest",
      mp4
    ], { stdio: ["pipe", "inherit", "inherit"] });

    ff.on("error", reject);
    ff.on("close", (code) => {
      fs.unlinkSync(wav);
      if (code === 0) { console.log("ok", mp4); resolve(); }
      else reject(new Error("ffmpeg salió con código " + code));
    });

    const c = new Canvas();
    const total = Math.round(scene.duration * FPS);
    let f = 0;
    const pump = () => {
      let ok = true;
      while (f < total && ok) {
        c.clear([0, 0, 0]);
        scene.draw(c, f / FPS);
        c.scanlines(0.08);
        ok = ff.stdin.write(Buffer.from(c.buf));
        f++;
      }
      if (f < total) ff.stdin.once("drain", pump);
      else ff.stdin.end();
    };
    pump();
  });
}

(async () => {
  for (const scene of scenes) {
    if (preview) renderPreviews(scene);
    else await renderVideo(scene);
  }
})().catch((e) => { console.error(e); process.exit(1); });
