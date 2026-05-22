
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    const categoryParam = params.get("category");
    const modeParam = params.get("studyMode");
    const API_BASE_URL = "http://localhost:5500";

    const titles = {
      hausa: "Learning Hausa",
      yoruba: "Learning Yoruba",
      igbo: "Learning Igbo",
      french: "Learning French",
      swahili: "Learning Swahili",
      zulu: "Learning Zulu",
      amharic: "Learning Amharic"
    };

    const prettyLanguageNames = {
      hausa: "Hausa",
      yoruba: "Yoruba",
      igbo: "Igbo",
      french: "French",
      swahili: "Swahili",
      zulu: "Zulu",
      amharic: "Amharic"
    };

    let savedLang = lang || localStorage.getItem("selectedLanguage") || "yoruba";
    let selectedCategory = categoryParam || localStorage.getItem("selectedCategory") || "all";
    let selectedStudyMode = modeParam || localStorage.getItem("selectedStudyMode") || "level";

    if (typeof getLanguageCategories === "function") {
      const validCategories = getLanguageCategories(savedLang);
      if (selectedCategory !== "all" && !validCategories.includes(selectedCategory)) {
        selectedCategory = "all";
      }
    }

    localStorage.setItem("selectedLanguage", savedLang);
    localStorage.setItem("selectedCategory", selectedCategory);
    localStorage.setItem("selectedStudyMode", selectedStudyMode);

    // const allFlashcardData =
    //   typeof flashcardData !== "undefined" ? flashcardData : (window.flashcardData || {});

    function getStoredUser() {
      try {
        const raw = localStorage.getItem("languageCompanionUser");
        if (!raw) return null;
        return normalizeUserRecord(JSON.parse(raw));
      } catch (error) {
        return null;
      }
    }

    function normalizeUserRecord(user) {
      if (!user) return null;

      return {
        id: user.id || null,
        name: user.name || "Language Partner",
        email: user.email || "learner@example.com",
        role: user.role || "user",
        goal: user.goal || "Daily conversation practice",
        joinedAt: user.joinedAt || user.created_at || new Date().toISOString()
      };
    }

    function saveStoredUser(user) {
      localStorage.setItem("languageCompanionUser", JSON.stringify(normalizeUserRecord(user)));
    }

    function getActiveUserId() {
      const user = getStoredUser();
      return user && user.id ? user.id : null;
    }

    if (localStorage.getItem("languageCompanionSession") !== "active") {
      window.location.href = `login.html?lang=${savedLang}`;
    }

    if (localStorage.getItem("languageCompanionSession") === "active" && !getActiveUserId()) {
      localStorage.removeItem("languageCompanionSession");
      localStorage.removeItem("languageCompanionUser");
      window.location.href = `login.html?lang=${savedLang}`;
    }

    function getDefaultUser() {
      return normalizeUserRecord({
        name: "Language Partner",
        email: "learner@example.com",
        goal: "Daily conversation practice",
        joinedAt: new Date().toISOString()
      });
    }

    function getActiveUser() {
      return getStoredUser() || getDefaultUser();
    }

    function formatCategoryName(category) {
      if (category === "all") return "All Categories";
      return category.charAt(0).toUpperCase() + category.slice(1);
    }

    function getInitials(name) {
      return (name || "LP")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join("");
    }

    function formatJoinDate(value) {
      if (!value) return "Today";

      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return "Today";

      return date.toLocaleDateString([], {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    }

    function getCurrentDeck() {
      if (typeof getDeckForLanguage === "function") {
        return getDeckForLanguage(savedLang, selectedCategory);
      }

      return allFlashcardData[savedLang] || [];
    }

    async function fetchBackendProfile(userId) {
      const response = await fetch(`${API_BASE_URL}/user/profile/${userId}`);
      const payload = await response.json();

      if (!response.ok) {
        const error = new Error(payload.error || "Failed to fetch backend profile.");
        error.status = response.status;
        throw error;
      }

      return payload.user;
    }

    async function fetchBackendProgress(userId) {
      const response = await fetch(`${API_BASE_URL}/progress/${userId}`);
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to fetch backend progress.");
      }

      return payload;
    }

    function getDeckEntryKeys(currentDeck) {
      return new Set(currentDeck.map(card => `${card.word}::${card.meaning}`));
    }

    function getBackendStudyStreak(sessions, language) {
      const relevantSessions = sessions
        .filter(session => session.language === language)
        .map(session => session.created_at.split("T")[0]);

      const uniqueDays = [...new Set(relevantSessions)].sort();

      if (!uniqueDays.length) {
        return 0;
      }

      let streak = 0;
      let cursor = new Date();
      cursor.setHours(0, 0, 0, 0);

      for (let i = uniqueDays.length - 1; i >= 0; i--) {
        const dayKey = cursor.toISOString().split("T")[0];

        if (uniqueDays[i] === dayKey) {
          streak += 1;
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }

        if (uniqueDays[i] > dayKey) {
          continue;
        }

        break;
      }

      return streak;
    }

    function getBackendDashboardStats(progressEntries, sessions, currentDeck) {
      const currentDeckKeys = getDeckEntryKeys(currentDeck);
      const filteredEntries = progressEntries.filter(entry =>
        entry.language === savedLang &&
        currentDeckKeys.has(`${entry.word}::${entry.meaning}`)
      );

      const totals = filteredEntries.reduce((acc, entry) => {
        acc.correct += entry.correct_count || 0;
        acc.wrong += entry.wrong_count || 0;
        return acc;
      }, { correct: 0, wrong: 0 });

      const totalAttempts = totals.correct + totals.wrong;
      const practicedCount = filteredEntries.length;
      const masteredCount = filteredEntries.filter(entry => entry.is_mastered === 1).length;
      const weakCount = filteredEntries.filter(entry =>
        (entry.wrong_count || 0) > 0 && entry.is_mastered !== 1
      ).length;
      const unseenCount = Math.max(currentDeck.length - practicedCount, 0);
      const accuracy = totalAttempts ? Math.round((totals.correct / totalAttempts) * 100) : 0;
      const levelInfo = typeof getPerformanceLevel === "function"
        ? getPerformanceLevel({
          practicedCount,
          totalDeckWords: currentDeck.length,
          accuracy,
          masteredCount,
          weakCount
        })
        : { name: "Starter", hint: "" };

      return {
        practicedCount,
        accuracy,
        masteredCount,
        weakCount,
        streak: getBackendStudyStreak(sessions, savedLang),
        totalAttempts,
        unseenCount,
        level: levelInfo.name,
        levelHint: levelInfo.hint
      };
    }

    function renderCategoryOptions() {
      const options = document.getElementById("categoryOptions");
      const categories = typeof getLanguageCategories === "function"
        ? ["all", ...getLanguageCategories(savedLang)]
        : ["all"];

      options.innerHTML = categories.map(category => `
        <button
          class="category-option${category === selectedCategory ? " active" : ""}"
          type="button"
          onclick="selectCategory('${category}')"
        >
          ${formatCategoryName(category)}
        </button>
      `).join("");

      document.getElementById("selectedCategoryNote").textContent =
        selectedCategory === "all"
          ? `Currently studying all categories in ${selectedStudyMode === "adaptive" ? "Adaptive" : "My Level"} mode.`
          : `Currently focused on ${formatCategoryName(selectedCategory)} words in ${selectedStudyMode === "adaptive" ? "Adaptive" : "My Level"} mode.`;
    }

    function renderStudyModeOptions() {
      const options = document.getElementById("studyModeOptions");
      const modes = [
        { id: "level", label: "My Level" },
        { id: "adaptive", label: "Adaptive" }
      ];

      options.innerHTML = modes.map(mode => `
        <button
          class="category-option${mode.id === selectedStudyMode ? " active" : ""}"
          type="button"
          onclick="selectStudyMode('${mode.id}')"
        >
          ${mode.label}
        </button>
      `).join("");
    }

    function renderProfile(stats, currentDeck, userOverride = null) {
      const user = normalizeUserRecord(userOverride || getActiveUser());

      document.getElementById("profileAvatar").textContent = getInitials(user.name);
      document.getElementById("profileName").textContent = user.name || "Language Partner";
      document.getElementById("profileEmail").textContent = user.email || "learner@example.com";
      document.getElementById("profileGoal").textContent = user.goal || "Daily conversation practice";
      document.getElementById("profileJoined").textContent = formatJoinDate(user.joinedAt);
      document.getElementById("dashboardUserQuick").textContent = `${user.name} - ${user.email}`;
      document.getElementById("profileLanguageChip").textContent = prettyLanguageNames[savedLang] || "Language";
      document.getElementById("profileLevelChip").textContent = stats.level;
      document.getElementById("profileStreakChip").textContent =
        `${stats.streak} ${stats.streak === 1 ? "day" : "days"} streak`;

      document.getElementById("wordsPracticedValue").textContent =
        `${stats.practicedCount} / ${currentDeck.length || 0}`;
      document.getElementById("accuracyValue").textContent = `${stats.accuracy}%`;
      document.getElementById("masteredValue").textContent = stats.masteredCount;
      document.getElementById("weakWordsValue").textContent = stats.weakCount;
    }

    async function renderDashboard() {
      const currentDeck = getCurrentDeck();
      let stats = getDashboardStats(savedLang, currentDeck.length);
      let activeUser = normalizeUserRecord(getActiveUser());
      const userId = getActiveUserId();

      renderProfile(stats, currentDeck, activeUser);

      if (userId) {
        try {
          const [backendUser, backendProgress] = await Promise.all([
            fetchBackendProfile(userId),
            fetchBackendProgress(userId)
          ]);

          activeUser = normalizeUserRecord({
            id: backendUser.id,
            name: backendUser.name,
            email: backendUser.email,
            role: backendUser.role || "user",
            goal: backendUser.goal || "Daily conversation practice",
            joinedAt: backendUser.created_at
          });
          saveStoredUser(activeUser);
          stats = getBackendDashboardStats(
            backendProgress.progress || [],
            backendProgress.sessions || [],
            currentDeck
          );
        } catch (error) {
          if (error.status === 404) {
            localStorage.removeItem("languageCompanionSession");
            localStorage.removeItem("languageCompanionUser");
            window.location.href = `login.html?lang=${savedLang}&forceAuth=1`;
            return;
          }
          console.warn("Dashboard backend sync failed, using local fallback.", error);
        }
      }

      const reviewLabel = stats.weakCount === 0
        ? "No weak words yet. Keep practicing to build a review list."
        : `${stats.weakCount} weak word${stats.weakCount === 1 ? "" : "s"} ready for review in ${formatCategoryName(selectedCategory)}.`;
      document.getElementById("reviewCardText").textContent = reviewLabel;

      document.getElementById("language-title").textContent =
        titles[savedLang] || "Learning Language";

      document.getElementById("dashboardSubtitle").textContent =
        `Focus on ${formatCategoryName(selectedCategory).toLowerCase()} in ${selectedStudyMode === "adaptive" ? "Adaptive" : "My Level"} mode and jump into the right practice card below.`;

      let summary = "Start a quiz or flashcard session to build your stats.";

      if (stats.totalAttempts > 0) {
        summary =
          `You are at ${stats.level} level with ${stats.accuracy}% accuracy. You have practiced ${stats.practicedCount} words, mastered ${stats.masteredCount}, and still have ${stats.weakCount} weak word${stats.weakCount === 1 ? "" : "s"} to revisit.`;

        if (stats.levelHint) {
          summary += ` ${stats.levelHint}`;
        }
      }

      document.getElementById("dashboardSummary").textContent = summary;
      renderProfile(stats, currentDeck, activeUser);
    }

    function selectCategory(category) {
      selectedCategory = category;
      localStorage.setItem("selectedCategory", category);
      renderCategoryOptions();
      updateActionLinks();
      renderDashboard();
    }
    window.selectCategory = selectCategory;

    function selectStudyMode(mode) {
      selectedStudyMode = mode;
      localStorage.setItem("selectedStudyMode", mode);
      renderStudyModeOptions();
      renderCategoryOptions();
      updateActionLinks();
      renderDashboard();
    }
    window.selectStudyMode = selectStudyMode;

    function buildStudyLink(path, extra = "") {
      const langValue = localStorage.getItem("selectedLanguage") || savedLang || "yoruba";
      const category = localStorage.getItem("selectedCategory") || selectedCategory || "all";
      const studyMode = localStorage.getItem("selectedStudyMode") || selectedStudyMode || "level";
      return `${path}?lang=${langValue}&category=${category}&studyMode=${studyMode}${extra}`;
    }

    function updateActionLinks() {
      const aiLink = document.getElementById("aiActionLink");
      const flashcardsLink = document.getElementById("flashcardsActionLink");
      const quizLink = document.getElementById("quizActionLink");
      const reviewLink = document.getElementById("reviewActionLink");

      if (aiLink) aiLink.href = buildStudyLink("ai-chat.html");
      if (flashcardsLink) flashcardsLink.href = buildStudyLink("flashcards.html");
      if (quizLink) quizLink.href = buildStudyLink("quiz.html");
      if (reviewLink) reviewLink.href = buildStudyLink("quiz.html", "&mode=review");
    }

    function goToFlashcards() {
      window.location.href = buildStudyLink("flashcards.html");
    }
    window.goToFlashcards = goToFlashcards;

    function goToQuiz() {
      window.location.href = buildStudyLink("quiz.html");
    }
    window.goToQuiz = goToQuiz;

    function goToReview() {
      window.location.href = buildStudyLink("quiz.html", "&mode=review");
    }
    window.goToReview = goToReview;

    function goToAiChat() {
      window.location.href = buildStudyLink("ai-chat.html");
    }
    window.goToAiChat = goToAiChat;

    renderCategoryOptions();
    renderStudyModeOptions();
    updateActionLinks();
    renderDashboard();
  
