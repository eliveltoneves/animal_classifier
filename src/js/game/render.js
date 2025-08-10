import { els, makeItemCard, makeBucket } from "../ui/dom.js";
import { state } from "./state.js";
import { wireDragEvents, wireDropZone, setSelected, clearSelected } from "./dragdrop.js";
import { showToast } from "../ui/toast.js";
import { celebrate } from "../ui/confetti.js";

let CURRENT_CATEGORIES = [];
let MOBILE_CURRENT_ID = null;
let mobileBucketIndex = 0;

function isMobile() {
  return window.matchMedia("(max-width: 640px)").matches;
}

export function renderBuckets(categories) {
  els.buckets.innerHTML = "";
  CURRENT_CATEGORIES = categories;

  if (!isMobile()) {
    // ===== DESKTOP: grid normal =====
    categories.forEach((c) => {
      const bucket = makeBucket(c);
      els.buckets.appendChild(bucket);
      const dropZone = bucket.querySelector(".bucket-drop");
      wireDropZone(dropZone, c.name, handleDrop);
    });
    return;
  }

  // ===== MOBILE: carrossel com botões Prev/Next (um bucket por vez) =====
  const wrapper = document.createElement("div");
  wrapper.className = "m-buckets";

  const prevBtn = document.createElement("button");
  prevBtn.className = "m-nav m-prev";
  prevBtn.setAttribute("aria-label", "Anterior");
  prevBtn.textContent = "‹";

  const nextBtn = document.createElement("button");
  nextBtn.className = "m-nav m-next";
  nextBtn.setAttribute("aria-label", "Próximo");
  nextBtn.textContent = "›";

  const viewport = document.createElement("div");
  viewport.className = "m-viewport";

  const track = document.createElement("div");
  track.className = "m-track";
  track.id = "bucketsTrack";

  // cria slides
  categories.forEach((c) => {
    const slide = document.createElement("div");
    slide.className = "m-slide";
    const bucket = makeBucket(c);
    slide.appendChild(bucket);
    track.appendChild(slide);

    const dropZone = bucket.querySelector(".bucket-drop");
    wireDropZone(dropZone, c.name, handleDrop);
  });

  viewport.appendChild(track);
  wrapper.appendChild(prevBtn);
  wrapper.appendChild(viewport);
  wrapper.appendChild(nextBtn);
  els.buckets.appendChild(wrapper);

  mobileBucketIndex = 0;
  updateBucketCarousel();

  prevBtn.addEventListener("click", () => {
    mobileBucketIndex = Math.max(0, mobileBucketIndex - 1);
    updateBucketCarousel();
  });
  nextBtn.addEventListener("click", () => {
    mobileBucketIndex = Math.min(CURRENT_CATEGORIES.length - 1, mobileBucketIndex + 1);
    updateBucketCarousel();
  });

  function updateBucketCarousel() {
    const width = viewport.clientWidth;
    track.style.transform = `translateX(-${mobileBucketIndex * width}px)`;
  }

  // Recalcula posição ao rotacionar/resize
  window.addEventListener("resize", () => {
    if (isMobile()) {
      const width = viewport.clientWidth;
      track.style.transform = `translateX(-${mobileBucketIndex * width}px)`;
    }
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
 *  MOBILE: 1 por vez (arrastar até o bucket visível)
 *  ========================= */
function getMobileRemaining() {
  return state.poolItems.filter((i) => !state.placedMap.has(i.id));
}

function renderMobileOneAtATime(pickRandom = false) {
  const remaining = getMobileRemaining();
  els.pool.innerHTML = "";

  if (remaining.length === 0) {
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

  // card arrastável (reusa nossa lógica de DnD custom)
  const card = document.createElement("div");
  card.className =
    "item-card group w-full bg-white text-slate-900 transition border text-left p-4 flex items-center justify-center gap-2 select-none";
  card.dataset.id = item.id;
  card.style.cursor = "grab";
  card.style.touchAction = "none"; // ajuda no touch
  card.innerHTML = `
    <span class="text-2xl" style="font-size:3rem; line-height:1">${item.emoji}</span>
    <div class="flex-1 text-center">
      <div class="font-extrabold leading-tight" style="font-size:1.2rem">${item.nome}</div>
      <div class="text-xs hint">Arraste até o balde correto</div>
    </div>
  `;

  // Seleção + DnD
  card.addEventListener("click", () => {
    if (state.selectedId === item.id) clearSelected();
    else setSelected(item.id, card);
  });
  wireDragEvents(card, setSelected);

  const container = document.createElement("div");
  container.className = "mobile-quiz";
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

    // Remove do pool (desktop) se existir
    const poolCard = document.querySelector(`.item-card[data-id="${itemId}"]`);
    if (poolCard) poolCard.remove();

    // Adiciona visualmente no balde (chip)
    const placed = document.createElement("div");
    placed.className =
      "pop rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-2 flex items-center gap-2";
    placed.innerHTML = `
      <span class="text-xl">${item.emoji}</span>
      <div class="font-bold">${item.nome}</div>
      <span class="ml-auto text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Correto</span>
    `;
    containerEl.appendChild(placed);

    showToast("Correto! Boa! 🎉", "success");
    updateCounters();
    clearSelected();

    // Mobile: já mostra o próximo sem empilhar
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
