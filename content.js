// Injeta um <style> que escala e estiliza as legendas de acordo com as configurações salvas.

const DEFAULTS = {
  enabled: true,
  scale: 1.5,
  offset: 0,
  textColor: "", // "" = cor original do site
  outlineColor: "#000000",
  outlineWidth: 0, // px; 0 = sem borda
  hideBackground: false,
};
const STYLE_ID = "subtitle-styler-style";

// Containers de legenda conhecidos. Escalamos o container com transform para
// não brigar com os font-size inline que cada player define.
const CONTAINERS = [
  // Netflix
  ".player-timedtext-text-container",
  // YouTube
  ".ytp-caption-window-container .caption-window",
  // Prime Video
  ".atvwebplayersdk-captions-text",
  // Disney+
  ".dss-subtitle-renderer-cue-window",
  ".hive-subtitle-renderer-cue-positioning-box",
  // Max / HBO
  "[data-testid='CueBoxContainer']",
  // Paramount+ / Pluto / outros com classes comuns
  ".aa-captions-text",
  // Players genéricos (Globoplay, Crunchyroll web, sites com video.js, Shaka, JW, Bitmovin, Plyr...)
  ".vjs-text-track-display > div > div",
  ".shaka-text-container > *",
  ".jw-text-track-container",
  ".bmpui-ui-subtitle-overlay .bmpui-ui-subtitle-label",
  ".plyr__captions",
];

// Contorno feito com text-shadow em 16 direções: funciona em qualquer elemento,
// inclusive em ::cue, e fica uniforme em volta da letra.
function outlineShadow(width, color) {
  const shadows = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * 2 * Math.PI;
    const x = (Math.cos(angle) * width).toFixed(2);
    const y = (Math.sin(angle) * width).toFixed(2);
    shadows.push(`${x}px ${y}px 0 ${color}`);
  }
  return shadows.join(", ");
}

function buildCss({ enabled, scale, offset, textColor, outlineColor, outlineWidth, hideBackground }) {
  if (!enabled) return "";
  const transform = `translateY(${-offset}vh) scale(${scale})`;

  // Os players colocam cor e sombra inline nos <span> internos, então
  // as regras de texto valem para o container e todos os descendentes.
  const textRules = [];
  if (textColor) textRules.push(`color: ${textColor} !important;`);
  if (outlineWidth > 0) textRules.push(`text-shadow: ${outlineShadow(outlineWidth, outlineColor)} !important;`);
  if (hideBackground) textRules.push("background: transparent !important;");

  const containers = CONTAINERS.join(",\n    ");
  const allText = CONTAINERS.flatMap((s) => [s, `${s} *`]).join(",\n    ");

  return `
    ${containers} {
      transform: ${transform} !important;
      transform-origin: center bottom !important;
    }
    ${textRules.length ? `${allText} {\n      ${textRules.join("\n      ")}\n    }` : ""}
    /* Legendas nativas do <video> (WebVTT) */
    video::cue {
      font-size: ${Math.round(scale * 100)}% !important;
      ${textRules.join("\n      ")}
    }
  `;
}

function apply(settings) {
  let style = document.getElementById(STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = STYLE_ID;
    (document.head || document.documentElement).appendChild(style);
  }
  style.textContent = buildCss(settings);
}

let current = { ...DEFAULTS };

chrome.storage.sync.get(DEFAULTS, (settings) => {
  current = settings;
  apply(current);
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  for (const [key, { newValue }] of Object.entries(changes)) current[key] = newValue;
  apply(current);
});

// Alguns players (SPA) trocam o <head>; garante que o estilo continue lá.
new MutationObserver(() => {
  if (!document.getElementById(STYLE_ID)) apply(current);
}).observe(document.documentElement, { childList: true, subtree: true });
