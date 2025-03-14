document.addEventListener('DOMContentLoaded', function() {
  // Single set of DOM element references
  const welcomeOverlay = document.getElementById('welcomeOverlay');
  const startTestBtn = document.getElementById('startTestBtn');
  const countdownOverlay = document.getElementById('countdownOverlay');
  const countdownNumber = document.getElementById('countdownNumber');
  const inputField = document.getElementById('inputField');

  // Unified start button handler
  if (startTestBtn) {
      startTestBtn.addEventListener('click', function() {
          console.log('Start button clicked');
          if (welcomeOverlay) {
              welcomeOverlay.classList.add('hidden');
              welcomeOverlay.style.display = 'none';
              startCountdown();
          }
      });
  }

  function startCountdown() {
      console.log('Starting countdown');
      if (countdownOverlay) {
          countdownOverlay.classList.remove('hidden');
          countdownOverlay.style.display = 'flex';
          let count = 3;

          const updateCountdown = () => {
              console.log('Count:', count);
              countdownNumber.textContent = count;
              
              if (count === 0) {
                  countdownOverlay.classList.add('hidden');
                  countdownOverlay.style.display = 'none';
                  if (inputField) inputField.focus();
                  clearInterval(countdownInterval);
                  
                  // Make sure history and results are hidden after countdown
                  if (historyPanel) {
                      historyPanel.classList.add('hidden');
                      historyPanel.style.display = 'none';
                  }
                  if (results) {
                      results.classList.add('hidden');
                      results.style.display = 'none';
                  }
                  
                  initTest(); // Start the typing test
              }
              count--;
          };

          updateCountdown(); // Initial call
          const countdownInterval = setInterval(updateCountdown, 1000);
      }
  }

  // Remove the second DOMContentLoaded listener and move its content here
  // ...existing code for theme toggle, test initialization, etc...

  // DOM Elements
  const themeToggle = document.getElementById("themeToggle")
  const soundToggle = document.getElementById("soundToggle")
  const textDisplay = document.getElementById("textDisplay")
  const timer = document.getElementById("timer")
  const restartBtn = document.getElementById("restartBtn")
  const results = document.getElementById("results")
  const closeResults = document.getElementById("closeResults")
  const retryBtn = document.getElementById("retryBtn")
  const shareBtn = document.getElementById("shareBtn")
  const toast = document.getElementById("toast")
  const toastMessage = document.getElementById("toastMessage")
  const liveWpm = document.getElementById("liveWpm")
  const liveAccuracy = document.getElementById("liveAccuracy")
  const cursor = document.querySelector(".cursor")
  const historyToggle = document.getElementById("historyToggle")
  const historyPanel = document.getElementById("historyPanel")
  const closeHistory = document.getElementById("closeHistory")
  const historyTabs = document.querySelectorAll(".history-tab")
  const historyTabContents = document.querySelectorAll(".history-tab-content")
  const recentTestsList = document.getElementById("recentTestsList")
  const timeHighscores = document.getElementById("timeHighscores")
  const wordsHighscores = document.getElementById("wordsHighscores")
  const quoteHighscores = document.getElementById("quoteHighscores")
  const clearHistoryBtn = document.getElementById("clearHistoryBtn")

  // Result elements
  const wpmValue = document.getElementById("wpmValue")
  const accuracyValue = document.getElementById("accuracyValue")
  const timeValue = document.getElementById("timeValue")
  const correctCharsValue = document.getElementById("correctCharsValue")
  const totalCharsValue = document.getElementById("totalCharsValue")
  const detailedAccuracyValue = document.getElementById("detailedAccuracyValue")
  const correctWordsValue = document.getElementById("correctWordsValue")
  const incorrectWordsValue = document.getElementById("incorrectWordsValue")
  const consistencyValue = document.getElementById("consistencyValue")
  const rawWpmValue = document.getElementById("rawWpmValue")

  // Test configuration elements
  const modeBtns = document.querySelectorAll(".mode-btn")
  const optionGroups = document.querySelectorAll(".option-group")
  const timeOptions = document.querySelectorAll("[data-time]")
  const wordsOptions = document.querySelectorAll("[data-words]")
  const quoteOptions = document.querySelectorAll("[data-quote]")
  const difficultyBtns = document.querySelectorAll(".difficulty-btn")
  const customText = document.getElementById("customText")

  // Audio elements - create dynamically since we don't have actual sound files
  const keySound = new Audio()
  keySound.volume = 0.5

  const errorSound = new Audio()
  errorSound.volume = 0.5

  const completeSound = new Audio()
  completeSound.volume = 0.7

  // State variables
  let words = []
  let wordIndex = 0
  let charIndex = 0
  let startTime = 0
  let timerInterval = null
  let timeLeft = 30
  let isTestActive = false
  let correctChars = 0
  let incorrectChars = 0
  let totalChars = 0
  let correctWords = 0
  let incorrectWords = 0
  let wpmHistory = []
  let rawWpmHistory = []
  let currentMode = "time"
  let currentTimeOption = 30
  let currentWordsOption = 25
  let currentQuoteOption = "short"
  let currentDifficulty = "medium"
  let soundEnabled = true
  let wpmChart = null
  const cursorPosition = { x: 0, y: 0 }
  let lastWpmValues = []

  // ---------------------------
  //  1. THEME & SOUND TOGGLE
  // ---------------------------
  themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark")
      localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light")
  })

  if (
      localStorage.getItem("theme") === "dark" ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches && !localStorage.getItem("theme"))
  ) {
      document.body.classList.add("dark")
  }

  soundToggle.addEventListener("click", () => {
      soundEnabled = !soundEnabled
      soundToggle.classList.toggle("muted", !soundEnabled)
      localStorage.setItem("sound", soundEnabled ? "enabled" : "disabled")
  })

  if (localStorage.getItem("sound") === "disabled") {
      soundEnabled = false
      soundToggle.classList.add("muted")
  }

  function playSound(sound) {
      if (!soundEnabled) return;

      try {
          // Simulated beep sounds (instead of real files)
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          const oscillator = new AudioContext();
          const osc = oscillator.createOscillator();
          const gain = oscillator.createGain();

          osc.connect(gain);
          gain.connect(oscillator.destination);

          if (sound === keySound) {
              osc.frequency.value = 600;
              gain.gain.value = 0.05;
              gain.gain.exponentialRampToValueAtTime(0.00001, oscillator.currentTime + 0.1);
              osc.start();
              osc.stop(oscillator.currentTime + 0.1);
          } else if (sound === errorSound) {
              osc.frequency.value = 200;
              gain.gain.value = 0.1;
              gain.gain.exponentialRampToValueAtTime(0.00001, oscillator.currentTime + 0.2);
              osc.start();
              osc.stop(oscillator.currentTime + 0.2);
          } else if (sound === completeSound) {
              osc.frequency.value = 800;
              gain.gain.value = 0.1;
              gain.gain.exponentialRampToValueAtTime(0.00001, oscillator.currentTime + 0.3);
              osc.start();
              osc.stop(oscillator.currentTime + 0.3);
          }
      } catch (error) {
          console.error("Error playing sound:", error);
      }
  }

  // ---------------------------
  //  2. MODE SELECTION
  // ---------------------------
  modeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
          modeBtns.forEach((b) => b.classList.remove("active"))
          btn.classList.add("active")
          currentMode = btn.dataset.mode

          optionGroups.forEach((group) => group.classList.add("hidden"))
          document.querySelector(`.${currentMode}-options`).classList.remove("hidden")

          // Show/hide difficulty selector based on mode
          const difficultySelector = document.querySelector(".difficulty-selector")
          if (currentMode === "code" || currentMode === "quote" || currentMode === "custom") {
              difficultySelector.classList.add("hidden")
          } else {
              difficultySelector.classList.remove("hidden")
          }

          // Add/remove code class to text display
          if (currentMode === "code") {
              textDisplay.classList.add("code")
          } else {
              textDisplay.classList.remove("code")
          }

          resetTest()
      })
  })

  timeOptions.forEach((option) => {
      option.addEventListener("click", () => {
          timeOptions.forEach((o) => o.classList.remove("active"))
          option.classList.add("active")
          currentTimeOption = Number.parseInt(option.dataset.time)
          timeLeft = currentTimeOption
          timer.textContent = timeLeft
          resetTest()
      })
  })

  wordsOptions.forEach((option) => {
      option.addEventListener("click", () => {
          wordsOptions.forEach((o) => o.classList.remove("active"))
          option.classList.add("active")
          currentWordsOption = Number.parseInt(option.dataset.words)
          resetTest()
      })
  })

  quoteOptions.forEach((option) => {
      option.addEventListener("click", () => {
          quoteOptions.forEach((o) => o.classList.remove("active"))
          option.classList.add("active")
          currentQuoteOption = option.dataset.quote
          resetTest()
      })
  })

  difficultyBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
          difficultyBtns.forEach((b) => b.classList.remove("active"))
          btn.classList.add("active")
          currentDifficulty = btn.dataset.difficulty
          resetTest()
      })
  })

  customText.addEventListener("input", () => {
      resetTest()
  })

  // ---------------------------
  //  3. FETCH / Fallback logic
  // ---------------------------
  async function fetchWords() {
      try {
          const response = await fetch(`/api/words?count=${currentWordsOption}&difficulty=${currentDifficulty}`)
          const data = await response.json()
          return data
      } catch (error) {
          console.error("Error fetching words:", error)
          return generateFallbackWords(currentWordsOption)
      }
  }

  async function fetchQuote() {
      try {
          const response = await fetch(`/api/quotes?length=${currentQuoteOption}`)
          const data = await response.json()
          return data.quote.split(" ")
      } catch (error) {
          console.error("Error fetching quote:", error)
          return ["An", "error", "occurred", "while", "fetching", "the", "quote."]
      }
  }

  async function fetchCode() {
      try {
          const response = await fetch("/api/code")
          const data = await response.json()
          return data.code.split("\n").join(" ").split(" ")
      } catch (error) {
          console.error("Error fetching code:", error)
          return ["function", "example()", "{", "return", "true;", "}"]
      }
  }

  function generateFallbackWords(count) {
      const fallbackWords = [
          "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for",
          "not", "on", "with", "he", "as", "you", "do", "at",
      ]
      const result = []
      for (let i = 0; i < count; i++) {
          const randomIndex = Math.floor(Math.random() * fallbackWords.length)
          result.push(fallbackWords[randomIndex])
      }
      return result
  }

  // ---------------------------
  //  4. INIT / RENDER / RESET
  // ---------------------------
  async function initTest() {
      switch (currentMode) {
          case "time":
              words = await fetchWords()
              timeLeft = currentTimeOption
              timer.textContent = timeLeft
              break
          case "words":
              words = await fetchWords()
              timer.textContent = "0"
              break
          case "quote":
              words = await fetchQuote()
              timer.textContent = "0"
              break
          case "code":
              words = await fetchCode()
              timer.textContent = "0"
              textDisplay.classList.add("code")
              break
          case "custom":
              if (customText.value.trim() === "") {
                  customText.value = "Type or paste your custom text here..."
              }
              words = customText.value.trim().split(" ")
              timer.textContent = "0"
              break
      }

      renderText()
      wordIndex = 0
      charIndex = 0
      correctChars = 0
      incorrectChars = 0
      totalChars = 0
      correctWords = 0
      incorrectWords = 0
      wpmHistory = []
      rawWpmHistory = []
      lastWpmValues = []
      isTestActive = false
      liveWpm.textContent = "0"
      liveAccuracy.textContent = "100%"

      // Position cursor at the first character
      updateCursorPosition()

      // ---------------------------
      // Initialize result fields to zero or default values
      // but don't show the results panel yet
      // ---------------------------
      wpmValue.textContent = 0
      accuracyValue.textContent = "0%"
      timeValue.textContent = "0s"
      correctCharsValue.textContent = 0
      totalCharsValue.textContent = 0
      detailedAccuracyValue.textContent = "0%"
      correctWordsValue.textContent = 0
      incorrectWordsValue.textContent = 0
      consistencyValue.textContent = "0%"
      rawWpmValue.textContent = 0

      // Make sure the results panel is hidden during initialization
      results.classList.add("hidden")

      // If you want a chart from the start (even if empty),
      // you can create it now with zero data:
      createWpmChart()
  }

  function renderText() {
      textDisplay.innerHTML = ""

      words.forEach((word, wIndex) => {
          const wordSpan = document.createElement("span")
          wordSpan.className = "word"

          for (let i = 0; i < word.length; i++) {
              const charSpan = document.createElement("span")
              charSpan.textContent = word[i]
              if (wIndex === 0 && i === 0) {
                  charSpan.className = "current"
              }
              wordSpan.appendChild(charSpan)
          }

          textDisplay.appendChild(wordSpan)

          // Add space after each word except the last
          if (wIndex < words.length - 1) {
              const spaceSpan = document.createElement("span")
              spaceSpan.textContent = " "
              textDisplay.appendChild(spaceSpan)
          }
      })

      // Show cursor
      cursor.style.display = "block"
  }

  function updateCursorPosition() {
      const currentChar = textDisplay.querySelector(".current")
      if (currentChar) {
          const rect = currentChar.getBoundingClientRect()
          const textDisplayRect = textDisplay.getBoundingClientRect()
          cursorPosition.x = rect.left - textDisplayRect.left
          cursorPosition.y = rect.top - textDisplayRect.top
          cursor.style.transform = `translate(${cursorPosition.x}px, ${cursorPosition.y}px)`
      }
  }

  function resetTest() {
      clearInterval(timerInterval)
      inputField.value = ""
      results.classList.add("hidden")
      initTest()
  }

  // ---------------------------
  //  5. TIMER & LIVE STATS
  // ---------------------------
  function startTimer() {
      if (currentMode === "time") {
          timerInterval = setInterval(() => {
              timeLeft--
              timer.textContent = timeLeft
              updateLiveStats()
              if (timeLeft <= 0) {
                  endTest()
              }
          }, 1000)
      } else {
          startTime = Date.now()
          timerInterval = setInterval(() => {
              const elapsedTime = Math.floor((Date.now() - startTime) / 1000)
              timer.textContent = elapsedTime
              updateLiveStats()
          }, 1000)
      }
  }

  function updateLiveStats() {
      const elapsedTime = (Date.now() - startTime) / 1000 / 60 // in minutes
      const currentWpm = Math.round(correctChars / 5 / (elapsedTime || 1e-9)) // avoid div by zero
      const currentRawWpm = Math.round((correctChars + incorrectChars) / 5 / (elapsedTime || 1e-9))
      const currentAccuracy = Math.round((correctChars / (correctChars + incorrectChars || 1)) * 100)

      wpmHistory.push(currentWpm)
      rawWpmHistory.push(currentRawWpm)
      lastWpmValues.push(currentWpm)
      if (lastWpmValues.length > 5) {
          lastWpmValues.shift()
      }

      liveWpm.textContent = currentWpm
      liveAccuracy.textContent = `${currentAccuracy}%`
  }

  // ---------------------------
  //  6. INPUT HANDLING
  // ---------------------------
  inputField.addEventListener("input", (e) => {
      const inputValue = e.target.value

      // Start the test when the user starts typing
      if (!isTestActive && inputValue.length === 1) {
          isTestActive = true
          startTime = Date.now()
          startTimer()
      }

      if (isTestActive) {
          // Check if the current word is completed
          if (inputValue.endsWith(" ")) {
              // Check if the word was typed correctly
              const currentWord = words[wordIndex]
              const typedWord = inputValue.trim()

              if (typedWord === currentWord) {
                  correctWords++
                  correctChars += currentWord.length
              } else {
                  incorrectWords++

                  // Count correct characters in the word
                  for (let i = 0; i < Math.min(typedWord.length, currentWord.length); i++) {
                      if (typedWord[i] === currentWord[i]) {
                          correctChars++
                      } else {
                          incorrectChars++
                      }
                  }

                  // Count extra or missing characters
                  if (typedWord.length > currentWord.length) {
                      incorrectChars += typedWord.length - currentWord.length
                  } else {
                      incorrectChars += currentWord.length - typedWord.length
                  }
              }

              // Move to the next word
              wordIndex++
              charIndex = 0
              e.target.value = ""

              // Check if the test is complete (for words mode)
              if (currentMode === "words" && wordIndex >= currentWordsOption) {
                  endTest()
                  return
              }

              // Play sound
              playSound(keySound)
          } else {
              // Update character index
              charIndex = inputValue.length
          }

          // Update display
          updateDisplay()
          updateCursorPosition()
          updateLiveStats()
      }
  })

  inputField.addEventListener("keydown", (e) => {
      // Prevent default behavior for Tab key
      if (e.key === "Tab") {
          e.preventDefault()

          // Tab + Enter to restart
          if (e.getModifierState("Enter")) {
              resetTest()
          }
      }

      // Escape to reset
      if (e.key === "Escape") {
          e.preventDefault()
          resetTest()
      }
  })

  function updateDisplay() {
      const wordElements = textDisplay.querySelectorAll(".word")
      const spaces = textDisplay.querySelectorAll(".word + span")

      textDisplay.querySelectorAll("span").forEach((span) => {
          span.classList.remove("correct", "incorrect", "current")
      })

      // Mark completed words
      for (let i = 0; i < wordIndex; i++) {
          const wordSpan = wordElements[i]
          const chars = wordSpan.querySelectorAll("span")
          chars.forEach((char) => {
              char.classList.add("correct")
          })
          if (i < spaces.length) {
              spaces[i].classList.add("correct")
          }
      }

      // Mark current word
      if (wordIndex < wordElements.length) {
          const currentWordSpan = wordElements[wordIndex]
          const chars = currentWordSpan.querySelectorAll("span")
          const inputValue = inputField.value

          for (let i = 0; i < chars.length; i++) {
              if (i < inputValue.length) {
                  if (chars[i].textContent === inputValue[i]) {
                      chars[i].classList.add("correct")
                  } else {
                      chars[i].classList.add("incorrect")
                  }
              }
          }
          if (charIndex < chars.length) {
              chars[charIndex].classList.add("current")
          }
      }
  }

  // ---------------------------
  //  7. END TEST & RESULTS
  // ---------------------------
  function endTest() {
      clearInterval(timerInterval);
      isTestActive = false;
      cursor.style.display = "none";
      playSound(completeSound);

      // Calculate final stats
      const elapsedTime = currentMode === "time" ? currentTimeOption : (Date.now() - startTime) / 1000;
      const elapsedTimeMinutes = elapsedTime / 60;
      const wpm = Math.round(correctChars / 5 / (elapsedTimeMinutes || 1e-9));
      const rawWpm = Math.round((correctChars + incorrectChars) / 5 / (elapsedTimeMinutes || 1e-9));
      const accuracy = Math.round((correctChars / (correctChars + incorrectChars || 1)) * 100);
      const consistency = calculateConsistency(lastWpmValues);

      // Update results
      wpmValue.textContent = wpm;
      accuracyValue.textContent = `${accuracy}%`;
      timeValue.textContent = `${Math.round(elapsedTime)}s`;
      correctCharsValue.textContent = correctChars;
      totalCharsValue.textContent = correctChars + incorrectChars;
      detailedAccuracyValue.textContent = `${accuracy}%`;
      correctWordsValue.textContent = correctWords;
      incorrectWordsValue.textContent = incorrectWords;
      consistencyValue.textContent = `${consistency}%`;
      rawWpmValue.textContent = rawWpm;

      // Save test result to history
      saveTestResult({
          mode: currentMode,
          option: currentMode === "time" ? currentTimeOption :
              currentMode === "words" ? currentWordsOption :
                  currentMode === "quote" ? currentQuoteOption : null,
          wpm,
          rawWpm,
          accuracy,
          time: Math.round(elapsedTime),
          correctChars,
          totalChars: correctChars + incorrectChars,
          correctWords,
          incorrectWords,
          consistency
      });

      // Make sure history panel is hidden
      if (historyPanel) {
          historyPanel.classList.add('hidden');
          historyPanel.style.display = 'none';
      }

      // Make sure results panel is visible
      results.classList.remove('hidden');
      results.style.display = 'block';
      createWpmChart();
  }

  function calculateConsistency(wpmValues) {
      if (wpmValues.length < 2) return 100
      const mean = wpmValues.reduce((sum, val) => sum + val, 0) / wpmValues.length
      const squaredDiffs = wpmValues.map((val) => Math.pow(val - mean, 2))
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / wpmValues.length
      const stdDev = Math.sqrt(variance)
      const cv = (stdDev / mean) * 100 // coefficient of variation
      return Math.max(0, Math.min(100, Math.round(100 - cv)))
  }

  // ---------------------------
  //  8. CHART
  // ---------------------------
  function createWpmChart() {
      const chartCanvas = document.getElementById("wpmChart")
      if (!chartCanvas) return

      const ctx = chartCanvas.getContext("2d")
      if (wpmChart) wpmChart.destroy()

      const labels = Array.from({ length: wpmHistory.length }, (_, i) => i + 1)
      const textColor = getComputedStyle(document.documentElement).getPropertyValue("--text").trim()
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim()
      const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue("--primary-light").trim()

      try {
          wpmChart = new Chart(ctx, {
              type: "line",
              data: {
                  labels: labels,
                  datasets: [
                      {
                          label: "WPM",
                          data: wpmHistory,
                          borderColor: primaryColor,
                          backgroundColor: "rgba(99, 102, 241, 0.2)",
                          tension: 0.3,
                          fill: true,
                      },
                      {
                          label: "Raw WPM",
                          data: rawWpmHistory,
                          borderColor: secondaryColor,
                          backgroundColor: "rgba(129, 140, 248, 0.1)",
                          tension: 0.3,
                          borderDash: [5, 5],
                          fill: false,
                      },
                  ],
              },
              options: {
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                      legend: {
                          display: true,
                          labels: {
                              color: textColor,
                          },
                      },
                  },
                  scales: {
                      y: {
                          beginAtZero: true,
                          grid: {
                              color: "rgba(200, 200, 200, 0.1)",
                          },
                          ticks: {
                              color: textColor,
                          },
                      },
                      x: {
                          grid: {
                              display: false,
                          },
                          ticks: {
                              color: textColor,
                          },
                      },
                  },
              },
          })
      } catch (error) {
          console.error("Error creating chart:", error)
      }
  }

  // ---------------------------
  //  9. BUTTONS / SHARING
  // ---------------------------
  shareBtn.addEventListener("click", () => {
      const wpm = wpmValue.textContent
      const accuracy = accuracyValue.textContent
      const time = timeValue.textContent

      const shareText = `I just scored ${wpm} WPM with ${accuracy} accuracy in ${time} on TypeTest by Soham! 🚀`

      navigator.clipboard
          .writeText(shareText)
          .then(() => {
              showToast("Result copied to clipboard!")
          })
          .catch((err) => {
              console.error("Failed to copy text: ", err)
              showToast("Failed to copy result")
          })
  })

  function showToast(message) {
      toastMessage.textContent = message
      toast.classList.remove("hidden")
      setTimeout(() => {
          toast.classList.add("hidden")
      }, 3000)
  }

  restartBtn.addEventListener("click", resetTest)
  retryBtn.addEventListener("click", () => {
      results.classList.add("hidden")
      resetTest()
  })
  closeResults.addEventListener("click", function() {
      console.log('Close results button clicked');
      results.classList.add('hidden');
      results.style.display = 'none';
  })

  // Focus on input if user clicks text display
  textDisplay.addEventListener("click", () => {
      inputField.focus()
  })

  // ---------------------------
  //  HISTORY FUNCTIONALITY
  // ---------------------------
  historyToggle.addEventListener("click", () => {
      historyPanel.classList.remove("hidden")
      loadHistory()
  })

  closeHistory.addEventListener("click", function() {
      console.log('Close history button clicked');
      historyPanel.classList.add('hidden');
      historyPanel.style.display = 'none';
  })

  historyTabs.forEach(tab => {
      tab.addEventListener("click", () => {
          historyTabs.forEach(t => t.classList.remove("active"))
          tab.classList.add("active")

          const tabName = tab.dataset.tab
          historyTabContents.forEach(content => {
              content.classList.remove("active")
          })
          document.getElementById(tabName === "recent" ? "recentTests" : "highScores").classList.add("active")
      })
  })

  clearHistoryBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all your typing history? This cannot be undone.")) {
          localStorage.removeItem("typingHistory")
          localStorage.removeItem("typingHighscores")
          loadHistory()
          showToast("History cleared successfully")
      }
  })

  function saveTestResult(result) {
      // Get existing history or initialize empty array
      const history = JSON.parse(localStorage.getItem("typingHistory") || "[]")

      // Add new result with timestamp
      const newResult = {
          ...result,
          timestamp: Date.now()
      }

      // Add to beginning of array (most recent first)
      history.unshift(newResult)

      // Keep only the last 20 results
      if (history.length > 20) {
          history.pop()
      }

      // Save back to localStorage
      localStorage.setItem("typingHistory", JSON.stringify(history))

      // Update highscores
      updateHighscores(newResult)
  }

  function updateHighscores(result) {
      // Get existing highscores or initialize empty object
      const highscores = JSON.parse(localStorage.getItem("typingHighscores") || '{"time":[],"words":[],"quote":[]}')

      // Add to appropriate category
      if (result.mode === "time" || result.mode === "words" || result.mode === "quote") {
          highscores[result.mode].push(result)

          // Sort by WPM (descending)
          highscores[result.mode].sort((a, b) => b.wpm - a.wpm)

          // Keep only top 5
          if (highscores[result.mode].length > 5) {
              highscores[result.mode] = highscores[result.mode].slice(0, 5)
          }
      }

      // Save back to localStorage
      localStorage.setItem("typingHighscores", JSON.stringify(highscores))
  }

  function loadHistory() {
      // Load recent tests
      const history = JSON.parse(localStorage.getItem("typingHistory") || "[]")

      if (history.length === 0) {
          document.querySelector(".history-empty").classList.remove("hidden")
          recentTestsList.classList.add("hidden")
      } else {
          document.querySelector(".history-empty").classList.add("hidden")
          recentTestsList.classList.remove("hidden")

          // Clear existing items
          recentTestsList.innerHTML = ""

          // Add history items
          history.forEach(item => {
              const date = new Date(item.timestamp)
              const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`

              const historyItem = document.createElement("div")
              historyItem.className = "history-item"
              historyItem.innerHTML = `
        <div class="history-item-details">
          <div class="history-item-mode">${formatMode(item.mode, item.option)}</div>
          <div class="history-item-stats">
            <div class="history-stat">
              <div class="history-stat-value">${item.wpm}</div>
              <div class="history-stat-label">WPM</div>
            </div>
            <div class="history-stat">
              <div class="history-stat-value">${item.accuracy}%</div>
              <div class="history-stat-label">Accuracy</div>
            </div>
            <div class="history-stat">
              <div class="history-stat-value">${item.time}s</div>
              <div class="history-stat-label">Time</div>
            </div>
          </div>
        </div>
        <div class="history-item-date">${formattedDate}</div>
      `

              recentTestsList.appendChild(historyItem)
          })
      }

      // Load highscores
      const highscores = JSON.parse(localStorage.getItem("typingHighscores") || '{"time":[],"words":[],"quote":[]}')

      // Time highscores
      timeHighscores.innerHTML = ""
      if (highscores.time.length === 0) {
          timeHighscores.innerHTML = "<div class='history-empty'>No highscores yet</div>"
      } else {
          highscores.time.forEach((item, index) => {
              const highscoreItem = document.createElement("div")
              highscoreItem.className = "highscore-item"
              highscoreItem.innerHTML = `
        <div class="highscore-rank">#${index + 1}</div>
        <div class="highscore-details">${formatMode(item.mode, item.option)}</div>
        <div class="highscore-value">${item.wpm} WPM</div>
      `

              timeHighscores.appendChild(highscoreItem)
          })
      }

      // Words highscores
      wordsHighscores.innerHTML = ""
      if (highscores.words.length === 0) {
          wordsHighscores.innerHTML = "<div class='history-empty'>No highscores yet</div>"
      } else {
          highscores.words.forEach((item, index) => {
              const highscoreItem = document.createElement("div")
              highscoreItem.className = "highscore-item"
              highscoreItem.innerHTML = `
        <div class="highscore-rank">#${index + 1}</div>
        <div class="highscore-details">${formatMode(item.mode, item.option)}</div>
        <div class="highscore-value">${item.wpm} WPM</div>
      `

              wordsHighscores.appendChild(highscoreItem)
          })
      }

      // Quote highscores
      quoteHighscores.innerHTML = ""
      if (highscores.quote.length === 0) {
          quoteHighscores.innerHTML = "<div class='history-empty'>No highscores yet</div>"
      } else {
          highscores.quote.forEach((item, index) => {
              const highscoreItem = document.createElement("div")
              highscoreItem.className = "highscore-item"
              highscoreItem.innerHTML = `
        <div class="highscore-rank">#${index + 1}</div>
        <div class="highscore-details">${formatMode(item.mode, item.option)}</div>
        <div class="highscore-value">${item.wpm} WPM</div>
      `

              quoteHighscores.appendChild(highscoreItem)
          })
      }
  }

  function formatMode(mode, option) {
      switch (mode) {
          case "time":
              return `Time: ${option}s`
          case "words":
              return `Words: ${option}`
          case "quote":
              return `Quote: ${option}`
          case "code":
              return "Code"
          case "custom":
              return "Custom"
          default:
              return mode
      }
  }

  // ---------------------------
  // INITIALIZE
  // ---------------------------
  initTest()
  // Don't auto-focus the input field, let the user click the start button first
  // inputField.focus()
})
