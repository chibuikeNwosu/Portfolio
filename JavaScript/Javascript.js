// JavaScript to handle scroll-triggered animation for "About Me" text.

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

  if (isInViewport(aboutText) && !aboutText.classList.contains("animate")) {
    aboutText.classList.add("animate");
  }
}

// Add scroll event listener
window.addEventListener("scroll", handleScroll);

// Trigger on page load in case element is already in view
window.addEventListener("load", handleScroll);
