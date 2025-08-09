import { state } from "./state.js";

/** ---- Seleção visual (com fallback caso o Tailwind não gere as classes) ---- */
export function setSelected(id, element) {
  clearSelected();
  state.selectedId = id;
  element.classList.add("ring-4", "ring-amber-400", "ring-offset-2");
  element.style.outline = "3px solid #f59e0b"; // fallback visual
  element.style.outlineOffset = "2px";
}

export function clearSelected() {
  state.selectedId = null;
  document.querySelectorAll(".item-card").forEach((el) => {
    el.classList.remove("ring-4", "ring-amber-400", "ring-offset-2");
    el.style.outline = "";
    el.style.outlineOffset = "";
  });
}

/** ---- Utilitário para criar o "fantasma" que segue o cursor/dedo ---- */
function createGhost(card) {
  const ghost = document.createElement("div");
  ghost.className = "pointer-ghost";
  ghost.innerHTML = card.innerHTML;
  ghost.style.position = "fixed";
  ghost.style.left = "0px";
  ghost.style.top = "0px";
  ghost.style.transform = "translate(-9999px, -9999px)"; // começa fora
  ghost.style.zIndex = "9999";
  ghost.style.background = "#fff";
  ghost.style.border = "2px solid #f59e0b";
  ghost.style.borderRadius = "12px";
  ghost.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
  ghost.style.padding = "6px 8px";
  ghost.style.pointerEvents = "none";
  ghost.style.opacity = "0.95";
  document.body.appendChild(ghost);
  return ghost;
}

/** ---- Fallback/Principal: DnD custom com Pointer Events ---- */
function attachCustomDnD(card, onSelect) {
  let dragging = false;
  let ghost = null;
  let lastDropZone = null;

  const highlight = (drop) => drop.classList.add("drop-highlight");
  const unhighlight = (drop) => drop.classList.remove("drop-highlight");

  const updateGhostPos = (x, y) => {
    // desloca um pouco para a direita/baixo para não cobrir o ponteiro
    ghost.style.transform = `translate(${x + 10}px, ${y + 10}px)`;
  };

  const onPointerDown = (e) => {
    // Apenas botão primário, se mouse
    if (typeof e.button === "number" && e.button !== 0) return;

    onSelect(card.dataset.id, card); // seleciona
    dragging = true;
    card.setPointerCapture?.(e.pointerId);
    card.classList.add("opacity-80");
    card.style.cursor = "grabbing";

    ghost = createGhost(card);
    updateGhostPos(e.clientX, e.clientY);
  };

  const onPointerMove = (e) => {
    if (!dragging) return;
    updateGhostPos(e.clientX, e.clientY);

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const drop = el && (el.closest(".bucket-drop") || el.closest(".bucket"));
    const dropZone = drop?.classList.contains("bucket-drop")
      ? drop
      : drop?.querySelector(".bucket-drop");

    if (lastDropZone && lastDropZone !== dropZone) unhighlight(lastDropZone);
    if (dropZone && lastDropZone !== dropZone) highlight(dropZone);
    lastDropZone = dropZone || null;
  };

  const onPointerUp = (e) => {
    if (!dragging) return;
    dragging = false;
    card.releasePointerCapture?.(e.pointerId);
    card.classList.remove("opacity-80");
    card.style.cursor = "grab";

    if (ghost) {
      ghost.remove();
      ghost = null;
    }
    if (lastDropZone) {
      // Simula clique no dropzone (o listener de click chamará handleDrop)
      lastDropZone.click();
      unhighlight(lastDropZone);
      lastDropZone = null;
    }
  };

  card.addEventListener("pointerdown", onPointerDown);
  card.addEventListener("pointermove", onPointerMove);
  card.addEventListener("pointerup", onPointerUp);
}

/** ---- API usada pelo render.js ---- */
export function wireDragEvents(card, onSelect) {
  // Usamos SOMENTE o DnD custom
  attachCustomDnD(card, onSelect);
}

export function wireDropZone(dropZone, bucketName, handleDrop) {
  // Mantemos apenas o clique (usado pelo DnD custom e pelo modo tocar → balde)
  dropZone.addEventListener("click", () => {
    if (!state.selectedId) return;
    handleDrop(bucketName, state.selectedId, dropZone.querySelector(".bucket-items"));
  });
}
