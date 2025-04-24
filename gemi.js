// Add global error handler at the top of the file to help debug issues
window.addEventListener("error", function (event) {
  console.error("Global error caught:", event.error);
});

// Add a function to fix button click issues
function fixButtonClicks() {
  console.log("Fixing button click issues...");

  // Direct handling for all clickable elements
  const clickableElements = document.querySelectorAll(
    "button, .icon-btn, .gradient-btn, .outline-btn, .emotion, .meditation-launcher, .theme-toggle, .prompt-btn, .entry-item"
  );

  clickableElements.forEach((element) => {
    // Ensure element is clickable
    element.style.pointerEvents = "auto";
    element.style.cursor = "pointer";

    // Add a direct click handler to log and ensure clicks work
    element.addEventListener("click", function (e) {
      console.log("Element clicked:", this);
    });
  });
}

// Run after DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Try to fix button clicks
  fixButtonClicks();

  // Add a general document click handler to debug
  document.addEventListener("click", function (event) {
    console.log("Document click detected on:", event.target);
  });

  // Run again after a short delay
  setTimeout(fixButtonClicks, 1000);
});

// Check for any CSS issues that might block clicks
document.addEventListener("DOMContentLoaded", function () {
  // Remove any full-page overlays that might block clicks
  const possibleOverlays = document.querySelectorAll(
    'div[style*="position: fixed"][style*="top: 0"][style*="left: 0"][style*="width: 100%"][style*="height: 100%"]'
  );
  possibleOverlays.forEach((overlay) => {
    if (overlay.style.pointerEvents !== "none") {
      overlay.style.pointerEvents = "none";
      console.log("Fixed potential overlay blocking clicks:", overlay);
    }
  });
});

const API_KEY = "AIzaSyCh63Ww9HJy5itbB7Qm3niTrOa6PNNNyIA"; // ⚠️ Don't use this in production

let conversationHistory = []; // To maintain conversation context
let selectedEmotion = null;
let entries = []; // Array to store journal entries

// Load saved entries from local storage
function loadSavedEntries() {
  const savedEntries = localStorage.getItem("calmspace_entries");
  if (savedEntries) {
    entries = JSON.parse(savedEntries);
    console.log("Loaded entries from localStorage:", entries);
  } else {
    console.log("No saved entries found in localStorage");
  }
}

// Save entries to local storage
function saveEntriesToStorage() {
  localStorage.setItem("calmspace_entries", JSON.stringify(entries));
  console.log("Saved entries to localStorage:", entries);
}

// Save a journal entry
function saveEntry(aiReflection) {
  const userInput = document.getElementById("prompt").value;

  const entry = {
    id: Date.now().toString(), // Unique ID based on timestamp
    date: new Date().toISOString(),
    userInput: userInput,
    aiReflection: aiReflection,
    emotion: selectedEmotion || "neutral",
    isFavorite: false,
    tags: [],
  };

  entries.unshift(entry); // Add to beginning of array (newest first)
  saveEntriesToStorage();

  return entry;
}

// Function to format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Get emotion icon based on emotion type
function getEmotionIcon(emotion) {
  switch (emotion) {
    case "happy":
      return '<i class="far fa-smile"></i>';
    case "sad":
      return '<i class="far fa-frown"></i>';
    case "neutral":
      return '<i class="far fa-meh"></i>';
    case "excited":
      return '<i class="far fa-grin-stars"></i>';
    case "anxious":
      return '<i class="far fa-grimace"></i>';
    default:
      return '<i class="far fa-meh"></i>';
  }
}

// Utility function for debouncing inputs
function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

