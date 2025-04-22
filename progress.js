/**
 * CalmSpace Progress
 *
 * This file manages the Progress page functionality including
 * habit tracking, goal setting, mood calendar, and gratitude journaling.
 */

// Store habits, goals and other data
let habits = [];
let goals = [];
let gratitudeNotes = [];
let dailyMoods = {};
let currentMonth = new Date();
let quotes = [
  {
    text: "The mind is everything. What you think you become.",
    author: "Buddha",
  },
  {
    text: "You are never too old to set another goal or to dream a new dream.",
    author: "C.S. Lewis",
  },
  {
    text: "The journey of a thousand miles begins with one step.",
    author: "Lao Tzu",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Your time is limited, don't waste it living someone else's life.",
    author: "Steve Jobs",
  },
  {
    text: "In the midst of movement and chaos, keep stillness inside of you.",
    author: "Deepak Chopra",
  },
  {
    text: "Be present in all things and thankful for all things.",
    author: "Maya Angelou",
  },
  {
    text: "The wound is the place where the light enters you.",
    author: "Rumi",
  },
  {
    text: "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
    author: "Rumi",
  },
  {
    text: "The quieter you become, the more you can hear.",
    author: "Ram Dass",
  },
  {
    text: "Be the change that you wish to see in the world.",
    author: "Mahatma Gandhi",
  },
  {
    text: "Happiness is not something ready-made. It comes from your own actions.",
    author: "Dalai Lama",
  },
];

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Set up theme toggle to match the journal page
  setupThemeToggle();

  // Load data from local storage
  loadAllData();

  // Initialize UI components
  initializeHabits();
  initializeGoals();
  initializeMoodCalendar();
  initializeStreakCounter();
  initializeGratitude();
  setupDailyQuote();

  // Set up meditation launcher to be consistent with other pages
  setupMeditationLauncher();
});

// Load all data from local storage
function loadAllData() {
  // Load habits
  const savedHabits = localStorage.getItem("calmspace_habits");
  if (savedHabits) {
    habits = JSON.parse(savedHabits);
  }

  // Load goals
  const savedGoals = localStorage.getItem("calmspace_goals");
  if (savedGoals) {
    goals = JSON.parse(savedGoals);
  }

  // Load gratitude notes
  const savedGratitude = localStorage.getItem("calmspace_gratitude");
  if (savedGratitude) {
    gratitudeNotes = JSON.parse(savedGratitude);
  }

  // Load mood data
  const savedMoods = localStorage.getItem("calmspace_daily_moods");
  if (savedMoods) {
    dailyMoods = JSON.parse(savedMoods);
  }

  // Load journal entries to extract mood data if not already present
  if (Object.keys(dailyMoods).length === 0) {
    extractMoodsFromJournalEntries();
  }
}

// Extract moods from journal entries
function extractMoodsFromJournalEntries() {
  const savedEntries = localStorage.getItem("calmspace_entries");
  if (!savedEntries) return;

  const entries = JSON.parse(savedEntries);
  entries.forEach((entry) => {
    const date = new Date(entry.date);
    const dateString = `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}`;

    if (!dailyMoods[dateString]) {
      dailyMoods[dateString] = entry.emotion || "neutral";
    }
  });

  // Save the extracted moods
  saveDailyMoods();
}

// Save habits to local storage
function saveHabits() {
  localStorage.setItem("calmspace_habits", JSON.stringify(habits));
}

// Save goals to local storage
function saveGoals() {
  localStorage.setItem("calmspace_goals", JSON.stringify(goals));
}

// Save gratitude notes to local storage
function saveGratitude() {
  localStorage.setItem("calmspace_gratitude", JSON.stringify(gratitudeNotes));
}

// Save daily moods to local storage
function saveDailyMoods() {
  localStorage.setItem("calmspace_daily_moods", JSON.stringify(dailyMoods));
}

