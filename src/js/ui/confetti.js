export function celebrate() {
  const emojis = ["🎉", "🌟", "✨", "🎊", "💥", "🧠", "🏆"];
  const count = 24;
  for (let i = 0; i < count; i++) {
    const span = document.createElement("span");
    span.className = "confetti";
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.style.left = Math.random() * 100 + "vw";
    span.style.animationDuration = 6 + Math.random() * 3 + "s";
    span.style.fontSize = 16 + Math.random() * 18 + "px";
    document.body.appendChild(span);
    setTimeout(() => span.remove(), 10000);
  }
}