// Function to render all entries in the sidebar
function renderEntries() {
  const entriesList = document.getElementById("entries-list");

  // Clear current entries
  entriesList.innerHTML = "";

  console.log("Rendering entries:", entries);

  if (!entries || entries.length === 0) {
    // Show empty state
    entriesList.innerHTML = `
      <div class="empty-state">
        <i class="far fa-file-alt"></i>
        <p>No saved entries yet. Start journaling!</p>
      </div>
    `;
    return;
  }

  // Add each entry to the list
  entries.forEach((entry) => {
    const entryElement = document.createElement("div");
    entryElement.classList.add("entry-item");
    entryElement.dataset.entryId = entry.id;

    // Truncate the user input for display
    const previewText =
      entry.userInput.length > 60
        ? entry.userInput.substring(0, 60) + "..."
        : entry.userInput;

    entryElement.innerHTML = `
      <div class="entry-date">${formatDate(entry.date)}</div>
      <div class="entry-preview">
        <span class="entry-emotion-indicator entry-emotion-${
          entry.emotion
        }"></span>
        ${previewText}
      </div>
    `;

    // Add click event to show entry details
    entryElement.addEventListener("click", () => {
      showEntryDetail(entry);
    });

    entriesList.appendChild(entryElement);
  });
}

// Function to render filtered entries with highlighted search text
function renderFilteredEntries(filteredEntries, query) {
  const entriesList = document.getElementById("entries-list");

  // Clear current entries
  entriesList.innerHTML = "";

  if (filteredEntries.length === 0) {
    // Show empty search state
    entriesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-search"></i>
        <p>No entries match your search</p>
      </div>
    `;
    return;
  }

  // Add each filtered entry to the list
  filteredEntries.forEach((entry) => {
    const entryElement = document.createElement("div");
    entryElement.classList.add("entry-item");
    entryElement.dataset.entryId = entry.id;

    // Prepare preview text with highlighted search term
    const previewText =
      entry.userInput.length > 60
        ? entry.userInput.substring(0, 60) + "..."
        : entry.userInput;

    // Highlight the search term in preview
    const highlightedPreview = highlightText(previewText, query);

    entryElement.innerHTML = `
      <div class="entry-date">${formatDate(entry.date)}</div>
      <div class="entry-preview">
        <span class="entry-emotion-indicator entry-emotion-${
          entry.emotion
        }"></span>
        ${highlightedPreview}
      </div>
    `;

    // Add click event to show entry details
    entryElement.addEventListener("click", () => {
      showEntryDetail(entry);
    });

    entriesList.appendChild(entryElement);
  });
}

// Function to highlight search text in preview
function highlightText(text, query) {
  if (!query) return text;

  // Use regex to replace all occurrences of the query with highlighted version
  const regex = new RegExp(query, "gi");
  return text.replace(
    regex,
    (match) => `<span class="highlight">${match}</span>`
  );
}

// Function to show entry detail in modal
function showEntryDetail(entry) {
  const modal = document.getElementById("entry-detail-modal");

  // Update modal content
  document.getElementById("modal-date").textContent = formatDate(entry.date);
  document.getElementById("modal-emotion-icon").innerHTML = getEmotionIcon(
    entry.emotion
  );
  document.getElementById("modal-emotion-text").textContent =
    entry.emotion.charAt(0).toUpperCase() + entry.emotion.slice(1);
  document.getElementById("modal-user-input").textContent = entry.userInput;
  document.getElementById("modal-ai-reflection").textContent =
    entry.aiReflection;

  // Setup delete button
  const deleteBtn = document.getElementById("delete-entry-btn");
  deleteBtn.onclick = () => {
    if (confirm("Are you sure you want to delete this journal entry?")) {
      deleteEntry(entry.id);
      closeModal();
    }
  };

  // Setup export button
  const exportBtn = document.getElementById("export-entry-btn");
  exportBtn.onclick = () => exportEntry(entry);

  // Add current entry id to modal for reference
  modal.dataset.entryId = entry.id;

  // Show modal
  modal.classList.add("active");

  // Add close button functionality
  const closeBtn = modal.querySelector(".close-modal");
  closeBtn.onclick = closeModal;

  // Close modal on click outside
  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
    }
  };
}

// Function to close modal
function closeModal() {
  const modal = document.getElementById("entry-detail-modal");
  modal.classList.remove("active");
}

// Function to delete an entry
function deleteEntry(id) {
  const index = entries.findIndex((entry) => entry.id === id);
  if (index !== -1) {
    entries.splice(index, 1);
    saveEntriesToStorage();
    renderEntries();
    showNotification("Entry deleted");
  }
}

// Function to export entry as text file
function exportEntry(entry) {
  const content = `
Journal Entry - ${formatDate(entry.date)}
Emotion: ${entry.emotion}

YOUR JOURNAL:
${entry.userInput}

AI REFLECTION:
${entry.aiReflection}
  `.trim();

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `journal-entry-${
    new Date(entry.date).toISOString().split("T")[0]
  }.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("Entry exported");
}

