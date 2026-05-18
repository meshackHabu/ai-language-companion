document.addEventListener("DOMContentLoaded", function () {

  let currentIndex = 0;
  let currentDeck = [];

  function flipCard() {
    const flashcard = document.getElementById("flashcardInner");
    if (flashcard) {
      flashcard.classList.toggle("flipped");
    }
  }
  window.flipCard = flipCard;

  const params = new URLSearchParams(window.location.search);
  let lang = params.get("lang") || localStorage.getItem("selectedLanguage") || "yoruba";
  const selectedCategory = params.get("category") || localStorage.getItem("selectedCategory") || "all";
  const selectedStudyMode = params.get("studyMode") || localStorage.getItem("selectedStudyMode") || "level";
  let safeCategory = selectedCategory;
  let learnerLevel = "starter";

  if (typeof getLanguageCategories === "function") {
    const validCategories = getLanguageCategories(lang);
    if (safeCategory !== "all" && !validCategories.includes(safeCategory)) {
      safeCategory = "all";
    }
  }

  localStorage.setItem("selectedLanguage", lang);
  localStorage.setItem("selectedCategory", safeCategory);
  localStorage.setItem("selectedStudyMode", selectedStudyMode);

  const languageNames = {
    yoruba: "Yoruba",
    hausa: "Hausa",
    igbo: "Igbo",
    french: "French",
    swahili: "Swahili",
    zulu: "Zulu",
    amharic: "Amharic"
  };

  const allFlashcardData =
    typeof flashcardData !== "undefined" ? flashcardData : (window.flashcardData || {});

  const title = document.getElementById("languageTitle");

  function updateTitle() {
    if (title) {
      title.textContent = "Learning " + (languageNames[lang] || "Language");
    }
  }

  if (typeof getDeckForLanguage === "function" && getDeckForLanguage(lang, safeCategory).length) {
    currentDeck = getDeckForLanguage(lang, safeCategory);
  } else if (allFlashcardData[lang]) {
    currentDeck = [...allFlashcardData[lang]];
  } else if (typeof getDeckForLanguage === "function" && getDeckForLanguage("yoruba", safeCategory).length) {
    currentDeck = getDeckForLanguage("yoruba", safeCategory);
    lang = "yoruba";
    localStorage.setItem("selectedLanguage", lang);
  } else if (allFlashcardData["yoruba"]) {
    currentDeck = [...allFlashcardData["yoruba"]];
    lang = "yoruba";
    localStorage.setItem("selectedLanguage", lang);
  }

  updateTitle();
  if (typeof getDashboardStats === "function") {
    learnerLevel = (getDashboardStats(lang, getDeckForLanguage(lang).length).level || "Starter").toLowerCase();
  }

  if (typeof getDeckForStudyMode === "function") {
    const levelDeck = getDeckForStudyMode(lang, learnerLevel, safeCategory, selectedStudyMode);
    if (levelDeck.length) {
      currentDeck = levelDeck;
    }
  } else if (typeof getDeckForStudyLevel === "function") {
    const levelDeck = getDeckForStudyLevel(lang, learnerLevel, safeCategory);
    if (levelDeck.length) {
      currentDeck = levelDeck;
    }
  }

  if (typeof getLanguageCategories === "function") {
    const categoryNames = getLanguageCategories(lang)
      .map(name => name.charAt(0).toUpperCase() + name.slice(1))
      .join(", ");

    document.getElementById("categoryLabel").textContent = safeCategory === "all"
      ? `Categories: ${categoryNames}`
      : `Category: ${safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1)}`;
  }
  document.getElementById("levelLabel").textContent =
    `Level: ${learnerLevel.charAt(0).toUpperCase() + learnerLevel.slice(1)}`;
  document.getElementById("studyModeLabel").textContent =
    `Mode: ${selectedStudyMode === "adaptive" ? "Adaptive" : "My Level"}`;
  document.getElementById("backBtn").href =
    `dashboard.html?lang=${lang}&category=${safeCategory}&studyMode=${selectedStudyMode}`;

  function setStatus(message) {
    document.getElementById("flashcardStatus").textContent = message;
  }

  function updateProgressText(current, total) {
    const weakWordsCount = getDifficultWords(lang).length;
    document.getElementById("progressText").textContent =
      `Card ${current} of ${total} - Weak words: ${weakWordsCount}`;
  }

  function showEmptyState() {
    document.getElementById("word").textContent = "No words available";
    document.getElementById("meaning").textContent = "Please add flashcards for this language.";
    document.getElementById("example").textContent = "Try another language from the dashboard.";
    updateProgressText(0, 0);
    document.getElementById("flashcardInner").classList.remove("flipped");
    setStatus("No flashcards were found for this language.");
  }

  function showCard() {

    if (currentDeck.length === 0) {
      showEmptyState();
      return;
    }

    if (currentIndex >= currentDeck.length) {
      currentIndex = 0;
    }

    const card = currentDeck[currentIndex];

    document.getElementById("word").textContent = card.word;
    document.getElementById("meaning").textContent = card.meaning;
    document.getElementById("example").textContent = `Example: ${card.example || "No example yet"}`;

    document.getElementById("flashcardInner").classList.remove("flipped");

    updateProgressText(currentIndex + 1, currentDeck.length);
    setStatus("Tap the card to flip and study the example.");
  }

  showCard();

  function know() {
    if (currentDeck.length === 0) return;

    const currentCard = currentDeck[currentIndex];
    try {
      const progress = recordCorrectAnswer(currentCard, lang);
      syncAnswerToBackend(currentCard, lang, true, {
        category: safeCategory,
        studyMode: selectedStudyMode,
        activityType: "flashcard"
      }).then(syncResult => {
        if (!syncResult.synced && !syncResult.skipped) {
          setStatus(`${document.getElementById("flashcardStatus").textContent} Saved locally only.`);
        }
      });

      if (progress.justMastered) {
        setStatus("Strong work. This word is now mastered and removed from weak words.");
      } else if (progress.wasWeak) {
        setStatus(`${MASTERED_STREAK - progress.reviewStreak} more correct review(s) to master this word.`);
      } else {
        setStatus("Nice. This word counts as a correct review.");
      }
    } catch (error) {
      setStatus("Nice. This word counts as a correct review.");
    }

    currentIndex++;

    if (currentIndex >= currentDeck.length) {
      currentIndex = 0;
    }

    showCard();
  }
  window.know = know;

  function dontKnow() {
    if (currentDeck.length === 0) return;

    const difficultCard = currentDeck[currentIndex];

    let wrongCount = 1;
    try {
      const progress = saveDifficultWord(difficultCard, lang);
      wrongCount = progress.wrongCount || 1;
      syncAnswerToBackend(difficultCard, lang, false, {
        category: safeCategory,
        studyMode: selectedStudyMode,
        activityType: "flashcard"
      }).then(syncResult => {
        if (!syncResult.synced && !syncResult.skipped) {
          setStatus(`Saved to weak words. Missed ${wrongCount} time(s) so far. Saved locally only.`);
        }
      });
    } catch (error) {
      // keep moving even if local tracking breaks
    }

    currentDeck.push(difficultCard);
    setStatus(`Saved to weak words. Missed ${wrongCount} time(s) so far.`);

    currentIndex++;

    if (currentIndex >= currentDeck.length) {
      currentIndex = 0;
    }

    showCard();
  }
  window.dontKnow = dontKnow;

  function listen() {
    alert("Pronunciation coming soon");
  }
  window.listen = listen;

});

