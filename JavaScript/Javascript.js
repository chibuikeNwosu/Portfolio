// JavaScript to handle scroll-triggered animation for "About Me" text and card.

// Function to check if element is in viewport
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <=
    (window.innerHeight || document.documentElement.clientHeight) * 0.8
  );
}

// Function to handle scroll event
function handleScroll() {
  const aboutText = document.querySelector(".about-text");
  const aboutExtra = document.querySelector(".about-extra");

  // Animate about-text (your existing functionality)
  if (
    aboutText &&
    isInViewport(aboutText) &&
    !aboutText.classList.contains("animate")
  ) {
    aboutText.classList.add("animate");
  }

  // Animate card (new functionality)
  if (
    aboutExtra &&
    isInViewport(aboutExtra) &&
    !aboutExtra.classList.contains("animate")
  ) {
    aboutExtra.classList.add("animate");
  }
}

// Add scroll event listener
window.addEventListener("scroll", handleScroll);

// Trigger on page load in case element is already in view
window.addEventListener("load", handleScroll);
