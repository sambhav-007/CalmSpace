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
    this.audioElements = {
      nature: null,
      rain: null,
      waves: null,
      bowl: null,
      bell: null,
    };
    this.endSound = "bell";
  }

  initialize(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;

    this.createTimerUI();
    this.loadAudioElements();
    this.addEventListeners();
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
            <button class="end-sound-option" data-sound="none" title="No sound">
              <i class="fas fa-volume-mute"></i>
            </button>
          </div>
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
  }

  loadAudioElements() {
    // Create audio elements for ambient sounds
    const audioFiles = {
      nature:
        "https://soundbible.com/mp3/Summer_Meadow_Ambience-SoundBible.com-2013477403.mp3",
      rain: "https://soundbible.com/mp3/rain_outside-Mike_Koenig-1759959592.mp3",
      waves: "https://soundbible.com/mp3/ocean_waves-Mike_Koenig-980635595.mp3",
      bowl: "https://soundbible.com/mp3/Tibetan-singing-bowl-sound-sample_MyssaSoundBible.com_.mp3",
      bell: "https://soundbible.com/mp3/meditation-bell-sound_daniel-simion.mp3",
    };

    // Create and configure audio elements
    for (const [key, url] of Object.entries(audioFiles)) {
      const audio = new Audio(url);

      if (key !== "bowl" && key !== "bell") {
        audio.loop = true;
      }

      audio.volume = this.volume;
      this.audioElements[key] = audio;
    }
  }

  addEventListeners() {
    // Decrease timer button
    document.getElementById("timer-decrease").addEventListener("click", () => {
      if (this.isPaused && this.duration > 1) {
        this.duration -= 1;
        this.remainingTime = this.duration * 60;
        this.updateTimerDisplay();
      }
    });

    // Increase timer button
    document.getElementById("timer-increase").addEventListener("click", () => {
      if (this.isPaused && this.duration < 60) {
        this.duration += 1;
        this.remainingTime = this.duration * 60;
        this.updateTimerDisplay();
      }
    });

    // Toggle timer button
    this.toggleButton.addEventListener("click", () => {
      this.toggleTimer();
    });

    // Ambient sound options
    const soundOptions = document.querySelectorAll(".sound-option");
    soundOptions.forEach((option) => {
      option.addEventListener("click", () => {
        // Stop all ambient sounds
        this.stopAllAmbientSounds();

        // Remove active class from all options
        soundOptions.forEach((opt) => opt.classList.remove("active"));

        // Set the new ambient sound
        this.ambientSound = option.dataset.sound;
        option.classList.add("active");

        // Play the new ambient sound if timer is running
        if (!this.isPaused && this.ambientSound !== "none") {
          this.audioElements[this.ambientSound]?.play();
        }
      });
    });

    // End sound options
    const endSoundOptions = document.querySelectorAll(".end-sound-option");
    endSoundOptions.forEach((option) => {
      option.addEventListener("click", () => {
        // Remove active class from all options
        endSoundOptions.forEach((opt) => opt.classList.remove("active"));

        // Set the new end sound
        this.endSound = option.dataset.sound;
        option.classList.add("active");
      });
    });

    // Volume control
    document.getElementById("volume-slider").addEventListener("input", (e) => {
      this.volume = e.target.value / 100;

      // Update volume for all audio elements
      for (const audio of Object.values(this.audioElements)) {
        if (audio) {
          audio.volume = this.volume;
        }
      }
    });

    // Close meditation button
    document
      .querySelector(".close-meditation")
      .addEventListener("click", () => {
        this.stopTimer();
        this.stopAllAmbientSounds();
        this.container.classList.remove("active");
      });
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
        this.audioElements[this.ambientSound]?.play();
      }

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
      if (this.ambientSound !== "none") {
        this.audioElements[this.ambientSound]?.pause();
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

      // Call onTick callback if defined
      if (this.onTick) {
        this.onTick(this.remainingTime);
      }
    } else {
      this.complete();
    }
  }

  complete() {
    this.stopAllAmbientSounds();
    this.pauseTimer();

    // Play ending sound
    if (this.endSound !== "none") {
      this.audioElements[this.endSound]?.play();
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
    document
      .getElementById("meditation-close-btn")
      .addEventListener("click", () => {
        messageElement.classList.remove("show");
        setTimeout(() => {
          messageElement.remove();
        }, 300);
      });
  }

  updateTimerDisplay() {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;

    this.minutesElement.textContent = minutes.toString().padStart(2, "0");
    this.secondsElement.textContent = seconds.toString().padStart(2, "0");
  }

  stopAllAmbientSounds() {
    for (const [key, audio] of Object.entries(this.audioElements)) {
      if (audio && (key === "nature" || key === "rain" || key === "waves")) {
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
