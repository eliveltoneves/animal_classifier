import { els, makeItemCard, makeBucket } from "../ui/dom.js";
import { state } from "./state.js";
import { wireDragEvents, wireDropZone, setSelected, clearSelected } from "./dragdrop.js";
import { showToast } from "../ui/toast.js";
import { celebrate } from "../ui/confetti.js";

let CURRENT_CATEGORIES = [];
let MOBILE_CURRENT_ID = null;

function isMobile() {
  return window.matchMedia("(max-width: 640px)").matches;
}

export function renderBuckets(categories) {
  els.buckets.innerHTML = "";
  CURRENT_CATEGORIES = categories;
  categories.forEach((c) => {
    const bucket = makeBucket(c);
    els.buckets.appendChild(bucket);
    const dropZone = bucket.querySelector(".bucket-drop");
    // Em desktop continua com DnD/click normal; em mobile usamos click p/ classificar o item atual
    wireDropZone(dropZone, c.name, handleDrop);
  });
}

export function renderPool() {
  els.pool.innerHTML = "";
  if (isMobile()) {
    renderMobileOneAtATime(true);
    return;
  }

  // ===== DESKTOP =====
  state.poolItems.forEach((item) => {
    if (state.placedMap.has(item.id)) return;
    const card = makeItemCard(item);

    // Clique/seleção (desktop)
    card.addEventListener("click", () => {
      if (state.selectedId === item.id) clearSelected();
      else setSelected(item.id, card);
    });

    // Drag custom (desktop/tablet)
    wireDragEvents(card, setSelected);

    els.pool.appendChild(card);
  });
  updateCounters();
}

/** =========================
 *  MOBILE: 1 por vez (aleatório)
 *  ========================= */
function getMobileRemaining() {
  return state.poolItems.filter((i) => !state.placedMap.has(i.id));
}

function renderMobileOneAtATime(pickRandom = false) {
  const remaining = getMobileRemaining();
  els.pool.innerHTML = "";

  if (remaining.length === 0) {
    // acabou
    celebrate();
    showToast("Parabéns! Você classificou todos os animais! 🏆", "success", 3000);
    updateCounters();
    return;
  }

  // escolhe o item atual
  let item;
  if (pickRandom || MOBILE_CURRENT_ID === null) {
    item = remaining[Math.floor(Math.random() * remaining.length)];
  } else {
    item = remaining.find((i) => i.id === MOBILE_CURRENT_ID) || remaining[0];
  }
  MOBILE_CURRENT_ID = item.id;

  // seta seleção para o click nos baldes funcionar
  state.selectedId = item.id;

  // monta o card único
  const container = document.createElement("div");
  container.className = "mobile-quiz";

  const card = document.createElement("div");
  card.className = "animal-card";
  card.innerHTML = `
    <div class="animal-emoji">${item.emoji}</div>
    <div class="animal-name">${item.nome}</div>
    <div class="text-sm mt-1" style="opacity:.9">Deslize os baldes abaixo e toque no correto</div>
  `;
  container.appendChild(card);

  els.pool.appendChild(container);
  updateCounters();
}

export function handleDrop(bucketName, itemId, containerEl) {
  const item = state.poolItems.find((it) => it.id === itemId);
  if (!item || state.placedMap.has(itemId)) return;

  state.attempts++;
  const isCorrect = item.categoria === bucketName;

  if (isCorrect) {
    state.correctCount++;
    state.streak++;
    state.placedMap.set(itemId, bucketName);

    // Remove do pool no desktop
    const poolCard = document.querySelector(`.item-card[data-id="${itemId}"]`);
    if (poolCard) poolCard.remove();

    // Adiciona visualmente no balde (chip)
    const placed = document.createElement("div");
    placed.className = "pop rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-2 flex items-center gap-2";
    placed.innerHTML = `
      <span class="text-xl">${item.emoji}</span>
      <div class="font-bold">${item.nome}</div>
      <span class="ml-auto text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Correto</span>
    `;
    containerEl.appendChild(placed);

    showToast("Correto! Boa! 🎉", "success");
    updateCounters();
    clearSelected();

    // Se for mobile, imediatamente mostra o próximo (sem empilhar)
    if (isMobile()) {
      MOBILE_CURRENT_ID = null;
      renderMobileOneAtATime(true);
    }

    if (state.correctCount === state.poolItems.length) {
      celebrate();
      showToast("Parabéns! Você classificou todos os animais! 🏆", "success", 3000);
    }
  } else {
    state.streak = 0;

    // feedback no desktop (card do pool)
    const poolCard = document.querySelector(`.item-card[data-id="${itemId}"]`);
    if (poolCard) {
      poolCard.classList.add("shake", "border-rose-400");
      setTimeout(() => {
        poolCard.classList.remove("shake", "border-rose-400");
      }, 450);
    }

    // no mobile, mantém o mesmo item visível
    showToast("Ops! Tente outro balde. ❌", "error");
    updateCounters();
  }
}

export function updateCounters() {
  const total = state.poolItems.length;
  const remaining = total - state.correctCount;
  els.correctCount.textContent = String(state.correctCount);
  els.attemptsCount.textContent = String(state.attempts);
  els.streakCount.textContent = String(state.streak);
  els.itemsRemainingBadge.textContent = `${remaining} ${remaining === 1 ? "restante" : "restantes"}`;
  els.progressText.textContent = `${state.correctCount} de ${total}`;
  els.progressBar.style.width = (state.correctCount / total) * 100 + "%";
}
