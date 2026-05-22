const STUDY_LEVELS = ["starter", "building", "confident", "mastering"];

function createCard(word, meaning, example, level = "starter") {
    return { word, meaning, example, level };
}

const DATASET_VERSION = "tatoeba-2026-05-14";
const DATASET_SOURCE = "tatoeba";

const flashcardLibrary = {
    "yoruba": {
        "greetings": [
            {
                "word": "Ẹ káàárọ̀!",
                "meaning": "Good morning!",
                "example": "Ẹ káàárọ̀! -> Good morning!",
                "level": "starter"
            },
            {
                "word": "Orúkọ mi ni Jack.",
                "meaning": "My name is Jack.",
                "example": "Orúkọ mi ni Jack. -> My name is Jack.",
                "level": "starter"
            },
            {
                "word": "Káǎrọ̀.",
                "meaning": "Good morning!",
                "example": "Káǎrọ̀. -> Good morning!",
                "level": "starter"
            },
            {
                "word": "Ẹ káǎrọ̀.",
                "meaning": "Good morning!",
                "example": "Ẹ káǎrọ̀. -> Good morning!",
                "level": "starter"
            },
            {
                "word": "Jack lorúkọ mi.",
                "meaning": "My name is Jack.",
                "example": "Jack lorúkọ mi. -> My name is Jack.",
                "level": "starter"
            },
            {
                "word": "Bawo ni?",
                "meaning": "How are you?",
                "example": "Bawo ni? -> How are you?",
                "level": "starter"
            }
        ],
        "market": [
            {
                "word": "Mo lọ s'ọ́jà.",
                "meaning": "I went to the market.",
                "example": "Mo lọ s'ọ́jà. -> I went to the market.",
                "level": "building"
            },
            {
                "word": "Ṣé o lọ sọjà ni àna?",
                "meaning": "Did you go to the market yesterday?",
                "example": "Ṣé o lọ sọjà ni àna? -> Did you go to the market yesterday?",
                "level": "building"
            },
            {
                "word": "Mo fẹ́ rà ìwé.",
                "meaning": "I want to buy a book.",
                "example": "Mo fẹ́ rà ìwé. -> I want to buy a book.",
                "level": "building"
            }
        ],
        "transport": [
            {
                "word": "Mo nlọ s'étí òkun.",
                "meaning": "I will go to the beach.",
                "example": "Mo nlọ s'étí òkun. -> I will go to the beach.",
                "level": "building"
            },
            {
                "word": "Mi ò fẹ́ lọ sí ilé-ẹ́kọ́.",
                "meaning": "I don't want to go to school.",
                "example": "Mi ò fẹ́ lọ sí ilé-ẹ́kọ́. -> I don't want to go to school.",
                "level": "building"
            }
        ],
        "health": [],
        "ai_chat": [
            {
                "word": "Ilé wà dáadáa.",
                "meaning": "The house is pretty.",
                "example": "Ilé wà dáadáa. -> The house is pretty.",
                "level": "starter"
            },
            {
                "word": "Mo ní ọmọ mẹ́ta.",
                "meaning": "I have three sons.",
                "example": "Mo ní ọmọ mẹ́ta. -> I have three sons.",
                "level": "starter"
            },
            {
                "word": "Ọmọ wa ni.",
                "meaning": "He's our son.",
                "example": "Ọmọ wa ni. -> He's our son.",
                "level": "starter"
            },
            {
                "word": "N kò mọ̀ èdè Yorùbá.",
                "meaning": "I don't know Yoruba.",
                "example": "N kò mọ̀ èdè Yorùbá. -> I don't know Yoruba.",
                "level": "starter"
            },
            {
                "word": "N kò gbọ́ èdè Gẹ̀ẹ́sì.",
                "meaning": "I don't speak English.",
                "example": "N kò gbọ́ èdè Gẹ̀ẹ́sì. -> I don't speak English.",
                "level": "starter"
            },
            {
                "word": "Kẹ̀kẹ́ mi ni.",
                "meaning": "This is my bicycle.",
                "example": "Kẹ̀kẹ́ mi ni. -> This is my bicycle.",
                "level": "starter"
            },
            {
                "word": "Mo ń kọ́ èdè Yorùbá.",
                "meaning": "I'm learning Yoruba.",
                "example": "Mo ń kọ́ èdè Yorùbá. -> I'm learning Yoruba.",
                "level": "starter"
            },
            {
                "word": "Ó jẹ́ ọmọ ilẹ̀ Potogí.",
                "meaning": "He is Portuguese.",
                "example": "Ó jẹ́ ọmọ ilẹ̀ Potogí. -> He is Portuguese.",
                "level": "starter"
            },
            {
                "word": "Ta l'ó ńmu ọtí bíà?",
                "meaning": "Who's drinking beer?",
                "example": "Ta l'ó ńmu ọtí bíà? -> Who's drinking beer?",
                "level": "starter"
            },
            {
                "word": "Ó dáhùn ìbéèré náà.",
                "meaning": "He answered the question.",
                "example": "Ó dáhùn ìbéèré náà. -> He answered the question.",
                "level": "starter"
            },
            {
                "word": "Ó jẹun.",
                "meaning": "He is eating.",
                "example": "Ó jẹun. -> He is eating.",
                "level": "starter"
            },
            {
                "word": "Mo fẹ́ ṣòkòtò.",
                "meaning": "I want trousers.",
                "example": "Mo fẹ́ ṣòkòtò. -> I want trousers.",
                "level": "starter"
            },
            {
                "word": "Mo rà fìlà.",
                "meaning": "I bought a hat.",
                "example": "Mo rà fìlà. -> I bought a hat.",
                "level": "starter"
            },
            {
                "word": "Kí ló dé?",
                "meaning": "What happened?",
                "example": "Kí ló dé? -> What happened?",
                "level": "starter"
            },
            {
                "word": "Ó wá láti Èkó.",
                "meaning": "He came from Lagos.",
                "example": "Ó wá láti Èkó. -> He came from Lagos.",
                "level": "starter"
            },
            {
                "word": "Ó fẹ́ lọ.",
                "meaning": "He wants to go.",
                "example": "Ó fẹ́ lọ. -> He wants to go.",
                "level": "starter"
            },
            {
                "word": "Ìwọ ta ni?",
                "meaning": "Who is it?",
                "example": "Ìwọ ta ni? -> Who is it?",
                "level": "starter"
            },
            {
                "word": "Kí l'o fẹ́?",
                "meaning": "What do you want?",
                "example": "Kí l'o fẹ́? -> What do you want?",
                "level": "starter"
            },
            {
                "word": "Ẹ ṣé!",
                "meaning": "Thank you!",
                "example": "Ẹ ṣé! -> Thank you!",
                "level": "starter"
            },
            {
                "word": "Ẹ rọra.",
                "meaning": "Take care of yourself.",
                "example": "Ẹ rọra. -> Take care of yourself.",
                "level": "starter"
            },
            {
                "word": "Kaabo padà sí ilé",
                "meaning": "Welcome back home.",
                "example": "Kaabo padà sí ilé -> Welcome back home.",
                "level": "starter"
            },
            {
                "word": "Tom ko fó nkan kan",
                "meaning": "Tom didn't break anything.",
                "example": "Tom ko fó nkan kan -> Tom didn't break anything.",
                "level": "starter"
            },
            {
                "word": "kò sí wahála.",
                "meaning": "There's no problem.",
                "example": "kò sí wahála. -> There's no problem.",
                "level": "starter"
            },
            {
                "word": "A fẹ́ àwọn ọ̀rọ̀ ní gbólóhùn pípé.",
                "meaning": "We want complete sentences.",
                "example": "A fẹ́ àwọn ọ̀rọ̀ ní gbólóhùn pípé. -> We want complete sentences.",
                "level": "starter"
            },
            {
                "word": "Omi ni ayé.",
                "meaning": "Water is life.",
                "example": "Omi ni ayé. -> Water is life.",
                "level": "starter"
            },
            {
                "word": "Gidi gan?",
                "meaning": "Really?",
                "example": "Gidi gan? -> Really?",
                "level": "starter"
            },
            {
                "word": "Mo lọ sí odò.",
                "meaning": "I went to the river.",
                "example": "Mo lọ sí odò. -> I went to the river.",
                "level": "building"
            },
            {
                "word": "Bẹ́ẹ̀ni.",
                "meaning": "Yes.",
                "example": "Bẹ́ẹ̀ni. -> Yes.",
                "level": "starter"
            },
            {
                "word": "Burj Khalifa je agbar tó ga ju ni gbògbó ayè.",
                "meaning": "Burj Khalifa is currently the tallest skyscraper in the world.",
                "example": "Burj Khalifa je agbar tó ga ju ni gbògbó ayè. -> Burj Khalifa is currently the tallest skyscraper in the world.",
                "level": "confident"
            },
            {
                "word": "Mo nifẹẹ rẹ.",
                "meaning": "I love you.",
                "example": "Mo nifẹẹ rẹ. -> I love you.",
                "level": "starter"
            },
            {
                "word": "Mo ní àwọn arákunrin.",
                "meaning": "I have brothers.",
                "example": "Mo ní àwọn arákunrin. -> I have brothers.",
                "level": "starter"
            },
            {
                "word": "Àwọn erékùṣù wà ní òkun.",
                "meaning": "There are islands in the sea.",
                "example": "Àwọn erékùṣù wà ní òkun. -> There are islands in the sea.",
                "level": "building"
            },
            {
                "word": "Ta ni Emily?",
                "meaning": "Who's Emily?",
                "example": "Ta ni Emily? -> Who's Emily?",
                "level": "starter"
            },
            {
                "word": "Ẹni tó bá ńjẹ nínú ọlà ẹnìkan nií pèé ní anímáṣaun.",
                "meaning": "It's one who shares in another's wealth that hails him as a generous person.",
                "example": "Ẹni tó bá ńjẹ nínú ọlà ẹnìkan nií pèé ní anímáṣaun. -> It's one who shares in another's wealth that hails him as a generous person.",
                "level": "mastering"
            },
            {
                "word": "Ẹ̀gbẹ́ táa máa fi sùn lálẹ́, kò yẹ ká fi gbọgbẹ́ lọ́ọ̀sán.",
                "meaning": "One shouldn't injure during the day, the body side on which one will lie at night.",
                "example": "Ẹ̀gbẹ́ táa máa fi sùn lálẹ́, kò yẹ ká fi gbọgbẹ́ lọ́ọ̀sán. -> One shouldn't injure during the day, the body side on which one will lie at night.",
                "level": "mastering"
            },
            {
                "word": "Ìwé kìí ṣe titun.",
                "meaning": "The book isn't new.",
                "example": "Ìwé kìí ṣe titun. -> The book isn't new.",
                "level": "starter"
            },
            {
                "word": "Agogo mejila ọsan.",
                "meaning": "It is midday.",
                "example": "Agogo mejila ọsan. -> It is midday.",
                "level": "starter"
            },
            {
                "word": "Ó yà mí l'ẹ́nu.",
                "meaning": "It surprises me.",
                "example": "Ó yà mí l'ẹ́nu. -> It surprises me.",
                "level": "starter"
            }
        ]
    },
    "hausa": {
        "greetings": [],
        "market": [
            {
                "word": "Ba su sayar ƴaƴan itatuwa ba.",
                "meaning": "They don't sell fruits.",
                "example": "Ba su sayar ƴaƴan itatuwa ba. -> They don't sell fruits.",
                "level": "starter"
            },
            {
                "word": "Ina da kuɗi kaɗan.",
                "meaning": "I have little money.",
                "example": "Ina da kuɗi kaɗan. -> I have little money.",
                "level": "starter"
            },
            {
                "word": "Shin zan sayi motar baƙar fata ko motar shuɗi?",
                "meaning": "Should I buy a black car or a blue car?",
                "example": "Shin zan sayi motar baƙar fata ko motar shuɗi? -> Should I buy a black car or a blue car?",
                "level": "confident"
            }
        ],
        "transport": [],
        "health": [
            {
                "word": "Ni ba likita ba ne.",
                "meaning": "I'm not a doctor.",
                "example": "Ni ba likita ba ne. -> I'm not a doctor.",
                "level": "starter"
            }
        ],
        "ai_chat": [
            {
                "word": "Za ka iya rage min farashin?",
                "meaning": "Can you give me a discount?",
                "example": "Za ka iya rage min farashin? -> Can you give me a discount?",
                "level": "building"
            },
            {
                "word": "Zan biya da kuɗi.",
                "meaning": "I will pay in cash.",
                "example": "Zan biya da kuɗi. -> I will pay in cash.",
                "level": "building"
            },
            {
                "word": "Na yi kuskure.",
                "meaning": "I made a mistake.",
                "example": "Na yi kuskure. -> I made a mistake.",
                "level": "starter"
            },
            {
                "word": "Ki sake kira na.",
                "meaning": "Call me back.",
                "example": "Ki sake kira na. -> Call me back.",
                "level": "starter"
            },
            {
                "word": "Kina yin amfani da Facebook?",
                "meaning": "Do you use Facebook?",
                "example": "Kina yin amfani da Facebook? -> Do you use Facebook?",
                "level": "starter"
            },
            {
                "word": "Don Allah ka taimake ni!",
                "meaning": "Please help me.",
                "example": "Don Allah ka taimake ni! -> Please help me.",
                "level": "starter"
            },
            {
                "word": "Ta zo nan da kanta.",
                "meaning": "She came here by herself.",
                "example": "Ta zo nan da kanta. -> She came here by herself.",
                "level": "building"
            },
            {
                "word": "Kin zo nan da kanki?",
                "meaning": "Did you come here by yourself?",
                "example": "Kin zo nan da kanki? -> Did you come here by yourself?",
                "level": "building"
            },
            {
                "word": "Na zo nan da kaina.",
                "meaning": "I came here by myself.",
                "example": "Na zo nan da kaina. -> I came here by myself.",
                "level": "building"
            },
            {
                "word": "Tom ya rubuta gajeren labari.",
                "meaning": "Tom wrote a short story.",
                "example": "Tom ya rubuta gajeren labari. -> Tom wrote a short story.",
                "level": "building"
            },
            {
                "word": "Na gama.",
                "meaning": "I'm done.",
                "example": "Na gama. -> I'm done.",
                "level": "starter"
            },
            {
                "word": "Aiki yana tafiya sosai.",
                "meaning": "Work is going well.",
                "example": "Aiki yana tafiya sosai. -> Work is going well.",
                "level": "starter"
            },
            {
                "word": "Yaya aiki?",
                "meaning": "How is work?",
                "example": "Yaya aiki? -> How is work?",
                "level": "starter"
            },
            {
                "word": "Wannan ya isa.",
                "meaning": "This is enough!",
                "example": "Wannan ya isa. -> This is enough!",
                "level": "starter"
            },
            {
                "word": "Kana buƙatan wani abu ɗaban?",
                "meaning": "Need anything else?",
                "example": "Kana buƙatan wani abu ɗaban? -> Need anything else?",
                "level": "starter"
            },
            {
                "word": "Zan iya ganin jerin abincin sayarwar?",
                "meaning": "Can I see the menu?",
                "example": "Zan iya ganin jerin abincin sayarwar? -> Can I see the menu?",
                "level": "building"
            },
            {
                "word": "Sai me?",
                "meaning": "Anything else?",
                "example": "Sai me? -> Anything else?",
                "level": "starter"
            },
            {
                "word": "Shayinmu ya kare.",
                "meaning": "We're out of tea.",
                "example": "Shayinmu ya kare. -> We're out of tea.",
                "level": "starter"
            },
            {
                "word": "Ina son shayi da lemon tsami.",
                "meaning": "I would like tea with lemon.",
                "example": "Ina son shayi da lemon tsami. -> I would like tea with lemon.",
                "level": "building"
            },
            {
                "word": "Wuyana ya sankare.",
                "meaning": "My neck is stiff.",
                "example": "Wuyana ya sankare. -> My neck is stiff.",
                "level": "starter"
            },
            {
                "word": "Bana iya ganin komai.",
                "meaning": "I can't see anything.",
                "example": "Bana iya ganin komai. -> I can't see anything.",
                "level": "starter"
            },
            {
                "word": "Kana iya ganin wani abu?",
                "meaning": "Can you see anything?",
                "example": "Kana iya ganin wani abu? -> Can you see anything?",
                "level": "starter"
            },
            {
                "word": "Me ya sa kake gardama da shi?",
                "meaning": "Why do you argue with him?",
                "example": "Me ya sa kake gardama da shi? -> Why do you argue with him?",
                "level": "building"
            },
            {
                "word": "Wani littafi ka fi so?",
                "meaning": "What is your favorite book?",
                "example": "Wani littafi ka fi so? -> What is your favorite book?",
                "level": "building"
            },
            {
                "word": "Allah yana amince da dukan addinai kuwa?",
                "meaning": "Does God accept all forms of worship?",
                "example": "Allah yana amince da dukan addinai kuwa? -> Does God accept all forms of worship?",
                "level": "building"
            },
            {
                "word": "Ni ɗalibi ce.",
                "meaning": "I am a student.",
                "example": "Ni ɗalibi ce. -> I am a student.",
                "level": "starter"
            },
            {
                "word": "Ni ɗalibi ne.",
                "meaning": "I am a student.",
                "example": "Ni ɗalibi ne. -> I am a student.",
                "level": "starter"
            },
            {
                "word": "Ni ba mawaƙi ba ne.",
                "meaning": "I'm not a singer.",
                "example": "Ni ba mawaƙi ba ne. -> I'm not a singer.",
                "level": "starter"
            },
            {
                "word": "\"Bari mu yi wasan Hop Skip da kuma tsalle kamar ni,\" in ji ɗan farin zomo.",
                "meaning": "\"Let's play Hop Skip And Jump like me,\" said the little white rabbit.",
                "example": "\"Bari mu yi wasan Hop Skip da kuma tsalle kamar ni,\" in ji ɗan farin zomo. -> \"Let's play Hop Skip And Jump like me,\" said the little white rabbit.",
                "level": "mastering"
            },
            {
                "word": "Ana tunanin mutanen Anglo-Saxon ko asalin Jamusanci ba Americansar Amurkawa dari ba.",
                "meaning": "Persons of Anglo-Saxon or German origin are considered one hundred percent Americans.",
                "example": "Ana tunanin mutanen Anglo-Saxon ko asalin Jamusanci ba Americansar Amurkawa dari ba. -> Persons of Anglo-Saxon or German origin are considered one hundred percent Americans.",
                "level": "mastering"
            },
            {
                "word": "Wasu lokutan kina tashi daga bacci a gajiye?",
                "meaning": "Do you sometimes wake up feeling tired?",
                "example": "Wasu lokutan kina tashi daga bacci a gajiye? -> Do you sometimes wake up feeling tired?",
                "level": "building"
            },
            {
                "word": "\" Shi Musulmi ne kuwa\" \"Me ya hada wannan batu da addininsa kuma?\"",
                "meaning": "\"Is he Muslim.\" \"What does his religion have to do with that?\"",
                "example": "\" Shi Musulmi ne kuwa\" \"Me ya hada wannan batu da addininsa kuma?\" -> \"Is he Muslim.\" \"What does his religion have to do with that?\"",
                "level": "mastering"
            },
            {
                "word": "Ƴansanda suna neman shaida.",
                "meaning": "The police are searching for clues.",
                "example": "Ƴansanda suna neman shaida. -> The police are searching for clues.",
                "level": "building"
            },
            {
                "word": "Waye wancan matan da ta saka kwat mai launin ruwan-ƙasa?",
                "meaning": "Who's that woman in the brown coat?",
                "example": "Waye wancan matan da ta saka kwat mai launin ruwan-ƙasa? -> Who's that woman in the brown coat?",
                "level": "building"
            },
            {
                "word": "Waye wancan matan wanda ta saka kwat mai launin ruwan-ƙasa?",
                "meaning": "Who's that woman with the brown coat?",
                "example": "Waye wancan matan wanda ta saka kwat mai launin ruwan-ƙasa? -> Who's that woman with the brown coat?",
                "level": "building"
            },
            {
                "word": "Wace waya kake ganin zan yanke, ta ja ce ko ta kore?",
                "meaning": "Which wire do you think I should cut, the red one or the green one?",
                "example": "Wace waya kake ganin zan yanke, ta ja ce ko ta kore? -> Which wire do you think I should cut, the red one or the green one?",
                "level": "mastering"
            },
            {
                "word": "Bari mu nuna cewa mu 'yan fashi ne.",
                "meaning": "Let's pretend that we're pirates.",
                "example": "Bari mu nuna cewa mu 'yan fashi ne. -> Let's pretend that we're pirates.",
                "level": "building"
            },
            {
                "word": "Mu dan jira kadan ko ruwan saman zai dauke.",
                "meaning": "Let's wait for a while and see if the rain stops.",
                "example": "Mu dan jira kadan ko ruwan saman zai dauke. -> Let's wait for a while and see if the rain stops.",
                "level": "confident"
            },
            {
                "word": "Wannan ne gidan Sasha. Ta zauna a ciki shekaru gomanni.",
                "meaning": "That's Sasha's house. She's lived there for decades.",
                "example": "Wannan ne gidan Sasha. Ta zauna a ciki shekaru gomanni. -> That's Sasha's house. She's lived there for decades.",
                "level": "confident"
            },
            {
                "word": "Ina bukatar dala arba'in.",
                "meaning": "I need forty dollars.",
                "example": "Ina bukatar dala arba'in. -> I need forty dollars.",
                "level": "starter"
            },
            {
                "word": "Idan kina son ƙona tutar Amurka, kin tabbatar sai dai ke sata maimakon ke saya.",
                "meaning": "If you're going to burn an American flag, make sure you steal it instead of buying it.",
                "example": "Idan kina son ƙona tutar Amurka, kin tabbatar sai dai ke sata maimakon ke saya. -> If you're going to burn an American flag, make sure you steal it instead of buying it.",
                "level": "mastering"
            },
            {
                "word": "Amurka ta shiga yanayi.",
                "meaning": "America sucks.",
                "example": "Amurka ta shiga yanayi. -> America sucks.",
                "level": "starter"
            },
            {
                "word": "Kune muke jira.",
                "meaning": "You're the ones we've been waiting for.",
                "example": "Kune muke jira. -> You're the ones we've been waiting for.",
                "level": "building"
            },
            {
                "word": "Za'a tsara wannan kuma a rataye shi a bango.",
                "meaning": "This will be framed and hung up on the wall.",
                "example": "Za'a tsara wannan kuma a rataye shi a bango. -> This will be framed and hung up on the wall.",
                "level": "confident"
            },
            {
                "word": "Zobe, don Allah.",
                "meaning": "The ring, please.",
                "example": "Zobe, don Allah. -> The ring, please.",
                "level": "starter"
            },
            {
                "word": "Ina son ki sanya wannan sarƙar.",
                "meaning": "I want you to have this necklace.",
                "example": "Ina son ki sanya wannan sarƙar. -> I want you to have this necklace.",
                "level": "building"
            }
        ]
    },
    "igbo": {
        "greetings": [
            {
                "word": "Ee! Kedu aha gị?",
                "meaning": "Hello, what is your name?",
                "example": "Ee! Kedu aha gị? -> Hello, what is your name?",
                "level": "building"
            },
            {
                "word": "Ndewo!",
                "meaning": "Hello!",
                "example": "Ndewo! -> Hello!",
                "level": "starter"
            },
            {
                "word": "Tom Kedu.",
                "meaning": "Hello, Tom.",
                "example": "Tom Kedu. -> Hello, Tom.",
                "level": "starter"
            }
        ],
        "market": [],
        "transport": [
            {
                "word": "Ihuru mgbe Tomu bara n'me ugbo ala ahu?",
                "meaning": "Did you see Tom get on the bus?",
                "example": "Ihuru mgbe Tomu bara n'me ugbo ala ahu? -> Did you see Tom get on the bus?",
                "level": "confident"
            }
        ],
        "health": [],
        "ai_chat": [
            {
                "word": "Idem ama enyek enye tutu enye efehe ọkpọn̄ ukot.",
                "meaning": "He was so startled that he ran outside barefoot.",
                "example": "Idem ama enyek enye tutu enye efehe ọkpọn̄ ukot. -> He was so startled that he ran outside barefoot.",
                "level": "confident"
            },
            {
                "word": "Gịnị ka njakịrị a pụtara?",
                "meaning": "What is the meaning of this joke?",
                "example": "Gịnị ka njakịrị a pụtara? -> What is the meaning of this joke?",
                "level": "building"
            },
            {
                "word": "Biko nyefee m mkpịsị akwụkwọ ahụ.",
                "meaning": "Please hand me that pen.",
                "example": "Biko nyefee m mkpịsị akwụkwọ ahụ. -> Please hand me that pen.",
                "level": "building"
            },
            {
                "word": "Sami ahụbeghị Layla ruo mgbe ebighị ebi.",
                "meaning": "Sami hasn't seen Layla in forever.",
                "example": "Sami ahụbeghị Layla ruo mgbe ebighị ebi. -> Sami hasn't seen Layla in forever.",
                "level": "building"
            },
            {
                "word": "Anyị ghọrọ enyi mgbe m nọ na Taiwan.",
                "meaning": "We became friends when I was in Taiwan.",
                "example": "Anyị ghọrọ enyi mgbe m nọ na Taiwan. -> We became friends when I was in Taiwan.",
                "level": "confident"
            },
            {
                "word": "N'ihi ya, ọ ga-amụta ihe niile na anyị nwere ike izute obere oge.",
                "meaning": "So she has to learn everything and only rarely can we meet.",
                "example": "N'ihi ya, ọ ga-amụta ihe niile na anyị nwere ike izute obere oge. -> So she has to learn everything and only rarely can we meet.",
                "level": "mastering"
            },
            {
                "word": "Welie olu gị.",
                "meaning": "Raise your voice.",
                "example": "Welie olu gị. -> Raise your voice.",
                "level": "starter"
            },
            {
                "word": "O nwere mmetụta dịpụrụ adịpụ site na nke e bu n'obi.",
                "meaning": "It had an effect alien from the one intended.",
                "example": "O nwere mmetụta dịpụrụ adịpụ site na nke e bu n'obi. -> It had an effect alien from the one intended.",
                "level": "confident"
            },
            {
                "word": "Ihe kasị enye nsogbu bụ nrụrụ aka nke ndị kasị mma.",
                "meaning": "What is most troublesome is the corruption of the best.",
                "example": "Ihe kasị enye nsogbu bụ nrụrụ aka nke ndị kasị mma. -> What is most troublesome is the corruption of the best.",
                "level": "confident"
            },
            {
                "word": "Kedu onye nọ ebe ahụ?",
                "meaning": "Who is the guy there?",
                "example": "Kedu onye nọ ebe ahụ? -> Who is the guy there?",
                "level": "building"
            },
            {
                "word": "Ị̀ na-asụ Bekee?",
                "meaning": "Do you speak English?",
                "example": "Ị̀ na-asụ Bekee? -> Do you speak English?",
                "level": "starter"
            },
            {
                "word": "Amara ihe nke ukwu na agaghịm eme ihe dị otua",
                "meaning": "I'm smart enough not to do that.",
                "example": "Amara ihe nke ukwu na agaghịm eme ihe dị otua -> I'm smart enough not to do that.",
                "level": "building"
            },
            {
                "word": "A chọbụrụ m ịchete.",
                "meaning": "I wanted to remember.",
                "example": "A chọbụrụ m ịchete. -> I wanted to remember.",
                "level": "starter"
            },
            {
                "word": "Bịa!",
                "meaning": "Come!",
                "example": "Bịa! -> Come!",
                "level": "starter"
            },
            {
                "word": "Kedụ?",
                "meaning": "Hi.",
                "example": "Kedụ? -> Hi.",
                "level": "starter"
            },
            {
                "word": "Ka emesịa!",
                "meaning": "Good-bye!",
                "example": "Ka emesịa! -> Good-bye!",
                "level": "starter"
            },
            {
                "word": "Daalụ!",
                "meaning": "Thank you!",
                "example": "Daalụ! -> Thank you!",
                "level": "starter"
            },
            {
                "word": "Kwụsị!",
                "meaning": "Stop!",
                "example": "Kwụsị! -> Stop!",
                "level": "starter"
            },
            {
                "word": "Biko.",
                "meaning": "Please.",
                "example": "Biko. -> Please.",
                "level": "starter"
            },
            {
                "word": "Obu n'imaburo maka ihea?",
                "meaning": "Didn't you know that already?",
                "example": "Obu n'imaburo maka ihea? -> Didn't you know that already?",
                "level": "building"
            },
            {
                "word": "Mu na Tomu enwere Ike ikwu maka ihea?",
                "meaning": "May I talk about this with Tom?",
                "example": "Mu na Tomu enwere Ike ikwu maka ihea? -> May I talk about this with Tom?",
                "level": "building"
            },
            {
                "word": "I tinyere ihe na-asa efere ka obido.",
                "meaning": "Did you start the dishwasher?",
                "example": "I tinyere ihe na-asa efere ka obido. -> Did you start the dishwasher?",
                "level": "building"
            },
            {
                "word": "Amam na Tomu choro ka mu na ya kwo.",
                "meaning": "I know Tom wants to talk with me.",
                "example": "Amam na Tomu choro ka mu na ya kwo. -> I know Tom wants to talk with me.",
                "level": "confident"
            },
            {
                "word": "Amam na Tomu choro ka mu na ya kpa.",
                "meaning": "I know Tom wants to talk with me.",
                "example": "Amam na Tomu choro ka mu na ya kpa. -> I know Tom wants to talk with me.",
                "level": "confident"
            },
            {
                "word": "Amam na Tomu choro igwa m okwu.",
                "meaning": "I know Tom wants to talk to me.",
                "example": "Amam na Tomu choro igwa m okwu. -> I know Tom wants to talk to me.",
                "level": "confident"
            },
            {
                "word": "Ikwukwara Ihe meru?",
                "meaning": "Did you report what happened?",
                "example": "Ikwukwara Ihe meru? -> Did you report what happened?",
                "level": "building"
            },
            {
                "word": "Amam na Tomu na-aruru Meri Oru.",
                "meaning": "I know Tom is working for Mary.",
                "example": "Amam na Tomu na-aruru Meri Oru. -> I know Tom is working for Mary.",
                "level": "building"
            },
            {
                "word": "Akam ahubeghi ndi be Tomu.",
                "meaning": "I haven't met Tom's family yet.",
                "example": "Akam ahubeghi ndi be Tomu. -> I haven't met Tom's family yet.",
                "level": "building"
            },
            {
                "word": "Mu na ndi be Tomu ahubeghi.",
                "meaning": "I haven't met Tom's family yet.",
                "example": "Mu na ndi be Tomu ahubeghi. -> I haven't met Tom's family yet.",
                "level": "building"
            },
            {
                "word": "Enwerem ike iju gi ajuju ozo?",
                "meaning": "Could I ask another question?",
                "example": "Enwerem ike iju gi ajuju ozo? -> Could I ask another question?",
                "level": "building"
            },
            {
                "word": "Enwere m ike ibiri gi diksonari a?",
                "meaning": "Can I borrow this dictionary?",
                "example": "Enwere m ike ibiri gi diksonari a? -> Can I borrow this dictionary?",
                "level": "building"
            },
            {
                "word": "Tomu na Mari akpara Ihe ahu?",
                "meaning": "Did Tom discuss that with Mary?",
                "example": "Tomu na Mari akpara Ihe ahu? -> Did Tom discuss that with Mary?",
                "level": "building"
            },
            {
                "word": "I na-akwado Iga ebe ahu?",
                "meaning": "Are you planning to go there?",
                "example": "I na-akwado Iga ebe ahu? -> Are you planning to go there?",
                "level": "building"
            },
            {
                "word": "I nwere Ike Igwa Tomu ka-obata n'ime?",
                "meaning": "Can you ask Tom to come inside?",
                "example": "I nwere Ike Igwa Tomu ka-obata n'ime? -> Can you ask Tom to come inside?",
                "level": "building"
            },
            {
                "word": "Gwagodi Tomu ka-obata n'ime?",
                "meaning": "Can you ask Tom to come inside?",
                "example": "Gwagodi Tomu ka-obata n'ime? -> Can you ask Tom to come inside?",
                "level": "building"
            },
            {
                "word": "I wepuru ahihia ahu?",
                "meaning": "Did you take out the rubbish?",
                "example": "I wepuru ahihia ahu? -> Did you take out the rubbish?",
                "level": "building"
            },
            {
                "word": "Mbe enweghị ezé.",
                "meaning": "Turtles don't have teeth.",
                "example": "Mbe enweghị ezé. -> Turtles don't have teeth.",
                "level": "starter"
            },
            {
                "word": "Ana m ele anya ya.",
                "meaning": "I look forward to it.",
                "example": "Ana m ele anya ya. -> I look forward to it.",
                "level": "building"
            }
        ]
    },
    "french": {
        "greetings": [],
        "market": [],
        "transport": [
            {
                "word": "Pour arriver à la mairie, vous pouvez prendre soit le métro, soit le bus.",
                "meaning": "To get to the city hall, you can take either the underground or the bus.",
                "example": "Pour arriver à la mairie, vous pouvez prendre soit le métro, soit le bus. -> To get to the city hall, you can take either the underground or the bus.",
                "level": "mastering"
            },
            {
                "word": "À la gare principale, vous devez changer.",
                "meaning": "At the main station, you have to change.",
                "example": "À la gare principale, vous devez changer. -> At the main station, you have to change.",
                "level": "confident"
            }
        ],
        "health": [],
        "ai_chat": [
            {
                "word": "Nous ne sombrerons pas dans l'oubli.",
                "meaning": "We won't be forgotten.",
                "example": "Nous ne sombrerons pas dans l'oubli. -> We won't be forgotten.",
                "level": "starter"
            },
            {
                "word": "Cela ne doit pas sombrer dans l'oubli.",
                "meaning": "This can't be forgotten.",
                "example": "Cela ne doit pas sombrer dans l'oubli. -> This can't be forgotten.",
                "level": "starter"
            },
            {
                "word": "Pourquoi devons-nous payer des impôts ?",
                "meaning": "Why do we have to pay taxes?",
                "example": "Pourquoi devons-nous payer des impôts ? -> Why do we have to pay taxes?",
                "level": "building"
            },
            {
                "word": "Nous étions heureux sans le savoir.",
                "meaning": "We were happy, and we didn't know it.",
                "example": "Nous étions heureux sans le savoir. -> We were happy, and we didn't know it.",
                "level": "confident"
            },
            {
                "word": "Mes filles ont campé dans un camping près d'un lac.",
                "meaning": "My daughters camped on a camping site close to a lake.",
                "example": "Mes filles ont campé dans un camping près d'un lac. -> My daughters camped on a camping site close to a lake.",
                "level": "confident"
            },
            {
                "word": "Je contacte l'agence de voyages pour demander un remboursement.",
                "meaning": "I'm contacting the travel agency to request a refund.",
                "example": "Je contacte l'agence de voyages pour demander un remboursement. -> I'm contacting the travel agency to request a refund.",
                "level": "confident"
            },
            {
                "word": "Marie n'aime pas camper, parce qu'elle déteste les insectes.",
                "meaning": "Mary doesn't like camping, because she hates insects.",
                "example": "Marie n'aime pas camper, parce qu'elle déteste les insectes. -> Mary doesn't like camping, because she hates insects.",
                "level": "confident"
            },
            {
                "word": "J'ai réservé une table dans ce bistrot.",
                "meaning": "I have reserved a table at this pub.",
                "example": "J'ai réservé une table dans ce bistrot. -> I have reserved a table at this pub.",
                "level": "confident"
            },
            {
                "word": "Je les ai massacrées.",
                "meaning": "I have killed them.",
                "example": "Je les ai massacrées. -> I have killed them.",
                "level": "starter"
            },
            {
                "word": "Ne gaspille pas ton temps.",
                "meaning": "Don't waste time.",
                "example": "Ne gaspille pas ton temps. -> Don't waste time.",
                "level": "starter"
            },
            {
                "word": "Nous devons descendre au prochain arrêt.",
                "meaning": "We have to get off at the next stop.",
                "example": "Nous devons descendre au prochain arrêt. -> We have to get off at the next stop.",
                "level": "confident"
            },
            {
                "word": "Nous allons passer la nuit dans cet hôtel au centre de la ville.",
                "meaning": "We'll spend the night in this hotel downtown.",
                "example": "Nous allons passer la nuit dans cet hôtel au centre de la ville. -> We'll spend the night in this hotel downtown.",
                "level": "confident"
            },
            {
                "word": "Vous serez informé si le vol sera annulé.",
                "meaning": "You'll be informed if the flight will be cancelled.",
                "example": "Vous serez informé si le vol sera annulé. -> You'll be informed if the flight will be cancelled.",
                "level": "confident"
            },
            {
                "word": "Veuillez remplir le formulaire pour être dédommagé.",
                "meaning": "Please fill out the form to be reimbursed.",
                "example": "Veuillez remplir le formulaire pour être dédommagé. -> Please fill out the form to be reimbursed.",
                "level": "confident"
            },
            {
                "word": "Que dit ta mère ?",
                "meaning": "What does your mom say?",
                "example": "Que dit ta mère ? -> What does your mom say?",
                "level": "building"
            },
            {
                "word": "Combien de temps faut-il attendre au carrousel à bagages ?",
                "meaning": "How long do you have to wait at the baggage carrousel?",
                "example": "Combien de temps faut-il attendre au carrousel à bagages ? -> How long do you have to wait at the baggage carrousel?",
                "level": "confident"
            },
            {
                "word": "Les enfants, l'escalier roulant n'est pas une aire de jeux !",
                "meaning": "Kids, the escalator isn't a playground!",
                "example": "Les enfants, l'escalier roulant n'est pas une aire de jeux ! -> Kids, the escalator isn't a playground!",
                "level": "building"
            },
            {
                "word": "Qui possède ces sacs de voyage ?",
                "meaning": "Who owns these travel bags?",
                "example": "Qui possède ces sacs de voyage ? -> Who owns these travel bags?",
                "level": "building"
            },
            {
                "word": "Nous attendons avec impatience notre arrivée à Vienne.",
                "meaning": "We're looking forward to our arrival in Vienna.",
                "example": "Nous attendons avec impatience notre arrivée à Vienne. -> We're looking forward to our arrival in Vienna.",
                "level": "confident"
            },
            {
                "word": "Veuillez rester assis. Nous allons atterrir bientôt.",
                "meaning": "Please remain seated. We're landing soon.",
                "example": "Veuillez rester assis. Nous allons atterrir bientôt. -> Please remain seated. We're landing soon.",
                "level": "building"
            },
            {
                "word": "Pendant le vol, les appareils électroniques doivent être éteints.",
                "meaning": "During the flight, electronic devices have to be turned off.",
                "example": "Pendant le vol, les appareils électroniques doivent être éteints. -> During the flight, electronic devices have to be turned off.",
                "level": "confident"
            },
            {
                "word": "Vous agissez comme si de rien n'était.",
                "meaning": "You're acting as if nothing has happened.",
                "example": "Vous agissez comme si de rien n'était. -> You're acting as if nothing has happened.",
                "level": "building"
            },
            {
                "word": "Vous agissez comme si rien n'était arrivé.",
                "meaning": "You're acting as if nothing has happened.",
                "example": "Vous agissez comme si rien n'était arrivé. -> You're acting as if nothing has happened.",
                "level": "building"
            },
            {
                "word": "Tu agis comme si rien n'était arrivé.",
                "meaning": "You're acting as if nothing has happened.",
                "example": "Tu agis comme si rien n'était arrivé. -> You're acting as if nothing has happened.",
                "level": "building"
            },
            {
                "word": "Tu agis comme si rien ne s'était passé.",
                "meaning": "You're acting as if nothing has happened.",
                "example": "Tu agis comme si rien ne s'était passé. -> You're acting as if nothing has happened.",
                "level": "building"
            },
            {
                "word": "Tu agis comme si de rien n'était.",
                "meaning": "You're acting as if nothing has happened.",
                "example": "Tu agis comme si de rien n'était. -> You're acting as if nothing has happened.",
                "level": "building"
            },
            {
                "word": "Ziri fut torturé.",
                "meaning": "Ziri was being tortured.",
                "example": "Ziri fut torturé. -> Ziri was being tortured.",
                "level": "starter"
            },
            {
                "word": "J'essaie de garder mes résolutions cette année.",
                "meaning": "I'm trying to keep my resolutions this year.",
                "example": "J'essaie de garder mes résolutions cette année. -> I'm trying to keep my resolutions this year.",
                "level": "confident"
            },
            {
                "word": "Les cochonnets en pâte d'amande sont des porte-bonheurs dans la culture allemande.",
                "meaning": "Piggies made of marzipan are lucky charms in the German culture.",
                "example": "Les cochonnets en pâte d'amande sont des porte-bonheurs dans la culture allemande. -> Piggies made of marzipan are lucky charms in the German culture.",
                "level": "confident"
            },
            {
                "word": "Nos enfants veulent regarder le feu d'artifices du Nouvel An.",
                "meaning": "Our children want to watch the New Year's fireworks.",
                "example": "Nos enfants veulent regarder le feu d'artifices du Nouvel An. -> Our children want to watch the New Year's fireworks.",
                "level": "confident"
            },
            {
                "word": "Ce jeu est sans intérêt.",
                "meaning": "This is such a lame game.",
                "example": "Ce jeu est sans intérêt. -> This is such a lame game.",
                "level": "building"
            },
            {
                "word": "Il s'est cassé l'orteil lors de son escalade.",
                "meaning": "He broke his toe while climbing.",
                "example": "Il s'est cassé l'orteil lors de son escalade. -> He broke his toe while climbing.",
                "level": "building"
            },
            {
                "word": "Il y a eu de la bruine, hier.",
                "meaning": "Yesterday it drizzled.",
                "example": "Il y a eu de la bruine, hier. -> Yesterday it drizzled.",
                "level": "starter"
            },
            {
                "word": "Il est tombé sur son coccyx.",
                "meaning": "He hit his coccyx in a fall.",
                "example": "Il est tombé sur son coccyx. -> He hit his coccyx in a fall.",
                "level": "building"
            },
            {
                "word": "Le coccyx est une structure vestigiale.",
                "meaning": "The coccyx is a vestigial trait.",
                "example": "Le coccyx est une structure vestigiale. -> The coccyx is a vestigial trait.",
                "level": "building"
            },
            {
                "word": "L'escargot n'est pas le plus véloce des animaux.",
                "meaning": "Snails aren't the fastest-moving creatures.",
                "example": "L'escargot n'est pas le plus véloce des animaux. -> Snails aren't the fastest-moving creatures.",
                "level": "building"
            },
            {
                "word": "Tom vit dans un univers imaginaire.",
                "meaning": "Tom lives in a fantasy world.",
                "example": "Tom vit dans un univers imaginaire. -> Tom lives in a fantasy world.",
                "level": "building"
            },
            {
                "word": "Nous allons le cuire au feu.",
                "meaning": "We are going to cook it on the fire.",
                "example": "Nous allons le cuire au feu. -> We are going to cook it on the fire.",
                "level": "confident"
            },
            {
                "word": "J'ai un stylo-bille.",
                "meaning": "I have a pen.",
                "example": "J'ai un stylo-bille. -> I have a pen.",
                "level": "starter"
            },
            {
                "word": "Je ne savais pas que Tom était canadien.",
                "meaning": "I didn't know Tom was Canadian.",
                "example": "Je ne savais pas que Tom était canadien. -> I didn't know Tom was Canadian.",
                "level": "building"
            },
            {
                "word": "Tom et Mary voulaient se marier et avoir des enfants aussi tôt que possible.",
                "meaning": "Tom and Mary wanted to get married and have kids as soon as possible.",
                "example": "Tom et Mary voulaient se marier et avoir des enfants aussi tôt que possible. -> Tom and Mary wanted to get married and have kids as soon as possible.",
                "level": "mastering"
            },
            {
                "word": "Félicitations, l'installation de votre nouvelle imprimante s'est déroulée avec succès !",
                "meaning": "Congratulations, the installation of your new printer was completed successfully!",
                "example": "Félicitations, l'installation de votre nouvelle imprimante s'est déroulée avec succès ! -> Congratulations, the installation of your new printer was completed successfully!",
                "level": "confident"
            },
            {
                "word": "Félicitations, vous avez installé avec succès votre nouvelle imprimante !",
                "meaning": "Congratulations, you have successfully installed your new printer!",
                "example": "Félicitations, vous avez installé avec succès votre nouvelle imprimante ! -> Congratulations, you have successfully installed your new printer!",
                "level": "confident"
            },
            {
                "word": "Il était agriculteur.",
                "meaning": "He was a farmer.",
                "example": "Il était agriculteur. -> He was a farmer.",
                "level": "starter"
            },
            {
                "word": "Il n’y a pas d’enfer pire que celui-là.",
                "meaning": "There is no hell worse than this one.",
                "example": "Il n’y a pas d’enfer pire que celui-là. -> There is no hell worse than this one.",
                "level": "confident"
            },
            {
                "word": "Il est cuit au feu.",
                "meaning": "It is cooked over a fore.",
                "example": "Il est cuit au feu. -> It is cooked over a fore.",
                "level": "building"
            },
            {
                "word": "Adieu.",
                "meaning": "Farewell!",
                "example": "Adieu. -> Farewell!",
                "level": "starter"
            },
            {
                "word": "Elle est devenue pâle de peur.",
                "meaning": "She turned pale with fear.",
                "example": "Elle est devenue pâle de peur. -> She turned pale with fear.",
                "level": "building"
            }
        ]
    },
    "swahili": {
        "greetings": [],
        "market": [
            {
                "word": "Nataka kununua kitabu hiki. Ni bei gani?",
                "meaning": "I want to buy this book. How much is it?",
                "example": "Nataka kununua kitabu hiki. Ni bei gani? -> I want to buy this book. How much is it?",
                "level": "confident"
            }
        ],
        "transport": [
            {
                "word": "Mwalimu yuko wapi?",
                "meaning": "Where is the teacher?",
                "example": "Mwalimu yuko wapi? -> Where is the teacher?",
                "level": "starter"
            }
        ],
        "health": [],
        "ai_chat": [
            {
                "word": "Utakula nini siku ya Krismasi?",
                "meaning": "What are you going to eat on Christmas?",
                "example": "Utakula nini siku ya Krismasi? -> What are you going to eat on Christmas?",
                "level": "confident"
            },
            {
                "word": "Kifaransa ni kigumu sana.",
                "meaning": "French is very difficult.",
                "example": "Kifaransa ni kigumu sana. -> French is very difficult.",
                "level": "starter"
            },
            {
                "word": "Tom anakula nyama.",
                "meaning": "Tom eats meat.",
                "example": "Tom anakula nyama. -> Tom eats meat.",
                "level": "starter"
            },
            {
                "word": "Sina watoto.",
                "meaning": "I don't have any children.",
                "example": "Sina watoto. -> I don't have any children.",
                "level": "building"
            },
            {
                "word": "Pole, sina wakati,",
                "meaning": "Sorry. I don't have time.",
                "example": "Pole, sina wakati, -> Sorry. I don't have time.",
                "level": "building"
            },
            {
                "word": "Hatusomi Kiingereza.",
                "meaning": "We don't study English.",
                "example": "Hatusomi Kiingereza. -> We don't study English.",
                "level": "starter"
            },
            {
                "word": "Sitaenda mjini.",
                "meaning": "I am not going to town.",
                "example": "Sitaenda mjini. -> I am not going to town.",
                "level": "building"
            },
            {
                "word": "Alichora picha hii alipokuwa na miaka 23.",
                "meaning": "He painted this painting when he was 23.",
                "example": "Alichora picha hii alipokuwa na miaka 23. -> He painted this painting when he was 23.",
                "level": "confident"
            },
            {
                "word": "Desconecta el enchufe.",
                "meaning": "Pull the plug.",
                "example": "Desconecta el enchufe. -> Pull the plug.",
                "level": "starter"
            },
            {
                "word": "Tom anapika koko ya kukaanga.",
                "meaning": "Tom cooks fried chicken.",
                "example": "Tom anapika koko ya kukaanga. -> Tom cooks fried chicken.",
                "level": "starter"
            },
            {
                "word": "Nani ataokoa dunia?",
                "meaning": "Who will save the planet?",
                "example": "Nani ataokoa dunia? -> Who will save the planet?",
                "level": "building"
            },
            {
                "word": "Unaishi katika nchi gani?",
                "meaning": "What country do you live in?",
                "example": "Unaishi katika nchi gani? -> What country do you live in?",
                "level": "building"
            },
            {
                "word": "Uko wapi?",
                "meaning": "Where are you?",
                "example": "Uko wapi? -> Where are you?",
                "level": "starter"
            },
            {
                "word": "Mimi ni mwalimu wa Kiingereza.",
                "meaning": "I am an English teacher.",
                "example": "Mimi ni mwalimu wa Kiingereza. -> I am an English teacher.",
                "level": "building"
            },
            {
                "word": "Mary ni mwanamke.",
                "meaning": "Mary is a woman.",
                "example": "Mary ni mwanamke. -> Mary is a woman.",
                "level": "starter"
            },
            {
                "word": "Tom ni mwanafunzi.",
                "meaning": "Tom is a student.",
                "example": "Tom ni mwanafunzi. -> Tom is a student.",
                "level": "starter"
            },
            {
                "word": "Tom alichelewa kuja.",
                "meaning": "Tom came late.",
                "example": "Tom alichelewa kuja. -> Tom came late.",
                "level": "starter"
            },
            {
                "word": "Nilisubiri saa nusu.",
                "meaning": "I waited half an hour.",
                "example": "Nilisubiri saa nusu. -> I waited half an hour.",
                "level": "building"
            },
            {
                "word": "Saa nusu imepita.",
                "meaning": "Half an hour passed.",
                "example": "Saa nusu imepita. -> Half an hour passed.",
                "level": "starter"
            },
            {
                "word": "Uko tayari?",
                "meaning": "Are you ready?",
                "example": "Uko tayari? -> Are you ready?",
                "level": "starter"
            },
            {
                "word": "Kwa nini ujifunze Biblia?",
                "meaning": "Why study the Bible?",
                "example": "Kwa nini ujifunze Biblia? -> Why study the Bible?",
                "level": "starter"
            },
            {
                "word": "Mbwa yuko chini ya meza.",
                "meaning": "The dog is under the table.",
                "example": "Mbwa yuko chini ya meza. -> The dog is under the table.",
                "level": "building"
            },
            {
                "word": "Nafasi iliisha.",
                "meaning": "It was sold out.",
                "example": "Nafasi iliisha. -> It was sold out.",
                "level": "starter"
            },
            {
                "word": "Kwa nini unabishana naye?",
                "meaning": "Why do you argue with him?",
                "example": "Kwa nini unabishana naye? -> Why do you argue with him?",
                "level": "building"
            },
            {
                "word": "Nina uhakika.",
                "meaning": "I am sure.",
                "example": "Nina uhakika. -> I am sure.",
                "level": "starter"
            },
            {
                "word": "Naenda kula!",
                "meaning": "I am going to eat!",
                "example": "Naenda kula! -> I am going to eat!",
                "level": "building"
            },
            {
                "word": "Nataka kunywa kahawa.",
                "meaning": "I would like to drink a coffee.",
                "example": "Nataka kunywa kahawa. -> I would like to drink a coffee.",
                "level": "building"
            },
            {
                "word": "Napenda Mungu.",
                "meaning": "I love God.",
                "example": "Napenda Mungu. -> I love God.",
                "level": "starter"
            },
            {
                "word": "Napenda kula maharage.",
                "meaning": "I like to eat beans.",
                "example": "Napenda kula maharage. -> I like to eat beans.",
                "level": "building"
            },
            {
                "word": "Napenda kula.",
                "meaning": "I like to eat.",
                "example": "Napenda kula. -> I like to eat.",
                "level": "starter"
            },
            {
                "word": "Napenda kula pea.",
                "meaning": "I like to eat pears.",
                "example": "Napenda kula pea. -> I like to eat pears.",
                "level": "building"
            },
            {
                "word": "Napenda kula tufaha.",
                "meaning": "I like to eat apples.",
                "example": "Napenda kula tufaha. -> I like to eat apples.",
                "level": "building"
            },
            {
                "word": "Napenda kula nyama.",
                "meaning": "I like to eat meat.",
                "example": "Napenda kula nyama. -> I like to eat meat.",
                "level": "building"
            },
            {
                "word": "Napenda kula samaki.",
                "meaning": "I like to eat fish.",
                "example": "Napenda kula samaki. -> I like to eat fish.",
                "level": "building"
            },
            {
                "word": "Napenda kunywa maji na barafu.",
                "meaning": "I like to drink ice water.",
                "example": "Napenda kunywa maji na barafu. -> I like to drink ice water.",
                "level": "building"
            },
            {
                "word": "Napenda kunywa chai.",
                "meaning": "I like to drink tea.",
                "example": "Napenda kunywa chai. -> I like to drink tea.",
                "level": "building"
            },
            {
                "word": "Unafanya kazi gani?",
                "meaning": "What's your profession?",
                "example": "Unafanya kazi gani? -> What's your profession?",
                "level": "starter"
            },
            {
                "word": "Nilisoma hadithi jana.",
                "meaning": "I read a story yesterday.",
                "example": "Nilisoma hadithi jana. -> I read a story yesterday.",
                "level": "building"
            },
            {
                "word": "Asante kwa kuja.",
                "meaning": "Thank you for coming.",
                "example": "Asante kwa kuja. -> Thank you for coming.",
                "level": "starter"
            },
            {
                "word": "Nina haraka.",
                "meaning": "I am in a hurry.",
                "example": "Nina haraka. -> I am in a hurry.",
                "level": "building"
            },
            {
                "word": "Nitarudi wiki ijayo.",
                "meaning": "I will come back next week.",
                "example": "Nitarudi wiki ijayo. -> I will come back next week.",
                "level": "building"
            },
            {
                "word": "Niliona nyumba nzuri.",
                "meaning": "I saw a beautiful house.",
                "example": "Niliona nyumba nzuri. -> I saw a beautiful house.",
                "level": "building"
            },
            {
                "word": "Kazi zinanichosha sana.",
                "meaning": "Jobs make me so exhausted.",
                "example": "Kazi zinanichosha sana. -> Jobs make me so exhausted.",
                "level": "building"
            },
            {
                "word": "Barabara nyingi ni mbovu hazipitiki kwa hiyo watu wa UN wanaotoa misaada wanashindwa kuwafikia watu kwa urahisi.",
                "meaning": "Many roads are impassable, so UN aid workers are unable to reach people easily.",
                "example": "Barabara nyingi ni mbovu hazipitiki kwa hiyo watu wa UN wanaotoa misaada wanashindwa kuwafikia watu kwa urahisi. -> Many roads are impassable, so UN aid workers are unable to reach people easily.",
                "level": "mastering"
            },
            {
                "word": "Utamwamini nani?",
                "meaning": "Who will you believe?",
                "example": "Utamwamini nani? -> Who will you believe?",
                "level": "starter"
            },
            {
                "word": "Mungu Anakubali Aina Zote za Ibada?",
                "meaning": "Does God accept all forms of worship?",
                "example": "Mungu Anakubali Aina Zote za Ibada? -> Does God accept all forms of worship?",
                "level": "building"
            },
            {
                "word": "Hatuna Papa!",
                "meaning": "We don't have a Pope!",
                "example": "Hatuna Papa! -> We don't have a Pope!",
                "level": "building"
            },
            {
                "word": "Baba alisema kwamba hatakula.",
                "meaning": "Dad said that he wouldn't eat.",
                "example": "Baba alisema kwamba hatakula. -> Dad said that he wouldn't eat.",
                "level": "building"
            }
        ]
    },
    "zulu": {
        "greetings": [
            {
                "word": "Sawubona. Igama lami nginguJabu.",
                "meaning": "Hello. My name is Jabu.",
                "example": "Sawubona. Igama lami nginguJabu. -> Hello. My name is Jabu.",
                "level": "building"
            }
        ],
        "market": [],
        "transport": [
            {
                "word": "Uthe ebusheni bakhe, abantu abancane babesukumela abantu abadala ebhasini ukuze bahlale.",
                "meaning": "He said that in his youth youngsters gave up their bus seats for the elderly.",
                "example": "Uthe ebusheni bakhe, abantu abancane babesukumela abantu abadala ebhasini ukuze bahlale. -> He said that in his youth youngsters gave up their bus seats for the elderly.",
                "level": "mastering"
            },
            {
                "word": "Uma imoto yakho yephuka ngokushesha, into yokuqala oyenzayo ukungenwa ingebhe.",
                "meaning": "When your car suddenly breaks down, your first reaction is often to panic.",
                "example": "Uma imoto yakho yephuka ngokushesha, into yokuqala oyenzayo ukungenwa ingebhe. -> When your car suddenly breaks down, your first reaction is often to panic.",
                "level": "mastering"
            },
            {
                "word": "Likuphi isonto lamaSulumani?",
                "meaning": "Where is the mosque?",
                "example": "Likuphi isonto lamaSulumani? -> Where is the mosque?",
                "level": "starter"
            },
            {
                "word": "Likuphi ikepisi likaJabu?",
                "meaning": "Where is Jabu’s cap?",
                "example": "Likuphi ikepisi likaJabu? -> Where is Jabu’s cap?",
                "level": "starter"
            },
            {
                "word": "Angifuni ukuya esikoleni.",
                "meaning": "I don't want to go to school.",
                "example": "Angifuni ukuya esikoleni. -> I don't want to go to school.",
                "level": "building"
            }
        ],
        "health": [
            {
                "word": "Ngenxa yokuthi abantu abadala abaningi sebedlule emhlabeni, abantu abasebasha ngisho nezingane imbala baphoqeleka ukuthi baphathe imizi.",
                "meaning": "Because so many adults have passed away, young people and even children are forced to head up households.",
                "example": "Ngenxa yokuthi abantu abadala abaningi sebedlule emhlabeni, abantu abasebasha ngisho nezingane imbala baphoqeleka ukuthi baphathe imizi. -> Because so many adults have passed away, young people and even children are forced to head up households.",
                "level": "mastering"
            }
        ],
        "ai_chat": [
            {
                "word": "Umculo uwukuphila kwami.",
                "meaning": "Music is my life.",
                "example": "Umculo uwukuphila kwami. -> Music is my life.",
                "level": "starter"
            },
            {
                "word": "Waphendula umbuzo.",
                "meaning": "He answered the question.",
                "example": "Waphendula umbuzo. -> He answered the question.",
                "level": "starter"
            },
            {
                "word": "Wanquma ukuthuthela eBelgium.",
                "meaning": "She decided to move to Belgium.",
                "example": "Wanquma ukuthuthela eBelgium. -> She decided to move to Belgium.",
                "level": "building"
            },
            {
                "word": "Ngiyayithanda intombi yami.",
                "meaning": "I love my girlfriend.",
                "example": "Ngiyayithanda intombi yami. -> I love my girlfriend.",
                "level": "starter"
            },
            {
                "word": "Imithetho yethu iqinile kakhulu.",
                "meaning": "Our laws are very strict.",
                "example": "Imithetho yethu iqinile kakhulu. -> Our laws are very strict.",
                "level": "building"
            },
            {
                "word": "Kungani ungadli?",
                "meaning": "Why aren't you eating?",
                "example": "Kungani ungadli? -> Why aren't you eating?",
                "level": "starter"
            },
            {
                "word": "Sikholwa ukuthi, njengoba kusho amaZulu, akukho ndlovu esindwa umboko wayo.",
                "meaning": "We believe, as the Zulus say, that no elephant ever found its trunk too heavy.",
                "example": "Sikholwa ukuthi, njengoba kusho amaZulu, akukho ndlovu esindwa umboko wayo. -> We believe, as the Zulus say, that no elephant ever found its trunk too heavy.",
                "level": "mastering"
            },
            {
                "word": "Izindiza azivamile ukuvunyelwa ukundiza endaweni engaphezu kwenkaba yedolobha.",
                "meaning": "Aeroplanes are not usually allowed to fly through the zone above a city centre.",
                "example": "Izindiza azivamile ukuvunyelwa ukundiza endaweni engaphezu kwenkaba yedolobha. -> Aeroplanes are not usually allowed to fly through the zone above a city centre.",
                "level": "mastering"
            },
            {
                "word": "Imitha ibekwe eqandeni.",
                "meaning": "The meter is set at zero.",
                "example": "Imitha ibekwe eqandeni. -> The meter is set at zero.",
                "level": "building"
            },
            {
                "word": "Umhlambi wamadube uqale ukubaleka ngesikhathi ubona kuza amabhubesi.",
                "meaning": "The herd of zebras started fleeing when they saw the lions approaching.",
                "example": "Umhlambi wamadube uqale ukubaleka ngesikhathi ubona kuza amabhubesi. -> The herd of zebras started fleeing when they saw the lions approaching.",
                "level": "mastering"
            },
            {
                "word": "Uhulumeni kufanele abheke izidingo zentsha.",
                "meaning": "The government should pay attention to the needs of the youth.",
                "example": "Uhulumeni kufanele abheke izidingo zentsha. -> The government should pay attention to the needs of the youth.",
                "level": "confident"
            },
            {
                "word": "Ngabe uhlala wedwa?",
                "meaning": "Do you live by yourself?",
                "example": "Ngabe uhlala wedwa? -> Do you live by yourself?",
                "level": "building"
            },
            {
                "word": "Ngabe le ndishi uzenzele wena?",
                "meaning": "Did you make this dish yourself?",
                "example": "Ngabe le ndishi uzenzele wena? -> Did you make this dish yourself?",
                "level": "building"
            },
            {
                "word": "Ummese ubukhali – ungazisiki!",
                "meaning": "The knife is sharp – don’t cut yourself!",
                "example": "Ummese ubukhali – ungazisiki! -> The knife is sharp – don’t cut yourself!",
                "level": "confident"
            },
            {
                "word": "La masokisi awakho.",
                "meaning": "These socks are yours.",
                "example": "La masokisi awakho. -> These socks are yours.",
                "level": "starter"
            },
            {
                "word": "Ngihlangane nomyeni wakho ezitolo.",
                "meaning": "I met your husband at the shops.",
                "example": "Ngihlangane nomyeni wakho ezitolo. -> I met your husband at the shops.",
                "level": "building"
            },
            {
                "word": "Ngabe izingane zakho lezi?",
                "meaning": "Are these your children?",
                "example": "Ngabe izingane zakho lezi? -> Are these your children?",
                "level": "starter"
            },
            {
                "word": "Nina zingane ningabangi umsindo ongaka!",
                "meaning": "You children mustn’t make so much noise!",
                "example": "Nina zingane ningabangi umsindo ongaka! -> You children mustn’t make so much noise!",
                "level": "building"
            },
            {
                "word": "Sinifisela uKhisimusi omuhle nonyaka omusha omuhle.",
                "meaning": "We wish you a happy Christmas and a happy New Year.",
                "example": "Sinifisela uKhisimusi omuhle nonyaka omusha omuhle. -> We wish you a happy Christmas and a happy New Year.",
                "level": "confident"
            },
            {
                "word": "Usalele.",
                "meaning": "You were still asleep.",
                "example": "Usalele. -> You were still asleep.",
                "level": "starter"
            },
            {
                "word": "Wena ukhulumisa okwesilima.",
                "meaning": "You are talking like a fool.",
                "example": "Wena ukhulumisa okwesilima. -> You are talking like a fool.",
                "level": "building"
            },
            {
                "word": "Nginifisela amnandi amaphupho.",
                "meaning": "I wish you pleasant dreams.",
                "example": "Nginifisela amnandi amaphupho. -> I wish you pleasant dreams.",
                "level": "building"
            },
            {
                "word": "Ngifuna ukuhamba.",
                "meaning": "I want to go.",
                "example": "Ngifuna ukuhamba. -> I want to go.",
                "level": "starter"
            },
            {
                "word": "Emuva kwesikhashana uqala ukufunda ngokucophelela okukhulu bese ubona okuqondwe umbhali.",
                "meaning": "After a while you start reading with greater care and you realize the author’s true meaning.",
                "example": "Emuva kwesikhashana uqala ukufunda ngokucophelela okukhulu bese ubona okuqondwe umbhali. -> After a while you start reading with greater care and you realize the author’s true meaning.",
                "level": "mastering"
            },
            {
                "word": "Bazokhokha malini ngalezi ziphuzo ezibandayo ezimbili?",
                "meaning": "How much will they pay for the two cooldrinks?",
                "example": "Bazokhokha malini ngalezi ziphuzo ezibandayo ezimbili? -> How much will they pay for the two cooldrinks?",
                "level": "confident"
            },
            {
                "word": "Sidinga ufulawa noshukela.",
                "meaning": "We need flour and sugar.",
                "example": "Sidinga ufulawa noshukela. -> We need flour and sugar.",
                "level": "building"
            },
            {
                "word": "Ungazithola izimpawu zesonto lamaSulumani, isonto kanye nesinagogo?",
                "meaning": "Can you find the signs for the mosque, the church and the synagogue?",
                "example": "Ungazithola izimpawu zesonto lamaSulumani, isonto kanye nesinagogo? -> Can you find the signs for the mosque, the church and the synagogue?",
                "level": "mastering"
            },
            {
                "word": "Sibheke!",
                "meaning": "Look at us!",
                "example": "Sibheke! -> Look at us!",
                "level": "starter"
            },
            {
                "word": "Iseduzane noxhaxha lwezitolo.",
                "meaning": "It’s next to the shopping mall.",
                "example": "Iseduzane noxhaxha lwezitolo. -> It’s next to the shopping mall.",
                "level": "building"
            },
            {
                "word": "Lapha kulapho sihlala khona.",
                "meaning": "This is where we live.",
                "example": "Lapha kulapho sihlala khona. -> This is where we live.",
                "level": "building"
            },
            {
                "word": "Ngizogqoka ijini.",
                "meaning": "I’m going to wear jeans.",
                "example": "Ngizogqoka ijini. -> I’m going to wear jeans.",
                "level": "building"
            },
            {
                "word": "Likuphi ikepisi lami?",
                "meaning": "Where's my cap?",
                "example": "Likuphi ikepisi lami? -> Where's my cap?",
                "level": "starter"
            },
            {
                "word": "Kungabe idolo lakho libuhlungu?",
                "meaning": "Does your knee hurt?",
                "example": "Kungabe idolo lakho libuhlungu? -> Does your knee hurt?",
                "level": "starter"
            },
            {
                "word": "Bangaki abantu abafunda iphephandaba?",
                "meaning": "How many people are reading the newspaper?",
                "example": "Bangaki abantu abafunda iphephandaba? -> How many people are reading the newspaper?",
                "level": "building"
            },
            {
                "word": "Lesi sichazamazwi senzelwe ukusiza izingane ezineminyaka ephansi, ezisaqala ukufunda isiNgisi noma isiZulu njengolimi olwengeziwe.",
                "meaning": "This dictionary has been designed to help children in their first few years of learning English or IsiZulu as an additional language.",
                "example": "Lesi sichazamazwi senzelwe ukusiza izingane ezineminyaka ephansi, ezisaqala ukufunda isiNgisi noma isiZulu njengolimi olwengeziwe. -> This dictionary has been designed to help children in their first few years of learning English or IsiZulu as an additional language.",
                "level": "mastering"
            },
            {
                "word": "Uyalibona ikati na?",
                "meaning": "Can you see the cat?",
                "example": "Uyalibona ikati na? -> Can you see the cat?",
                "level": "building"
            },
            {
                "word": "Nali igumbi lokuphekela.",
                "meaning": "Here's the kitchen.",
                "example": "Nali igumbi lokuphekela. -> Here's the kitchen.",
                "level": "starter"
            },
            {
                "word": "Ungazithola zonke izincwadi zikaNiki?",
                "meaning": "Can you find all of Niki’s books?",
                "example": "Ungazithola zonke izincwadi zikaNiki? -> Can you find all of Niki’s books?",
                "level": "building"
            },
            {
                "word": "Lapha kulapho sibuka khona umabonakude.",
                "meaning": "This is where we watch TV.",
                "example": "Lapha kulapho sibuka khona umabonakude. -> This is where we watch TV.",
                "level": "building"
            },
            {
                "word": "Sobonana kusasa.",
                "meaning": "See you tomorrow.",
                "example": "Sobonana kusasa. -> See you tomorrow.",
                "level": "starter"
            },
            {
                "word": "Burj Khalifa yibhilidi elide kwengca wonkhe emhlabeni.",
                "meaning": "Burj Khalifa is currently the tallest skyscraper in the world.",
                "example": "Burj Khalifa yibhilidi elide kwengca wonkhe emhlabeni. -> Burj Khalifa is currently the tallest skyscraper in the world.",
                "level": "confident"
            },
            {
                "word": "Zikhona iziqhingi olwandle.",
                "meaning": "There are islands in the sea.",
                "example": "Zikhona iziqhingi olwandle. -> There are islands in the sea.",
                "level": "building"
            }
        ]
    },
    "amharic": {
        "greetings": [
            {
                "word": "Endemin aderk /እንደ ምን አደርክ/",
                "meaning": "Good morning!",
                "example": "Endemin aderk /እንደ ምን አደርክ/ -> Good morning!",
                "level": "starter"
            },
            {
                "word": "ስሜ ማን ነው፧",
                "meaning": "What is my name?",
                "example": "ስሜ ማን ነው፧ -> What is my name?",
                "level": "starter"
            },
            {
                "word": "አንቺ ዛሬ እንዴት ነሽ፧",
                "meaning": "How are you today?",
                "example": "አንቺ ዛሬ እንዴት ነሽ፧ -> How are you today?",
                "level": "starter"
            },
            {
                "word": "አንተ ዛሬ እንዴት ነህ፧",
                "meaning": "How are you today?",
                "example": "አንተ ዛሬ እንዴት ነህ፧ -> How are you today?",
                "level": "starter"
            }
        ],
        "market": [
            {
                "word": "አዲስ የጊዜ ማሽን መግዛት እፈልጋለሁ።",
                "meaning": "I want to buy a new time machine.",
                "example": "አዲስ የጊዜ ማሽን መግዛት እፈልጋለሁ። -> I want to buy a new time machine.",
                "level": "confident"
            }
        ],
        "transport": [
            {
                "word": "ቤቱ የት ነው?",
                "meaning": "Where is his house?",
                "example": "ቤቱ የት ነው? -> Where is his house?",
                "level": "starter"
            },
            {
                "word": "ደህና ሆቴል የት አለ?",
                "meaning": "Where is a good hotel?",
                "example": "ደህና ሆቴል የት አለ? -> Where is a good hotel?",
                "level": "building"
            },
            {
                "word": "ባቡር ጣቢያው ክዚህ ሩቅ ነው?",
                "meaning": "Is the railroad station far from here?",
                "example": "ባቡር ጣቢያው ክዚህ ሩቅ ነው? -> Is the railroad station far from here?",
                "level": "building"
            },
            {
                "word": "እባክዎ፣ ያሜሪካን ኤምባሲ የት ነው?",
                "meaning": "Excuse me, where is the American Embassy?",
                "example": "እባክዎ፣ ያሜሪካን ኤምባሲ የት ነው? -> Excuse me, where is the American Embassy?",
                "level": "building"
            }
        ],
        "health": [],
        "ai_chat": [
            {
                "word": "ኢትዮጵያ ትልቅ አገር ናት።",
                "meaning": "Ethiopia is a big country.",
                "example": "ኢትዮጵያ ትልቅ አገር ናት። -> Ethiopia is a big country.",
                "level": "building"
            },
            {
                "word": "የትግሬ ቋንቋ ለመማር ቀላል ነው።",
                "meaning": "The Tigre language is easy to learn.",
                "example": "የትግሬ ቋንቋ ለመማር ቀላል ነው። -> The Tigre language is easy to learn.",
                "level": "building"
            },
            {
                "word": "አስተማሪ ነበርኩ።",
                "meaning": "I was a teacher.",
                "example": "አስተማሪ ነበርኩ። -> I was a teacher.",
                "level": "starter"
            },
            {
                "word": "ጠርሙሱን ማን ሰበረ?",
                "meaning": "Who broke the bottle?",
                "example": "ጠርሙሱን ማን ሰበረ? -> Who broke the bottle?",
                "level": "starter"
            },
            {
                "word": "ሶፍትዌሩን ወደ የቅርብ ጊዜው ስሪት አዘምነዋለሁ።",
                "meaning": "I updated the software to the latest version.",
                "example": "ሶፍትዌሩን ወደ የቅርብ ጊዜው ስሪት አዘምነዋለሁ። -> I updated the software to the latest version.",
                "level": "confident"
            },
            {
                "word": "ዛሬ የማይረሳ ቀን ነበር።",
                "meaning": "Today was an unforgettable day.",
                "example": "ዛሬ የማይረሳ ቀን ነበር። -> Today was an unforgettable day.",
                "level": "building"
            },
            {
                "word": "ቶም በአንበሳ ተገደለ።",
                "meaning": "Tom was killed by a lion.",
                "example": "ቶም በአንበሳ ተገደለ። -> Tom was killed by a lion.",
                "level": "building"
            },
            {
                "word": "ደረሰኝ አለኝ።",
                "meaning": "I have a receipt.",
                "example": "ደረሰኝ አለኝ። -> I have a receipt.",
                "level": "starter"
            },
            {
                "word": "ትናንት ሐሙስ ነበር።",
                "meaning": "Yesterday was Thursday.",
                "example": "ትናንት ሐሙስ ነበር። -> Yesterday was Thursday.",
                "level": "starter"
            },
            {
                "word": "እህቶቼ ስለ ሳይንስ ማውራት ይወዳሉ።",
                "meaning": "My sisters love to talk about science.",
                "example": "እህቶቼ ስለ ሳይንስ ማውራት ይወዳሉ። -> My sisters love to talk about science.",
                "level": "building"
            },
            {
                "word": "ሁሉም ሰው እንግሊዝኛ ይናገራል።",
                "meaning": "Everyone speaks English.",
                "example": "ሁሉም ሰው እንግሊዝኛ ይናገራል። -> Everyone speaks English.",
                "level": "starter"
            },
            {
                "word": "ቶም እየተዋጋ አልነበረም።",
                "meaning": "Tom wasn't fighting.",
                "example": "ቶም እየተዋጋ አልነበረም። -> Tom wasn't fighting.",
                "level": "starter"
            },
            {
                "word": "የድመትህ ስም ማን ነው?",
                "meaning": "What's your cat's name?",
                "example": "የድመትህ ስም ማን ነው? -> What's your cat's name?",
                "level": "starter"
            },
            {
                "word": "ሴቶቹ በቤት ውስጥ ይሰሩ ነበር።",
                "meaning": "Women worked at home.",
                "example": "ሴቶቹ በቤት ውስጥ ይሰሩ ነበር። -> Women worked at home.",
                "level": "starter"
            },
            {
                "word": "ሴቶቹ በቤት ውስጥ ይሠሩ ነበር።",
                "meaning": "Women worked at home.",
                "example": "ሴቶቹ በቤት ውስጥ ይሠሩ ነበር። -> Women worked at home.",
                "level": "starter"
            },
            {
                "word": "ከቶ አልወደድኩሽም።",
                "meaning": "I never loved you.",
                "example": "ከቶ አልወደድኩሽም። -> I never loved you.",
                "level": "starter"
            },
            {
                "word": "ከቶ አልወደድኩህም።",
                "meaning": "I never loved you.",
                "example": "ከቶ አልወደድኩህም። -> I never loved you.",
                "level": "starter"
            },
            {
                "word": "መጽሐፎቼ አዲስ ናቸው።",
                "meaning": "My books are new.",
                "example": "መጽሐፎቼ አዲስ ናቸው። -> My books are new.",
                "level": "starter"
            },
            {
                "word": "ሀንጋሪኛ እየተማርኩ ነው።",
                "meaning": "I'm learning Hungarian.",
                "example": "ሀንጋሪኛ እየተማርኩ ነው። -> I'm learning Hungarian.",
                "level": "starter"
            },
            {
                "word": "የትኛውን ቋንቋ መማር ይፈልጋሉ?",
                "meaning": "What language do they want to learn?",
                "example": "የትኛውን ቋንቋ መማር ይፈልጋሉ? -> What language do they want to learn?",
                "level": "building"
            },
            {
                "word": "ወላንዶን ማብረር አደገኛ ሊሆን ይችላል።",
                "meaning": "Flying a kite can be dangerous.",
                "example": "ወላንዶን ማብረር አደገኛ ሊሆን ይችላል። -> Flying a kite can be dangerous.",
                "level": "building"
            },
            {
                "word": "ይህ ይዘት በእርስዎ አገር ውስጥ አይገኝም።",
                "meaning": "This content is not available in your country.",
                "example": "ይህ ይዘት በእርስዎ አገር ውስጥ አይገኝም። -> This content is not available in your country.",
                "level": "confident"
            },
            {
                "word": "ለንደን ውስጥ ለሁለት ሳምንታት ቆየን።",
                "meaning": "We stayed in London for a fortnight.",
                "example": "ለንደን ውስጥ ለሁለት ሳምንታት ቆየን። -> We stayed in London for a fortnight.",
                "level": "building"
            },
            {
                "word": "በረዶው በጣም ወፍራም ነው።",
                "meaning": "The ice is very thick.",
                "example": "በረዶው በጣም ወፍራም ነው። -> The ice is very thick.",
                "level": "building"
            },
            {
                "word": "ውጭ ሀገር መኖር አልችልም።",
                "meaning": "I can't live abroad.",
                "example": "ውጭ ሀገር መኖር አልችልም። -> I can't live abroad.",
                "level": "starter"
            },
            {
                "word": "እኛ የቶም ወላጆች ነን።",
                "meaning": "We're Tom's parents.",
                "example": "እኛ የቶም ወላጆች ነን። -> We're Tom's parents.",
                "level": "starter"
            },
            {
                "word": "ዘፋኝ አይደለሁም።",
                "meaning": "I'm not a singer.",
                "example": "ዘፋኝ አይደለሁም። -> I'm not a singer.",
                "level": "starter"
            },
            {
                "word": "ወደ ቤልጂየም ለመሄድ ወሰነች።",
                "meaning": "She decided to move to Belgium.",
                "example": "ወደ ቤልጂየም ለመሄድ ወሰነች። -> She decided to move to Belgium.",
                "level": "building"
            },
            {
                "word": "አንቺ በጣም ቆንጆ ነሽ።",
                "meaning": "You are very beautiful.",
                "example": "አንቺ በጣም ቆንጆ ነሽ። -> You are very beautiful.",
                "level": "starter"
            },
            {
                "word": "ድመቶቹ ዓለሙን እየገዛ ነው።",
                "meaning": "Cats rule the world.",
                "example": "ድመቶቹ ዓለሙን እየገዛ ነው። -> Cats rule the world.",
                "level": "starter"
            },
            {
                "word": "ሆቴሉ እዚያ ነው።",
                "meaning": "The hotel is over there.",
                "example": "ሆቴሉ እዚያ ነው። -> The hotel is over there.",
                "level": "building"
            },
            {
                "word": "ቅርብ ነው።",
                "meaning": "It's nearby.",
                "example": "ቅርብ ነው። -> It's nearby.",
                "level": "starter"
            },
            {
                "word": "ወደፊት ይህዱና ወደ ግራ ይዙሩ።",
                "meaning": "Go straight ahead and turn to the left.",
                "example": "ወደፊት ይህዱና ወደ ግራ ይዙሩ። -> Go straight ahead and turn to the left.",
                "level": "confident"
            },
            {
                "word": "በስተግራዎ ነው።",
                "meaning": "It's on your left.",
                "example": "በስተግራዎ ነው። -> It's on your left.",
                "level": "starter"
            },
            {
                "word": "ያሜሪካን ኤምባሲ በስተቀኝዎ ነው።",
                "meaning": "The American Embassy is on your right.",
                "example": "ያሜሪካን ኤምባሲ በስተቀኝዎ ነው። -> The American Embassy is on your right.",
                "level": "building"
            },
            {
                "word": "በጣም ጥሩ ነው።",
                "meaning": "It's very good.",
                "example": "በጣም ጥሩ ነው። -> It's very good.",
                "level": "starter"
            },
            {
                "word": "ልክ ነው።",
                "meaning": "It's correct.",
                "example": "ልክ ነው። -> It's correct.",
                "level": "starter"
            },
            {
                "word": "ልክ አይደለም።",
                "meaning": "It's not correct.",
                "example": "ልክ አይደለም። -> It's not correct.",
                "level": "starter"
            },
            {
                "word": "እግዚአብሔር ይመስገን።",
                "meaning": "Thank you!",
                "example": "እግዚአብሔር ይመስገን። -> Thank you!",
                "level": "starter"
            },
            {
                "word": "እቤት ቆዪ።",
                "meaning": "Stay at home.",
                "example": "እቤት ቆዪ። -> Stay at home.",
                "level": "starter"
            },
            {
                "word": "እንኳን ለአለም አቀፍ የሴቶች ቀን አደረሰን",
                "meaning": "Happy International Women's Day!",
                "example": "እንኳን ለአለም አቀፍ የሴቶች ቀን አደረሰን -> Happy International Women's Day!",
                "level": "starter"
            }
        ]
    }
};

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
        const key = `${card.word}::${card.meaning}`;
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

