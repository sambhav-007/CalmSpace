const API_KEY = "AIzaSyCh63Ww9HJy5itbB7Qm3niTrOa6PNNNyIA"; // ⚠️ Don't use this in production

let conversationHistory = []; // To maintain conversation context
let selectedEmotion = null;

// Initialize elements and event handlers
document.addEventListener("DOMContentLoaded", () => {
  // Add subtle entrance animation to elements
  animateEntranceEffects();

  // Setup emotion selectors
  const emotions = document.querySelectorAll(".emotion");
  emotions.forEach((emotion) => {
    emotion.addEventListener("click", () => {
      // Remove active class from all emotions
      emotions.forEach((e) => e.classList.remove("active"));
      // Add active class to selected emotion
      emotion.classList.add("active");
      selectedEmotion = emotion.dataset.emotion;

      // Add animation to selected emotion
      emotion.classList.add("pulse");
      setTimeout(() => {
        emotion.classList.remove("pulse");
      }, 500);
    });
  });

  // Setup copy button
  const copyBtn = document.getElementById("copy-btn");
  copyBtn.addEventListener("click", () => {
    const output = document.getElementById("output");
    navigator.clipboard.writeText(output.textContent);

    copyBtn.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="far fa-copy"></i>';
    }, 2000);
  });

  // Setup save button with improved animation
  const saveBtn = document.getElementById("save-btn");
  saveBtn.addEventListener("click", () => {
    saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
    saveBtn.classList.add("saved");

    // Create and show notification
    showNotification("Reflection saved!");
  });

  // Theme toggle with enhanced animation
  const themeToggle = document.querySelector(".theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const icon = themeToggle.querySelector("i");

    // Add rotation animation for smooth transition
    icon.style.transition =
      "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    icon.style.transform = "rotate(360deg)";

    setTimeout(() => {
      if (document.body.classList.contains("dark-mode")) {
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

  // Continue conversation button with hover effect
  const continueBtn = document.getElementById("continue-btn");
  continueBtn.addEventListener("click", () => {
    const prompt = document.getElementById("prompt");
    prompt.focus();

    // Subtle bounce animation on the textarea
    const journalInput = document.querySelector(".journal-input");
    journalInput.classList.add("focused");

    // Scroll to textarea smoothly
    journalInput.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  // Focus animation for textarea with enhanced effects
  const textarea = document.getElementById("prompt");
  textarea.addEventListener("focus", () => {
    document.querySelector(".journal-input").classList.add("focused");

    // Subtle particles or highlight effect around the focused area
    addFocusParticles();
  });

  textarea.addEventListener("blur", () => {
    document.querySelector(".journal-input").classList.remove("focused");

    // Remove particles
    removeFocusParticles();
  });

  // Connect reflect button to the askGemini function
  document.getElementById("reflect-btn").addEventListener("click", askGemini);

  // Add hover animation to floating shapes
  animateBackgroundShapes();
});

// Function to show notifications with smoother animation
function showNotification(message) {
  const notification = document.createElement("div");
  notification.classList.add("notification");
  notification.textContent = message;
  document.body.appendChild(notification);

  // Delayed addition of show class for smooth entrance
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      notification.classList.add("show");
    });
  });

  setTimeout(() => {
    notification.classList.remove("show");
    notification.addEventListener("transitionend", () => {
      notification.remove();
    });
  }, 3000);
}

// Function to add entrance animations to elements
function animateEntranceEffects() {
  const elements = [
    { selector: ".navbar", delay: 0 },
    { selector: ".gradient-text", delay: 200 },
    { selector: ".subtitle", delay: 400 },
    { selector: ".journal-input", delay: 600 },
    { selector: ".response-section", delay: 800 },
  ];

  elements.forEach((item) => {
    const element = document.querySelector(item.selector);
    if (element) {
      element.style.opacity = "0";
      element.style.transform = "translateY(20px)";
      element.style.transition = "opacity 0.5s ease, transform 0.5s ease";

      setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }, item.delay);
    }
  });
}

// Function to add subtle particle effect around the focused textarea
function addFocusParticles() {
  // This is a placeholder for a more complex particle effect
  // Simple solution: add a subtle glow effect
  const journalInput = document.querySelector(".journal-input");
  journalInput.style.boxShadow =
    "0 0 20px rgba(106, 90, 205, 0.3), 0 0 40px rgba(106, 90, 205, 0.1)";
}

function removeFocusParticles() {
  const journalInput = document.querySelector(".journal-input");
  journalInput.style.boxShadow = "";
}

// Function to animate background shapes with more dynamic movement
function animateBackgroundShapes() {
  const shapes = document.querySelectorAll(".shape");
  shapes.forEach((shape) => {
    shape.addEventListener("mouseover", () => {
      // Subtle grow effect when user hovers near a shape
      shape.style.transform = "scale(1.1)";
      shape.style.opacity = "0.4";
      shape.style.transition = "transform 1s ease, opacity 1s ease";
    });

    shape.addEventListener("mouseout", () => {
      shape.style.transform = "";
      shape.style.opacity = "";
    });
  });
}

