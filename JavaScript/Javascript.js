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

// JavaScript to handle scroll-triggered animation for "My Work" section and projects.
document.addEventListener("DOMContentLoaded", () => {
  const myWorkSection = document.querySelector(".my-work-section");
  const projects = document.querySelectorAll(".project");

  const options = {
    threshold: 0.2, // trigger when 20% of section is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // change background
        myWorkSection.classList.add("active");

        // animate each project
        projects.forEach((project, index) => {
          setTimeout(() => {
            project.classList.add("show");
          }, index * 200); // stagger animation by 200ms
        });
      } else {
        // reset if you want animations again when scrolling back up
        myWorkSection.classList.remove("active");
        projects.forEach((project) => project.classList.remove("show"));
      }
    });
  }, options);

  observer.observe(myWorkSection);
});