const PRACTICE_SCENARIOS = [
    {
        id: "hotel_checkin",
        title: "Checking into a Hotel",
        description: "Practice asking for room keys and clarifying check-out times.",
        aiRole: "Act as a busy hotel receptionist in London.",
        initialMessage: "Hello, welcome to the Grand Plaza. Do you have a reservation under your name?",
        difficulty: "Intermediate"
    },
    {
        id: "restaurant_ordering",
        title: "Ordering at a Restaurant",
        description: "Practice ordering food, asking about ingredients, and requesting special modifications.",
        aiRole: "Act as a friendly waiter in a Parisian café.",
        initialMessage: "Good evening! Welcome to our restaurant. Have you dined with us before?",
        difficulty: "Beginner"
    },
    {
        id: "airport_checkin",
        title: "Airport Check-in",
        description: "Practice checking in at the airport, managing luggage, and understanding boarding procedures.",
        aiRole: "Act as a professional airline check-in agent at Heathrow Airport.",
        initialMessage: "Good morning! Welcome to our airline. I'll be checking you in today. May I see your passport and booking reference?",
        difficulty: "Intermediate"
    },
    {
        id: "doctor_appointment",
        title: "Doctor's Appointment",
        description: "Practice describing symptoms, understanding medical questions, and scheduling follow-ups.",
        aiRole: "Act as a caring doctor in a NHS clinic in Manchester.",
        initialMessage: "Hello, I'm Dr. Smith. What brings you in today? Please describe your symptoms.",
        difficulty: "Advanced"
    },
    {
        id: "job_interview",
        title: "Job Interview",
        description: "Practice answering interview questions, discussing experience, and asking about the role.",
        aiRole: "Act as a professional HR manager conducting an interview for a tech company.",
        initialMessage: "Thank you for coming in today. Tell me a bit about your background and why you're interested in this position.",
        difficulty: "Advanced"
    }
];

window.DATASET_VERSION = DATASET_VERSION;
window.DATASET_SOURCE = DATASET_SOURCE;
