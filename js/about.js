document.addEventListener('DOMContentLoaded', () => {
  // Add underline elements to footer links
  const footerLinks = document.querySelectorAll('.footer-links a');
  
  footerLinks.forEach(link => {
    // Create the underline element
    const underline = document.createElement('span');
    underline.classList.add('footer-link-underline');
    link.appendChild(underline);
    
    // Add hover events
    link.addEventListener('mouseenter', () => {
      underline.style.width = '100%';
      underline.style.opacity = '1';
    });
    
    link.addEventListener('mouseleave', () => {
      // Don't hide the underline if this is the active link
      if (!link.classList.contains('active')) {
        underline.style.width = '0';
        underline.style.opacity = '0';
      }
    });
  });
  
  // Set active link underline visible immediately
  document.querySelectorAll('.footer-links a.active').forEach(activeLink => {
    const activeUnderline = activeLink.querySelector('.footer-link-underline');
    if (activeUnderline) {
      activeUnderline.style.width = '100%';
      activeUnderline.style.opacity = '1';
    }
  });
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

const darkToggle = document.querySelector(".toggle");
const icon = darkToggle.querySelector("i");


    // Reset transform after icon change
    setTimeout(() => {
      icon.style.transition = "none";
      icon.style.transform = "rotate(0deg)";

      setTimeout(() => {
        icon.style.transition =
          "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
      }, 50);
    }, 500);
  }, 250);
});

