// Scroll-triggered reveal for Process page stages
document.addEventListener("DOMContentLoaded", () => {
  const stages = document.querySelectorAll(".stage");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add("show");
          }, i * 100);
        }
      });
    },
    { threshold: 0.15 },
  );

  stages.forEach((stage) => observer.observe(stage));
});
