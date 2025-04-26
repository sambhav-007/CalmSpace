/**
 * Meditation Timer Module for CalmSpace
 * Enables users to practice mindfulness meditation alongside journaling
 */

class MeditationTimer {
  constructor() {
    this.duration = 5; // Default duration in minutes
    this.remainingTime = 5 * 60; // Convert to seconds
    this.isPaused = true;
    this.interval = null;
    this.ambientSound = "nature"; // Default ambient sound
    this.volume = 0.5; // Default volume (0-1)
    this.onComplete = null;
    this.onTick = null;
    this.audioElements = {};
    this.endSound = "bell";
    this.initialized = false;
    this.audioLoaded = false;
    this.audioContext = null;
  }

  initialize(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) {
      console.error("Meditation container not found:", containerSelector);
      return;
    }

    this.createTimerUI();
    this.loadAudioElements();
    this.addEventListeners();
    this.initialized = true;

    // Log initialization success
    console.log("Meditation timer initialized successfully");

    // Show notification to user
    this.showNotification("Meditation timer ready");
  }

  createTimerUI() {
    // Create UI elements
    this.container.innerHTML = `
      <div class="meditation-header">
        <h3><i class="fas fa-spa"></i> Meditation Timer</h3>
        <button class="close-meditation icon-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="meditation-content">
        <div class="timer-display">
          <span id="timer-minutes">05</span>:<span id="timer-seconds">00</span>
        </div>
        
        <div class="timer-controls">
          <button class="meditation-btn" id="timer-decrease" title="Decrease time">
            <i class="fas fa-minus"></i>
          </button>
          <button class="meditation-btn timer-btn-large" id="timer-toggle">
            <i class="fas fa-play"></i>
          </button>
          <button class="meditation-btn" id="timer-increase" title="Increase time">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        
        <div class="ambient-sounds">
          <h4>Ambient Sounds</h4>
          <div class="sound-options">
            <button class="sound-option active" data-sound="nature" title="Nature sounds">
              <i class="fas fa-leaf"></i>
            </button>
            <button class="sound-option" data-sound="rain" title="Rainfall">
              <i class="fas fa-cloud-rain"></i>
            </button>
            <button class="sound-option" data-sound="waves" title="Ocean waves">
              <i class="fas fa-water"></i>
            </button>
            <button class="sound-option" data-sound="whiteNoise" title="White noise">
              <i class="fas fa-wind"></i>
            </button>
            <button class="sound-option" data-sound="none" title="No sound">
              <i class="fas fa-volume-mute"></i>
            </button>
          </div>
          
          <div class="volume-control">
            <i class="fas fa-volume-down"></i>
            <input type="range" id="volume-slider" min="0" max="100" value="50">
            <i class="fas fa-volume-up"></i>
          </div>
        </div>
        
        <div class="ending-sound">
          <h4>Ending Sound</h4>
          <div class="sound-options">
            <button class="end-sound-option active" data-sound="bell" title="Bell">
              <i class="fas fa-bell"></i>
            </button>
            <button class="end-sound-option" data-sound="bowl" title="Singing bowl">
              <i class="fas fa-circle"></i>
            </button>
            <button class="end-sound-option" data-sound="gong" title="Meditation gong">
              <i class="fas fa-dot-circle"></i>
            </button>
            <button class="end-sound-option" data-sound="none" title="No sound">
              <i class="fas fa-volume-mute"></i>
            </button>
          </div>
        </div>
        
        <div class="meditation-status" id="meditation-status">
          <div class="meditation-status-icon">
            <i class="fas fa-om"></i>
          </div>
          <div class="meditation-status-text">Ready to begin</div>
        </div>
      </div>
      
      <div class="meditation-footer">
        <p>Take a moment to breathe and center yourself.</p>
      </div>
    `;

    // Cache DOM elements for later use
    this.minutesElement = document.getElementById("timer-minutes");
    this.secondsElement = document.getElementById("timer-seconds");
    this.toggleButton = document.getElementById("timer-toggle");
    this.statusElement = document.getElementById("meditation-status");
  }

  loadAudioElements() {
    // Define local audio files
    const audioFiles = {
      // Ambient sounds
      nature: "../assets/audio/nature-ambient.mp3",
      rain: "../assets/audio/rain-ambient.mp3",
      waves: "../assets/audio/waves-ambient.mp3",
      whiteNoise: "../assets/audio/white-noise.mp3",

      // End sounds
      bowl: "../assets/audio/singing-bowl.mp3",
      bell: "../assets/audio/meditation-bell.mp3",
      gong: "../assets/audio/meditation-gong.mp3",
    };

    // Fallback to online sources if local files fail
    const fallbackAudioUrls = {
      nature:
        "https://soundbible.com/mp3/Summer_Meadow_Ambience-SoundBible.com-2013477403.mp3",
      rain: "https://soundbible.com/mp3/rain_outside-Mike_Koenig-1759959592.mp3",
      waves: "https://soundbible.com/mp3/ocean_waves-Mike_Koenig-980635595.mp3",
      whiteNoise:
        "https://cdn.pixabay.com/download/audio/2022/03/15/audio_360d5a86ce.mp3",
      bowl: "https://soundbible.com/mp3/Tibetan-singing-bowl-sound-sample_MyssaSoundBible.com_.mp3",
      bell: "https://soundbible.com/mp3/meditation-bell-sound_daniel-simion.mp3",
      gong: "https://soundbible.com/mp3/tibetan-singing-bowl-strike-sound_daniel-simion.mp3",
    };

    try {
      // Try to initialize Web Audio API for better audio handling
      this.initWebAudio();
    } catch (error) {
      console.log("Web Audio API not supported, using standard Audio elements");
    }

    // Create and configure audio elements with fallbacks
    for (const [key, path] of Object.entries(audioFiles)) {
      try {
        // Create audio element
        const audio = new Audio(path);

        // Configure audio element
        if (key !== "bowl" && key !== "bell" && key !== "gong") {
          audio.loop = true;
        }

        audio.volume = this.volume;

        // Add error handler to use fallback URL if local file fails
        audio.addEventListener("error", (e) => {
          console.log(
            `Error loading audio file ${key} from local path, trying fallback URL`
          );
          if (fallbackAudioUrls[key]) {
            audio.src = fallbackAudioUrls[key];
            this.showNotification(`Using online audio for ${key}`);
          }
        });

        // Add loaded handler
        audio.addEventListener("canplaythrough", () => {
          console.log(`Audio file ${key} loaded successfully`);
          this.audioLoaded = true;
        });

        // Store audio element
        this.audioElements[key] = audio;

        // Preload audio
        audio.load();
      } catch (error) {
        console.error(`Error creating audio element for ${key}:`, error);

        // Try fallback URL as a last resort
        try {
          if (fallbackAudioUrls[key]) {
            const fallbackAudio = new Audio(fallbackAudioUrls[key]);
            if (key !== "bowl" && key !== "bell" && key !== "gong") {
              fallbackAudio.loop = true;
            }
            fallbackAudio.volume = this.volume;
            this.audioElements[key] = fallbackAudio;
            this.showNotification(`Using online audio for ${key}`);
          }
        } catch (fallbackError) {
          console.error(
            `Failed to load fallback audio for ${key}:`,
            fallbackError
          );
        }
      }
    }
  }

  // Initialize Web Audio API for better audio handling
  initWebAudio() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if (window.AudioContext) {
        this.audioContext = new AudioContext();
        console.log("Web Audio API initialized");
      }
    } catch (error) {
      console.error("Web Audio API not supported:", error);
    }
  }

  // Function to show notifications to users
  showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = this.container.querySelector(".meditation-notification");

    if (!notification) {
      notification = document.createElement("div");
      notification.className = "meditation-notification";
      this.container.appendChild(notification);
    }

    // Set message and show
    notification.textContent = message;
    notification.classList.add("show");

    // Hide after a delay
    setTimeout(() => {
      notification.classList.remove("show");
    }, 3000);
  }

  addEventListeners() {
    // Decrease timer button
    const decreaseButton = document.getElementById("timer-decrease");
    if (decreaseButton) {
      decreaseButton.addEventListener("click", () => {
        if (this.isPaused && this.duration > 1) {
          this.duration -= 1;
          this.remainingTime = this.duration * 60;
          this.updateTimerDisplay();
        }
      });
    }

    // Increase timer button
    const increaseButton = document.getElementById("timer-increase");
    if (increaseButton) {
      increaseButton.addEventListener("click", () => {
        if (this.isPaused && this.duration < 60) {
          this.duration += 1;
          this.remainingTime = this.duration * 60;
          this.updateTimerDisplay();
        }
      });
    }

    // Toggle timer button
    if (this.toggleButton) {
      this.toggleButton.addEventListener("click", () => {
        this.toggleTimer();
      });
    }

    // Ambient sound options
    const soundOptions = document.querySelectorAll(".sound-option");
    if (soundOptions) {
      soundOptions.forEach((option) => {
        option.addEventListener("click", () => {
          // Stop all ambient sounds
          this.stopAmbientSound();

          // Remove active class from all options
          soundOptions.forEach((opt) => opt.classList.remove("active"));

          // Set the new ambient sound
          this.ambientSound = option.dataset.sound;
          option.classList.add("active");

          // Play the new ambient sound if timer is running
          if (!this.isPaused && this.ambientSound !== "none") {
            this.playAmbientSound();
          }

          // Update status
          this.updateStatus();
        });
      });
    }

    // End sound options
    const endSoundOptions = document.querySelectorAll(".end-sound-option");
    if (endSoundOptions) {
      endSoundOptions.forEach((option) => {
        option.addEventListener("click", () => {
          // Remove active class from all options
          endSoundOptions.forEach((opt) => opt.classList.remove("active"));

          // Set the new end sound
          this.endSound = option.dataset.sound;
          option.classList.add("active");

          // Play a preview of the end sound
          if (this.endSound !== "none" && this.isPaused) {
            this.previewEndSound();
          }
        });
      });
    }

    // Volume control
    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
      volumeSlider.addEventListener("input", (e) => {
        this.volume = e.target.value / 100;

        // Update volume for all audio elements
        for (const [key, audio] of Object.entries(this.audioElements)) {
          if (audio) {
            audio.volume = this.volume;
          }
        }
      });
    }

    // Close meditation button
    const closeButton = document.querySelector(".close-meditation");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        this.stopTimer();
        this.stopAmbientSound();
        this.stopAllSounds();
        this.container.classList.remove("active");
      });
    }
  }

  // Preview ending sound when selected
  previewEndSound() {
    if (this.endSound === "none") return;

    // First stop any currently playing end sounds
    const endSounds = ["bowl", "bell", "gong"];
    endSounds.forEach((sound) => {
      if (this.audioElements[sound]) {
        this.audioElements[sound].pause();
        this.audioElements[sound].currentTime = 0;
      }
    });

    // Play selected end sound
    this.playEndSound();
  }

  toggleTimer() {
    if (this.isPaused) {
      this.startTimer();
    } else {
      this.pauseTimer();
    }
  }

  startTimer() {
    if (this.isPaused) {
      this.isPaused = false;
      this.toggleButton.innerHTML = '<i class="fas fa-pause"></i>';

      // Play ambient sound
      if (this.ambientSound !== "none") {
        this.playAmbientSound();
      }

      // Update status
      this.updateStatus();

      // Start timer interval
      this.interval = setInterval(() => {
        this.tick();
      }, 1000);
    }
  }

  pauseTimer() {
    if (!this.isPaused) {
      this.isPaused = true;
      this.toggleButton.innerHTML = '<i class="fas fa-play"></i>';
      clearInterval(this.interval);

      // Pause ambient sound
      this.stopAmbientSound();

      // Update status
      if (this.statusElement) {
        this.statusElement.classList.remove("active");
        this.statusElement.querySelector(
          ".meditation-status-text"
        ).textContent = "Paused";
      }
    }
  }

  stopTimer() {
    this.pauseTimer();
    this.remainingTime = this.duration * 60;
    this.updateTimerDisplay();
  }

  tick() {
    if (this.remainingTime > 0) {
      this.remainingTime--;
      this.updateTimerDisplay();

      // Add visual feedback when time is almost up
      if (this.remainingTime <= 10) {
        const timerDisplay = document.querySelector(".timer-display");
        if (timerDisplay) timerDisplay.classList.add("pulse-gentle");
      }

      // Start fading out ambient sound near the end
      if (this.remainingTime === 3) {
        this.stopAmbientSound();
      }

      // Call onTick callback if defined
      if (this.onTick) {
        this.onTick(this.remainingTime);
      }
    } else {
      this.complete();
    }
  }

  complete() {
    // Stop timer and ambient sounds
    clearInterval(this.interval);
    this.stopAmbientSound();

    // Reset UI
    this.isPaused = true;
    this.toggleButton.innerHTML = '<i class="fas fa-play"></i>';

    // Remove pulse effect
    const timerDisplay = document.querySelector(".timer-display");
    if (timerDisplay) timerDisplay.classList.remove("pulse-gentle");

    // Play ending sound
    this.playEndSound();

    // Update status
    if (this.statusElement) {
      this.statusElement.querySelector(".meditation-status-text").textContent =
        "Meditation complete";
    }

    // Reset timer
    setTimeout(() => {
      this.remainingTime = this.duration * 60;
      this.updateTimerDisplay();

      // Show meditation completion message
      this.showCompletionMessage();

      // Call onComplete callback if defined
      if (this.onComplete) {
        this.onComplete();
      }
    }, 1000);
  }

  showCompletionMessage() {
    const messageElement = document.createElement("div");
    messageElement.classList.add("meditation-complete");
    messageElement.innerHTML = `
      <div class="meditation-complete-content">
        <i class="fas fa-check-circle"></i>
        <h4>Meditation Complete</h4>
        <p>Well done! Take a moment to notice how you feel.</p>
        <button class="outline-btn" id="meditation-close-btn">Continue</button>
      </div>
    `;

    // Add to container
    this.container.appendChild(messageElement);

    // Animate in
    setTimeout(() => {
      messageElement.classList.add("show");
    }, 10);

    // Add event listener to close button
    const closeBtn = document.getElementById("meditation-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        messageElement.classList.remove("show");
        setTimeout(() => {
          messageElement.remove();

          // Reset status
          if (this.statusElement) {
            this.statusElement.querySelector(
              ".meditation-status-text"
            ).textContent = "Ready to begin";
          }
        }, 300);
      });
    }
  }

  updateTimerDisplay() {
    if (!this.minutesElement || !this.secondsElement) return;

    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;

    this.minutesElement.textContent = minutes.toString().padStart(2, "0");
    this.secondsElement.textContent = seconds.toString().padStart(2, "0");
  }

  updateStatus() {
    if (!this.statusElement) return;

    if (!this.isPaused) {
      this.statusElement.classList.add("active");

      // Get display name for the sound
      let soundName = this.ambientSound;
      if (soundName === "whiteNoise") soundName = "white noise";

      this.statusElement.querySelector(".meditation-status-text").textContent =
        this.ambientSound === "none"
          ? "Meditating in silence"
          : `Meditating with ${soundName} sounds`;
    } else {
      this.statusElement.classList.remove("active");
      this.statusElement.querySelector(".meditation-status-text").textContent =
        "Ready to begin";
    }
  }

  playAmbientSound() {
    if (this.ambientSound === "none") return;

    const sound = this.audioElements[this.ambientSound];
    if (!sound) return;

    // Reset audio to beginning
    sound.currentTime = 0;

    // Set volume
    sound.volume = this.volume;

    // Use promise-based play with error handling
    const playPromise = sound.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error(
          `Error playing ambient sound: ${this.ambientSound}`,
          error
        );
        this.showNotification(
          "Audio autoplay prevented by browser. Click play again."
        );
      });
    }
  }

  stopAmbientSound() {
    // Stop all ambient sounds
    const ambientSounds = ["nature", "rain", "waves", "whiteNoise"];
    ambientSounds.forEach((sound) => {
      const audio = this.audioElements[sound];
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });
  }

  playEndSound() {
    if (this.endSound === "none") return;

    const sound = this.audioElements[this.endSound];
    if (!sound) return;

    // Reset audio to beginning
    sound.currentTime = 0;

    // Set volume
    sound.volume = this.volume;

    // Use promise-based play with error handling
    const playPromise = sound.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.error(`Error playing end sound: ${this.endSound}`, error);
      });
    }
  }

  stopAllSounds() {
    // Stop all audio elements
    for (const [key, audio] of Object.entries(this.audioElements)) {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }
}

// Create global meditation timer instance
const meditationTimer = new MeditationTimer();

// Export the class
window.MeditationTimer = MeditationTimer;
window.meditationTimer = meditationTimer;

// Initialize on load if on a page with the meditation container
document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("meditation-container");
  if (container) {
    // Short timeout to ensure DOM is fully ready
    setTimeout(() => {
      meditationTimer.initialize("#meditation-container");
    }, 200);
  }
});
