/**
 * CalmSpace Insights
 *
 * This file handles processing and visualization of journal data,
 * generating charts and analytics for the user's journaling patterns.
 */

// Chart color scheme
const chartColors = {
  happy: "#64c27b",
  sad: "#7b88c9",
  neutral: "#c2bb7b",
  excited: "#e5c05e",
  anxious: "#e57e5e",
  backgrounds: [
    "rgba(106, 90, 205, 0.7)",
    "rgba(0, 191, 255, 0.7)",
    "rgba(105, 179, 162, 0.7)",
    "rgba(135, 116, 225, 0.7)",
    "rgba(80, 173, 201, 0.7)",
  ],
  borders: [
    "rgba(106, 90, 205, 1)",
    "rgba(0, 191, 255, 1)",
    "rgba(105, 179, 162, 1)",
    "rgba(135, 116, 225, 1)",
    "rgba(80, 173, 201, 1)",
  ],
};

// Store chart instances for later updating
let emotionsChart, activityChart, moodChart, timeChart;
let entries = []; // Will store all journal entries
let selectedTimeRange = 30; // Default time range in days

// Initialize charts when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Set up theme toggle to be consistent with journal page
  setupThemeToggle();

  // Load entries from local storage
  loadEntries();

  // Setup time range selector
  document.getElementById("time-range").addEventListener("change", (e) => {
    selectedTimeRange = e.target.value;
    updateAllCharts();
  });

  // Initialize charts with empty data first
  initializeCharts();

  // Load actual data and update charts
  updateAllCharts();

  // Set up export functionality
  setupExportInsights();

  // Setup meditation launcher to be consistent with journal page
  setupMeditationLauncher();
});

// Load entries from localStorage
function loadEntries() {
  const savedEntries = localStorage.getItem("calmspace_entries");
  if (savedEntries) {
    entries = JSON.parse(savedEntries);
    console.log(`Loaded ${entries.length} entries from storage`);
  } else {
    console.log("No entries found in storage");

    // If no entries, show empty state message
    if (entries.length === 0) {
      document.querySelectorAll(".chart-container").forEach((container) => {
        container.innerHTML += `
          <div class="empty-state" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; background: rgba(0,0,0,0.1); backdrop-filter: blur(3px); border-radius: 12px;">
            <i class="fas fa-chart-bar" style="font-size: 2rem; opacity: 0.5; margin-bottom: 10px;"></i>
            <p>Start journaling to see insights</p>
          </div>
        `;
      });
    }
  }
}

// Initialize chart structures
function initializeCharts() {
  // Set up empty charts
  initEmotionsChart();
  initActivityChart();
  initMoodChart();
  initTimeChart();

  // Set up keyword cloud
  initKeywordCloud();
}

// Update all charts with current data
function updateAllCharts() {
  // Filter entries by selected time range
  const filteredEntries = filterEntriesByTimeRange(entries, selectedTimeRange);

  // Update summary stats
  updateSummaryStats(filteredEntries);

  // Update all charts with filtered data
  updateEmotionsChart(filteredEntries);
  updateActivityChart(filteredEntries);
  updateMoodChart(filteredEntries);
  updateTimeChart(filteredEntries);
  updateKeywordCloud(filteredEntries);
}

// Filter entries by selected time range
function filterEntriesByTimeRange(allEntries, days) {
  if (days === "all") {
    return allEntries;
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));

  return allEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate;
  });
}