// Initialize habit tracking functionality
function initializeHabits() {
  renderHabits();

  // Set up add habit button
  const addHabitBtn = document.getElementById("add-habit-btn");
  const habitModal = document.getElementById("habit-modal");
  const cancelHabitBtn = document.getElementById("cancel-habit-btn");
  const saveHabitBtn = document.getElementById("save-habit-btn");
  const closeModalBtn = habitModal.querySelector(".close-modal");

  addHabitBtn.addEventListener("click", () => {
    openHabitModal();
  });

  cancelHabitBtn.addEventListener("click", () => {
    closeHabitModal();
  });

  closeModalBtn.addEventListener("click", () => {
    closeHabitModal();
  });

  saveHabitBtn.addEventListener("click", () => {
    saveNewHabit();
  });

  // Set up day checkboxes in modal
  const dayCheckboxes = document.querySelectorAll(".day-checkbox");
  dayCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("click", () => {
      checkbox.classList.toggle("selected");
    });
  });

  // Set up color options in modal
  const colorOptions = document.querySelectorAll(".color-option");
  colorOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove active class from all options
      colorOptions.forEach((opt) => opt.classList.remove("active"));
      // Add active class to clicked option
      option.classList.add("active");
    });
  });

  // Set up icon options in modal
  const iconOptions = document.querySelectorAll(".icon-option");
  iconOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove active class from all options
      iconOptions.forEach((opt) => opt.classList.remove("active"));
      // Add active class to clicked option
      option.classList.add("active");
    });
  });
}

// Open the habit modal
function openHabitModal() {
  const habitModal = document.getElementById("habit-modal");
  const habitNameInput = document.getElementById("habit-name");

  // Reset form
  habitNameInput.value = "";
  document
    .querySelectorAll(".day-checkbox")
    .forEach((cb) => cb.classList.remove("selected"));
  document.querySelectorAll(".color-option").forEach((opt, index) => {
    if (index === 0) opt.classList.add("active");
    else opt.classList.remove("active");
  });
  document.querySelectorAll(".icon-option").forEach((opt, index) => {
    if (index === 0) opt.classList.add("active");
    else opt.classList.remove("active");
  });

  // Show modal
  habitModal.style.display = "flex";
  setTimeout(() => {
    habitModal.classList.add("active");
    habitNameInput.focus();
  }, 10);
}

// Close the habit modal
function closeHabitModal() {
  const habitModal = document.getElementById("habit-modal");
  habitModal.classList.remove("active");
  setTimeout(() => {
    habitModal.style.display = "none";
  }, 300);
}

// Save a new habit
function saveNewHabit() {
  const habitNameInput = document.getElementById("habit-name");
  const habitName = habitNameInput.value.trim();

  if (!habitName) {
    showNotification("Please enter a habit name");
    return;
  }

  // Get selected days
  const selectedDays = [];
  document.querySelectorAll(".day-checkbox.selected").forEach((day) => {
    selectedDays.push(parseInt(day.dataset.day));
  });

  if (selectedDays.length === 0) {
    showNotification("Please select at least one day");
    return;
  }

  // Get selected color
  const selectedColor = document.querySelector(".color-option.active").dataset
    .color;

  // Get selected icon
  const selectedIcon = document.querySelector(".icon-option.active").dataset
    .icon;

  // Create new habit
  const newHabit = {
    id: Date.now().toString(),
    name: habitName,
    days: selectedDays,
    color: selectedColor,
    icon: selectedIcon,
    completed: {}, // Store completion dates
  };

  // Add to habits array
  habits.push(newHabit);

  // Save and update UI
  saveHabits();
  renderHabits();
  closeHabitModal();
  showNotification("Habit added successfully");
}

