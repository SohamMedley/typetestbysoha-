import { Chart } from "@/components/ui/chart"

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const themeToggle = document.getElementById("themeToggle")
  const soundToggle = document.getElementById("soundToggle")
  const textDisplay = document.getElementById("textDisplay")
  const inputField = document.getElementById("inputField")
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
    if (!soundEnabled) return

    // Simulated beep sounds (instead of real files)
    const oscillator = new (window.AudioContext || window.webkitAudioContext)()
    const osc = oscillator.createOscillator()
    const gain = oscillator.createGain()

    osc.connect(gain)
    gain.connect(oscillator.destination)

    if (sound === keySound) {
      osc.frequency.value = 600
      gain.gain.value = 0.05
      gain.gain.exponentialRampToValueAtTime(0.00001, oscillator.currentTime + 0.1)
      osc.start()
      osc.stop(oscillator.currentTime + 0.1)
    } else if (sound === errorSound) {
      osc.frequency.value = 200
      gain.gain.value = 0.1
      gain.gain.exponentialRampToValueAtTime(0.00001, oscillator.currentTime + 0.2)
      osc.start()
      osc.stop(oscillator.currentTime + 0.2)
    } else if (sound === completeSound) {
      osc.frequency.value = 800
      gain.gain.value = 0.1
      gain.gain.exponentialRampToValueAtTime(0.00001, oscillator.currentTime + 0.3)
      osc.start()
      osc.stop(oscillator.currentTime + 0.3)
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
      "the","be","to","of","and","a","in","that","have","I","it","for",
      "not","on","with","he","as","you","do","at",
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
    // Show the Results Panel Immediately
    // (So that it’s visible before typing)
    // ---------------------------
   // Initialize all result fields to zero or default
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

// (Do not show the results panel here)
// createWpmChart() can be called later when needed


    // Make sure the results panel is visible:
    results.classList.remove("hidden")

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
  results.classList.add("hidden")  // Hide the results panel on reset
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
    if (!isTestActive) {
      isTestActive = true
      startTime = Date.now()
      startTimer()
    }

    const inputValue = e.target.value
    const currentWord = words[wordIndex]

    if (inputValue.endsWith(" ")) {
      // Word completed
      const typedWord = inputValue.trim()

      // Check correctness
      if (typedWord === currentWord) {
        correctChars += currentWord.length
        correctWords++
        playSound(keySound)
      } else {
        for (let i = 0; i < Math.min(typedWord.length, currentWord.length); i++) {
          if (typedWord[i] === currentWord[i]) {
            correctChars++
          } else {
            incorrectChars++
          }
        }
        const lengthDiff = Math.abs(typedWord.length - currentWord.length)
        incorrectChars += lengthDiff
        incorrectWords++
      }

      // Add space to correct chars
      correctChars++

      // Move on
      wordIndex++
      charIndex = 0
      e.target.value = ""

      // Check if test is complete (words mode)
      if (currentMode === "words" && wordIndex >= words.length) {
        endTest()
        return
      }
      // For quote/code/custom
      if ((currentMode === "quote" || currentMode === "code" || currentMode === "custom") && wordIndex >= words.length) {
        endTest()
        return
      }

      updateDisplay()
      updateCursorPosition()
    } else {
      // Character-level updates
      charIndex = inputValue.length
      updateDisplay()
      updateCursorPosition()

      if (inputValue.length > 0) {
        const lastChar = inputValue[inputValue.length - 1]
        const expectedChar = currentWord[charIndex - 1]
        if (lastChar === expectedChar) {
          playSound(keySound)
        } else {
          playSound(errorSound)
        }
      }
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
    clearInterval(timerInterval)
    isTestActive = false
    cursor.style.display = "none"
    playSound(completeSound)

    // Calculate final stats
    const elapsedTime = currentMode === "time" ? currentTimeOption : (Date.now() - startTime) / 1000
    const elapsedTimeMinutes = elapsedTime / 60
    const wpm = Math.round(correctChars / 5 / (elapsedTimeMinutes || 1e-9))
    const rawWpm = Math.round((correctChars + incorrectChars) / 5 / (elapsedTimeMinutes || 1e-9))
    const accuracy = Math.round((correctChars / (correctChars + incorrectChars || 1)) * 100)
    const consistency = calculateConsistency(lastWpmValues)

    // Update results
    wpmValue.textContent = wpm
    accuracyValue.textContent = `${accuracy}%`
    timeValue.textContent = `${Math.round(elapsedTime)}s`
    correctCharsValue.textContent = correctChars
    totalCharsValue.textContent = correctChars + incorrectChars
    detailedAccuracyValue.textContent = `${accuracy}%`
    correctWordsValue.textContent = correctWords
    incorrectWordsValue.textContent = incorrectWords
    consistencyValue.textContent = `${consistency}%`
    rawWpmValue.textContent = rawWpm

    // Make sure results panel is visible
    results.classList.remove("hidden")
    createWpmChart()
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
  closeResults.addEventListener("click", () => {
    results.classList.add("hidden")
  })

  // Focus on input if user clicks text display
  textDisplay.addEventListener("click", () => {
    inputField.focus()
  })

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    // Tab + Enter to restart
    if (e.key === "Enter" && e.getModifierState("Tab")) {
      e.preventDefault()
      resetTest()
    }
    // Escape to reset
    if (e.key === "Escape") {
      e.preventDefault()
      resetTest()
    }
  })

  // ---------------------------
  // INITIALIZE
  // ---------------------------
  initTest()
  inputField.focus()
})