// Update summary statistics
function updateSummaryStats(filteredEntries) {
  // Get total entries count
  const totalEntriesEl = document.getElementById("total-entries");
  totalEntriesEl.textContent = filteredEntries.length;

  // Get meditation stats from local storage
  const meditationStats = JSON.parse(
    localStorage.getItem("calmspace_meditation_stats") ||
      '{"count": 0, "totalMinutes": 0, "lastUsed": null}'
  );

  const meditationEl = document.getElementById("meditation-sessions");
  meditationEl.textContent = meditationStats.totalMinutes;

  // Calculate average words per entry
  let totalWords = 0;
  filteredEntries.forEach((entry) => {
    const wordCount = entry.userInput.trim().split(/\s+/).length;
    totalWords += wordCount;
  });

  const avgWords =
    filteredEntries.length > 0
      ? Math.round(totalWords / filteredEntries.length)
      : 0;
  const avgWordsEl = document.getElementById("avg-words");
  avgWordsEl.textContent = avgWords;

  // Calculate journaling streak
  const streakCount = calculateJournalingStreak(filteredEntries);
  const streakEl = document.getElementById("streak-count");
  streakEl.textContent = streakCount;

  // Animate the counters
  animateCounters();
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

// Initialize emotions distribution pie chart
function initEmotionsChart() {
  const ctx = document.getElementById("emotions-chart").getContext("2d");

  emotionsChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Happy", "Sad", "Neutral", "Excited", "Anxious"],
      datasets: [
        {
          data: [0, 0, 0, 0, 0],
          backgroundColor: [
            chartColors.happy,
            chartColors.sad,
            chartColors.neutral,
            chartColors.excited,
            chartColors.anxious,
          ],
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.formattedValue;
              return `${label}: ${value}%`;
            },
          },
        },
      },
      cutout: "70%",
    },
  });

  // Create custom legend
  createEmotionLegend();
}

// Create custom emotion legend with colored boxes
function createEmotionLegend() {
  const legendContainer = document.getElementById("emotions-legend");
  const emotions = ["Happy", "Sad", "Neutral", "Excited", "Anxious"];
  const colors = [
    chartColors.happy,
    chartColors.sad,
    chartColors.neutral,
    chartColors.excited,
    chartColors.anxious,
  ];

  emotions.forEach((emotion, index) => {
    const legendItem = document.createElement("div");
    legendItem.classList.add("legend-item");

    const colorBox = document.createElement("span");
    colorBox.classList.add("legend-color");
    colorBox.style.backgroundColor = colors[index];

    const label = document.createElement("span");
    label.textContent = emotion;

    legendItem.appendChild(colorBox);
    legendItem.appendChild(label);
    legendContainer.appendChild(legendItem);
  });
}

// Update emotions chart with entry data
function updateEmotionsChart(filteredEntries) {
  // Count emotions
  const emotionCounts = {
    happy: 0,
    sad: 0,
    neutral: 0,
    excited: 0,
    anxious: 0,
  };

  filteredEntries.forEach((entry) => {
    const emotion = entry.emotion || "neutral";
    if (emotionCounts.hasOwnProperty(emotion)) {
      emotionCounts[emotion]++;
    }
  });

  // Calculate percentages
  const totalEntries = filteredEntries.length;
  const percentages = Object.values(emotionCounts).map((count) =>
    totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0
  );

  // Update chart data
  emotionsChart.data.datasets[0].data = percentages;
  emotionsChart.update();
}

// Initialize activity chart (entries per day/week)
function initActivityChart() {
  const ctx = document.getElementById("activity-chart").getContext("2d");

  activityChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [
        {
          label: "Journal Entries",
          data: [],
          backgroundColor: chartColors.backgrounds[0],
          borderColor: chartColors.borders[0],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

// Update activity chart with data
function updateActivityChart(filteredEntries) {
  if (filteredEntries.length === 0) {
    activityChart.data.labels = [];
    activityChart.data.datasets[0].data = [];
    activityChart.update();
    return;
  }

  // Group entries by day
  const entriesByDay = {};

  // Generate labels based on time range
  const labels = [];
  const data = [];

  // Create date range
  const days = selectedTimeRange === "all" ? 30 : parseInt(selectedTimeRange);
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Populate with zeros
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split("T")[0];
    labels.push(dateStr);
    entriesByDay[dateStr] = 0;
  }

  // Count entries per day
  filteredEntries.forEach((entry) => {
    const dateStr = new Date(entry.date).toISOString().split("T")[0];
    if (!entriesByDay.hasOwnProperty(dateStr)) {
      entriesByDay[dateStr] = 0;
    }
    entriesByDay[dateStr]++;
  });

  // Extract data in correct order
  labels.forEach((label) => {
    data.push(entriesByDay[label] || 0);
  });

  // Format labels for display (e.g., "Apr 22")
  const formattedLabels = labels.map((label) => {
    const date = new Date(label);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  // Update chart
  activityChart.data.labels = formattedLabels;
  activityChart.data.datasets[0].data = data;

  // If too many labels, show every nth label
  if (formattedLabels.length > 14) {
    const skipFactor = Math.ceil(formattedLabels.length / 14);
    activityChart.options.scales.x = {
      ticks: {
        callback: function (val, index) {
          return index % skipFactor === 0 ? this.getLabelForValue(val) : "";
        },
      },
    };
  } else {
    activityChart.options.scales.x = {
      ticks: {
        callback: function (val) {
          return this.getLabelForValue(val);
        },
      },
    };
  }

  activityChart.update();
}

// Initialize mood trend chart
function initMoodChart() {
  const ctx = document.getElementById("mood-chart").getContext("2d");

  moodChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Mood Score",
          data: [],
          backgroundColor: "rgba(106, 90, 205, 0.2)",
          borderColor: "rgba(106, 90, 205, 1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: "rgba(106, 90, 205, 1)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function (value) {
              if (value === 0) return "Very Low";
              if (value === 25) return "Low";
              if (value === 50) return "Neutral";
              if (value === 75) return "High";
              if (value === 100) return "Very High";
              return "";
            },
          },
        },
      },
    },
  });
}

