import { CATEGORIES } from "./data/categories.js";
import { ITEMS } from "./data/items.js";
import { shuffle } from "./utils/shuffle.js";
import { els } from "./ui/dom.js";
import { state, resetState } from "./game/state.js";
import { renderBuckets, renderPool } from "./game/render.js";
import { showToast } from "./ui/toast.js";

function resetGame({ shuffleItems = true } = {}) {
  renderBuckets(CATEGORIES);
  const items = shuffleItems ? shuffle([...ITEMS]) : [...ITEMS];
  resetState(items);
  renderPool();
  showToast("Jogo reiniciado! 🔄", "success");
}

// Inicialização
renderBuckets(CATEGORIES);
resetGame({ shuffleItems: true });

// Ações
els.shuffleBtn.addEventListener("click", () => {
  // Embaralha somente os que ainda estão no pool
  state.poolItems = shuffle(state.poolItems);
  renderPool();
  showToast("Itens embaralhados! 🔀", "success");
});

els.resetBtn.addEventListener("click", () => {
  resetGame({ shuffleItems: true });
});