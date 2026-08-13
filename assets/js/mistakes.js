/* =========================================================
   PTE TRAINER - MISTAKE BANK
   USER-SPECIFIC STORAGE
========================================================= */


/* =========================================================
   REQUIRED CORRECT STREAK
========================================================= */

const REQUIRED_CORRECT_STREAK = 3;


/* =========================================================
   GET CURRENT USER STORAGE KEY
========================================================= */

function getUserStorageKey(baseKey) {

    if (
        typeof getCurrentUser !==
        "function"
    ) {

        return baseKey;

    }


    const username =
        getCurrentUser();


    if (!username) {

        return baseKey;

    }


    return (
        baseKey +
        "::" +
        username
    );

}


/* =========================================================
   WFD KEY
========================================================= */

function getWFDMistakeStorageKey() {

    return getUserStorageKey(
        "pte_wfd_mistake_bank"
    );

}


/* =========================================================
   LFIB KEY
========================================================= */

function getLFIBMistakeStorageKey() {

    return getUserStorageKey(
        "pte_lfib_mistake_bank"
    );

}


/* =========================================================
   GENERIC BANK LOADER
========================================================= */

function loadMistakeBank(storageKey) {

    try {

        const saved =
            localStorage.getItem(
                storageKey
            );


        if (!saved) {

            return {};

        }


        const bank =
            JSON.parse(
                saved
            );


        Object.values(bank).forEach(
            item => {

                if (
                    typeof item.correctStreak !==
                    "number"
                ) {

                    item.correctStreak = 0;

                }


                if (
                    typeof item.mistakes !==
                    "number"
                ) {

                    item.mistakes = 0;

                }


                if (
                    typeof item.correct !==
                    "number"
                ) {

                    item.correct = 0;

                }

            }
        );


        return bank;

    } catch (error) {

        console.error(
            "Could not load mistake bank:",
            error
        );

        return {};

    }

}


/* =========================================================
   GENERIC BANK SAVER
========================================================= */

function saveMistakeBank(
    storageKey,
    bank
) {

    localStorage.setItem(
        storageKey,
        JSON.stringify(
            bank
        )
    );

}


/* =========================================================
   RECORD MISTAKE
========================================================= */

function recordMistake(
    storageKey,
    word
) {

    const cleanWord =
        String(word || "")
            .toLowerCase()
            .trim();


    if (!cleanWord) {

        return;

    }


    const bank =
        loadMistakeBank(
            storageKey
        );


    if (!bank[cleanWord]) {

        bank[cleanWord] = {

            word:
                cleanWord,

            mistakes:
                0,

            correct:
                0,

            correctStreak:
                0,

            lastMistake:
                null,

            lastCorrect:
                null

        };

    }


    bank[cleanWord].mistakes++;

    bank[cleanWord].correctStreak = 0;

    bank[cleanWord].lastMistake =
        new Date().toISOString();


    saveMistakeBank(
        storageKey,
        bank
    );

}


/* =========================================================
   RECORD CORRECT
========================================================= */

function recordCorrect(
    storageKey,
    word
) {

    const cleanWord =
        String(word || "")
            .toLowerCase()
            .trim();


    if (!cleanWord) {

        return;

    }


    const bank =
        loadMistakeBank(
            storageKey
        );


    /*
        Only words that already exist
        in the mistake bank should
        receive correct history.
    */

    if (!bank[cleanWord]) {

        return;

    }


    bank[cleanWord].correct++;

    bank[cleanWord].correctStreak++;

    bank[cleanWord].lastCorrect =
        new Date().toISOString();


    saveMistakeBank(
        storageKey,
        bank
    );

}


/* =========================================================
   RECORD REVIEW RESULT
========================================================= */

