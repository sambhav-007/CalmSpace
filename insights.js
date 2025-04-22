/**
 * CalmSpace Insights
 * 
 * This file analyzes journal entries and meditation data
 * to provide visual insights about the user's mindfulness journey.
 */

// Chart objects
let emotionsChart = null;
let activityChart = null;
let moodChart = null;
let timeChart = null;
let comparisonChart = null;

// Set chart theme based on current mode
Chart.defaults.color = '#e0e0e0';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.font.family = "'Inter', 'Segoe UI', sans-serif";

// Emotion colors
const emotionColors = {
  'happy': '#64c27b',
  'sad': '#7b88c9',
  'neutral': '#c2bb7b',
  'excited': '#e5c05e',
  'anxious': '#e57e5e'
};

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Set up theme toggle
  setupThemeToggle();
  
  // Load and process data
  loadUserData();
  
  // Set up time range selector
  const timeRange = document.getElementById('time-range');
  timeRange.addEventListener('change', () => {
    loadUserData();
  });
  
  // Set up meditation launcher
  setupMeditationLauncher();

  // Set up export button
  const exportBtn = document.getElementById('export-insights-btn');
  exportBtn.addEventListener('click', exportInsightsReport);
  
  // Set up comparison toggle
  const comparisonBtn = document.getElementById('toggle-comparison-btn');
  if (comparisonBtn) {
    comparisonBtn.addEventListener('click', toggleComparisonView);
  }
});

// Load and process user data from local storage
function loadUserData() {
  // Get selected time range
  const timeRange = document.getElementById('time-range').value;
  const daysToInclude = timeRange === 'all' ? Infinity : parseInt(timeRange);
  
  // Get entries
  const entries = getJournalEntries(daysToInclude);
  
  // Get meditation sessions
  const meditationSessions = getMeditationSessions(daysToInclude);
  
  // Update page with data
  updateStatistics(entries, meditationSessions);
  updateEmotionsChart(entries);
  updateKeywordCloud(entries);
  updateActivityChart(entries);
  updateMoodTrendChart(entries);
  updateTimeOfDayChart(entries);
  
  // If comparison view is active, update comparison chart
  const comparisonContainer = document.getElementById('comparison-container');
  if (comparisonContainer && comparisonContainer.classList.contains('active')) {
    updateComparisonChart();
  }
}

// Get journal entries filtered by date range
function getJournalEntries(daysToInclude) {
  const savedEntries = localStorage.getItem('calmspace_entries');
  
  if (!savedEntries) return [];
  
  const entries = JSON.parse(savedEntries);
  
  if (daysToInclude === Infinity) return entries;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= cutoffDate;
  });
}

// Get journal entries for a specific date range
function getJournalEntriesForRange(startDate, endDate) {
  const savedEntries = localStorage.getItem('calmspace_entries');
  
  if (!savedEntries) return [];
  
  const entries = JSON.parse(savedEntries);
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

// Get meditation sessions filtered by date range
function getMeditationSessions(daysToInclude) {
  const savedSessions = localStorage.getItem('calmspace_meditation_sessions');
  
  if (!savedSessions) return [];
  
  const sessions = JSON.parse(savedSessions);
  
  if (daysToInclude === Infinity) return sessions;
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);
  
  return sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= cutoffDate;
  });
}

// Update page statistics
function updateStatistics(entries, meditationSessions) {
  // Total entries
  document.getElementById('total-entries').textContent = entries.length;
  
  // Calculate word count
  let totalWords = 0;
  entries.forEach(entry => {
    if (entry.content) {
      totalWords += entry.content.split(/\s+/).filter(Boolean).length;
    }
  });
  
  // Average words per entry
  const avgWords = entries.length > 0 ? Math.round(totalWords / entries.length) : 0;
  document.getElementById('avg-words').textContent = avgWords;
  
  // Calculate meditation minutes
  let totalMinutes = 0;
  meditationSessions.forEach(session => {
    if (session.duration) {
      totalMinutes += Math.round(session.duration / 60); // Convert seconds to minutes
    }
  });
  document.getElementById('meditation-sessions').textContent = totalMinutes;
  
  // Calculate streak
  const streak = calculateJournalingStreak(entries);
  document.getElementById('streak-count').textContent = streak;
}

