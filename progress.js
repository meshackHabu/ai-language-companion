const WORD_PROGRESS_KEY = "wordProgress";
const LEGACY_DIFFICULT_WORDS_KEY = "difficultWords";
const STUDY_ACTIVITY_KEY = "studyActivity";
const MASTERED_STREAK = 3;
const API_BASE_URL = "http://localhost:5500";

function parseStoredJSON(key, fallbackValue) {
    const rawValue = localStorage.getItem(key);

    if (!rawValue) {
        return fallbackValue;
    }

    try {
        const parsedValue = JSON.parse(rawValue);
        return parsedValue ?? fallbackValue;
    } catch (error) {
        localStorage.removeItem(key);
        return fallbackValue;
    }
}

function getWordKey(card, lang) {
    const safeLang = lang || card.lang || "unknown";
    return `${safeLang}::${card.word}::${card.meaning}`;
}

function getStoredWordProgress() {
    const parsed = parseStoredJSON(WORD_PROGRESS_KEY, {});
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
        ? parsed
        : {};
}

function saveStoredWordProgress(progress) {
    localStorage.setItem(WORD_PROGRESS_KEY, JSON.stringify(progress));
}

function findLanguageForCard(card) {
    if (card.lang) {
        return card.lang;
    }

    const allData =
        typeof flashcardData !== "undefined" ? flashcardData : (window.flashcardData || {});

    for (const [language, cards] of Object.entries(allData)) {
        const exists = cards.some(item =>
            item.word === card.word && item.meaning === card.meaning
        );

        if (exists) {
            return language;
        }
    }

    return "unknown";
}

function buildWordEntry(card, lang, existing = {}) {
    return {
        word: card.word,
        meaning: card.meaning,
        example: card.example || "",
        lang: lang,
        wrongCount: existing.wrongCount || 0,
        correctCount: existing.correctCount || 0,
        reviewStreak: existing.reviewStreak || 0,
        isWeak: existing.isWeak || false,
        lastResult: existing.lastResult || null,
        lastSeenAt: existing.lastSeenAt || null,
        masteredAt: existing.masteredAt || null
    };
}

function migrateLegacyDifficultWords() {
    const legacyWords = parseStoredJSON(LEGACY_DIFFICULT_WORDS_KEY, []);
    const safeLegacyWords = Array.isArray(legacyWords) ? legacyWords : [];

    if (!safeLegacyWords.length) {
        return;
    }

    const progress = getStoredWordProgress();

    safeLegacyWords.forEach(card => {
        if (!card || !card.word || !card.meaning) {
            return;
        }

        const lang = findLanguageForCard(card);
        const key = getWordKey(card, lang);
        const existing = progress[key];

        progress[key] = {
            ...buildWordEntry(card, lang, existing),
            wrongCount: Math.max((existing && existing.wrongCount) || 0, 1),
            isWeak: true,
            reviewStreak: 0,
            lastResult: "wrong",
            lastSeenAt: Date.now(),
            masteredAt: null
        };
    });

    saveStoredWordProgress(progress);
    localStorage.removeItem(LEGACY_DIFFICULT_WORDS_KEY);
}

function updateWordProgress(card, lang, isCorrect) {
    migrateLegacyDifficultWords();

    const resolvedLang = lang || findLanguageForCard(card);
    recordStudyActivity(resolvedLang);
    const progress = getStoredWordProgress();
    const key = getWordKey(card, resolvedLang);
    const entry = buildWordEntry(card, resolvedLang, progress[key]);
    const wasWeak = entry.isWeak;
    let justMastered = false;

    entry.lastSeenAt = Date.now();
    entry.lastResult = isCorrect ? "correct" : "wrong";

    if (isCorrect) {
        entry.correctCount += 1;
        entry.reviewStreak += 1;

        if (entry.isWeak && entry.reviewStreak >= MASTERED_STREAK) {
            entry.isWeak = false;
            entry.masteredAt = Date.now();
            justMastered = true;
        }
    } else {
        entry.wrongCount += 1;
        entry.reviewStreak = 0;
        entry.isWeak = true;
        entry.masteredAt = null;
    }

    progress[key] = entry;
    saveStoredWordProgress(progress);

    return {
        ...entry,
        wasWeak: wasWeak,
        justMastered: justMastered
    };
}

function saveDifficultWord(card, lang) {
    return updateWordProgress(card, lang, false);
}

function recordCorrectAnswer(card, lang) {
    return updateWordProgress(card, lang, true);
}

function getDifficultWords(lang) {
    migrateLegacyDifficultWords();

    return Object.values(getStoredWordProgress())
        .filter(entry => entry.isWeak && (!lang || entry.lang === lang))
        .sort((a, b) => {
            if (b.wrongCount !== a.wrongCount) {
                return b.wrongCount - a.wrongCount;
            }

            return (b.lastSeenAt || 0) - (a.lastSeenAt || 0);
        });
}

