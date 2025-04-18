document.addEventListener('DOMContentLoaded', () => {
  // Overlay Effect for Member Cards
  const cards = document.querySelectorAll('.member-card');
  const overlay = document.getElementById('overlay');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      overlay.style.display = 'block';
      setTimeout(() => {
        overlay.style.display = 'none';
      }, 2000);
    });
  });

  overlay.addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  // Back to Top Button
  const backToTopButton = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopButton.style.display = 'flex';
    } else {
      backToTopButton.style.display = 'none';
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
});