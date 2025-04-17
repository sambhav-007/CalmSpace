const API_KEY = "AIzaSyCh63Ww9HJy5itbB7Qm3niTrOa6PNNNyIA"; // ⚠️ Don't use this in production

let conversationHistory = []; // To maintain conversation context
let selectedEmotion = null;

// Initialize elements and event handlers
document.addEventListener("DOMContentLoaded", () => {
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

  // Setup save button
  const saveBtn = document.getElementById("save-btn");
  saveBtn.addEventListener("click", () => {
    saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
    saveBtn.classList.add("saved");

    // Create and show notification
    const notification = document.createElement("div");
    notification.classList.add("notification");
    notification.textContent = "Reflection saved!";
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 100);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  });

  // Theme toggle
  const themeToggle = document.querySelector(".theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const icon = themeToggle.querySelector("i");
    if (document.body.classList.contains("dark-mode")) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
  });

  // Continue conversation button
  const continueBtn = document.getElementById("continue-btn");
  continueBtn.addEventListener("click", () => {
    document.getElementById("prompt").focus();
  });

  // Focus animation for textarea
  const textarea = document.getElementById("prompt");
  textarea.addEventListener("focus", () => {
    document.querySelector(".journal-input").classList.add("focused");
  });

  textarea.addEventListener("blur", () => {
    document.querySelector(".journal-input").classList.remove("focused");
  });
});

async function askGemini() {
  const userInput = document.getElementById("prompt").value;
  const output = document.getElementById("output");
  const typingIndicator = document.querySelector(".typing-indicator");
  const moodLevel = document.querySelector(".mood-level");

  if (!userInput.trim()) {
    output.textContent = "Please write something to reflect on.";
    return;
  }

  // Show typing indicator
  typingIndicator.style.display = "flex";
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

      // Hide typing indicator before displaying text
      typingIndicator.style.display = "none";

      // Display text with typewriter effect
      displayWordByWord(reply, output);

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

      // Animate the mood meter
      animateMoodMeter(moodPercentage);
    } else if (data.error) {
      typingIndicator.style.display = "none";
      output.textContent = `Error: ${data.error.message}`;
    } else {
      typingIndicator.style.display = "none";
      output.textContent = "No response from Gemini.";
    }
  } catch (err) {
    typingIndicator.style.display = "none";
    output.textContent = "Request failed: " + err.message;
    console.error(err);
  }
}

function displayWordByWord(text, outputElement) {
  outputElement.textContent = ""; // Clear previous content
  const words = text.split(" ");
  let index = 0;

  const interval = setInterval(() => {
    if (index < words.length) {
      outputElement.textContent += words[index] + " ";
      index++;

      // Auto-scroll to show latest content
      outputElement.parentNode.scrollTop =
        outputElement.parentNode.scrollHeight;
    } else {
      clearInterval(interval);
    }
  }, 80); // Slightly faster text display
}

function animateMoodMeter(percentage) {
  const moodLevel = document.querySelector(".mood-level");

  // Set the color based on the percentage
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

  // Animate width from 0 to the target percentage
  let currentWidth = 0;
  const animationInterval = setInterval(() => {
    if (currentWidth < percentage) {
      currentWidth += 1;
      moodLevel.style.width = `${currentWidth}%`;
    } else {
      clearInterval(animationInterval);
    }
  }, 10);
}