// Render all habits
function renderHabits() {
  const habitList = document.getElementById("habit-list");

  if (habits.length === 0) {
    habitList.innerHTML = `
      <div class="empty-habits">
        <i class="fas fa-seedling"></i>
        <p>Add habits to track your progress</p>
      </div>
    `;
    return;
  }

  habitList.innerHTML = "";

  habits.forEach((habit) => {
    // Create DOM element
    const habitElement = document.createElement("div");
    habitElement.classList.add("habit-item");
    habitElement.dataset.habitId = habit.id;

    // Get the current week's days
    const weekDays = getCurrentWeekDays();

    // Check which days in current week are scheduled for this habit
    const scheduledDays = weekDays.map((date, index) => {
      const dayOfWeek = date.getDay();
      return {
        date,
        scheduled: habit.days.includes(dayOfWeek),
        dayIndex: index,
        completed: isHabitCompletedOn(habit, date),
      };
    });

    // Build the HTML
    habitElement.innerHTML = `
      <div class="habit-header">
        <div class="habit-icon" style="background-color: ${habit.color}">
          <i class="${habit.icon}" style="color: white"></i>
        </div>
        <div class="habit-name">${habit.name}</div>
        <div class="habit-actions">
          <button class="icon-btn delete-habit-btn" title="Delete habit">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      <div class="habit-track">
        ${scheduledDays
          .map(
            (day) => `
          <div class="habit-day${day.scheduled ? " scheduled" : " disabled"}${
              day.completed ? " completed" : ""
            }" 
               style="${
                 day.scheduled ? `background-color: ${habit.color}30;` : ""
               }"
               data-date="${formatDateForDatabase(day.date)}"
               ${day.scheduled ? "" : "disabled"}>
            ${day.date.getDate()}
          </div>
        `
          )
          .join("")}
      </div>
    `;

    habitList.appendChild(habitElement);

    // Add event listeners
    const deleteBtn = habitElement.querySelector(".delete-habit-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteHabit(habit.id);
    });

    // Add click events for completion tracking
    const habitDays = habitElement.querySelectorAll(".habit-day.scheduled");
    habitDays.forEach((dayEl) => {
      dayEl.addEventListener("click", () => {
        const dateStr = dayEl.dataset.date;
        toggleHabitCompletion(habit.id, dateStr, dayEl);
      });
    });
  });
}

// Get array of dates for the current week (Sunday-Saturday)
function getCurrentWeekDays() {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Calculate the date of Sunday (start of week)
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dayOfWeek);

  // Create array of 7 days starting from Sunday
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    weekDays.push(date);
  }

  return weekDays;
}