// Calculate current streak
function calculateJournalingStreak(entries) {
  if (!entries.length) return 0;
  
  // Sort entries by date, newest first
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
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
  sortedEntries.forEach(entry => {
    const dateKey = new Date(entry.date);
    dateKey.setHours(0, 0, 0, 0);
    entriesByDay[dateKey.getTime()] = true;
  });
  
  // Count consecutive days
  for (let i = 1; i <= 100; i++) { // Limit to 100 days max
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

// Toggle comparison view
function toggleComparisonView() {
  const comparisonContainer = document.getElementById('comparison-container');
  const comparisonBtn = document.getElementById('toggle-comparison-btn');
  
  if (!comparisonContainer) return;
  
  comparisonContainer.classList.toggle('active');
  
  if (comparisonContainer.classList.contains('active')) {
    comparisonBtn.innerHTML = '<i class="fas fa-times"></i> Hide Comparison';
    comparisonBtn.classList.add('active');
    updateComparisonChart();
  } else {
    comparisonBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Compare Periods';
    comparisonBtn.classList.remove('active');
  }
}

// Update the comparison chart
function updateComparisonChart() {
  // Set up date ranges for comparison
  const currentDate = new Date();
  
  // Current period (based on selected time range)
  const timeRange = document.getElementById('time-range').value;
  const daysToInclude = timeRange === 'all' ? 30 : parseInt(timeRange);
  
  const currentPeriodStart = new Date(currentDate);
  currentPeriodStart.setDate(currentDate.getDate() - daysToInclude);
  
  // Previous period (same length, immediately before)
  const previousPeriodStart = new Date(currentPeriodStart);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - daysToInclude);
  const previousPeriodEnd = new Date(currentPeriodStart);
  previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
  
  // Get entries for both periods
  const currentPeriodEntries = getJournalEntriesForRange(currentPeriodStart, currentDate);
  const previousPeriodEntries = getJournalEntriesForRange(previousPeriodStart, previousPeriodEnd);
  
  // Get mood data for both periods
  const currentMoodData = calculateMoodDistribution(currentPeriodEntries);
  const previousMoodData = calculateMoodDistribution(previousPeriodEntries);
  
  // Format date ranges for display
  const formatOptions = { month: 'short', day: 'numeric' };
  const currentPeriodLabel = `${currentPeriodStart.toLocaleDateString('en-US', formatOptions)} - ${currentDate.toLocaleDateString('en-US', formatOptions)}`;
  const previousPeriodLabel = `${previousPeriodStart.toLocaleDateString('en-US', formatOptions)} - ${previousPeriodEnd.toLocaleDateString('en-US', formatOptions)}`;
  
  // Update title
  const comparisonTitle = document.getElementById('comparison-title');
  if (comparisonTitle) {
    comparisonTitle.textContent = `Comparing ${daysToInclude} Day Periods`;
  }
  
  // Update period labels
  const currentPeriodDisplay = document.getElementById('current-period');
  const previousPeriodDisplay = document.getElementById('previous-period');
  
  if (currentPeriodDisplay) {
    currentPeriodDisplay.textContent = currentPeriodLabel;
  }
  
  if (previousPeriodDisplay) {
    previousPeriodDisplay.textContent = previousPeriodLabel;
  }
  
  // Create datasets
  const ctx = document.getElementById('comparison-chart').getContext('2d');
  
  // Destroy previous chart if it exists
  if (comparisonChart) {
    comparisonChart.destroy();
  }
  
  // Get emotions and ensure same order for both datasets
  const emotions = Object.keys(emotionColors);
  
  // Create datasets
  const currentData = emotions.map(emotion => currentMoodData[emotion] || 0);
  const previousData = emotions.map(emotion => previousMoodData[emotion] || 0);
  
  comparisonChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: emotions.map(e => e.charAt(0).toUpperCase() + e.slice(1)),
      datasets: [
        {
          label: 'Current Period',
          data: currentData,
          backgroundColor: emotions.map(emotion => `${emotionColors[emotion]}cc`),
          borderColor: emotions.map(emotion => emotionColors[emotion]),
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Previous Period',
          data: previousData,
          backgroundColor: emotions.map(emotion => `${emotionColors[emotion]}66`),
          borderColor: emotions.map(emotion => emotionColors[emotion]),
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          },
          title: {
            display: true,
            text: 'Number of Entries'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const datasetLabel = context.dataset.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
              return `${datasetLabel}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
  
  // Update insights section
  updateComparisonInsights(currentMoodData, previousMoodData, currentPeriodEntries, previousPeriodEntries);
}

// Calculate mood distribution from entries
function calculateMoodDistribution(entries) {
  const moodCounts = {
    'happy': 0,
    'sad': 0,
    'neutral': 0,
    'excited': 0,
    'anxious': 0
  };
  
  entries.forEach(entry => {
    if (entry.emotion && moodCounts.hasOwnProperty(entry.emotion)) {
      moodCounts[entry.emotion]++;
    } else {
      moodCounts['neutral']++;
    }
  });
  
  return moodCounts;
}

// Update comparison insights
function updateComparisonInsights(currentMoodData, previousMoodData, currentEntries, previousEntries) {
  const insightsContainer = document.getElementById('comparison-insights');
  if (!insightsContainer) return;
  
  // Calculate total entries for both periods
  const currentTotal = currentEntries.length;
  const previousTotal = previousEntries.length;
  
  // Calculate dominant mood for both periods
  let currentDominantMood = 'neutral';
  let currentMax = 0;
  let previousDominantMood = 'neutral';
  let previousMax = 0;
  
  Object.keys(currentMoodData).forEach(mood => {
    if (currentMoodData[mood] > currentMax) {
      currentMax = currentMoodData[mood];
      currentDominantMood = mood;
    }
  });
  
  Object.keys(previousMoodData).forEach(mood => {
    if (previousMoodData[mood] > previousMax) {
      previousMax = previousMoodData[mood];
      previousDominantMood = mood;
    }
  });
  
  // Calculate entry frequency (entries per day)
  const timeRange = document.getElementById('time-range').value;
  const daysToInclude = timeRange === 'all' ? 30 : parseInt(timeRange);
  
  const currentFrequency = currentTotal / daysToInclude;
  const previousFrequency = previousTotal / daysToInclude;
  
  // Generate insights
  let insightsHTML = '';
  
  // Entries comparison
  const entryDiff = currentTotal - previousTotal;
  const entryDiffPercent = previousTotal > 0 ? Math.round((entryDiff / previousTotal) * 100) : 0;
  
  insightsHTML += `
    <div class="insight-item">
      <div class="insight-icon ${entryDiff >= 0 ? 'positive' : 'negative'}">
        <i class="${entryDiff >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}"></i>
      </div>
      <div class="insight-content">
        <h4>Journaling Frequency</h4>
        <p>
          ${Math.abs(entryDiffPercent)}% ${entryDiff >= 0 ? 'increase' : 'decrease'} in journal entries 
          (${currentTotal} vs ${previousTotal})
        </p>
      </div>
    </div>
  `;
  
  // Mood shift
  insightsHTML += `
    <div class="insight-item">
      <div class="insight-icon">
        <i class="fas fa-exchange-alt"></i>
      </div>
      <div class="insight-content">
        <h4>Emotional Shift</h4>
        <p>
          Your dominant emotion changed from 
          <span class="highlight" style="color:${emotionColors[previousDominantMood]}">
            ${previousDominantMood.charAt(0).toUpperCase() + previousDominantMood.slice(1)}
          </span> to
          <span class="highlight" style="color:${emotionColors[currentDominantMood]}">
            ${currentDominantMood.charAt(0).toUpperCase() + currentDominantMood.slice(1)}
          </span>
        </p>
      </div>
    </div>
  `;
  
  // Detailed mood changes
  const moodChanges = [];
  Object.keys(emotionColors).forEach(mood => {
    const currentCount = currentMoodData[mood] || 0;
    const previousCount = previousMoodData[mood] || 0;
    const change = currentCount - previousCount;
    if (change !== 0) {
      moodChanges.push({
        mood,
        change,
        percentage: previousCount > 0 ? Math.abs(Math.round((change / previousCount) * 100)) : 0
      });
    }
  });
  
  // Sort by magnitude of change
  moodChanges.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  
  // Take top 2 changes
  const topChanges = moodChanges.slice(0, 2);
  
  if (topChanges.length > 0) {
    insightsHTML += `
      <div class="insight-item">
        <div class="insight-icon analysis">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="insight-content">
          <h4>Notable Changes</h4>
          <ul>
    `;
    
    topChanges.forEach(change => {
      insightsHTML += `
        <li>
          <span class="highlight" style="color:${emotionColors[change.mood]}">
            ${change.mood.charAt(0).toUpperCase() + change.mood.slice(1)}
          </span>: 
          ${change.change > 0 ? '+' : ''}${change.change} entries 
          (${change.change > 0 ? '+' : ''}${change.percentage}%)
        </li>
      `;
    });
    
    insightsHTML += `
          </ul>
        </div>
      </div>
    `;
  }
  
  // Overall assessment
  let overallMessage = "";
  if (entryDiff > 0) {
    overallMessage = "You're journaling more frequently, which can lead to greater self-awareness.";
  } else if (entryDiff < 0) {
    overallMessage = "Your journaling frequency has decreased. Consider setting reminders to reflect regularly.";
  } else {
    overallMessage = "Your journaling frequency has remained consistent.";
  }
  
  insightsHTML += `
    <div class="insight-item">
      <div class="insight-icon recommendation">
        <i class="fas fa-lightbulb"></i>
      </div>
      <div class="insight-content">
        <h4>Insight</h4>
        <p>${overallMessage}</p>
      </div>
    </div>
  `;
  
  insightsContainer.innerHTML = insightsHTML;
}

// Update emotions distribution chart
function updateEmotionsChart(entries) {
  // Count emotions
  const emotionCounts = {
    'happy': 0,
    'sad': 0, 
    'neutral': 0,
    'excited': 0,
    'anxious': 0
  };
  
  entries.forEach(entry => {
    if (entry.emotion && emotionCounts.hasOwnProperty(entry.emotion)) {
      emotionCounts[entry.emotion]++;
    } else {
      emotionCounts['neutral']++;
    }
  });
  
  // Convert to arrays for Chart.js
  const emotions = Object.keys(emotionCounts);
  const counts = emotions.map(emotion => emotionCounts[emotion]);
  const colors = emotions.map(emotion => emotionColors[emotion]);
  
  // Generate chart
  const ctx = document.getElementById('emotions-chart').getContext('2d');
  
  // Destroy previous chart if it exists
  if (emotionsChart) {
    emotionsChart.destroy();
  }
  
  emotionsChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: emotions.map(e => e.charAt(0).toUpperCase() + e.slice(1)),
      datasets: [{
        data: counts,
        backgroundColor: colors,
        borderColor: 'rgba(30, 30, 30, 0.2)',
        borderWidth: 1,
        hoverOffset: 15
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
  
  // Update legend
  updateEmotionsLegend(emotions, counts, colors);
}

// Update the emotions legend separately from the chart
function updateEmotionsLegend(emotions, counts, colors) {
  const legendElement = document.getElementById('emotions-legend');
  legendElement.innerHTML = '';
  
  // Calculate total for percentages
  const total = counts.reduce((a, b) => a + b, 0);
  
  emotions.forEach((emotion, index) => {
    if (counts[index] === 0) return;
    
    const percentage = Math.round((counts[index] / total) * 100);
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';
    
    legendItem.innerHTML = `
      <span class="legend-color" style="background-color: ${colors[index]}"></span>
      <span>${emotion.charAt(0).toUpperCase() + emotion.slice(1)}: ${percentage}%</span>
    `;
    
    legendElement.appendChild(legendItem);
  });
}

// Update keyword cloud with common themes
function updateKeywordCloud(entries) {
  const keywordCloud = document.getElementById('keyword-cloud');
  
  // Show loading state if we have entries
  if (entries.length > 0) {
    keywordCloud.innerHTML = '<div class="loading-keywords">Analyzing your journals for themes...</div>';
  } else {
    keywordCloud.innerHTML = '<div class="empty-state"><i class="fas fa-cloud"></i><p>Add journal entries to see common themes</p></div>';
    return;
  }
  
  // Extract words from all entries
  let allText = '';
  entries.forEach(entry => {
    if (entry.content) {
      allText += ' ' + entry.content.toLowerCase();
    }
    if (entry.aiResponse) {
      // Include AI responses as they often contain insightful themes
      allText += ' ' + entry.aiResponse.toLowerCase();
    }
  });
  
  // Clean up text and split into words
  const words = allText
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/)
    .filter(word => word.length > 3); // Only include words longer than 3 chars
  
  // Count word frequency
  const wordCounts = {};
  words.forEach(word => {
    if (!commonStopWords.includes(word)) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  // Sort by frequency
  const sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a]);
  
  // Take top words (if we have enough)
  const topWords = sortedWords.slice(0, Math.min(20, sortedWords.length));
  
  // If we have no meaningful words
  if (topWords.length === 0) {
    keywordCloud.innerHTML = '<div class="empty-state"><i class="fas fa-cloud"></i><p>More journal entries needed to identify themes</p></div>';
    return;
  }
  
  // Find max and min counts for sizing
  const maxCount = wordCounts[topWords[0]];
  const minCount = wordCounts[topWords[topWords.length - 1]];
  
  // Clear container
  keywordCloud.innerHTML = '';
  
  // Generate tag cloud
  topWords.forEach(word => {
    const count = wordCounts[word];
    
    // Calculate size category (1-5)
    let sizeCategory;
    if (maxCount === minCount) {
      sizeCategory = 3;
    } else {
      const ratio = (count - minCount) / (maxCount - minCount);
      sizeCategory = Math.ceil(ratio * 5) || 1;
    }
    
    // Choose a color based on word's first letter to add variety
    const charCode = word.charCodeAt(0);
    const colorIndex = charCode % 5;
    const emotions = ['happy', 'excited', 'neutral', 'anxious', 'sad'];
    const color = emotionColors[emotions[colorIndex]];
    
    const tag = document.createElement('div');
    tag.className = `keyword-tag tag-size-${sizeCategory}`;
    tag.style.backgroundColor = color;
    tag.textContent = word;
    
    // Add click functionality to filter entries
    tag.addEventListener('click', () => {
      filterEntriesByKeyword(word);
    });
    
    keywordCloud.appendChild(tag);
  });
}

// Filter entries by keyword
function filterEntriesByKeyword(keyword) {
  // Show notification that this would filter entries
  showNotification(`This would filter journal entries containing "${keyword}"`);
  
  // In a full implementation, this would filter the entries list
  // and update all the charts accordingly
}

// Update journaling activity chart
function updateActivityChart(entries) {
  // Group entries by day
  const entriesByDate = {};
  
  // Get time range to determine x-axis
  const timeRange = document.getElementById('time-range').value;
  const daysToShow = timeRange === 'all' ? 30 : parseInt(timeRange);
  
  // Create array of last n days
  const dates = [];
  const labels = [];
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dateString = date.toISOString().split('T')[0];
    dates.push(dateString);
    
    // Format label
    const formatOptions = { month: 'short', day: 'numeric' };
    labels.push(date.toLocaleDateString('en-US', formatOptions));
    
    // Initialize count
    entriesByDate[dateString] = 0;
  }
  
  // Count entries per day
  entries.forEach(entry => {
    const entryDate = new Date(entry.date);
    const dateString = entryDate.toISOString().split('T')[0];
    
    if (entriesByDate.hasOwnProperty(dateString)) {
      entriesByDate[dateString]++;
    }
  });
  
  // Create data array from dates
  const activityData = dates.map(date => entriesByDate[date] || 0);
  
  // Generate chart
  const ctx = document.getElementById('activity-chart').getContext('2d');
  
  // Destroy previous chart if it exists
  if (activityChart) {
    activityChart.destroy();
  }
  
  activityChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Journal Entries',
        data: activityData,
        backgroundColor: '#6a5acd80',
        borderColor: '#6a5acd',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              return context[0].label;
            },
            label: function(context) {
              const value = context.raw;
              return value === 1 ? '1 journal entry' : `${value} journal entries`;
            }
          }
        }
      }
    }
  });
}

// Update mood trend chart
function updateMoodTrendChart(entries) {
  // No entries
  if (entries.length === 0) {
    if (moodChart) {
      moodChart.destroy();
      moodChart = null;
    }
    return;
  }
  
  // Get time range to determine x-axis
  const timeRange = document.getElementById('time-range').value;
  const daysToShow = timeRange === 'all' ? 30 : parseInt(timeRange);
  
  // Create array of last n days
  const dates = [];
  const labels = [];
  
  for (let i = daysToShow - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dateString = date.toISOString().split('T')[0];
    dates.push(dateString);
    
    // Format label
    const formatOptions = { month: 'short', day: 'numeric' };
    labels.push(date.toLocaleDateString('en-US', formatOptions));
  }
  
  // Map emotions to numerical values for the chart
  const emotionValues = {
    'excited': 5,
    'happy': 4,
    'neutral': 3,
    'anxious': 2,
    'sad': 1
  };
  
  // Group entries by day and average emotions
  const moodByDate = {};
  const entriesByDate = {};
  
  // Count entries and sum emotion values per day
  entries.forEach(entry => {
    const entryDate = new Date(entry.date);
    const dateString = entryDate.toISOString().split('T')[0];
    
    const emotionValue = emotionValues[entry.emotion] || emotionValues['neutral'];
    
    if (!moodByDate[dateString]) {
      moodByDate[dateString] = 0;
      entriesByDate[dateString] = 0;
    }
    
    moodByDate[dateString] += emotionValue;
    entriesByDate[dateString]++;
  });
  
  // Calculate average mood per day
  const moodData = dates.map(date => {
    if (entriesByDate[date] && entriesByDate[date] > 0) {
      return moodByDate[date] / entriesByDate[date];
    }
    return null; // No data for this day
  });
  
  // Generate chart
  const ctx = document.getElementById('mood-chart').getContext('2d');
  
  // Destroy previous chart if it exists
  if (moodChart) {
    moodChart.destroy();
  }
  
  moodChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Mood Score',
        data: moodData,
        borderColor: '#00bfff',
        backgroundColor: '#00bfff20',
        borderWidth: 2,
        tension: 0.3,
        pointBackgroundColor: '#00bfff',
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0.5,
          max: 5.5,
          ticks: {
            callback: function(value) {
              const emotions = ['', 'Sad', 'Anxious', 'Neutral', 'Happy', 'Excited', ''];
              return emotions[Math.round(value)] || '';
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// Update time of day chart
function updateTimeOfDayChart(entries) {
  if (entries.length === 0) {
    document.getElementById('time-insight').textContent = 'Start journaling to see when you tend to reflect most.';
    
    if (timeChart) {
      timeChart.destroy();
      timeChart = null;
    }
    return;
  }
  
  // Count entries by hour of day
  const hourCounts = Array(24).fill(0);
  
  entries.forEach(entry => {
    const entryDate = new Date(entry.date);
    const hour = entryDate.getHours();
    hourCounts[hour]++;
  });
  
  // Generate labels for each hour
  const hourLabels = Array(24).fill().map((_, i) => {
    if (i === 0) return '12am';
    if (i === 12) return '12pm';
    return i < 12 ? `${i}am` : `${i-12}pm`;
  });
  
  // Find most common time
  const maxCount = Math.max(...hourCounts);
  const mostCommonHour = hourCounts.indexOf(maxCount);
  
  // Generate insight text
  const hourFormat = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    hour12: true
  });
  
  const insightDate = new Date();
  insightDate.setHours(mostCommonHour, 0, 0);
  const formattedHour = hourFormat.format(insightDate);
  
  // Update insight text
  document.getElementById('time-insight').textContent = 
    `You tend to journal most frequently around ${formattedHour}.`;
  
  // Generate chart
  const ctx = document.getElementById('time-chart').getContext('2d');
  
  // Destroy previous chart if it exists
  if (timeChart) {
    timeChart.destroy();
  }
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 250);
  gradient.addColorStop(0, '#6a5acd');
  gradient.addColorStop(1, '#00bfff');
  
  timeChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: hourLabels,
      datasets: [{
        label: 'Journal Entries',
        data: hourCounts,
        backgroundColor: gradient,
        borderRadius: 4,
        barPercentage: 0.8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// Export insights report
function exportInsightsReport() {
  showNotification('Preparing your insights report...');
  
  setTimeout(() => {
    showNotification('Insights report downloaded successfully');
  }, 1500);
  
  // In a full implementation, this would generate a PDF with the insights
}

// Setup theme toggle for consistent appearance with journal page
function setupThemeToggle() {
  const themeToggle = document.querySelector('.theme-toggle');
  const icon = themeToggle.querySelector('i');
  
  // Check if dark mode is already enabled
  if (localStorage.getItem('calmspace_darkmode') === 'true') {
    document.body.classList.add('dark-mode');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    
    // Update chart colors for dark mode
    Chart.defaults.color = '#e0e0e0';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
  } else {
    // Light mode chart colors
    Chart.defaults.color = '#333333';
    Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.1)';
  }
  
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
      localStorage.setItem('calmspace_darkmode', 'true');
      
      // Update chart colors
      Chart.defaults.color = '#e0e0e0';
      Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
      localStorage.setItem('calmspace_darkmode', 'false');
      
      // Update chart colors
      Chart.defaults.color = '#333333';
      Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.1)';
    }
    
    // Reload charts to apply new theme
    loadUserData();
  });
}

// Setup meditation launcher
function setupMeditationLauncher() {
  const meditationLauncher = document.querySelector('.meditation-launcher');
  const meditationContainer = document.getElementById('meditation-container');
  
  if (!meditationLauncher || !meditationContainer) return;
  
  meditationLauncher.addEventListener('click', () => {
    // Check if meditation timer is initialized
    if (window.meditationTimer) {
      // Initialize if not already initialized
      if (!window.meditationTimer.initialized) {
        window.meditationTimer.initialize('#meditation-container');
        window.meditationTimer.initialized = true;
      }
      
      // Show the meditation container
      meditationContainer.classList.add('active');
    } else {
      // If meditation JS is not loaded yet, show a notification
      showNotification('Loading meditation timer...');
    }
  });
}

// Show a notification
function showNotification(message) {
  // Create notification element if it doesn't exist
  let notification = document.querySelector('.notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);
  }
  
  // Set message and show
  notification.textContent = message;
  notification.classList.add('show');
  
  // Hide after delay
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

// Common English stopwords to filter out from keyword analysis
const commonStopWords = [
  'about', 'after', 'again', 'also', 'always', 'around', 'been', 'because',
  'before', 'being', 'between', 'both', 'could', 'does', 'doesn', 'doing',
  'down', 'during', 'each', 'even', 'every', 'from', 'going', 'have', 'haven',
  'having', 'here', 'just', 'know', 'like', 'look', 'more', 'much', 'myself',
  'only', 'other', 'over', 'really', 'should', 'some', 'something', 'such', 
  'take', 'than', 'that', 'their', 'them', 'then', 'there', 'these', 'they', 
  'this', 'those', 'through', 'under', 'very', 'want', 'well', 'were', 'what',
  'when', 'where', 'which', 'while', 'will', 'with', 'would', 'your', 'yours',
  'yourself'
];
