
document.addEventListener('DOMContentLoaded', () => {
    // Overlay Effect for Member Cards
    const cards = document.querySelectorAll('.member-card');
    const overlay = document.getElementById('overlay');
  
    cards.forEach(card => {
      card.addEventListener('click', () => {
        overlay.style.display = 'block'; // Show the overlay
        setTimeout(() => {
          overlay.style.display = 'none'; // Hide the overlay after 2 seconds
        }, 2000);
      });
    });
  
    overlay.addEventListener('click', () => {
      overlay.style.display = 'none'; // Hide the overlay when clicked
    });
  
    // "Back to Top" Button Functionality
    const backToTopButton = document.getElementById('backToTop');
  
    // Show the button when the user scrolls down
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.style.display = 'flex'; // Show the button
      } else {
        backToTopButton.style.display = 'none'; // Hide the button
      }
    });
  
    // Scroll smoothly to the top when the button is clicked
    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scroll to top
      });
    });
  });
  
  