// Filter entries by emotion
function filterByEmotion(emotion) {
  if (!emotion || emotion === "all") {
    renderEntries(); // Show all entries if no filter
    return;
  }

  const filteredEntries = entries.filter((entry) => entry.emotion === emotion);
  renderFilteredEntries(filteredEntries, ""); // No search highlight needed
}

// Check if it's the user's first visit and show welcome modal
function checkFirstTimeUser() {
  const hasVisitedBefore = localStorage.getItem("calmspace_visited");

  if (!hasVisitedBefore) {
    // Show welcome modal
    const welcomeModal = document.getElementById("welcome-modal");
    setTimeout(() => {
      welcomeModal.classList.add("active");
    }, 1000);

    // Setup button actions
    const skipBtn = document.getElementById("skip-tour-btn");
    const startBtn = document.getElementById("start-journey-btn");
    const closeBtn = welcomeModal.querySelector(".close-modal");

    skipBtn.addEventListener("click", () => {
      closeWelcomeModal();
    });

    startBtn.addEventListener("click", () => {
      closeWelcomeModal();
      // Could start a guided tour here in the future
      showNotification(
        "Welcome to CalmSpace! Start by writing in your journal."
      );
    });

    closeBtn.addEventListener("click", () => {
      closeWelcomeModal();
    });

    // Mark as visited
    localStorage.setItem("calmspace_visited", "true");
  }
}

function closeWelcomeModal() {
  const welcomeModal = document.getElementById("welcome-modal");
  welcomeModal.classList.remove("active");
}

// Function to update word count
function updateWordCount() {
  const text = document.getElementById("prompt").value;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const wordCounter = document.querySelector(".word-counter");

  // Update the word counter
  wordCounter.textContent = `${wordCount} words`;

  // Add visual indication if approaching a limit
  if (wordCount > 400) {
    wordCounter.classList.add("limit-near");
  } else {
    wordCounter.classList.remove("limit-near");
  }

  if (wordCount > 500) {
    wordCounter.classList.add("limit-reached");
  } else {
    wordCounter.classList.remove("limit-reached");
  }

  // Auto-save while typing
  autoSaveDraft();
}

// Function to auto save draft of current entry
function autoSaveDraft() {
  const text = document.getElementById("prompt").value;
  if (text.trim().length > 10) {
    // Only save if there's substantial content
    localStorage.setItem("calmspace_draft", text);
    localStorage.setItem("calmspace_draft_emotion", selectedEmotion);
    localStorage.setItem("calmspace_draft_timestamp", new Date().toISOString());

    // Show subtle indicator of save
    const journalInput = document.querySelector(".journal-input");
    journalInput.classList.add("auto-saved");

    // Remove the indicator after a short delay
    setTimeout(() => {
      journalInput.classList.remove("auto-saved");
    }, 1000);
  }
}

