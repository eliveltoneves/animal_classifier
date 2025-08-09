const toastEl = document.getElementById("toast");
const toastInnerEl = document.getElementById("toastInner");

export function showToast(message, type = "success", duration = 1400) {
  toastInnerEl.textContent = message;
  toastInnerEl.className = "px-4 py-2 rounded-xl shadow-2xl font-semibold backdrop-blur-md";
  if (type === "success") {
    toastInnerEl.classList.add("bg-emerald-400/90", "text-emerald-950");
  } else {
    toastInnerEl.classList.add("bg-rose-400/90", "text-rose-950");
  }
  toastEl.classList.remove("hidden");
  toastEl.classList.add("pop");
  setTimeout(() => {
    toastEl.classList.add("hidden");
    toastEl.classList.remove("pop");
  }, duration);
}