import { els, makeItemCard, makeBucket } from "../ui/dom.js";
import { state } from "./state.js";
import { wireDragEvents, wireDropZone, setSelected, clearSelected } from "./dragdrop.js";
import { showToast } from "../ui/toast.js";
import { celebrate } from "../ui/confetti.js";

export function renderBuckets(categories) {
  els.buckets.innerHTML = "";
  categories.forEach((c) => {
    const bucket = makeBucket(c);
    els.buckets.appendChild(bucket);
    const dropZone = bucket.querySelector(".bucket-drop");
    wireDropZone(dropZone, c.name, handleDrop);
  });
}

export function renderPool() {
  els.pool.innerHTML = "";
  state.poolItems.forEach((item) => {
    if (state.placedMap.has(item.id)) return;
    const card = makeItemCard(item);

    // Clique/seleção mobile
    card.addEventListener("click", () => {
      if (state.selectedId === item.id) clearSelected();
      else setSelected(item.id, card);
    });

    // Drag & drop desktop
    wireDragEvents(card, setSelected);

    els.pool.appendChild(card);
  });
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

    const poolCard = document.querySelector(`.item-card[data-id="${itemId}"]`);
    if (poolCard) poolCard.remove();

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

    if (state.correctCount === state.poolItems.length) {
      celebrate();
      showToast("Parabéns! Você classificou todos os animais! 🏆", "success", 3000);
    }
  } else {
    state.streak = 0;
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