async function askGemini() {
  const userInput = document.getElementById("prompt").value;
  const output = document.getElementById("output");
  const typingIndicator = document.querySelector(".typing-indicator");
  const reflectBtn = document.getElementById("reflect-btn");

  if (!userInput.trim()) {
    // Show an elegant error notification instead of changing the output text
    showNotification("Please write something to reflect on");
    return;
  }

  // Disable button and show thinking state
  reflectBtn.disabled = true;
  reflectBtn.innerHTML =
    '<span class="btn-text">Thinking...</span><i class="fas fa-spinner fa-spin"></i>';

  // Show typing indicator with fade-in effect
  typingIndicator.style.opacity = "0";
  typingIndicator.style.display = "flex";
  setTimeout(() => {
    typingIndicator.style.opacity = "1";
    typingIndicator.style.transition = "opacity 0.3s ease";
  }, 10);

  output.textContent = "";

  // Add emotion context if selected
  let promptWithEmotion = userInput;
  if (selectedEmotion) {
    promptWithEmotion = `I'm feeling ${selectedEmotion} today. ${userInput}`;
  }

  // Add the user's input to the conversation history
  conversationHistory.push({
    role: "user",
    parts: [
      {
        text: `You are a compassionate and empathetic therapist. Your role is to help users reflect on their thoughts, provide emotional support, and guide them toward personal growth. Respond thoughtfully and kindly to the following journaling entry: "${promptWithEmotion}"`,
      },
    ],
  });

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
        API_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: conversationHistory,
        }),
      }
    );

    const data = await response.json();
    console.log(data); // DEBUG: full response

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const reply = data.candidates[0].content.parts[0].text;

      // Add the AI's reply to the conversation history
      conversationHistory.push({
        role: "assistant",
        parts: [{ text: reply }],
      });

      // Fade out typing indicator before displaying text
      typingIndicator.style.opacity = "0";
      typingIndicator.addEventListener("transitionend", function handler() {
        typingIndicator.style.display = "none";
        typingIndicator.removeEventListener("transitionend", handler);

        // Display text with typewriter effect
        displayWordByWord(reply, output);
      });

      // Animate the mood meter based on the selected emotion
      let moodPercentage = 50; // Default neutral

      if (selectedEmotion) {
        switch (selectedEmotion) {
          case "happy":
            moodPercentage = 80;
            break;
          case "excited":
            moodPercentage = 90;
            break;
          case "neutral":
            moodPercentage = 50;
            break;
          case "anxious":
            moodPercentage = 30;
            break;
          case "sad":
            moodPercentage = 20;
            break;
        }
      }

      // Animate the mood meter with enhanced animation
      animateMoodMeter(moodPercentage);

      // Reset button state
      setTimeout(() => {
        reflectBtn.disabled = false;
        reflectBtn.innerHTML =
          '<span class="btn-text">Reflect with AI</span><i class="fas fa-sparkles"></i>';
      }, 1000);
    } else if (data.error) {
      typingIndicator.style.display = "none";
      showNotification(`Error: ${data.error.message}`);
      reflectBtn.disabled = false;
      reflectBtn.innerHTML =
        '<span class="btn-text">Reflect with AI</span><i class="fas fa-sparkles"></i>';
    } else {
      typingIndicator.style.display = "none";
      showNotification("No response from Gemini");
      reflectBtn.disabled = false;
      reflectBtn.innerHTML =
        '<span class="btn-text">Reflect with AI</span><i class="fas fa-sparkles"></i>';
    }
  } catch (err) {
    typingIndicator.style.display = "none";
    showNotification("Request failed: " + err.message);
    console.error(err);
    reflectBtn.disabled = false;
    reflectBtn.innerHTML =
      '<span class="btn-text">Reflect with AI</span><i class="fas fa-sparkles"></i>';
  }
}

function displayWordByWord(text, outputElement) {
  outputElement.textContent = ""; // Clear previous content

  // Fade in the output container first
  outputElement.style.opacity = "0";
  setTimeout(() => {
    outputElement.style.opacity = "1";
    outputElement.style.transition = "opacity 0.5s ease";
  }, 100);

  const words = text.split(" ");
  let index = 0;

  const interval = setInterval(() => {
    if (index < words.length) {
      outputElement.textContent += words[index] + " ";
      index++;

      // Auto-scroll to show latest content with smooth behavior
      outputElement.parentNode.scrollTo({
        top: outputElement.parentNode.scrollHeight,
        behavior: "smooth",
      });
    } else {
      clearInterval(interval);

      // Add subtle highlight to the finished text
      outputElement.style.animation = "subtle-pulse 2s ease-in-out";
      setTimeout(() => {
        outputElement.style.animation = "";
      }, 2000);
    }
  }, 80); // Slightly faster text display
}

function animateMoodMeter(percentage) {
  const moodLevel = document.querySelector(".mood-level");
  const moodMeter = document.querySelector(".mood-meter");

  // Add pulse animation to the mood meter
  moodMeter.style.animation = "pulse 1s ease-in-out";
  setTimeout(() => {
    moodMeter.style.animation = "";
  }, 1000);

  // Set the color based on the percentage with smoother gradient transitions
  let color;
  if (percentage < 30) {
    color = "rgb(235, 87, 87)"; // Red for sad/anxious
  } else if (percentage < 50) {
    color = "rgb(242, 153, 74)"; // Orange for slightly negative
  } else if (percentage < 70) {
    color = "rgb(76, 207, 211)"; // Teal for neutral/calm
  } else {
    color = "rgb(68, 190, 135)"; // Green for happy/positive
  }

  moodLevel.style.backgroundColor = color;

  // Animate width from 0 to the target percentage with easing
  let currentWidth = 0;
  const animationInterval = setInterval(() => {
    if (currentWidth < percentage) {
      // Accelerate at beginning, decelerate at end (ease in-out)
      const step = 1 + 0.1 * Math.sin((currentWidth * Math.PI) / percentage);
      currentWidth = Math.min(currentWidth + step, percentage);
      moodLevel.style.width = `${currentWidth}%`;
    } else {
      clearInterval(animationInterval);
    }
  }, 10);
}