// Format date as YYYY-MM-DD for storage
function formatDateForDatabase(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Check if habit is completed on a specific date
function isHabitCompletedOn(habit, date) {
  const dateStr = formatDateForDatabase(date);
  return habit.completed && habit.completed[dateStr] === true;
}

// Toggle habit completion status
function toggleHabitCompletion(habitId, dateStr, dayElement) {
  const habit = habits.find((h) => h.id === habitId);

  if (!habit) return;

  // Initialize completed object if it doesn't exist
  if (!habit.completed) {
    habit.completed = {};
  }

  // Toggle completion status
  habit.completed[dateStr] = !habit.completed[dateStr];

  // Update UI
  if (habit.completed[dateStr]) {
    dayElement.classList.add("completed");
  } else {
    dayElement.classList.remove("completed");
  }

  // Save changes
  saveHabits();

  // Show notification
  if (habit.completed[dateStr]) {
    showNotification(`${habit.name} marked as completed`);
  } else {
    showNotification(`${habit.name} marked as incomplete`);
  }
}

// Delete a habit
function deleteHabit(habitId) {
  if (confirm("Are you sure you want to delete this habit?")) {
    habits = habits.filter((h) => h.id !== habitId);
    saveHabits();
    renderHabits();
    showNotification("Habit deleted");
  }
}

// Initialize goal setting functionality
function initializeGoals() {
  renderGoals();

  // Set up category filters
  const goalCategories = document.querySelectorAll(".goal-category");
  goalCategories.forEach((category) => {
    category.addEventListener("click", () => {
      // Remove active class from all categories
      goalCategories.forEach((c) => c.classList.remove("active"));
      // Add active class to clicked category
      category.classList.add("active");

      // Filter goals by category
      filterGoalsByCategory(category.dataset.category);
    });
  });

  // Set up add goal button
  const addGoalBtn = document.getElementById("add-goal-btn");
  const goalModal = document.getElementById("goal-modal");
  const cancelGoalBtn = document.getElementById("cancel-goal-btn");
  const saveGoalBtn = document.getElementById("save-goal-btn");
  const closeModalBtn = goalModal.querySelector(".close-modal");

  addGoalBtn.addEventListener("click", () => {
    openGoalModal();
  });

  cancelGoalBtn.addEventListener("click", () => {
    closeGoalModal();
  });

  closeModalBtn.addEventListener("click", () => {
    closeGoalModal();
  });

  saveGoalBtn.addEventListener("click", () => {
    saveNewGoal();
  });
}

// Open the goal modal
function openGoalModal() {
  const goalModal = document.getElementById("goal-modal");
  const goalTitleInput = document.getElementById("goal-title");

  // Reset form
  goalTitleInput.value = "";
  document.getElementById("goal-category").value = "wellness";
  document.getElementById("goal-deadline").value = "";
  document.getElementById("goal-steps").value = "";

  // Show modal
  goalModal.style.display = "flex";
  setTimeout(() => {
    goalModal.classList.add("active");
    goalTitleInput.focus();
  }, 10);
}

// Close the goal modal
function closeGoalModal() {
  const goalModal = document.getElementById("goal-modal");
  goalModal.classList.remove("active");
  setTimeout(() => {
    goalModal.style.display = "none";
  }, 300);
}

// Save a new goal
function saveNewGoal() {
  const goalTitleInput = document.getElementById("goal-title");
  const goalTitle = goalTitleInput.value.trim();

  if (!goalTitle) {
    showNotification("Please enter a goal title");
    return;
  }

  const categorySelect = document.getElementById("goal-category");
  const deadlineInput = document.getElementById("goal-deadline");
  const stepsTextarea = document.getElementById("goal-steps");

  // Parse steps from textarea (one per line)
  const stepsText = stepsTextarea.value.trim();
  const steps = stepsText
    ? stepsText.split("\n").filter((step) => step.trim())
    : [];

  // Create steps objects array
  const stepsArray = steps.map((step) => ({
    text: step.trim(),
    completed: false,
  }));

  // Create new goal
  const newGoal = {
    id: Date.now().toString(),
    title: goalTitle,
    category: categorySelect.value,
    deadline: deadlineInput.value || null,
    steps: stepsArray,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  // Add to goals array
  goals.push(newGoal);

  // Save and update UI
  saveGoals();
  renderGoals();
  closeGoalModal();
  showNotification("Goal added successfully");
}

// Filter goals by category
function filterGoalsByCategory(category) {
  const filteredGoals =
    category === "all"
      ? goals
      : goals.filter((goal) => goal.category === category);

  renderFilteredGoals(filteredGoals);
}

// Render filtered goals
function renderFilteredGoals(filteredGoals) {
  const goalsList = document.getElementById("goals-list");

  if (filteredGoals.length === 0) {
    goalsList.innerHTML = `
      <div class="empty-goals" style="text-align: center; padding: 20px; opacity: 0.6;">
        <i class="fas fa-flag" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p>No goals in this category yet</p>
      </div>
    `;
    return;
  }

  goalsList.innerHTML = "";

  filteredGoals.forEach((goal) => {
    // Calculate progress percentage
    let progress = 0;
    if (goal.steps && goal.steps.length > 0) {
      const completedSteps = goal.steps.filter((step) => step.completed).length;
      progress = Math.round((completedSteps / goal.steps.length) * 100);
    }

    // Format deadline
    let deadlineText = "";
    if (goal.deadline) {
      const deadline = new Date(goal.deadline);
      deadlineText = `Target: ${deadline.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    // Create DOM element
    const goalElement = document.createElement("div");
    goalElement.classList.add("goal-item");
    goalElement.dataset.goalId = goal.id;

    // Set category color
    let categoryColor;
    switch (goal.category) {
      case "wellness":
        categoryColor = "rgba(106, 90, 205, 0.2)";
        break;
      case "mindfulness":
        categoryColor = "rgba(0, 191, 255, 0.2)";
        break;
      case "growth":
        categoryColor = "rgba(100, 194, 123, 0.2)";
        break;
      default:
        categoryColor = "rgba(106, 90, 205, 0.2)";
    }

    // Format steps HTML
    const stepsHTML = goal.steps
      .map(
        (step, index) => `
      <div class="goal-step">
        <input type="checkbox" class="step-checkbox" data-step-index="${index}" ${
          step.completed ? "checked" : ""
        }>
        <span style="${
          step.completed ? "text-decoration: line-through; opacity: 0.7;" : ""
        }">${step.text}</span>
      </div>
    `
      )
      .join("");

    // Build the HTML
    goalElement.innerHTML = `
      <div class="goal-header">
        <div>
          <div class="goal-title">${goal.title}</div>
          <div class="goal-category-tag" style="background-color: ${categoryColor}">
            ${goal.category.charAt(0).toUpperCase() + goal.category.slice(1)}
          </div>
          ${
            deadlineText
              ? `<div class="goal-deadline">${deadlineText}</div>`
              : ""
          }
        </div>
        <div class="habit-actions">
          <button class="icon-btn delete-goal-btn" title="Delete goal">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      <div class="goal-progress">
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${progress}%"></div>
        </div>
      </div>
      ${
        goal.steps.length > 0
          ? `<div class="goal-steps">${stepsHTML}</div>`
          : ""
      }
    `;

    goalsList.appendChild(goalElement);

    // Add event listeners
    const deleteBtn = goalElement.querySelector(".delete-goal-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteGoal(goal.id);
    });

    // Add checkbox events
    const stepCheckboxes = goalElement.querySelectorAll(".step-checkbox");
    stepCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        const stepIndex = parseInt(checkbox.dataset.stepIndex);
        toggleStepCompletion(goal.id, stepIndex);
      });
    });
  });
}

// Render all goals
function renderGoals() {
  // Find the active category
  const activeCategory = document.querySelector(".goal-category.active");
  const category = activeCategory ? activeCategory.dataset.category : "all";

  // Filter and render goals
  filterGoalsByCategory(category);
}

// Toggle step completion
function toggleStepCompletion(goalId, stepIndex) {
  const goal = goals.find((g) => g.id === goalId);

  if (!goal || !goal.steps || stepIndex >= goal.steps.length) return;

  // Toggle completion status
  goal.steps[stepIndex].completed = !goal.steps[stepIndex].completed;

  // Calculate new progress
  const completedSteps = goal.steps.filter((step) => step.completed).length;
  const progress = Math.round((completedSteps / goal.steps.length) * 100);

  // Check if all steps are completed
  if (progress === 100 && !goal.completed) {
    goal.completed = true;
    showNotification(`Congratulations! Goal "${goal.title}" completed!`);
  } else if (progress < 100 && goal.completed) {
    goal.completed = false;
  }

  // Save changes
  saveGoals();

  // Update just the progress bar without re-rendering everything
  const goalElement = document.querySelector(
    `.goal-item[data-goal-id="${goalId}"]`
  );
  if (goalElement) {
    const progressFill = goalElement.querySelector(".progress-fill");
    progressFill.style.width = `${progress}%`;

    // Update step text styling
    const stepElement = goalElement.querySelector(
      `.step-checkbox[data-step-index="${stepIndex}"]`
    ).nextElementSibling;
    if (goal.steps[stepIndex].completed) {
      stepElement.style.textDecoration = "line-through";
      stepElement.style.opacity = "0.7";
    } else {
      stepElement.style.textDecoration = "none";
      stepElement.style.opacity = "1";
    }
  }
}

// Delete a goal
function deleteGoal(goalId) {
  if (confirm("Are you sure you want to delete this goal?")) {
    goals = goals.filter((g) => g.id !== goalId);
    saveGoals();
    renderGoals();
    showNotification("Goal deleted");
  }
}

// Initialize mood calendar
function initializeMoodCalendar() {
  renderCalendar(currentMonth);

  // Set up month navigation
  const prevMonthBtn = document.getElementById("prev-month");
  const nextMonthBtn = document.getElementById("next-month");

  prevMonthBtn.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar(currentMonth);
  });

  nextMonthBtn.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar(currentMonth);
  });
}

// Render calendar for a specific month
function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Update current month text
  const currentMonthElement = document.getElementById("current-month");
  currentMonthElement.textContent = date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Get first day of month and total days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDays = lastDayOfMonth.getDate();
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Calculate days from previous month to show
  const daysFromPrevMonth = firstDayOfWeek;

  // Calculate how many weeks to show
  const totalCells = daysFromPrevMonth + totalDays;
  const totalRows = Math.ceil(totalCells / 7);
  const totalCellsToShow = totalRows * 7;
  const daysFromNextMonth = totalCellsToShow - (daysFromPrevMonth + totalDays);

  // Get calendar container
  const calendarDays = document.getElementById("calendar-days");
  calendarDays.innerHTML = "";

  // Get previous month's last days
  const prevLastDay = new Date(year, month, 0).getDate();

  // Current date for highlighting today
  const today = new Date();
  const currentDateString = formatDateForDatabase(today);

  // Render previous month days
  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    const dayNumber = prevLastDay - i;
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day", "other-month");
    dayElement.textContent = dayNumber;
    calendarDays.appendChild(dayElement);
  }

  // Render current month days
  for (let i = 1; i <= totalDays; i++) {
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day");
    dayElement.textContent = i;

    // Check if it's today
    const currentDate = new Date(year, month, i);
    const dateString = formatDateForDatabase(currentDate);
    if (dateString === currentDateString) {
      dayElement.classList.add("today");
    }

    // Add mood indicator if exists
    if (dailyMoods[dateString]) {
      const moodIndicator = document.createElement("span");
      moodIndicator.classList.add("mood-indicator");
      moodIndicator.style.backgroundColor = getMoodColor(
        dailyMoods[dateString]
      );
      dayElement.appendChild(moodIndicator);
    }

    // Add click event to set/change mood
    dayElement.addEventListener("click", () => {
      openMoodSelector(dateString, dayElement);
    });

    calendarDays.appendChild(dayElement);
  }

  // Render next month days
  for (let i = 1; i <= daysFromNextMonth; i++) {
    const dayElement = document.createElement("div");
    dayElement.classList.add("calendar-day", "other-month");
    dayElement.textContent = i;
    calendarDays.appendChild(dayElement);
  }
}

// Get color for a specific mood
function getMoodColor(mood) {
  switch (mood) {
    case "happy":
      return "#64c27b";
    case "sad":
      return "#7b88c9";
    case "neutral":
      return "#c2bb7b";
    case "excited":
      return "#e5c05e";
    case "anxious":
      return "#e57e5e";
    default:
      return "#c2bb7b"; // Default to neutral
  }
}

// Open mood selector for a specific day
function openMoodSelector(dateString, dayElement) {
  // Create a simple popup for mood selection
  const moodPopup = document.createElement("div");
  moodPopup.classList.add("mood-popup");
  moodPopup.style.position = "absolute";
  moodPopup.style.zIndex = "1000";
  moodPopup.style.background = "rgba(30, 30, 30, 0.9)";
  moodPopup.style.borderRadius = "8px";
  moodPopup.style.padding = "10px";
  moodPopup.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.3)";

  // Add moods
  const moods = ["happy", "sad", "neutral", "excited", "anxious"];
  moods.forEach((mood) => {
    const moodElement = document.createElement("div");
    moodElement.style.padding = "8px";
    moodElement.style.cursor = "pointer";
    moodElement.style.display = "flex";
    moodElement.style.alignItems = "center";
    moodElement.style.marginBottom = "5px";
    moodElement.style.borderRadius = "4px";
    moodElement.style.transition = "background 0.2s ease";

    moodElement.innerHTML = `
      <span style="display: inline-block; width: 12px; height: 12px; background: ${getMoodColor(
        mood
      )}; border-radius: 50%; margin-right: 10px;"></span>
      ${mood.charAt(0).toUpperCase() + mood.slice(1)}
    `;

    moodElement.addEventListener("mouseover", () => {
      moodElement.style.background = "rgba(255, 255, 255, 0.1)";
    });

    moodElement.addEventListener("mouseout", () => {
      moodElement.style.background = "transparent";
    });

    moodElement.addEventListener("click", () => {
      // Set the mood
      setMood(dateString, mood);

      // Update indicator
      let moodIndicator = dayElement.querySelector(".mood-indicator");
      if (!moodIndicator) {
        moodIndicator = document.createElement("span");
        moodIndicator.classList.add("mood-indicator");
        dayElement.appendChild(moodIndicator);
      }
      moodIndicator.style.backgroundColor = getMoodColor(mood);

      // Close popup
      document.body.removeChild(moodPopup);

      // Show notification
      const date = new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      showNotification(`Mood for ${date} set to ${mood}`);
    });

    moodPopup.appendChild(moodElement);
  });

  // Add close button
  const closeButton = document.createElement("div");
  closeButton.style.padding = "8px";
  closeButton.style.textAlign = "center";
  closeButton.style.cursor = "pointer";
  closeButton.style.marginTop = "5px";
  closeButton.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
  closeButton.textContent = "Cancel";

  closeButton.addEventListener("click", () => {
    document.body.removeChild(moodPopup);
  });

  moodPopup.appendChild(closeButton);

  // Position popup near the day element
  const rect = dayElement.getBoundingClientRect();
  moodPopup.style.top = `${rect.bottom + window.scrollY + 10}px`;
  moodPopup.style.left = `${rect.left + window.scrollX}px`;

  // Add to document
  document.body.appendChild(moodPopup);

  // Close when clicking outside
  document.addEventListener("click", function closePopup(e) {
    if (!moodPopup.contains(e.target) && e.target !== dayElement) {
      document.body.removeChild(moodPopup);
      document.removeEventListener("click", closePopup);
    }
  });
}

// Set mood for a specific date
function setMood(dateString, mood) {
  dailyMoods[dateString] = mood;
  saveDailyMoods();
}

// Initialize streak counter
function initializeStreakCounter() {
  // Load journal entries to calculate streak
  const savedEntries = localStorage.getItem("calmspace_entries");
  if (!savedEntries) {
    updateStreakDisplay(0);
    return;
  }

  const entries = JSON.parse(savedEntries);

  // Calculate streak
  const streak = calculateJournalingStreak(entries);

  // Update UI
  updateStreakDisplay(streak);
}

// Calculate the user's current journaling streak
function calculateJournalingStreak(entries) {
  if (!entries.length) return 0;

  // Sort entries by date, newest first
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Check if there's an entry from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const latestEntryDate = new Date(sortedEntries[0].date);
  latestEntryDate.setHours(0, 0, 0, 0);

  // If latest entry is not from today or yesterday, streak is 0
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (latestEntryDate < yesterday) {
    return 0;
  }

  // Count streak by checking consecutive days
  let streak = 1;
  let currentDate = latestEntryDate;

  // Group entries by day
  const entriesByDay = {};
  sortedEntries.forEach((entry) => {
    const dateKey = new Date(entry.date);
    dateKey.setHours(0, 0, 0, 0);
    entriesByDay[dateKey.getTime()] = true;
  });

  // Count consecutive days
  for (let i = 1; i <= 100; i++) {
    // Limit to 100 days max
    const prevDay = new Date(currentDate);
    prevDay.setDate(prevDay.getDate() - 1);

    if (entriesByDay[prevDay.getTime()]) {
      streak++;
      currentDate = prevDay;
    } else {
      break;
    }
  }

  return streak;
}

// Update streak display
function updateStreakDisplay(streak) {
  const streakCount = document.getElementById("streak-count");
  streakCount.textContent = streak;

  // Update streak message
  const streakMessage = document.getElementById("streak-message");

  if (streak === 0) {
    streakMessage.textContent = "Start journaling daily to build your streak!";
  } else if (streak === 1) {
    streakMessage.textContent = "You journaled today! Keep it going tomorrow.";
  } else if (streak < 5) {
    streakMessage.textContent = `Great start! You've journaled for ${streak} consecutive days.`;
  } else if (streak < 10) {
    streakMessage.textContent = `You're building a helpful habit! ${streak} day streak.`;
  } else {
    streakMessage.textContent = `Impressive! ${streak} day journaling streak. You're committed!`;
  }

  // Update streak calendar (last 7 days)
  const streakCalendar = document.getElementById("streak-calendar");
  streakCalendar.innerHTML = "";

  // Create last 7 days
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);

    const dayElement = document.createElement("div");
    dayElement.classList.add("streak-day");

    // Check if this day is within the streak
    if (i < streak) {
      dayElement.classList.add("active");
    }

    streakCalendar.appendChild(dayElement);
  }
}