function recordReview(
    storageKey,
    word,
    isCorrect
) {

    const cleanWord =
        String(word || "")
            .toLowerCase()
            .trim();


    if (!cleanWord) {

        return;

    }


    const bank =
        loadMistakeBank(
            storageKey
        );


    if (!bank[cleanWord]) {

        bank[cleanWord] = {

            word:
                cleanWord,

            mistakes:
                0,

            correct:
                0,

            correctStreak:
                0,

            lastMistake:
                null,

            lastCorrect:
                null

        };

    }


    if (isCorrect) {

        bank[cleanWord].correct++;

        bank[cleanWord].correctStreak++;

        bank[cleanWord].lastCorrect =
            new Date().toISOString();

    } else {

        bank[cleanWord].mistakes++;

        bank[cleanWord].correctStreak = 0;

        bank[cleanWord].lastMistake =
            new Date().toISOString();

    }


    saveMistakeBank(
        storageKey,
        bank
    );

}


/* =========================================================
   WFD
========================================================= */

function getMistakeBank() {

    return loadMistakeBank(
        getWFDMistakeStorageKey()
    );

}


function recordWordMistake(word) {

    recordMistake(
        getWFDMistakeStorageKey(),
        word
    );

}


function recordWordCorrect(word) {

    recordCorrect(
        getWFDMistakeStorageKey(),
        word
    );

}


function recordReviewResult(
    word,
    isCorrect
) {

    recordReview(
        getWFDMistakeStorageKey(),
        word,
        isCorrect
    );

}


function getAllMistakes() {

    const bank =
        getMistakeBank();


    return Object.values(bank)
        .sort(
            (
                a,
                b
            ) => {

                if (
                    b.mistakes !==
                    a.mistakes
                ) {

                    return (
                        b.mistakes -
                        a.mistakes
                    );

                }


                return (
                    new Date(
                        b.lastMistake || 0
                    ) -
                    new Date(
                        a.lastMistake || 0
                    )
                );

            }
        );

}


function getWeakWords() {

    const bank =
        getMistakeBank();


    return Object.values(bank)
        .filter(
            item =>
                item.correctStreak <
                REQUIRED_CORRECT_STREAK
        )
        .sort(
            (
                a,
                b
            ) => {

                if (
                    b.mistakes !==
                    a.mistakes
                ) {

                    return (
                        b.mistakes -
                        a.mistakes
                    );

                }


                return (
                    a.correctStreak -
                    b.correctStreak
                );

            }
        );

}


function clearMistakeBank() {

    localStorage.removeItem(
        getWFDMistakeStorageKey()
    );

}


/* =========================================================
   LFIB
========================================================= */

function getLFIBMistakeBank() {

    return loadMistakeBank(
        getLFIBMistakeStorageKey()
    );

}


function recordLFIBMistake(word) {

    recordMistake(
        getLFIBMistakeStorageKey(),
        word
    );

}


function recordLFIBCorrect(word) {

    recordCorrect(
        getLFIBMistakeStorageKey(),
        word
    );

}


function recordLFIBReviewResult(
    word,
    isCorrect
) {

    recordReview(
        getLFIBMistakeStorageKey(),
        word,
        isCorrect
    );

}


function getAllLFIBMistakes() {

    const bank =
        getLFIBMistakeBank();


    return Object.values(bank)
        .sort(
            (
                a,
                b
            ) => {

                if (
                    b.mistakes !==
                    a.mistakes
                ) {

                    return (
                        b.mistakes -
                        a.mistakes
                    );

                }


                return (
                    new Date(
                        b.lastMistake || 0
                    ) -
                    new Date(
                        a.lastMistake || 0
                    )
                );

            }
        );

}


function getWeakLFIBWords() {

    const bank =
        getLFIBMistakeBank();


    return Object.values(bank)
        .filter(
            item =>
                item.correctStreak <
                REQUIRED_CORRECT_STREAK
        )
        .sort(
            (
                a,
                b
            ) => {

                if (
                    b.mistakes !==
                    a.mistakes
                ) {

                    return (
                        b.mistakes -
                        a.mistakes
                    );

                }


                return (
                    a.correctStreak -
                    b.correctStreak
                );

            }
        );

}


function clearLFIBMistakeBank() {

    localStorage.removeItem(
        getLFIBMistakeStorageKey()
    );

}