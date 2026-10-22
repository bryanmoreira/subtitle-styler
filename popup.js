const DEFAULTS = {
  enabled: true,
  scale: 1.5,
  offset: 0,
  textColor: "",
  outlineColor: "#000000",
  outlineWidth: 0,
  hideBackground: false,
};

const STYLES = {
  original: { textColor: "", outlineWidth: 0, hideBackground: false },
  yellow: { textColor: "#ffeb3b", outlineColor: "#000000", outlineWidth: 2, hideBackground: true },
  white: { textColor: "#ffffff", outlineColor: "#000000", outlineWidth: 2, hideBackground: true },
};

const $ = (id) => document.getElementById(id);
const enabled = $("enabled");
const scale = $("scale");
const offset = $("offset");
const presets = document.querySelectorAll(".presets button");
const customColor = $("customColor");
const textColor = $("textColor");
const outlineWidth = $("outlineWidth");
const outlineColor = $("outlineColor");
const hideBackground = $("hideBackground");
const textSwatches = $("textSwatches");
const outlineSwatches = $("outlineSwatches");

// Guarda a última cor escolhida para reaplicar ao marcar "Personalizar" de novo.
let lastTextColor = "#ffeb3b";

function markSwatch(container, color) {
  let found = false;
  container.querySelectorAll("button").forEach((b) => {
    const active = b.dataset.color === color;
    found ||= active;
    b.classList.toggle("active", active);
  });
  // Cor fora da paleta: destaca o seletor livre.
  container.querySelector(".picker").classList.toggle("active", Boolean(color) && !found);
}

// Mesmo contorno usado no content.js, para a prévia bater com o vídeo.
function outlineShadow(width, color) {
  const shadows = [];
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * 2 * Math.PI;
    shadows.push(`${(Math.cos(angle) * width).toFixed(2)}px ${(Math.sin(angle) * width).toFixed(2)}px 0 ${color}`);
  }
  return shadows.join(", ");
}

// Pinta a parte "cheia" do slider até o valor atual.
function paintRange(input) {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty("--fill", `${pct}%`);
}

function renderPreview(settings) {
  const text = $("previewText");
  const preview = $("preview");
  text.style.fontSize = `${Math.min(34, 12 * settings.scale)}px`;
  text.style.color = settings.textColor || "#fff";
  text.style.textShadow = settings.outlineWidth > 0 ? outlineShadow(settings.outlineWidth * 0.6, settings.outlineColor) : "none";
  text.style.background = settings.hideBackground ? "transparent" : "rgba(0, 0, 0, 0.75)";
  text.style.transform = `translateY(${-(settings.offset / 100) * preview.clientHeight}px)`;
}

function render(settings) {
  const pct = Math.round(settings.scale * 100);
  enabled.checked = settings.enabled;
  scale.value = pct;
  offset.value = settings.offset;
  $("scaleValue").textContent = `${pct}%`;
  $("offsetValue").textContent = settings.offset > 0 ? `+${settings.offset}` : "Padrão";
  document.body.classList.toggle("disabled", !settings.enabled);
  presets.forEach((b) => b.classList.toggle("active", Number(b.dataset.scale) === pct));

  customColor.checked = Boolean(settings.textColor);
  textSwatches.classList.toggle("off", !settings.textColor);
  if (settings.textColor) {
    lastTextColor = settings.textColor;
    textColor.value = settings.textColor;
  }
  markSwatch(textSwatches, settings.textColor);

  outlineWidth.value = settings.outlineWidth;
  outlineColor.value = settings.outlineColor;
  $("outlineValue").textContent = settings.outlineWidth > 0 ? `${settings.outlineWidth}px` : "Sem borda";
  markSwatch(outlineSwatches, settings.outlineColor);
  hideBackground.checked = settings.hideBackground;

  document.querySelectorAll(".styles button").forEach((b) => {
    const style = STYLES[b.dataset.style];
    const matches = style.textColor === settings.textColor &&
      style.outlineWidth === settings.outlineWidth &&
      style.hideBackground === settings.hideBackground &&
      (!style.outlineColor || style.outlineColor === settings.outlineColor);
    b.classList.toggle("active", matches);
  });

  [scale, offset, outlineWidth].forEach(paintRange);
  renderPreview(settings);
}

let state = { ...DEFAULTS };

function save(patch) {
  state = { ...state, ...patch };
  render(state);
  chrome.storage.sync.set(patch);
}

function setScalePct(pct) {
  pct = Math.min(Number(scale.max), Math.max(Number(scale.min), pct));
  save({ scale: pct / 100 });
}

chrome.storage.sync.get(DEFAULTS, (settings) => {
  state = settings;
  render(state);
});

enabled.addEventListener("change", () => save({ enabled: enabled.checked }));
scale.addEventListener("input", () => setScalePct(Number(scale.value)));
offset.addEventListener("input", () => save({ offset: Number(offset.value) }));
$("minus").addEventListener("click", () => setScalePct(Number(scale.value) - 10));
$("plus").addEventListener("click", () => setScalePct(Number(scale.value) + 10));
presets.forEach((b) => b.addEventListener("click", () => setScalePct(Number(b.dataset.scale))));

document.querySelectorAll(".styles button").forEach((b) =>
  b.addEventListener("click", () => save(STYLES[b.dataset.style]))
);

customColor.addEventListener("change", () => save({ textColor: customColor.checked ? lastTextColor : "" }));
textSwatches.querySelectorAll("button").forEach((b) =>
  b.addEventListener("click", () => save({ textColor: b.dataset.color }))
);
textColor.addEventListener("input", () => save({ textColor: textColor.value }));

// Escolher uma cor de borda com a borda zerada liga a borda automaticamente.
function setOutlineColor(color) {
  save({ outlineColor: color, outlineWidth: state.outlineWidth || 2 });
}
outlineWidth.addEventListener("input", () => save({ outlineWidth: Number(outlineWidth.value) }));
outlineSwatches.querySelectorAll("button").forEach((b) =>
  b.addEventListener("click", () => setOutlineColor(b.dataset.color))
);
outlineColor.addEventListener("input", () => setOutlineColor(outlineColor.value));
hideBackground.addEventListener("change", () => save({ hideBackground: hideBackground.checked }));

$("reset").addEventListener("click", () => save({ ...DEFAULTS }));