// Initialize gratitude notes
function initializeGratitude() {
  renderGratitudeNotes();

  const gratitudeInput = document.getElementById("gratitude-input");
  const addGratitudeBtn = document.getElementById("add-gratitude-btn");

  addGratitudeBtn.addEventListener("click", () => {
    addGratitudeNote();
  });

  gratitudeInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      addGratitudeNote();
    }
  });
}

// Add a new gratitude note
function addGratitudeNote() {
  const gratitudeInput = document.getElementById("gratitude-input");
  const text = gratitudeInput.value.trim();

  if (!text) {
    showNotification("Please enter something you are grateful for");
    return;
  }

  // Create new gratitude note
  const newNote = {
    id: Date.now().toString(),
    text,
    date: new Date().toISOString(),
  };

  // Add to array
  gratitudeNotes.push(newNote);

  // Save and update UI
  saveGratitude();
  renderGratitudeNotes();

  // Clear input
  gratitudeInput.value = "";
  gratitudeInput.focus();

  showNotification("Gratitude note added");
}

// Render gratitude notes
function renderGratitudeNotes() {
  const gratitudeList = document.getElementById("gratitude-list");

  if (gratitudeNotes.length === 0) {
    gratitudeList.innerHTML = "";
    return;
  }

  // Sort notes by date, newest first
  const sortedNotes = [...gratitudeNotes].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Show only the most recent notes (max 12)
  const recentNotes = sortedNotes.slice(0, 12);

  gratitudeList.innerHTML = "";

  recentNotes.forEach((note) => {
    const noteElement = document.createElement("div");
    noteElement.classList.add("gratitude-note");
    noteElement.dataset.noteId = note.id;

    noteElement.innerHTML = `
      ${note.text}
      <i class="fas fa-times delete-note"></i>
    `;

    gratitudeList.appendChild(noteElement);

    // Add delete event
    const deleteBtn = noteElement.querySelector(".delete-note");
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteGratitudeNote(note.id);
    });
  });
}