// Update mood chart with data
function updateMoodChart(filteredEntries) {
  if (filteredEntries.length === 0) {
    moodChart.data.labels = [];
    moodChart.data.datasets[0].data = [];
    moodChart.update();
    return;
  }

  // Sort entries by date
  const sortedEntries = [...filteredEntries].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Convert emotions to mood scores (0-100)
  const labels = [];
  const data = [];

  sortedEntries.forEach((entry) => {
    // Convert date to readable format
    const date = new Date(entry.date);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
    labels.push(dateStr);

    // Convert emotion to mood score
    let moodScore;
    switch (entry.emotion) {
      case "happy":
        moodScore = 80;
        break;
      case "excited":
        moodScore = 90;
        break;
      case "neutral":
        moodScore = 50;
        break;
      case "anxious":
        moodScore = 30;
        break;
      case "sad":
        moodScore = 20;
        break;
      default:
        moodScore = 50; // Default to neutral
    }

    data.push(moodScore);
  });

  // Update chart
  moodChart.data.labels = labels;
  moodChart.data.datasets[0].data = data;

  // If too many labels, show every nth label
  if (labels.length > 10) {
    const skipFactor = Math.ceil(labels.length / 10);
    moodChart.options.scales.x = {
      ticks: {
        callback: function (val, index) {
          return index % skipFactor === 0 ? this.getLabelForValue(val) : "";
        },
      },
    };
  } else {
    moodChart.options.scales.x = {
      ticks: {
        callback: function (val) {
          return this.getLabelForValue(val);
        },
      },
    };
  }

  moodChart.update();
}