// Function to load saved draft
function loadDraft() {
  const draftText = localStorage.getItem("calmspace_draft");
  const draftEmotion = localStorage.getItem("calmspace_draft_emotion");
  const draftTimestamp = localStorage.getItem("calmspace_draft_timestamp");

  if (draftText && draftTimestamp) {
    const lastEditTime = new Date(draftTimestamp);
    const now = new Date();
    const hoursSinceEdit = (now - lastEditTime) / (1000 * 60 * 60);

    // Only load drafts that are less than 24 hours old
    if (hoursSinceEdit < 24) {
      const textarea = document.getElementById("prompt");
      textarea.value = draftText;
      updateWordCount();

      // Select the saved emotion if available
      if (draftEmotion) {
        const emotions = document.querySelectorAll(".emotion");
        emotions.forEach((emotion) => {
          if (emotion.dataset.emotion === draftEmotion) {
            emotion.click();
          }
        });
      }

      // Show notification
      showNotification("Draft restored from your last session");
    }
  }
}

// Setup journaling prompts functionality
function setupJournalingPrompts() {
  const promptBtn = document.querySelector(".prompt-btn");
  const promptsContainer = document.querySelector(".prompts-container");

  if (!promptBtn || !promptsContainer) return;

  const closePrompts = promptsContainer.querySelector(".close-prompts");
  const promptItems = promptsContainer.querySelectorAll(".prompt-item");

  // Add glow effect when hovering over the inspiration button
  promptBtn.addEventListener("mouseenter", () => {
    promptBtn.style.boxShadow = "0 0 10px rgba(0, 212, 255, 0.4)";
  });

  promptBtn.addEventListener("mouseleave", () => {
    promptBtn.style.boxShadow = "";
  });

  // Toggle prompt container visibility with animation
  promptBtn.addEventListener("click", () => {
    // Add a subtle animation to the button itself
    promptBtn.classList.add("pulse");
    setTimeout(() => {
      promptBtn.classList.remove("pulse");
    }, 500);

    // Toggle the prompts container
    promptsContainer.classList.toggle("active");

    // If opening, ensure it has focus and is visible
    if (promptsContainer.classList.contains("active")) {
      showNotification("Choose a prompt for inspiration");
    }
  });

  // Close button functionality
  if (closePrompts) {
    closePrompts.addEventListener("click", () => {
      promptsContainer.classList.remove("active");
    });
  }

  // Setup each prompt item with enhanced feedback
  promptItems.forEach((item) => {
    item.addEventListener("click", () => {
      const promptText = item.dataset.prompt;
      const textarea = document.getElementById("prompt");

      // Insert the prompt text
      textarea.value = promptText;

      // Update word count
      updateWordCount();

      // Focus the textarea
      textarea.focus();

      // Close the prompts container
      promptsContainer.classList.remove("active");

      // Animation effect
      item.classList.add("pulse");
      setTimeout(() => {
        item.classList.remove("pulse");
      }, 500);

      // Show a notification
      showNotification("Prompt added to journal");
    });
  });
}

