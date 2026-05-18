
        let score = 0;

        const params = new URLSearchParams(window.location.search);
        let lang = params.get("lang") || localStorage.getItem("selectedLanguage") || "yoruba";
        const mode = params.get("mode");
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

        // Save selected language
        localStorage.setItem("selectedLanguage", lang);
        localStorage.setItem("selectedCategory", safeCategory);
        localStorage.setItem("selectedStudyMode", selectedStudyMode);

        // Base deck
        if (typeof getDashboardStats === "function" && typeof getDeckForLanguage === "function") {
            learnerLevel = (getDashboardStats(lang, getDeckForLanguage(lang).length).level || "Starter").toLowerCase();
        }

        const baseDeck = typeof getDeckForStudyMode === "function"
            ? getDeckForStudyMode(lang, learnerLevel, safeCategory, selectedStudyMode)
            : (typeof getDeckForStudyLevel === "function"
                ? getDeckForStudyLevel(lang, learnerLevel, safeCategory)
                : (typeof getDeckForLanguage === "function"
                    ? getDeckForLanguage(lang, safeCategory)
                    : (flashcardData[lang] || [])));
        let deck = baseDeck.length
            ? [...baseDeck]
            : (typeof getDeckForLanguage === "function" ? getDeckForLanguage(lang, safeCategory) : (flashcardData[lang] || []));

        if (!deck.length && typeof getDeckForLanguage === "function") {
            deck = getDeckForLanguage(lang, "all");
        }

        if (!deck.length && flashcardData["yoruba"]) {
            deck = [...flashcardData["yoruba"]];
            lang = "yoruba";
            localStorage.setItem("selectedLanguage", lang);
        }

        let currentQuestion = 0;
        let correctAnswer = "";

        // =========================
        // REVIEW MODE (FIXED)
        // =========================
        if (mode === "review") {

            document.getElementById("quizTitle").textContent = "Review Weak Words";

            const savedDifficult = getDifficultWords(lang);

            deck = savedDifficult.map(savedCard =>
                baseDeck.find(card =>
                    card.word === savedCard.word && card.meaning === savedCard.meaning
                ) || savedCard
            );

            if (deck.length === 0) {
                alert("No weak words to review yet.");
                window.location.href = `dashboard.html?lang=${lang}&category=${safeCategory}&studyMode=${selectedStudyMode}`;
                deck = [];
            }

        }

        // =========================
        // SHUFFLE
        // =========================
        function shuffle(array) {
            return array.sort(() => Math.random() - 0.5);
        }

        // =========================
        // LOAD QUESTION
        // =========================
        function loadQuestion() {

            if (!deck || deck.length === 0) return;

            const card = deck[currentQuestion];

            // Title (only if normal mode)
            if (mode !== "review") {
                document.getElementById("quizTitle").textContent =
                    lang.charAt(0).toUpperCase() + lang.slice(1) +
                    (safeCategory === "all"
                        ? ` ${learnerLevel.charAt(0).toUpperCase() + learnerLevel.slice(1)} ${selectedStudyMode === "adaptive" ? "Adaptive " : ""}Quiz`
                        : ` ${safeCategory.charAt(0).toUpperCase() + safeCategory.slice(1)} ${learnerLevel.charAt(0).toUpperCase() + learnerLevel.slice(1)} ${selectedStudyMode === "adaptive" ? "Adaptive " : ""}Quiz`);
            }

            // Progress text
            document.getElementById("progressText").textContent =
                `Question ${currentQuestion + 1} / ${deck.length}`;

            // Progress bar
            let progressPercent =
                ((currentQuestion + 1) / deck.length) * 100;

            document.getElementById("progressFill").style.width =
                progressPercent + "%";

            document.getElementById("quizWord").textContent = card.word;

            correctAnswer = card.meaning;

            const optionPool = [...new Set(baseDeck.map(item => item.meaning))]
                .filter(meaning => meaning !== correctAnswer);

            let options = [
                correctAnswer,
                ...shuffle([...optionPool]).slice(0, 3)
            ];

            options = shuffle(options);

            const buttons = document.querySelectorAll(".option-btn");

            buttons.forEach((btn, index) => {
                const option = options[index];

                btn.style.display = option ? "block" : "none";
                btn.textContent = option || "";
                btn.dataset.correct = option === correctAnswer;
                btn.disabled = false;
            });

            document.getElementById("feedback").textContent = "";
            document.getElementById("continueBtn").style.display = "none";
        }

        // =========================
        // SELECT ANSWER
        // =========================
    function selectAnswer(button) {

            const buttons = document.querySelectorAll(".option-btn");
            buttons.forEach(btn => btn.disabled = true);
            const currentCard = deck[currentQuestion];

            if (button.dataset.correct === "true") {

                score++;
                try {
                    const progress = recordCorrectAnswer(currentCard, lang);
                    syncAnswerToBackend(currentCard, lang, true, {
                        category: safeCategory,
                        studyMode: selectedStudyMode,
                        activityType: mode === "review" ? "review-quiz" : "quiz"
                    }).then(syncResult => {
                        if (!syncResult.synced && !syncResult.skipped) {
                            document.getElementById("feedback").textContent += " Progress saved locally only.";
                        }
                    });

                    if (progress.justMastered) {
                        document.getElementById("feedback").textContent =
                            "Correct! This word is mastered and removed from weak words.";
                    } else if (progress.wasWeak) {
                        document.getElementById("feedback").textContent =
                            `Correct! ${MASTERED_STREAK - progress.reviewStreak} more strong answer(s) to master this word.`;
                    } else {
                        document.getElementById("feedback").textContent = "Correct!";
                    }
                } catch (error) {
                    document.getElementById("feedback").textContent = "Correct!";
                }

            } else {

                try {
                    saveDifficultWord(currentCard, lang);
                    syncAnswerToBackend(currentCard, lang, false, {
                        category: safeCategory,
                        studyMode: selectedStudyMode,
                        activityType: mode === "review" ? "review-quiz" : "quiz"
                    }).then(syncResult => {
                        if (!syncResult.synced && !syncResult.skipped) {
                            document.getElementById("feedback").textContent += " Progress saved locally only.";
                        }
                    });
                } catch (error) {
                    // keep quiz flow moving even if tracking storage fails
                }

                document.getElementById("feedback").textContent =
                    "Wrong. Correct answer: " + correctAnswer;
            }

            document.getElementById("continueBtn").style.display = "block";
        }
        window.selectAnswer = selectAnswer;

        // =========================
        // NEXT QUESTION (FIXED)
        // =========================
        function nextQuestion() {

            currentQuestion++;

            // End logic
            if (currentQuestion >= deck.length) {

                // save score
                localStorage.setItem("lastQuizScore", score);
                localStorage.setItem("lastQuizTotal", deck.length);

                alert(`Lesson Complete\nScore: ${score} / ${deck.length}`);

                // reset
                currentQuestion = 0;
                score = 0;

                // reload normal deck after review
                if (mode === "review") {
                    window.location.href = `dashboard.html?lang=${lang}&category=${safeCategory}&studyMode=${selectedStudyMode}`;
                    return;
                }
            }

            loadQuestion();
        }
        window.nextQuestion = nextQuestion;

        // =========================
        // BACK BUTTON
        // =========================
        document.getElementById("backBtn").href =
            `dashboard.html?lang=${lang}&category=${safeCategory}&studyMode=${selectedStudyMode}`;

        // =========================
        // INIT
        // =========================
        loadQuestion();

    
