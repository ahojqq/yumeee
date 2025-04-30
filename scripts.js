document.addEventListener("DOMContentLoaded", function () {
  document.body.classList.add("fade-in");
  const links = document.querySelectorAll("a[href$='.html']");
  links.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      document.body.classList.remove("fade-in");
      document.body.classList.add("fade-out");
      setTimeout(() => {
        window.location.href = this.href;
      }, 300);
    });
  });

  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    loader.classList.add('hidden');
  });

  const targetDate = new Date("2025-06-01T00:00:00").getTime();
  const countdown = document.getElementById("countdown");
  const interval = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;
    if (distance < 0) {
      countdown.textContent = "Spuštěno!";
      clearInterval(interval);
      return;
    }
    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);
    countdown.textContent = `${d}d ${h}h ${m}m ${s}s`;
  }, 1000);

  const options = [
    "💥 Sleva 10 % – Kód: YUME10",
    "🖤 Módní tip dne: Černá je vždy správně",
    "✨ Kombinuj textury, ne barvy",
    "🔥 Sleva 15 % nad 3000 Kč",
    "🎁 Doprava zdarma",
    "🧢 Kšiltovka zdarma při nákupu nad 2000 Kč"
  ];
  const btn = document.getElementById("spin");
  const result = document.getElementById("wheel-result");
  if (btn) {
    btn.addEventListener("click", () => {
      const selected = options[Math.floor(Math.random() * options.length)];
      result.textContent = selected;
    });
  }
});