// Delete a gratitude note
function deleteGratitudeNote(noteId) {
  gratitudeNotes = gratitudeNotes.filter((note) => note.id !== noteId);
  saveGratitude();
  renderGratitudeNotes();
  showNotification("Note deleted");
}

// Setup daily quote
function setupDailyQuote() {
  // Display a random quote or a fixed quote based on the day
  const quoteText = document.getElementById("quote-text");
  const quoteAuthor = document.getElementById("quote-author");
  const refreshBtn = document.getElementById("refresh-quote");

  // Select a random quote
  displayRandomQuote();

  // Add refresh functionality
  refreshBtn.addEventListener("click", () => {
    displayRandomQuote();
  });
}

// Display a random quote
function displayRandomQuote() {
  const quoteText = document.getElementById("quote-text");
  const quoteAuthor = document.getElementById("quote-author");

  // Select a random quote
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Add a simple fade effect
  quoteText.style.opacity = "0";
  quoteAuthor.style.opacity = "0";

  setTimeout(() => {
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `- ${quote.author}`;

    quoteText.style.opacity = "1";
    quoteAuthor.style.opacity = "1";
  }, 300);
}

// Setup theme toggle for consistent appearance with journal page
function setupThemeToggle() {
  const themeToggle = document.querySelector(".theme-toggle");
  const icon = themeToggle.querySelector("i");

  // Check if dark mode is already enabled
  if (localStorage.getItem("calmspace_darkmode") === "true") {
    document.body.classList.add("dark-mode");
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
      localStorage.setItem("calmspace_darkmode", "true");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
      localStorage.setItem("calmspace_darkmode", "false");
    }
  });
}

// Setup meditation launcher
function setupMeditationLauncher() {
  const meditationLauncher = document.querySelector(".meditation-launcher");
  const meditationContainer = document.getElementById("meditation-container");

  if (!meditationLauncher || !meditationContainer) return;

  meditationLauncher.addEventListener("click", () => {
    // Check if meditation timer is initialized
    if (window.meditationTimer) {
      // Initialize if not already initialized
      if (!window.meditationTimer.initialized) {
        window.meditationTimer.initialize("#meditation-container");
        window.meditationTimer.initialized = true;
      }

      // Show the meditation container
      meditationContainer.classList.add("active");
    } else {
      // If meditation JS is not loaded yet, show a notification
      showNotification("Loading meditation timer...");
    }
  });
}

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