// Initialize time of day chart
function initTimeChart() {
  const ctx = document.getElementById("time-chart").getContext("2d");

  timeChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Morning", "Afternoon", "Evening", "Night"],
      datasets: [
        {
          label: "Journaling Time",
          data: [0, 0, 0, 0],
          backgroundColor: [
            chartColors.backgrounds[1],
            chartColors.backgrounds[2],
            chartColors.backgrounds[3],
            chartColors.backgrounds[4],
          ],
          borderColor: [
            chartColors.borders[1],
            chartColors.borders[2],
            chartColors.borders[3],
            chartColors.borders[4],
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

// Update time of day chart
function updateTimeChart(filteredEntries) {
  // Count entries by time of day
  const timeOfDay = [0, 0, 0, 0]; // Morning, Afternoon, Evening, Night

  filteredEntries.forEach((entry) => {
    const date = new Date(entry.date);
    const hour = date.getHours();

    // Categorize by time of day
    if (hour >= 5 && hour < 12) {
      timeOfDay[0]++; // Morning (5am-12pm)
    } else if (hour >= 12 && hour < 17) {
      timeOfDay[1]++; // Afternoon (12pm-5pm)
    } else if (hour >= 17 && hour < 22) {
      timeOfDay[2]++; // Evening (5pm-10pm)
    } else {
      timeOfDay[3]++; // Night (10pm-5am)
    }
  });

  // Update chart
  timeChart.data.datasets[0].data = timeOfDay;
  timeChart.update();

  // Update time insight text
  updateTimeInsight(timeOfDay);
}

// Update time insight text based on time of day data
function updateTimeInsight(timeOfDay) {
  const insightEl = document.getElementById("time-insight");
  const timeLabels = ["morning", "afternoon", "evening", "night"];

  // Find the time with most entries
  let maxIndex = 0;
  for (let i = 1; i < timeOfDay.length; i++) {
    if (timeOfDay[i] > timeOfDay[maxIndex]) {
      maxIndex = i;
    }
  }

  // Generate insight text based on most common time
  const insights = [
    "You tend to journal most frequently in the mornings. Early reflection may be helping you set a positive tone for the day.",
    "Afternoon journaling seems to be your preference. Mid-day reflections can help reset your focus and manage stress.",
    "Evening journaling is your most common pattern. This may be helping you process the day's events and wind down.",
    "You often journal at night. Late reflections can support stress reduction and may improve sleep quality.",
  ];

  // If no entries, show default message
  if (timeOfDay.reduce((a, b) => a + b, 0) === 0) {
    insightEl.textContent =
      "Start journaling to see when you tend to reflect most.";
    return;
  }

  insightEl.textContent = insights[maxIndex];
}

// Initialize keyword cloud
function initKeywordCloud() {
  const cloudContainer = document.getElementById("keyword-cloud");
  cloudContainer.innerHTML =
    '<div class="loading-keywords">Analyzing your journal entries...</div>';
}

// Update keyword cloud with most common themes from journal entries
function updateKeywordCloud(filteredEntries) {
  // Skip if no entries
  if (filteredEntries.length === 0) {
    const cloudContainer = document.getElementById("keyword-cloud");
    cloudContainer.innerHTML =
      '<div class="loading-keywords">Start journaling to see common themes</div>';
    return;
  }

  // Combine all text from journal entries
  let allText = filteredEntries.map((entry) => entry.userInput).join(" ");

  // Clean and normalize text
  allText = allText.toLowerCase();

  // Function to count word frequency in text
  function getWordFrequency(text) {
    // Remove punctuation and split into words
    const words = text.replace(/[^\w\s]/g, "").split(/\s+/);

    // Skip common stop words
    const stopWords = new Set([
      "a",
      "an",
      "the",
      "and",
      "but",
      "or",
      "for",
      "nor",
      "on",
      "at",
      "to",
      "by",
      "i",
      "me",
      "my",
      "mine",
      "you",
      "your",
      "yours",
      "he",
      "him",
      "his",
      "she",
      "her",
      "hers",
      "it",
      "its",
      "we",
      "us",
      "our",
      "ours",
      "they",
      "them",
      "their",
      "theirs",
      "this",
      "that",
      "these",
      "those",
      "am",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "shall",
      "should",
      "may",
      "might",
      "must",
      "can",
      "could",
      "of",
      "with",
      "about",
      "against",
      "between",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "from",
      "up",
      "down",
      "in",
      "out",
      "off",
      "over",
      "under",
      "again",
      "further",
      "then",
      "once",
      "here",
      "there",
      "when",
      "where",
      "why",
      "how",
      "all",
      "any",
      "both",
      "each",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "no",
      "nor",
      "not",
      "only",
      "own",
      "same",
      "so",
      "than",
      "too",
      "very",
      "just",
      "don",
      "don't",
      "should've",
      "now",
      "what",
      "who",
    ]);

    // Count frequency of each word
    const frequency = {};
    words.forEach((word) => {
      if (word.length > 2 && !stopWords.has(word)) {
        // Skip short words and stop words
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    return frequency;
  }

  // Get word frequency and sort by count
  const wordFrequency = getWordFrequency(allText);
  const sortedWords = Object.keys(wordFrequency).sort(
    (a, b) => wordFrequency[b] - wordFrequency[a]
  );

  // Get top 20 words
  const topWords = sortedWords.slice(0, 20);

  // Find max and min frequency for sizing
  const maxFreq = Math.max(...topWords.map((word) => wordFrequency[word]));
  const minFreq = Math.min(...topWords.map((word) => wordFrequency[word]));
  const range = maxFreq - minFreq;

  // Create tag cloud
  const cloudContainer = document.getElementById("keyword-cloud");
  cloudContainer.innerHTML = "";

  topWords.forEach((word) => {
    const tag = document.createElement("div");
    tag.classList.add("keyword-tag");

    // Calculate size based on frequency (1-5)
    let size = 1;
    if (range > 0) {
      size = Math.ceil(((wordFrequency[word] - minFreq) / range) * 5);
      if (size < 1) size = 1;
    }

    tag.classList.add(`tag-size-${size}`);
    tag.textContent = word;

    // Set a random background color
    const colorIndex = Math.floor(
      Math.random() * chartColors.backgrounds.length
    );
    tag.style.background = chartColors.backgrounds[colorIndex];
    tag.style.color = "white";

    // Add click handler to show entries with this word
    tag.addEventListener("click", () => {
      // Could implement functionality to filter entries by keyword
      showNotification(`Entries containing "${word}" will appear soon`);
    });

    cloudContainer.appendChild(tag);
  });

  // If no significant words found
  if (topWords.length === 0) {
    cloudContainer.innerHTML =
      '<div class="loading-keywords">Need more journal entries to analyze themes</div>';
  }
}

// Animate counter numbers for a smoother effect
function animateCounters() {
  document.querySelectorAll(".stat-value").forEach((counter) => {
    const target = parseInt(counter.textContent);
    const duration = 1500; // 1.5 seconds
    const step = target / (duration / 16); // 16ms per frame (approx 60fps)

    let current = 0;
    const counterAnimation = setInterval(() => {
      current += step;
      if (current >= target) {
        counter.textContent = target;
        clearInterval(counterAnimation);
      } else {
        counter.textContent = Math.floor(current);
      }
    }, 16);
  });
}

// Setup export insights functionality
function setupExportInsights() {
  const exportBtn = document.getElementById("export-insights-btn");

  exportBtn.addEventListener("click", () => {
    // Generate report content
    const reportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const timeRangeText =
      selectedTimeRange === "all"
        ? "All Time"
        : `Last ${selectedTimeRange} Days`;

    let reportContent = `
CalmSpace Insights Report - ${reportDate}
Time Period: ${timeRangeText}

SUMMARY STATISTICS
-----------------
Total Journal Entries: ${document.getElementById("total-entries").textContent}
Meditation Minutes: ${
      document.getElementById("meditation-sessions").textContent
    }
Average Words Per Entry: ${document.getElementById("avg-words").textContent}
Current Journaling Streak: ${
      document.getElementById("streak-count").textContent
    } days

MOOD ANALYSIS
------------
Your most common emotional state: ${getMostCommonEmotion()}

TIME PATTERNS
------------
${document.getElementById("time-insight").textContent}

Thank you for using CalmSpace for your mindfulness journey!
`;

    // Create downloadable file
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `calmspace-insights-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification("Insights report exported!");
  });
}

// Get the most common emotion from the data
function getMostCommonEmotion() {
  // Get chart data
  const emotionData = emotionsChart.data.datasets[0].data;
  const emotions = ["Happy", "Sad", "Neutral", "Excited", "Anxious"];

  // Find the highest percentage
  let maxIndex = 0;
  for (let i = 1; i < emotionData.length; i++) {
    if (emotionData[i] > emotionData[maxIndex]) {
      maxIndex = i;
    }
  }

  return emotions[maxIndex];
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

    // Update chart colors for better visibility in dark mode
    updateChartTheme();
  });
}

// Update chart colors based on theme
function updateChartTheme() {
  const isDarkMode = document.body.classList.contains("dark-mode");

  // Update text color in all charts
  Chart.defaults.color = isDarkMode
    ? "rgba(255, 255, 255, 0.7)"
    : "rgba(0, 0, 0, 0.7)";
  Chart.defaults.borderColor = isDarkMode
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  // Refresh all charts
  if (emotionsChart) emotionsChart.update();
  if (activityChart) activityChart.update();
  if (moodChart) moodChart.update();
  if (timeChart) timeChart.update();
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
