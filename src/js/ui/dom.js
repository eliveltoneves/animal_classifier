export const els = {
  pool: document.getElementById("pool"),
  buckets: document.getElementById("buckets"),
  progressText: document.getElementById("progressText"),
  progressBar: document.getElementById("progressBar"),
  correctCount: document.getElementById("correctCount"),
  attemptsCount: document.getElementById("attemptsCount"),
  streakCount: document.getElementById("streakCount"),
  itemsRemainingBadge: document.getElementById("itemsRemainingBadge"),
  shuffleBtn: document.getElementById("shuffleBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

export function makeItemCard(item) {
  // <div> (não <button>) para evitar conflitos com DnD
  const card = document.createElement("div");
  card.setAttribute("role", "button");    // acessibilidade
  card.setAttribute("tabindex", "0");     // foco via teclado
  // Importante: NÃO usar draggable nativo
  // card.draggable = false;
  card.dataset.id = item.id;

  card.className =
    "item-card group w-full bg-white text-slate-900 transition border text-left p-3 flex items-center gap-2 select-none";
  card.style.cursor = "grab";
  card.style.touchAction = "none"; // evita scroll durante o arraste custom

  card.innerHTML = `
    <span class="text-2xl">${item.emoji}</span>
    <div class="flex-1">
      <div class="font-extrabold leading-tight">${item.nome}</div>
      <div class="text-xs hint">Arraste ou toque</div>
    </div>
    <span class="opacity-0 group-hover:opacity-100 transition">↗</span>
  `;
  return card;
}

export function makeBucket({ name, icon, color }) {
  const wrapper = document.createElement("div");
  wrapper.dataset.bucket = name;
  wrapper.className = `bucket bucket-card bg-gradient-to-b ${color}`;
  wrapper.style.touchAction = "none"; // ajuda no mobile

  wrapper.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-2xl">${icon}</span>
        <h3 class="text-xl font-extrabold">${name}</h3>
      </div>
      <span class="text-xs pill">Solte aqui</span>
    </div>
    <div class="bucket-drop">
      <div class="bucket-items grid grid-cols-1 gap-2"></div>
    </div>
  `;
  return wrapper;
}
