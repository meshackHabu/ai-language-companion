const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..", "..");
const OUTPUT_DATA_JS = path.join(ROOT_DIR, "data.js");
const OUTPUT_JSON = path.join(__dirname, "..", "data", "external-tatoeba-seed.json");
const DATASET_VERSION = `tatoeba-${new Date().toISOString().slice(0, 10)}`;

const LANGUAGE_MAP = {
    yoruba: "yor",
    hausa: "hau",
    igbo: "ibo",
    french: "fra",
    swahili: "swh",
    zulu: "zul",
    amharic: "amh"
};

const CATEGORY_RULES = [
    {
        name: "greetings",
        regex: /\b(hello|good morning|good afternoon|good evening|how are you|my name|nice to meet)\b/i
    },
    {
        name: "market",
        regex: /\b(price|buy|sell|market|shop|money|cost|cheap|expensive)\b/i
    },
    {
        name: "transport",
        regex: /\b(bus|taxi|car|road|station|stop here|where is|go to|trip)\b/i
    },
    {
        name: "health",
        regex: /\b(hospital|clinic|doctor|medicine|pain|sick|ambulance|head)\b/i
    }
];

function toLevel(englishText) {
    const words = String(englishText || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    if (words <= 4) return "starter";
    if (words <= 7) return "building";
    if (words <= 11) return "confident";
    return "mastering";
}

function cleanText(text) {
    return String(text || "")
        .replace(/\s+/g, " ")
        .trim();
}

function pickCategory(englishText) {
    for (const rule of CATEGORY_RULES) {
        if (rule.regex.test(englishText)) {
            return rule.name;
        }
    }

    return "ai_chat";
}

function flattenTranslations(node) {
    if (!node) return [];
    if (Array.isArray(node)) {
        return node.flatMap(flattenTranslations);
    }
    if (typeof node !== "object") return [];

    const items = [node];
    if (Array.isArray(node.translations)) {
        items.push(...node.translations.flatMap(flattenTranslations));
    }
    return items;
}

function toCardFromSentence(sentence) {
    const source = cleanText(sentence.text);
    const translations = flattenTranslations(sentence.translations);
    const english = translations.find(item => item.lang === "eng" && item.text);

    if (!source || !english || !english.text) {
        return null;
    }

    const meaning = cleanText(english.text);
    if (!meaning) {
        return null;
    }

    return {
        word: source,
        meaning: meaning,
        example: `${source} -> ${meaning}`,
        level: toLevel(meaning),
        category: pickCategory(meaning)
    };
}

async function fetchPage(langCode, after) {
    const params = new URLSearchParams();
    params.set("lang", langCode);
    params.set("limit", "100");
    params.set("sort", "created");
    params.set("trans:lang", "eng");
    if (after) params.set("after", String(after));

    const url = `https://api.tatoeba.org/v1/sentences?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        let bodyText = "";
        try {
            bodyText = await response.text();
        } catch (error) {
            bodyText = "";
        }
        throw new Error(
            `Tatoeba request failed (${response.status}) for ${langCode}. ${bodyText}`.trim()
        );
    }

    return response.json();
}

async function fetchCardsForLanguage(langCode, targetCount = 120) {
    const cards = [];
    const seen = new Set();
    let after = null;
    let safety = 0;

    while (cards.length < targetCount && safety < 50) {
        safety += 1;
        const payload = await fetchPage(langCode, after);
        const rows = Array.isArray(payload.data) ? payload.data : [];

        if (!rows.length) break;

        for (const sentence of rows) {
            if (sentence.is_orphan || sentence.is_unapproved) {
                continue;
            }

            const card = toCardFromSentence(sentence);
            if (!card) continue;

            const key = `${card.word}::${card.meaning}`;
            if (seen.has(key)) continue;
            seen.add(key);
            cards.push(card);

            if (cards.length >= targetCount) {
                break;
            }
        }

        const nextAfter = payload && payload.paging && payload.paging.after;
        if (!nextAfter || nextAfter === after) {
            break;
        }

        after = nextAfter;
    }

    return cards;
}

function buildLibrary(rawCardsByLanguage) {
    const library = {};

    for (const [language, cards] of Object.entries(rawCardsByLanguage)) {
        const grouped = {
            greetings: [],
            market: [],
            transport: [],
            health: [],
            ai_chat: []
        };

        for (const card of cards) {
            grouped[card.category].push({
                word: card.word,
                meaning: card.meaning,
                example: card.example,
                level: card.level
            });
        }

        library[language] = grouped;
    }

    return library;
}

function createFrontendDataFile(library) {
    return `const STUDY_LEVELS = ["starter", "building", "confident", "mastering"];

function createCard(word, meaning, example, level = "starter") {
    return { word, meaning, example, level };
}

const DATASET_VERSION = ${JSON.stringify(DATASET_VERSION)};
const DATASET_SOURCE = "tatoeba";

const flashcardLibrary = ${JSON.stringify(library, null, 4)};

function getLanguageCategories(lang) {
    return Object.keys(flashcardLibrary[lang] || {});
}

function getLevelRank(level) {
    const rank = STUDY_LEVELS.indexOf((level || "").toLowerCase());
    return rank === -1 ? 0 : rank;
}

function getDeckForLanguage(lang, category = "all") {
    const categories = flashcardLibrary[lang] || {};

    if (category !== "all" && categories[category]) {
        return [...categories[category]].map(item =>
            createCard(item.word, item.meaning, item.example, item.level)
        );
    }

    return Object.values(categories).flat().map(item =>
        createCard(item.word, item.meaning, item.example, item.level)
    );
}

function getDeckForStudyLevel(lang, studyLevel = "starter", category = "all") {
    const sourceDeck = getDeckForLanguage(lang, category);
    const targetRank = getLevelRank(studyLevel);
    let deck = sourceDeck.filter(card => getLevelRank(card.level) === targetRank);

    for (let rank = targetRank - 1; deck.length < 6 && rank >= 0; rank--) {
        deck = deck.concat(sourceDeck.filter(card => getLevelRank(card.level) === rank));
    }

    if (deck.length < 6) {
        for (let rank = targetRank + 1; deck.length < 6 && rank < STUDY_LEVELS.length; rank++) {
            deck = deck.concat(sourceDeck.filter(card => getLevelRank(card.level) === rank));
        }
    }

    return deck;
}

function uniqueDeck(cards) {
    const seen = new Set();
    return cards.filter(card => {
        const key = \`\${card.word}::\${card.meaning}\`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function getDeckForAdaptiveStudy(lang, studyLevel = "starter", category = "all") {
    const sourceDeck = getDeckForLanguage(lang, category);
    const targetRank = getLevelRank(studyLevel);

    const sameLevel = sourceDeck.filter(card => getLevelRank(card.level) === targetRank);
    const easierLevel = sourceDeck.filter(card => getLevelRank(card.level) === Math.max(targetRank - 1, 0));
    const harderLevel = sourceDeck.filter(card => getLevelRank(card.level) === Math.min(targetRank + 1, STUDY_LEVELS.length - 1));

    let deck = uniqueDeck([
        ...sameLevel,
        ...easierLevel.slice(0, 3),
        ...harderLevel.slice(0, 3)
    ]);

    if (deck.length < 6) {
        deck = uniqueDeck([...deck, ...easierLevel, ...harderLevel, ...sourceDeck]);
    }

    return deck;
}

function getDeckForStudyMode(lang, studyLevel = "starter", category = "all", studyMode = "level") {
    if (studyMode === "adaptive") {
        return getDeckForAdaptiveStudy(lang, studyLevel, category);
    }
    return getDeckForStudyLevel(lang, studyLevel, category);
}

const flashcardData = Object.fromEntries(
    Object.keys(flashcardLibrary).map(lang => [lang, getDeckForLanguage(lang)])
);

window.DATASET_VERSION = DATASET_VERSION;
window.DATASET_SOURCE = DATASET_SOURCE;
`;
}

async function run() {
    console.log("Pulling external dataset from Tatoeba API...");
    const rawCardsByLanguage = {};

    for (const [language, code] of Object.entries(LANGUAGE_MAP)) {
        console.log(`- ${language} (${code})`);
        rawCardsByLanguage[language] = await fetchCardsForLanguage(code, 120);
    }

    const flashcardLibrary = buildLibrary(rawCardsByLanguage);

    fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
    fs.writeFileSync(
        OUTPUT_JSON,
        JSON.stringify(
            {
                version: DATASET_VERSION,
                source: "tatoeba",
                license: "CC-BY 2.0 FR / CC0 (depends on sentence)",
                generatedAt: new Date().toISOString(),
                languages: rawCardsByLanguage
            },
            null,
            2
        ),
        "utf8"
    );

    const fileContent = createFrontendDataFile(flashcardLibrary);
    fs.writeFileSync(OUTPUT_DATA_JS, fileContent, "utf8");

    console.log(`Done. Wrote dataset JSON: ${OUTPUT_JSON}`);
    console.log(`Done. Updated frontend dataset file: ${OUTPUT_DATA_JS}`);
}

run().catch(error => {
    console.error("Import failed:", error.message);
    process.exit(1);
});
