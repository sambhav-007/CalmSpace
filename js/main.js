document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {

            const isActive = item.classList.contains('active');

            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });

            if (!isActive) {
                item.classList.add('active');
            }
        });

        question.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                question.click();
            }
        });
    });
});

  const darkToggle = document.querySelector(".toggle");
  darkToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const icon = darkToggle.querySelector("i");

    // Add rotation animation for smooth transition
    icon.style.transition =
      "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    icon.style.transform = "rotate(360deg)";

    setTimeout(() => {
      if (document.body.classList.contains("dark")) {
        icon.classList.remove("fa-moon");
        icon.classList.add("fa-sun");
      } else {
        icon.classList.remove("fa-sun");
        icon.classList.add("fa-moon");
      }
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

  document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    // Toggle menu when hamburger icon is clicked
    menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
        navLinks.classList.remove('active');
      }
    });
    
    // Close menu when a link is clicked
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('active');
      });
    });
    
    // Adjust menu visibility on window resize
    window.addEventListener('resize', function() {
      if (window.innerWidth > 768) {
        navLinks.classList.remove('active');
      }
    });
  });