// Function to toggle fullscreen mode for journaling
function setupFullscreenMode() {
  const fullscreenBtn = document.querySelector(".fullscreen-btn");

  fullscreenBtn.addEventListener("click", () => {
    // Create fullscreen container if it doesn't exist
    let fullscreenMode = document.querySelector(".fullscreen-mode");

    if (!fullscreenMode) {
      // Create the fullscreen container
      fullscreenMode = document.createElement("div");
      fullscreenMode.classList.add("fullscreen-mode");

      // Create the header
      const header = document.createElement("div");
      header.classList.add("fullscreen-header");
      header.innerHTML = `
        <div class="fullscreen-title">Focus Mode</div>
        <div class="exit-fullscreen">
          <i class="fas fa-compress"></i> Exit Focus Mode
        </div>
      `;

      // Clone the journal input
      const journalInput = document
        .querySelector(".journal-input")
        .cloneNode(true);

      // Add to the fullscreen container
      fullscreenMode.appendChild(header);
      fullscreenMode.appendChild(journalInput);

      // Append to body
      document.body.appendChild(fullscreenMode);

      // Setup exit button
      const exitBtn = fullscreenMode.querySelector(".exit-fullscreen");
      exitBtn.addEventListener("click", () => {
        // Get the textarea content before removing
        const fullscreenTextarea = fullscreenMode.querySelector("textarea");
        const mainTextarea = document.getElementById("prompt");

        // Sync content back to main textarea
        if (fullscreenTextarea && mainTextarea) {
          mainTextarea.value = fullscreenTextarea.value;
          updateWordCount(); // Update word count in main view
        }

        // Sync emotion selection back to main view if selected in fullscreen
        const fullscreenActiveEmotion =
          fullscreenMode.querySelector(".emotion.active");
        if (
          fullscreenActiveEmotion &&
          fullscreenActiveEmotion.dataset.emotion
        ) {
          // Find the corresponding emotion in the main view and activate it
          const mainEmotions = document.querySelectorAll(
            ".journal-section .emotion"
          );
          mainEmotions.forEach((emotion) => {
            if (
              emotion.dataset.emotion ===
              fullscreenActiveEmotion.dataset.emotion
            ) {
              // Remove active class from all emotions in main view
              mainEmotions.forEach((e) => e.classList.remove("active"));
              // Add active class to selected emotion
              emotion.classList.add("active");
              selectedEmotion = emotion.dataset.emotion;
            }
          });
        }

        // Remove fullscreen mode
        fullscreenMode.remove();
      });

      // Setup textarea in fullscreen mode
      const textarea = fullscreenMode.querySelector("textarea");
      textarea.id = "fullscreen-prompt"; // Change ID to avoid conflict

      // Sync content from main textarea
      textarea.value = document.getElementById("prompt").value;

      // Focus the textarea
      setTimeout(() => {
        textarea.focus();
      }, 100);

      // Setup emotions in fullscreen mode
      const fullscreenEmotions = fullscreenMode.querySelectorAll(".emotion");
      fullscreenEmotions.forEach((emotion) => {
        // First, remove old event listeners by cloning and replacing each emotion element
        const newEmotion = emotion.cloneNode(true);
        emotion.parentNode.replaceChild(newEmotion, emotion);

        // Add new click event listeners to each emotion
        newEmotion.addEventListener("click", () => {
          // Remove active class from all emotions in fullscreen mode
          fullscreenEmotions.forEach((e) => e.classList.remove("active"));
          // Add active class to selected emotion
          newEmotion.classList.add("active");
          selectedEmotion = newEmotion.dataset.emotion;

          // Add animation to selected emotion
          newEmotion.classList.add("pulse");
          setTimeout(() => {
            newEmotion.classList.remove("pulse");
          }, 500);
        });

        // Mark the currently selected emotion as active in fullscreen mode
        if (newEmotion.dataset.emotion === selectedEmotion) {
          newEmotion.classList.add("active");
        }
      });

      // Re-initialize prompts in fullscreen mode
      setupPrompts(fullscreenMode);

      // Apply animation
      setTimeout(() => {
        fullscreenMode.classList.add("active");
      }, 10);
    }
  });
}

// Initialize the prompts in a container
function setupPrompts(container = document) {
  const promptBtn = container.querySelector(".prompt-btn");
  const promptsContainer = container.querySelector(".prompts-container");

  if (!promptBtn || !promptsContainer) return;

  const closePrompts = promptsContainer.querySelector(".close-prompts");
  const promptItems = promptsContainer.querySelectorAll(".prompt-item");

  promptBtn.addEventListener("click", () => {
    promptsContainer.classList.toggle("active");
  });

  if (closePrompts) {
    closePrompts.addEventListener("click", () => {
      promptsContainer.classList.remove("active");
    });
  }

  promptItems.forEach((item) => {
    item.addEventListener("click", () => {
      // Get the prompt text and the proper textarea
      const promptText = item.dataset.prompt;
      const textarea = container.querySelector("textarea");

      if (textarea) {
        // Insert the prompt text
        textarea.value = promptText;

        // Focus the textarea
        textarea.focus();

        // Update word count if we're in the main view
        if (textarea.id === "prompt") {
          updateWordCount();
        }
      }

      // Close the prompts container
      promptsContainer.classList.remove("active");

      // Show a notification
      showNotification("Prompt added to journal");
    });
  });
}

