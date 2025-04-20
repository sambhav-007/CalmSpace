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