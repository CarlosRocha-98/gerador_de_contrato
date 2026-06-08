// --- Hamburguer menu ---
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("navLinks");
const navActions = document.getElementById("navActions");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
  navActions.classList.toggle("open");
});

// --- FAQ accordion ---
document.querySelectorAll(".faq__question").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".faq__item");
    const isOpen = item.classList.contains("open");

    // Fecha todos
    document.querySelectorAll(".faq__item").forEach((el) => el.classList.remove("open"));

    // Abre o clicado (se não estava aberto)
    if (!isOpen) item.classList.add("open");
  });
});

// --- Intersection Observer: animação dos steps ---
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 120);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".step-card").forEach((card) => observer.observe(card));