// Setup meditation launcher
function setupMeditationLauncher() {
  const meditationLauncher = document.querySelector(".meditation-launcher");
  const meditationContainer = document.getElementById("meditation-container");

  if (!meditationLauncher || !meditationContainer) {
    console.error("Meditation launcher or container not found");
    return;
  }

  meditationLauncher.addEventListener("click", () => {
    // Show loading notification
    showNotification("Opening meditation timer...");

    // Make the container visible first
    meditationContainer.classList.add("active");

    // Simple approach - directly check if meditationTimer exists and is initialized
    if (window.meditationTimer) {
      // Initialize if not already initialized
      if (!window.meditationTimer.initialized) {
        window.meditationTimer.initialize("#meditation-container");
        window.meditationTimer.initialized = true;
      }

      // Show the meditation container
      meditationContainer.classList.add("active");

      // Track meditation usage in local storage
      incrementMeditationUsage();
    } else {
      // If meditation JS is not loaded yet, show a notification
      showNotification("Loading meditation timer...");

      // Load the meditation script dynamically if needed
      const script = document.createElement("script");
      script.src = "meditation.js";
      script.onload = () => {
        // Initialize meditation timer once script is loaded
        if (window.meditationTimer) {
          window.meditationTimer.initialize("#meditation-container");
          window.meditationTimer.initialized = true;
          meditationContainer.classList.add("active");
          incrementMeditationUsage();
        }
      };
      document.body.appendChild(script);
    }
  });
}

// Track meditation usage stats
function incrementMeditationUsage() {
  // Get current stats or initialize
  const stats = JSON.parse(
    localStorage.getItem("calmspace_meditation_stats") ||
      '{"count": 0, "totalMinutes": 0, "lastUsed": null}'
  );

  // Update stats
  stats.count++;
  stats.totalMinutes += window.meditationTimer
    ? window.meditationTimer.duration
    : 5; // Default to 5 minutes
  stats.lastUsed = new Date().toISOString();

  // Save updated stats
  localStorage.setItem("calmspace_meditation_stats", JSON.stringify(stats));
}

// Setup speech-to-text functionality
function setupSpeechToText() {
  const speechBtn = document.querySelector(".speech-btn");
  const textarea = document.getElementById("prompt");

  // Check if browser supports speech recognition
  if (
    !("webkitSpeechRecognition" in window) &&
    !("SpeechRecognition" in window)
  ) {
    speechBtn.style.display = "none";
    return;
  }

  // Initialize speech recognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = "en-US";

  let isRecording = false;

  speechBtn.addEventListener("click", () => {
    if (isRecording) {
      // Stop recording
      recognition.stop();
      speechBtn.classList.remove("recording");
      showNotification("Voice recording stopped");
    } else {
      // Start recording
      recognition.start();
      speechBtn.classList.add("recording");
      showNotification("Listening... Speak now");
    }

    isRecording = !isRecording;
  });

  // Process speech results
  recognition.onresult = (event) => {
    let interimTranscript = "";
    let finalTranscript = "";

    // Get current cursor position
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    const textAfterCursor = textarea.value.substring(cursorPos);

    // Process recognition results
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;

      if (event.results[i].isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }

    // Insert recognized text at cursor position
    if (finalTranscript) {
      textarea.value = textBeforeCursor + finalTranscript + textAfterCursor;
      textarea.selectionStart = textarea.selectionEnd =
        cursorPos + finalTranscript.length;

      // Update word count
      updateWordCount();
    }
  };

  // Error handling
  recognition.onerror = (event) => {
    if (event.error === "not-allowed") {
      showNotification("Microphone access denied");
    } else {
      showNotification(`Error: ${event.error}`);
    }

    isRecording = false;
    speechBtn.classList.remove("recording");
  };

  // Handle when recognition ends
  recognition.onend = () => {
    if (isRecording) {
      // Auto restart if still in recording mode
      recognition.start();
    } else {
      speechBtn.classList.remove("recording");
    }
  };
}

