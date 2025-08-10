// Exibe um modal com botões de categoria para escolher por toque.
// onChoose(bucketName) é chamado quando o usuário toca numa categoria.

const modal = document.getElementById("pickerModal");
const body = document.getElementById("pickerBody");
const btnClose = document.getElementById("pickerClose");

let _onChoose = null;

export function openPicker(categories, onChoose) {
  _onChoose = onChoose;
  body.innerHTML = "";

  categories.forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "picker-btn";
    btn.innerHTML = `<span class="text-2xl">${c.icon}</span><span class="text-base font-extrabold">${c.name}</span>`;
    btn.addEventListener("click", () => {
      if (_onChoose) _onChoose(c.name);
      closePicker();
    });
    body.appendChild(btn);
  });

  modal.classList.remove("hidden");
}

export function closePicker() {
  modal.classList.add("hidden");
  _onChoose = null;
}

btnClose?.addEventListener("click", closePicker);

// Fecha tocando fora do diálogo
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closePicker();
});

// Escape fecha
document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("hidden") && e.key === "Escape") closePicker();
});