function clearDifficultWords(lang) {
    if (!lang) {
        localStorage.removeItem(WORD_PROGRESS_KEY);
        localStorage.removeItem(LEGACY_DIFFICULT_WORDS_KEY);
        return;
    }

    const progress = getStoredWordProgress();
    const filteredProgress = {};

    Object.entries(progress).forEach(([key, value]) => {
        if (value.lang !== lang) {
            filteredProgress[key] = value;
        }
    });

    saveStoredWordProgress(filteredProgress);
}

function getTodayActivityKey() {
    return new Date().toISOString().split("T")[0];
}

function getStoredStudyActivity() {
    const parsed = parseStoredJSON(STUDY_ACTIVITY_KEY, {});
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
        ? parsed
        : {};
}

function saveStoredStudyActivity(activity) {
    localStorage.setItem(STUDY_ACTIVITY_KEY, JSON.stringify(activity));
}

function getStoredUserProfile() {
    try {
        return JSON.parse(localStorage.getItem("languageCompanionUser")) || null;
    } catch (error) {
        return null;
    }
}

function getActiveUserId() {
    const user = getStoredUserProfile();
    return user && user.id ? user.id : null;
}

async function syncAnswerToBackend(card, lang, isCorrect, options = {}) {
    const userId = getActiveUserId();

    if (!userId) {
        return {
            synced: false,
            skipped: true,
            reason: "No backend user id found."
        };
    }

    try {
        const response = await fetch(`${API_BASE_URL}/progress/answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: userId,
                language: lang || findLanguageForCard(card),
                category: options.category || "all",
                studyMode: options.studyMode || "level",
                activityType: options.activityType || "quiz",
                word: card.word,
                meaning: card.meaning,
                wasCorrect: isCorrect
            })
        });

        const payload = await response.json();

        if (!response.ok) {
            return {
                synced: false,
                skipped: false,
                reason: payload.error || "Backend rejected progress save."
            };
        }

        return {
            synced: true,
            skipped: false,
            data: payload
        };
    } catch (error) {
        return {
            synced: false,
            skipped: false,
            reason: "Backend is unavailable."
        };
    }
}

function recordStudyActivity(lang, dateKey = getTodayActivityKey()) {
    const safeLang = lang || "unknown";
    const activity = getStoredStudyActivity();

    if (!activity[safeLang]) {
        activity[safeLang] = [];
    }

    if (!activity[safeLang].includes(dateKey)) {
        activity[safeLang].push(dateKey);
        activity[safeLang].sort();
    }

    saveStoredStudyActivity(activity);
}

function getLanguageWordEntries(lang) {
    migrateLegacyDifficultWords();

    return Object.values(getStoredWordProgress())
        .filter(entry => !lang || entry.lang === lang);
}

function getStudyStreak(lang) {
    const activity = getStoredStudyActivity();
    const days = (activity[lang] || []).slice().sort();

    if (!days.length) {
        return 0;
    }

    let streak = 0;
    let cursor = new Date();
    cursor.setHours(0, 0, 0, 0);

    for (let i = days.length - 1; i >= 0; i--) {
        const dayKey = cursor.toISOString().split("T")[0];

        if (days[i] === dayKey) {
            streak += 1;
            cursor.setDate(cursor.getDate() - 1);
            continue;
        }

        if (days[i] > dayKey) {
            continue;
        }

        break;
    }

    return streak;
}

function getDashboardStats(lang, totalDeckWords = 0) {
    const entries = getLanguageWordEntries(lang);
    const totals = entries.reduce((acc, entry) => {
        acc.correct += entry.correctCount;
        acc.wrong += entry.wrongCount;
        return acc;
    }, { correct: 0, wrong: 0 });
    const attempts = totals.correct + totals.wrong;
    const masteredCount = entries.filter(entry => entry.masteredAt).length;
    const weakCount = entries.filter(entry => entry.isWeak).length;
    const practicedCount = entries.length;
    const unseenCount = Math.max(totalDeckWords - practicedCount, 0);
    const accuracy = attempts ? Math.round((totals.correct / attempts) * 100) : 0;
    const level = getPerformanceLevel({
        practicedCount: practicedCount,
        totalDeckWords: totalDeckWords,
        accuracy: accuracy,
        masteredCount: masteredCount,
        weakCount: weakCount
    });

    return {
        practicedCount: practicedCount,
        accuracy: accuracy,
        masteredCount: masteredCount,
        weakCount: weakCount,
        streak: getStudyStreak(lang),
        totalAttempts: attempts,
        unseenCount: unseenCount,
        level: level.name,
        levelHint: level.hint
    };
}

function getPerformanceLevel(stats) {
     const coverage = stats.totalDeckWords
         ? stats.practicedCount / stats.totalDeckWords
         : 0;
 
     if (stats.masteredCount >= 10 && stats.accuracy >= 85 && stats.weakCount <= 2) {
         return {
             name: "Mastering",
             hint: "You are retaining most words well. Keep reviewing weak words to stay sharp."
         };
     }
 
     if (stats.masteredCount >= 5 && stats.accuracy >= 75 && coverage >= 0.6) {
         return {
             name: "Confident",
             hint: "You have a strong base. Push a few more words into mastery."
         };
     }
 
     if (stats.practicedCount >= 5 && stats.accuracy >= 60) {
         return {
             name: "Building",
             hint: "You are gaining momentum. Keep practicing to turn familiar words into mastered ones."
         };
     }
 
     return {
         name: "Starter",
         hint: "You are laying the foundation. A few more sessions will grow your level quickly."
     };
 }

const GRAMMAR_ERRORS_KEY = "grammarErrors";

function getStoredGrammarErrors() {
     const parsed = parseStoredJSON(GRAMMAR_ERRORS_KEY, {});
     return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
         ? parsed
         : {};
 }

function saveStoredGrammarErrors(errors) {
     localStorage.setItem(GRAMMAR_ERRORS_KEY, JSON.stringify(errors));
 }

function logGrammarErrors(corrections, lang = "unknown") {
     if (!Array.isArray(corrections) || corrections.length === 0) {
         return { logged: false, count: 0 };
     }

     const errors = getStoredGrammarErrors();
     const safeLang = lang || "unknown";

     if (!errors[safeLang]) {
         errors[safeLang] = {
             totalMistakes: 0,
             categories: {},
             lastErrors: [],
             timestamps: []
         };
     }

     const langErrors = errors[safeLang];
     let categoriesFound = new Set();

     corrections.forEach((correction) => {
         if (!correction || typeof correction !== "object") {
             return;
         }

         const category = identifyErrorCategory(correction);
         categoriesFound.add(category);

         if (!langErrors.categories[category]) {
             langErrors.categories[category] = 0;
         }
         langErrors.categories[category] += 1;
         langErrors.totalMistakes += 1;

         langErrors.lastErrors.push({
             original: correction.original || "",
             corrected: correction.corrected || "",
             category: category,
             timestamp: Date.now()
         });

         if (langErrors.lastErrors.length > 50) {
             langErrors.lastErrors = langErrors.lastErrors.slice(-50);
         }
     });

     langErrors.timestamps.push(Date.now());
     if (langErrors.timestamps.length > 100) {
         langErrors.timestamps = langErrors.timestamps.slice(-100);
     }

     errors[safeLang] = langErrors;
     saveStoredGrammarErrors(errors);

     return {
         logged: true,
         count: corrections.length,
         categories: Array.from(categoriesFound)
     };
 }

function identifyErrorCategory(correction) {
     if (!correction || typeof correction !== "object") {
         return "unknown";
     }

     const explanation = (correction.explanation || "").toLowerCase();
     const original = (correction.original || "").toLowerCase();
     const corrected = (correction.corrected || "").toLowerCase();

     if (explanation.includes("tense") || explanation.includes("verb") || explanation.includes("auxiliary")) {
         return "tense";
     }
     if (explanation.includes("agreement") || explanation.includes("subject") || explanation.includes("plural")) {
         return "agreement";
     }
     if (explanation.includes("spelling") || explanation.includes("spell")) {
         return "spelling";
     }
     if (explanation.includes("capital") || explanation.includes("punctuation")) {
         return "punctuation";
     }
     if (explanation.includes("word") || explanation.includes("vocabulary") || explanation.includes("choice")) {
         return "vocabulary";
     }
     if (explanation.includes("article") || explanation.includes("preposition")) {
         return "articles_prepositions";
     }
     if (explanation.includes("grammar") || explanation.includes("structure")) {
         return "grammar";
     }

     return "other";
 }

function getGrammarStatistics(lang) {
     const errors = getStoredGrammarErrors();
     const langErrors = errors[lang];

     if (!langErrors) {
         return {
             totalMistakes: 0,
             categories: {},
             recentErrors: [],
             streak: 0
         };
     }

     return {
         totalMistakes: langErrors.totalMistakes,
         categories: { ...langErrors.categories },
         recentErrors: langErrors.lastErrors.slice(-10),
         streak: calculateErrorStreak(langErrors.timestamps)
     };
 }

function calculateErrorStreak(timestamps) {
     if (!Array.isArray(timestamps) || timestamps.length === 0) {
         return 0;
     }

     const now = Date.now();
     const oneDay = 24 * 60 * 60 * 1000;
     let streak = 0;
     let currentDate = new Date();
     currentDate.setHours(0, 0, 0, 0);

     const sortedTimestamps = timestamps.slice().sort((a, b) => b - a);

     for (const ts of sortedTimestamps) {
         const tsDate = new Date(ts);
         tsDate.setHours(0, 0, 0, 0);

         if (tsDate.getTime() === currentDate.getTime()) {
             streak += 1;
             currentDate.setDate(currentDate.getDate() - 1);
         } else if (tsDate.getTime() > currentDate.getTime()) {
             continue;
         } else {
             break;
         }
     }

     return streak;
 }

function clearGrammarErrors(lang) {
     if (!lang) {
         localStorage.removeItem(GRAMMAR_ERRORS_KEY);
         return;
     }

     const errors = getStoredGrammarErrors();
     delete errors[lang];
     saveStoredGrammarErrors(errors);
 }