// Initialize elements and event handlers
document.addEventListener("DOMContentLoaded", () => {
  // Check for first time users
  checkFirstTimeUser();

  // Load saved entries
  loadSavedEntries();

  // Load saved draft
  loadDraft();

  // Render entries in the sidebar
  renderEntries();

  // Setup word counter and focus effects for textarea
  const textarea = document.getElementById("prompt");
  textarea.addEventListener("input", debounce(updateWordCount, 300));

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

  // Setup fullscreen mode
  setupFullscreenMode();

  // Setup journaling prompts in the main view - use the enhanced function
  setupJournalingPrompts(); // We'll use this for the main view instead of setupPrompts()

  // Setup meditation launcher
  setupMeditationLauncher();

  // Setup speech-to-text functionality
  setupSpeechToText();

  // Setup search functionality
  const searchBtn = document.getElementById("search-btn");
  const searchContainer = document.querySelector(".search-container");
  const searchInput = document.querySelector(".search-input");
  const searchClose = document.querySelector(".search-close");

  searchBtn.addEventListener("click", () => {
    searchContainer.classList.toggle("active");
    if (searchContainer.classList.contains("active")) {
      searchInput.focus();
    }
  });

  searchClose.addEventListener("click", () => {
    searchContainer.classList.remove("active");
    searchInput.value = "";
    renderEntries(); // Reset to show all entries
  });

  searchInput.addEventListener(
    "input",
    debounce(() => {
      const query = searchInput.value.toLowerCase();
      if (query.trim() === "") {
        renderEntries();
        return;
      }

      // Filter entries that match the search query
      const filteredEntries = entries.filter(
        (entry) =>
          entry.userInput.toLowerCase().includes(query) ||
          entry.aiReflection.toLowerCase().includes(query)
      );

      renderFilteredEntries(filteredEntries, query);
    }, 300)
  );

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
    const output = document.getElementById("output").textContent;
    const userInput = document.getElementById("prompt").value;

    console.log("Save button clicked. User input:", userInput);
    console.log("AI output:", output);

    if (
      output.trim() &&
      output !== "Your AI-assisted reflections will appear here..."
    ) {
      saveBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
      saveBtn.classList.add("saved");

      // Save the current journal entry with enhanced metadata
      const savedEntry = saveEntry(output);
      console.log("Entry saved successfully:", savedEntry);

      // Create and show notification
      showNotification("Reflection saved!");
      renderEntries(); // Update the sidebar with the new entry
    } else {
      console.log("Nothing to save: Empty output or default text");
      showNotification("Nothing to save yet");
    }
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

  // Connect reflect button to the askGemini function
  document.getElementById("reflect-btn").addEventListener("click", askGemini);

  // Add hover animation to floating shapes
  animateBackgroundShapes();

  // Setup filter button
  const filterBtn = document.getElementById("filter-btn");
  filterBtn.addEventListener("click", () => {
    // Create filter dialog if it doesn't exist
    let filterDialog = document.querySelector(".filter-dialog");

    if (!filterDialog) {
      filterDialog = document.createElement("div");
      filterDialog.classList.add("filter-dialog");
      filterDialog.innerHTML = `
        <div class="filter-header">Filter by Emotion</div>
        <div class="filter-options">
          <div class="filter-option" data-emotion="all">
            <i class="fas fa-border-all"></i> All Entries
          </div>
          <div class="filter-option" data-emotion="happy">
            <span class="entry-emotion-indicator entry-emotion-happy"></span>
            <i class="far fa-smile"></i> Happy
          </div>
          <div class="filter-option" data-emotion="sad">
            <span class="entry-emotion-indicator entry-emotion-sad"></span>
            <i class="far fa-frown"></i> Sad
          </div>
          <div class="filter-option" data-emotion="neutral">
            <span class="entry-emotion-indicator entry-emotion-neutral"></span>
            <i class="far fa-meh"></i> Neutral
          </div>
          <div class="filter-option" data-emotion="excited">
            <span class="entry-emotion-indicator entry-emotion-excited"></span>
            <i class="far fa-grin-stars"></i> Excited
          </div>
          <div class="filter-option" data-emotion="anxious">
            <span class="entry-emotion-indicator entry-emotion-anxious"></span>
            <i class="far fa-grimace"></i> Anxious
          </div>
        </div>
      `;

      document.querySelector(".history-sidebar").appendChild(filterDialog);

      // Add event listeners to filter options
      const filterOptions = filterDialog.querySelectorAll(".filter-option");
      filterOptions.forEach((option) => {
        option.addEventListener("click", () => {
          // Remove active class from all options
          filterOptions.forEach((opt) => opt.classList.remove("active"));
          // Add active class to clicked option
          option.classList.add("active");

          // Apply filter
          filterByEmotion(option.dataset.emotion);

          // Hide filter dialog
          filterDialog.classList.remove("show");
        });
      });
    }

    // Toggle filter dialog
    filterDialog.classList.toggle("show");
  });
});

