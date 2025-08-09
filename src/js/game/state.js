export const state = {
  poolItems: [], // itens ainda não colocados
  placedMap: new Map(), // id -> categoria colocada
  correctCount: 0,
  attempts: 0,
  streak: 0,
  selectedId: null,
};

export function resetState(items) {
  state.poolItems = items.map((it) => ({ ...it }));
  state.placedMap.clear();
  state.correctCount = 0;
  state.attempts = 0;
  state.streak = 0;
  state.selectedId = null;
}