// Function to show notifications with smoother animation
function showNotification(message) {
  // Create notification element if it doesn't exist
  let notification = document.querySelector(".notification");

  if (!notification) {
    notification = document.createElement("div");
    notification.className = "notification";
    document.body.appendChild(notification);
  }

  // Set message and show
  notification.textContent = message;
  notification.classList.add("show");

  // Hide after a delay
  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Function to add entrance animations to elements
function animateEntranceEffects() {
  const elements = [".journal-input", ".response-section", ".history-sidebar"];

  elements.forEach((selector, index) => {
    const element = document.querySelector(selector);
    if (element) {
      element.style.opacity = "0";
      element.style.transform = "translateY(20px)";
      element.style.transition = "opacity 0.5s ease, transform 0.5s ease";

      setTimeout(() => {
        element.style.opacity = "1";
        element.style.transform = "translateY(0)";
      }, 100 + index * 150);
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

  // Reset conversation history to prevent context buildup
  conversationHistory = [];

  // Add emotion context if selected
  let promptWithEmotion = userInput;
  if (selectedEmotion) {
    promptWithEmotion = `I'm feeling ${selectedEmotion} today. ${userInput}`;
  }

  // Calculate journal length to determine response length
  const wordCount = promptWithEmotion.trim().split(/\s+/).length;
  const isShortJournal = wordCount < 30;

  // Create a strict prompt that demands extremely short responses
  const promptText = `CRITICAL INSTRUCTION: You are a therapeutic companion. Your responses MUST be extremely brief.
  
  ${
    isShortJournal
      ? "RESPOND WITH EXACTLY ONE SENTENCE, MAXIMUM 15 WORDS TOTAL. NO EXCEPTIONS."
      : "MAXIMUM 2 SENTENCES, NEVER MORE THAN 25 WORDS TOTAL. NO EXCEPTIONS."
  }
  
  Your response should be warm but extremely concise. Use contractions. 
  NO greetings, NO introductions, NO "I understand" phrases.
  NEVER mention the word limits in your response.
  Be insightful but brief.
  
  Journal entry: "${promptWithEmotion}"`;

  // Add the user's input to the conversation history
  conversationHistory.push({
    role: "user",
    parts: [{ text: promptText }],
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
          generationConfig: {
            maxOutputTokens: 50,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await response.json();
    console.log(data); // DEBUG: full response

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      let reply = data.candidates[0].content.parts[0].text.trim();

      // Additional safeguard: Truncate long responses
      const replyWords = reply.split(/\s+/);
      const maxWords = isShortJournal ? 15 : 25;

      if (replyWords.length > maxWords) {
        reply = replyWords.slice(0, maxWords).join(" ");
        // Ensure proper ending punctuation
        if (
          !reply.endsWith(".") &&
          !reply.endsWith("!") &&
          !reply.endsWith("?")
        ) {
          reply += ".";
        }
      }

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
