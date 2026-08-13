/* =========================================================
   LFIB PRACTICE ENGINE
========================================================= */

let currentLFIB = 0;

let lfibTotalScore = 0;

let lfibAudioTimer = null;

let lfibAnswerTimer = null;

let lfibAudioSeconds = 0;

let lfibAnswerSeconds = 0;

let lfibAudioFinished = false;

let lfibPracticeMode =
    "sequential";

let lfibQuestionQueue = [];

let lfibQueuePosition = 0;


/* =========================================================
   USER-SPECIFIC PROGRESS KEY
========================================================= */

function getLFIBProgressKey() {

    if (
        typeof getUserStorageKey ===
        "function"
    ) {

        return getUserStorageKey(
            "pte_lfib_progress"
        );

    }


    return "pte_lfib_progress";

}


/* =========================================================
   START
========================================================= */

function startLFIBPractice(
    mode = lfibPracticeMode,
    options = {}
) {

    lfibPracticeMode =
        mode;

    currentLFIB =
        0;

    lfibTotalScore =
        0;

    lfibQueuePosition =
        0;


    if (
        !options.forceNew &&
        mode !== "mistake" &&
        hasSavedLFIBProgress()
    ) {

        showLFIBResumeScreen();

        return;

    }


    createLFIBQuestionQueue();


    if (
        lfibQuestionQueue.length ===
        0
    ) {

        showNoLFIBQuestions();

        return;

    }


    saveLFIBProgress();

    showLFIBQuestion();

}


/* =========================================================
   CREATE QUEUE
========================================================= */

function createLFIBQuestionQueue() {

    lfibQuestionQueue =
        lfibQuestions.map(
            question => ({

                question:
                    question,

                focusWord:
                    null

            })
        );


    if (
        lfibPracticeMode ===
        "random"
    ) {

        shuffleLFIBQueue();

    }

}


/* =========================================================
   SHUFFLE
========================================================= */

function shuffleLFIBQueue() {

    for (
        let i =
            lfibQuestionQueue.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            lfibQuestionQueue[i],
            lfibQuestionQueue[j]
        ] =
        [
            lfibQuestionQueue[j],
            lfibQuestionQueue[i]
        ];

    }

}


/* =========================================================
   CHANGE MODE
========================================================= */

function changeLFIBPracticeMode(
    mode
) {

    clearLFIBProgress();

    lfibPracticeMode =
        mode;


    startLFIBPractice(
        mode,
        {
            forceNew:
                true
        }
    );

}


/* =========================================================
   BACK
========================================================= */

function backToListeningFromLFIB() {

    window.speechSynthesis.cancel();

    clearLFIBTimers();


    location.href =
        "practice.html?module=listening";

}


/* =========================================================
   PROGRESS
========================================================= */

function hasSavedLFIBProgress() {

    return (
        localStorage.getItem(
            getLFIBProgressKey()
        ) !==
        null
    );

}


function getSavedLFIBProgress() {

    try {

        const saved =
            localStorage.getItem(
                getLFIBProgressKey()
            );


        if (!saved) {

            return null;

        }


        return JSON.parse(
            saved
        );

    } catch (error) {

        console.error(
            "Could not load LFIB progress:",
            error
        );

        return null;

    }

}


function saveLFIBProgress() {

    if (
        lfibPracticeMode ===
        "mistake"
    ) {

        return;

    }


    if (
        !lfibQuestionQueue.length ||
        !lfibQuestionQueue[
            lfibQueuePosition
        ]
    ) {

        return;

    }


    const currentQuestion =
        lfibQuestionQueue[
            lfibQueuePosition
        ];


    const progress = {

        questionId:
            currentQuestion.question.id,

        queueIds:
            lfibQuestionQueue.map(
                item =>
                    item.question.id
            ),

        queuePosition:
            lfibQueuePosition,

        mode:
            lfibPracticeMode,

        savedAt:
            new Date().toISOString()

    };


    localStorage.setItem(
        getLFIBProgressKey(),
        JSON.stringify(
            progress
        )
    );

}


function clearLFIBProgress() {

    localStorage.removeItem(
        getLFIBProgressKey()
    );

}


/* =========================================================
   RESUME
========================================================= */

function resumeLFIBProgress() {

    const saved =
        getSavedLFIBProgress();


    if (!saved) {

        startLFIBFromBeginning();

        return;

    }


    lfibPracticeMode =
        saved.mode ||
        "sequential";


    const savedQueue =
        saved.queueIds
            .map(
                id => {

                    const question =
                        lfibQuestions.find(
                            item =>
                                item.id ===
                                id
                        );


                    if (!question) {

                        return null;

                    }


                    return {

                        question:
                            question,

                        focusWord:
                            null

                    };

                }
            )
            .filter(
                Boolean
            );


    if (
        savedQueue.length ===
        0
    ) {

        startLFIBFromBeginning();

        return;

    }


    lfibQuestionQueue =
        savedQueue;


    lfibQueuePosition =
        Math.min(
            saved.queuePosition,
            lfibQuestionQueue.length - 1
        );


    currentLFIB =
        lfibQuestions.indexOf(
            lfibQuestionQueue[
                lfibQueuePosition
            ].question
        );


    showLFIBQuestion();

}


/* =========================================================
   START FROM BEGINNING
========================================================= */

function startLFIBFromBeginning() {

    clearLFIBProgress();


    lfibPracticeMode =
        "sequential";


    startLFIBPractice(
        "sequential",
        {
            forceNew:
                true
        }
    );

}


/* =========================================================
   START FROM QUESTION
========================================================= */

function startLFIBFromQuestion(
    questionId
) {

    const index =
        lfibQuestions.findIndex(
            question =>
                question.id ===
                Number(
                    questionId
                )
        );


    if (
        index === -1
    ) {

        return;

    }


    clearLFIBProgress();


    lfibPracticeMode =
        "sequential";


    lfibQuestionQueue =
        lfibQuestions
            .slice(index)
            .map(
                question => ({

                    question:
                        question,

                    focusWord:
                        null

                })
            );


    lfibQueuePosition =
        0;

    currentLFIB =
        index;

    lfibTotalScore =
        0;


    saveLFIBProgress();

    showLFIBQuestion();

}


/* =========================================================
   SEARCH
========================================================= */

function searchLFIBQuestions(
    inputId
) {

    const input =
        document.getElementById(
            inputId
        );


    const results =
        document.getElementById(
            "lfib-search-results"
        );


    if (
        !input ||
        !results
    ) {

        return;

    }


    const query =
        input.value
            .trim()
            .toLowerCase();


    if (!query) {

        results.innerHTML = `

            <div class="search-empty">

                Enter a question number
                or a word.

            </div>

        `;

        return;

    }


    const numericQuery =
        Number(
            query
        );


    const matches =
        lfibQuestions.filter(
            question => {

                if (
                    Number.isInteger(
                        numericQuery
                    ) &&
                    question.id ===
                    numericQuery
                ) {

                    return true;

                }


                return question.text
                    .toLowerCase()
                    .includes(
                        query
                    );

            }
        );


    if (
        matches.length ===
        0
    ) {

        results.innerHTML = `

            <div class="search-empty">

                No questions found.

            </div>

        `;

        return;

    }


    results.innerHTML =
        matches
            .slice(
                0,
                20
            )
            .map(
                question => `

                    <button
                        class="
                            search-result-item
                        "
                        onclick="
                            startLFIBFromQuestion(
                                ${question.id}
                            )
                        "
                    >

                        <span
                            class="result-number"
                        >

                            #${question.id}

                        </span>


                        <span
                            class="result-text"
                        >

                            ${question.text}

                        </span>


                        <span
                            class="result-arrow"
                        >

                            →

                        </span>

                    </button>

                `
            )
            .join("");

}


/* =========================================================
   RESUME SCREEN
========================================================= */

function showLFIBResumeScreen() {

    const saved =
        getSavedLFIBProgress();


    if (!saved) {

        startLFIBFromBeginning();

        return;

    }


    const content =
        document.getElementById(
            "content"
        );


    content.innerHTML = `

        <div class="wfd-box">

            <div class="question-number">

                Last Progress

            </div>


            <h2>

                Welcome Back

            </h2>


            <p>

                You previously practiced up to

                <strong>
                    Question ${saved.questionId}
                </strong>.

            </p>


            <div class="resume-box">

                <div class="resume-info">

                    <strong>

                        Question
                        ${saved.questionId}

                    </strong>


                    <span>

                        ${
                            saved.mode ===
                            "random"
                                ? "Random Mode"
                                : "Sequential Mode"
                        }

                    </span>

                </div>


                <p>

                    Do you want to continue
                    from where you stopped?

                </p>

            </div>


            <div class="resume-buttons">

                <button
                    class="resume-continue"
                    onclick="
                        resumeLFIBProgress()
                    "
                >

                    ▶ Continue

                </button>


                <button
                    class="resume-new"
                    onclick="
                        startLFIBFromBeginning()
                    "
                >

                    ↻ Start From Beginning

                </button>

            </div>


            <div class="search-section">

                <div class="search-title">

                    🔎 Find a Question

                </div>


                <div class="search-row">

                    <input
                        id="lfib-search-start"
                        type="text"
                        placeholder="
                            Question number or word...
                        "
                    >


                    <button
                        onclick="
                            searchLFIBQuestions(
                                'lfib-search-start'
                            )
                        "
                    >

                        Search

                    </button>

                </div>


                <div
                    id="lfib-search-results"
                    class="search-results"
                ></div>

            </div>


            <button
                class="back-button full-back"
                onclick="
                    backToListeningFromLFIB()
                "
            >

                ← Back to Listening

            </button>

        </div>

    `;

}


/* =========================================================
   SHOW QUESTION
========================================================= */

function showLFIBQuestion() {

    clearLFIBTimers();


    lfibAudioSeconds =
        0;

    lfibAnswerSeconds =
        0;

    lfibAudioFinished =
        false;


    const task =
        lfibQuestionQueue[
            lfibQueuePosition
        ];


    if (!task) {

        finishLFIB();

        return;

    }


    saveLFIBProgress();


    if (
        lfibPracticeMode ===
        "mistake"
    ) {

        showLFIBMistakeReviewQuestion();

        return;

    }


    const question =
        task.question;


    currentLFIB =
        lfibQuestions.indexOf(
            question
        );


    const content =
        document.getElementById(
            "content"
        );


    content.innerHTML = `

        <div class="mistake-panel">

            <div class="mistake-header">

                <div>

                    <span>
                        📝 LFIB Mistakes
                    </span>


                    <div
                        id="lfib-mistake-summary"
                        class="mistake-summary"
                    >

                        Loading...

                    </div>

                </div>


                <button
                    class="mistake-review-btn"
                    onclick="
                        location.href='mistakes.html'
                    "
                >

                    View Mistakes →

                </button>

            </div>

        </div>


        <div class="wfd-box lfib-page">

            <div class="search-section">

                <div class="search-title">

                    🔎 Find a Question

                </div>


                <div class="search-row">

                    <input
                        id="lfib-search-question"
                        type="text"
                        placeholder="
                            Question number or word...
                        "
                    >


                    <button
                        onclick="
                            searchLFIBQuestions(
                                'lfib-search-question'
                            )
                        "
                    >

                        Search

                    </button>

                </div>


                <div
                    id="lfib-search-results"
                    class="search-results"
                ></div>

            </div>


            <div class="mode-selector">

                <div class="mode-title">

                    Practice Mode

                </div>


                <div class="mode-buttons">

                    <button
                        class="
                            mode-btn
                            ${
                                lfibPracticeMode ===
                                "sequential"
                                    ? "active"
                                    : ""
                            }
                        "
                        onclick="
                            changeLFIBPracticeMode(
                                'sequential'
                            )
                        "
                    >

                        Sequential

                    </button>


                    <button
                        class="
                            mode-btn
                            ${
                                lfibPracticeMode ===
                                "random"
                                    ? "active"
                                    : ""
                            }
                        "
                        onclick="
                            changeLFIBPracticeMode(
                                'random'
                            )
                        "
                    >

                        Random

                    </button>

                </div>

            </div>


            <div class="question-number">

                Question #${question.id}

                <span>

                    ·
                    ${lfibQueuePosition + 1}
                    /
                    ${lfibQuestionQueue.length}

                </span>

            </div>


            <h2>

                Listening Fill in the Blanks

            </h2>


            <p>

                Listen carefully and type
                the missing words.

            </p>


            <div id="lfib-status">

                Preparing audio...

            </div>


            <div class="timers">

                <div id="lfib-audio-time">

                    🔊 Audio Time: 0s

                </div>


                <div id="lfib-answer-time">

                    ✍️ Answer Time: 0s

                </div>

            </div>


            <textarea
                id="lfib-answer"
                class="lfib-answer-box"
                placeholder="
                    Please listen first...
                "
                rows="6"
                disabled>
            </textarea>


            <div class="wfd-action-row">

                <button
                    class="back-button"
                    onclick="
                        backToListeningFromLFIB()
                    "
                >

                    ← Back to Listening

                </button>


                <button
                    id="lfib-check-btn"
                    class="check-button"
                    onclick="
                        checkLFIB()
                    "
                    disabled
                >

                    Check Answer

                </button>


                <button
                    id="lfib-next-btn"
                    class="next-button"
                    onclick="
                        nextLFIB()
                    "
                    disabled
                >

                    Next Question →

                </button>

            </div>


            <div
                id="lfib-feedback"
            ></div>

        </div>

    `;


    displayLFIBMistakeSummary();


    setTimeout(
        () => {

            playLFIB();

        },
        3000
    );

}


/* =========================================================
   PLAY AUDIO
========================================================= */

function playLFIB() {

    clearLFIBTimers();


    const task =
        lfibQuestionQueue[
            lfibQueuePosition
        ];


    const question =
        task.question;


    const status =
        document.getElementById(
            "lfib-status"
        );


    const audioTime =
        document.getElementById(
            "lfib-audio-time"
        );


    const answerTime =
        document.getElementById(
            "lfib-answer-time"
        );


    const textarea =
        document.getElementById(
            "lfib-answer"
        );


    const checkButton =
        document.getElementById(
            "lfib-check-btn"
        );


    const nextButton =
        document.getElementById(
            "lfib-next-btn"
        );


    if (
        !status ||
        !audioTime ||
        !answerTime ||
        !textarea ||
        !checkButton ||
        !nextButton
    ) {

        return;

    }


    lfibAudioSeconds =
        0;

    lfibAnswerSeconds =
        0;

    lfibAudioFinished =
        false;


    textarea.disabled =
        true;

    checkButton.disabled =
        true;

    nextButton.disabled =
        true;


    status.textContent =
        "🔊 Playing audio...";


    audioTime.textContent =
        "🔊 Audio Time: 0s";


    answerTime.textContent =
        "✍️ Answer Time: 0s";


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            question.text
        );


    speech.lang =
        "en-US";


    speech.rate =
        0.85;


    speech.pitch =
        1;


    lfibAudioTimer =
        setInterval(
            () => {

                lfibAudioSeconds++;


                audioTime.textContent =
                    `🔊 Audio Time: ${lfibAudioSeconds}s`;

            },
            1000
        );


    speech.onend =
        () => {

            clearInterval(
                lfibAudioTimer
            );


            lfibAudioTimer =
                null;


            lfibAudioFinished =
                true;


            status.textContent =
                "✍️ Type the missing words";


            textarea.disabled =
                false;

            checkButton.disabled =
                false;

            nextButton.disabled =
                false;


            textarea.placeholder =
                "Type the missing words...";


            textarea.focus();


            startLFIBAnswerTimer();

        };


    window.speechSynthesis.speak(
        speech
    );

}


/* =========================================================
   ANSWER TIMER
========================================================= */

function startLFIBAnswerTimer() {

    clearInterval(
        lfibAnswerTimer
    );


    lfibAnswerSeconds =
        0;


    const answerTime =
        document.getElementById(
            "lfib-answer-time"
        );


    if (!answerTime) {

        return;

    }


    answerTime.textContent =
        "✍️ Answer Time: 0s";


    lfibAnswerTimer =
        setInterval(
            () => {

                lfibAnswerSeconds++;


                answerTime.textContent =
                    `✍️ Answer Time: ${lfibAnswerSeconds}s`;

            },
            1000
        );

}


/* =========================================================
   CHECK LFIB
========================================================= */

function checkLFIB() {

    if (
        !lfibAudioFinished
    ) {

        return;

    }


    clearInterval(
        lfibAnswerTimer
    );


    lfibAnswerTimer =
        null;


    if (
        lfibPracticeMode ===
        "mistake"
    ) {

        checkLFIBMistake();

        return;

    }


    const textarea =
        document.getElementById(
            "lfib-answer"
        );


    const feedback =
        document.getElementById(
            "lfib-feedback"
        );


    const task =
        lfibQuestionQueue[
            lfibQueuePosition
        ];


    const expected =
        task.question.answer
            .map(
                word =>
                    normalizeLFIBWord(
                        word
                    )
            );


    const userWords =
        normalizeLFIBWords(
            textarea.value
        );


    const remainingUserWords =
        [...userWords];


    let correct =
        0;


    const correctWords =
        [];


    const missingWords =
        [];


    expected.forEach(
        word => {

            const index =
                remainingUserWords.indexOf(
                    word
                );


            if (
                index !==
                -1
            ) {

                correct++;

                correctWords.push(
                    word
                );


                remainingUserWords.splice(
                    index,
                    1
                );

            } else {

                missingWords.push(
                    word
                );

            }

        }
    );


    /*
        Only wrong words that
        the user actually typed
        are stored.
    */

    const wrongWords =
        [];


    const wrongCount =
        Math.min(
            remainingUserWords.length,
            missingWords.length
        );


    for (
        let i = 0;
        i < wrongCount;
        i++
    ) {

        wrongWords.push(
            missingWords[i]
        );

    }


    wrongWords.forEach(
        word => {

            if (
                typeof recordLFIBMistake ===
                "function"
            ) {

                recordLFIBMistake(
                    word
                );

            }

        }
    );


    correctWords.forEach(
        word => {

            if (
                typeof recordLFIBCorrect ===
                "function"
            ) {

                recordLFIBCorrect(
                    word
                );

            }

        }
    );


    const total =
        expected.length;


    const percent =
        total > 0
            ? Math.round(
                (
                    correct /
                    total
                ) * 100
            )
            : 0;


    lfibTotalScore +=
        percent;


    feedback.innerHTML = `

        <div class="score">

            <div class="score-line">

                <strong>

                    Score:
                    ${percent}%

                </strong>


                <span
                    class="score-separator"
                >
                    •
                </span>


                <span>

                    ${correct}/${total}
                    blanks correct

                </span>

            </div>

        </div>


        <div class="word-result">

            ${expected
                .map(
                    word =>
                        correctWords.includes(
                            word
                        )
                            ? `
                                <span
                                    class="
                                        correct-word
                                    "
                                >
                                    ${word}
                                </span>
                            `
                            : `
                                <span
                                    class="
                                        wrong-word
                                    "
                                >
                                    ${word}
                                </span>
                            `
                )
                .join("")
            }

        </div>

    `;


    textarea.disabled =
        true;


    document.getElementById(
        "lfib-check-btn"
    ).disabled =
        true;


    document.getElementById(
        "lfib-next-btn"
    ).disabled =
        false;


    displayLFIBMistakeSummary();

}


/* =========================================================
   REVIEW QUESTION
========================================================= */

function showLFIBMistakeReviewQuestion() {

    clearLFIBTimers();


    const task =
        lfibQuestionQueue[
            lfibQueuePosition
        ];


    const content =
        document.getElementById(
            "content"
        );


    content.innerHTML = `

        <div class="mistake-panel">

            <div class="mistake-header">

                <span>

                    🔴 LFIB Mistake Review

                </span>


                <span>

                    ${lfibQueuePosition + 1}
                    /
                    ${lfibQuestionQueue.length}

                </span>

            </div>

        </div>


        <div class="wfd-box lfib-page">

            <div class="question-number">

                Review Word

            </div>


            <h2>

                Listen carefully

            </h2>


            <p>

                Type the word you hear.

            </p>


            <div id="lfib-status">

                Preparing audio...

            </div>


            <div class="timers">

                <div id="lfib-audio-time">

                    🔊 Audio Time: 0s

                </div>


                <div id="lfib-answer-time">

                    ✍️ Answer Time: 0s

                </div>

            </div>


            <textarea
                id="lfib-answer"
                class="lfib-answer-box"
                placeholder="
                    Please listen first...
                "
                rows="6"
                disabled>
            </textarea>


            <div class="wfd-action-row">

                <button
                    class="back-button"
                    onclick="
                        exitLFIBMistakeReview()
                    "
                >

                    ← Back to Listening

                </button>


                <button
                    id="lfib-check-btn"
                    class="check-button"
                    onclick="
                        checkLFIB()
                    "
                    disabled
                >

                    Check Word

                </button>


                <button
                    id="lfib-next-btn"
                    class="next-button"
                    onclick="
                        nextLFIB()
                    "
                    disabled
                >

                    Next Word →

                </button>

            </div>


            <div
                id="lfib-feedback"
            ></div>

        </div>

    `;


    setTimeout(
        () => {

            playLFIBMistakeWord();

        },
        3000
    );

}


/* =========================================================
   PLAY REVIEW WORD
========================================================= */

function playLFIBMistakeWord() {

    const task =
        lfibQuestionQueue[
            lfibQueuePosition
        ];


    playLFIBSpeech(
        task.focusWord
    );

}


/* =========================================================
   SPEAK REVIEW WORD
========================================================= */

function playLFIBSpeech(
    text
) {

    clearLFIBTimers();


    const status =
        document.getElementById(
            "lfib-status"
        );


    const audioTime =
        document.getElementById(
            "lfib-audio-time"
        );


    const answerTime =
        document.getElementById(
            "lfib-answer-time"
        );


    const textarea =
        document.getElementById(
            "lfib-answer"
        );


    const checkButton =
        document.getElementById(
            "lfib-check-btn"
        );


    const nextButton =
        document.getElementById(
            "lfib-next-btn"
        );


    if (
        !status ||
        !audioTime ||
        !answerTime ||
        !textarea ||
        !checkButton ||
        !nextButton
    ) {

        return;

    }


    lfibAudioSeconds =
        0;

    lfibAnswerSeconds =
        0;

    lfibAudioFinished =
        false;


    textarea.disabled =
        true;

    checkButton.disabled =
        true;

    nextButton.disabled =
        true;


    status.textContent =
        "🔊 Playing target word...";


    audioTime.textContent =
        "🔊 Audio Time: 0s";


    answerTime.textContent =
        "✍️ Answer Time: 0s";


    window.speechSynthesis.cancel();


    const speech =
        new SpeechSynthesisUtterance(
            text
        );


    speech.lang =
        "en-US";


    speech.rate =
        0.8;


    speech.pitch =
        1;


    lfibAudioTimer =
        setInterval(
            () => {

                lfibAudioSeconds++;


                audioTime.textContent =
                    `🔊 Audio Time: ${lfibAudioSeconds}s`;

            },
            1000
        );


    speech.onend =
        () => {

            clearInterval(
                lfibAudioTimer
            );


            lfibAudioTimer =
                null;


            lfibAudioFinished =
                true;


            status.textContent =
                "✍️ Type the word";


            textarea.disabled =
                false;

            checkButton.disabled =
                false;

            nextButton.disabled =
                false;


            textarea.placeholder =
                "Type the word you heard...";


            textarea.focus();


            startLFIBAnswerTimer();

        };


    window.speechSynthesis.speak(
        speech
    );

}


/* =========================================================
   CHECK REVIEW WORD
========================================================= */

function checkLFIBMistake() {

    const textarea =
        document.getElementById(
            "lfib-answer"
        );


    const feedback =
        document.getElementById(
            "lfib-feedback"
        );


    const userWord =
        normalizeLFIBWords(
            textarea.value
        )[0] ||
        "";


    const task =
        lfibQuestionQueue[
            lfibQueuePosition
        ];


    const targetWord =
        normalizeLFIBWord(
            task.focusWord
        );


    if (!userWord) {

        feedback.innerHTML = `

            <p class="error">

                Please type the word first.

            </p>

        `;


        startLFIBAnswerTimer();

        return;

    }


    const isCorrect =
        userWord ===
        targetWord;


    if (
        typeof recordLFIBReviewResult ===
        "function"
    ) {

        recordLFIBReviewResult(
            targetWord,
            isCorrect
        );

    }


    const bank =
        typeof getLFIBMistakeBank ===
        "function"
            ? getLFIBMistakeBank()
            : {};


    const updated =
        bank[targetWord] ||
        null;


    textarea.disabled =
        true;


    document.getElementById(
        "lfib-check-btn"
    ).disabled =
        true;


    document.getElementById(
        "lfib-next-btn"
    ).disabled =
        false;


    if (isCorrect) {

        feedback.innerHTML = `

            <div class="score">

                <div class="score-line">

                    <strong>

                        ✅ Correct

                    </strong>


                    <span
                        class="score-separator"
                    >
                        •
                    </span>


                    <span>

                        ${targetWord}

                    </span>

                </div>

            </div>


            <div class="no-mistakes">

                Great! You remembered
                <strong>
                    ${targetWord}
                </strong>.


                ${
                    updated
                        ? `

                            <br>

                            Correct:
                            ${updated.correct}

                            •

                            Streak:
                            ${updated.correctStreak}/3

                        `
                        : ""
                }

            </div>

        `;

    } else {

        feedback.innerHTML = `

            <div class="score">

                <div class="score-line">

                    <strong>

                        ❌ Not quite

                    </strong>


                    <span
                        class="score-separator"
                    >
                        •
                    </span>


                    <span>

                        Try again later

                    </span>

                </div>

            </div>


            <div class="error">

                You wrote:
                <strong>
                    ${userWord}
                </strong>


                <br>


                Correct word:
                <strong>
                    ${targetWord}
                </strong>

            </div>

        `;

    }

}


/* =========================================================
   START MISTAKE REVIEW
========================================================= */

function startLFIBMistakeReview() {

    const weak =
        typeof getWeakLFIBWords ===
        "function"
            ? getWeakLFIBWords()
            : [];


    if (
        weak.length ===
        0
    ) {

        alert(
            "You don't have any LFIB weak words yet."
        );

        return;

    }


    const reviewTasks =
        [];


    weak.forEach(
        item => {

            const targetWord =
                normalizeLFIBWord(
                    item.word
                );


            const matchingQuestion =
                lfibQuestions.find(
                    question =>
                        question.answer.some(
                            word =>
                                normalizeLFIBWord(
                                    word
                                ) ===
                                targetWord
                        )
                );


            if (
                matchingQuestion
            ) {

                reviewTasks.push({

                    question:
                        matchingQuestion,

                    focusWord:
                        targetWord

                });

            }

        }
    );


    if (
        reviewTasks.length ===
        0
    ) {

        alert(
            "No matching LFIB questions were found."
        );

        return;

    }


    lfibPracticeMode =
        "mistake";


    lfibTotalScore =
        0;

    lfibQueuePosition =
        0;


    lfibQuestionQueue =
        reviewTasks;


    showLFIBQuestion();

}


/* =========================================================
   EXIT REVIEW
========================================================= */

function exitLFIBMistakeReview() {

    window.speechSynthesis.cancel();

    clearLFIBTimers();


    location.href =
        "mistakes.html";

}


/* =========================================================
   NEXT
========================================================= */

function nextLFIB() {

    window.speechSynthesis.cancel();

    clearLFIBTimers();


    lfibQueuePosition++;


    if (
        lfibQueuePosition >=
        lfibQuestionQueue.length
    ) {

        finishLFIB();

        return;

    }


    saveLFIBProgress();

    showLFIBQuestion();

}


/* =========================================================
   FINISH
========================================================= */

function finishLFIB() {

    window.speechSynthesis.cancel();

    clearLFIBTimers();


    const reviewMode =
        lfibPracticeMode ===
        "mistake";


    if (!reviewMode) {

        clearLFIBProgress();

    }


    const averageScore =
        lfibQuestionQueue.length >
        0

            ? Math.round(
                lfibTotalScore /
                lfibQuestionQueue.length
            )

            : 0;


    document.getElementById(
        "content"
    ).innerHTML = `

        <div class="completed">

            <h2>

                ${
                    reviewMode
                        ? "🎯 LFIB Mistake Review Completed"
                        : "🎉 LFIB Completed"
                }

            </h2>


            ${
                reviewMode
                    ? ""
                    : `

                        <div class="final-score">

                            <h3>
                                Final Score
                            </h3>


                            <strong>
                                ${averageScore}%
                            </strong>

                        </div>

                    `
            }


            <p>

                You completed
                ${lfibQuestionQueue.length}

                ${
                    reviewMode
                        ? " review words."
                        : " questions."
                }

            </p>


            ${
                reviewMode
                    ? `

                        <button
                            onclick="
                                startLFIBMistakeReview()
                            "
                        >

                            Review Again

                        </button>

                    `
                    : ""
            }


            <button
                onclick="
                    location.href='mistakes.html'
                "
            >

                View My Mistakes

            </button>


            <button
                onclick="
                    startLFIBPractice(
                        'sequential',
                        {
                            forceNew:
                                true
                        }
                    )
                "
            >

                Start Sequential

            </button>


            <button
                onclick="
                    startLFIBPractice(
                        'random',
                        {
                            forceNew:
                                true
                        }
                    )
                "
            >

                Start Random

            </button>


            <button
                class="back-button"
                onclick="
                    backToListeningFromLFIB()
                "
            >

                ← Back to Listening

            </button>

        </div>

    `;

}


/* =========================================================
   NO QUESTIONS
========================================================= */

function showNoLFIBQuestions() {

    document.getElementById(
        "content"
    ).innerHTML = `

        <div class="completed">

            <h2>

                No LFIB Questions Available

            </h2>


            <p>

                The LFIB question bank
                is currently empty.

            </p>


            <button
                class="back-button"
                onclick="
                    backToListeningFromLFIB()
                "
            >

                ← Back to Listening

            </button>

        </div>

    `;

}


/* =========================================================
   MISTAKE SUMMARY
========================================================= */

function displayLFIBMistakeSummary() {

    const summary =
        document.getElementById(
            "lfib-mistake-summary"
        );


    if (!summary) {

        return;

    }


    if (
        typeof getAllLFIBMistakes !==
        "function" ||
        typeof getWeakLFIBWords !==
        "function"
    ) {

        summary.textContent =
            "Mistake Bank unavailable";

        return;

    }


    const mistakes =
        getAllLFIBMistakes();


    const weak =
        getWeakLFIBWords();


    const total =
        mistakes.reduce(
            (
                sum,
                item
            ) =>
                sum +
                item.mistakes,
            0
        );


    if (
        weak.length ===
        0
    ) {

        summary.textContent =
            "No weak words";

        return;

    }


    summary.textContent =
        `${weak.length} weak words • ${total} mistakes`;

}


/* =========================================================
   NORMALIZE
========================================================= */

function normalizeLFIBWord(
    word
) {

    return String(word || "")
        .toLowerCase()
        .replace(
            /[.,!?;:'"()[\]{}]/g,
            ""
        )
        .trim();

}


function normalizeLFIBWords(
    text
) {

    return String(text || "")
        .toLowerCase()
        .replace(
            /[.,!?;:'"()[\]{}]/g,
            ""
        )
        .split(/\s+/)
        .filter(Boolean);

}


/* =========================================================
   CLEAR TIMERS
========================================================= */

function clearLFIBTimers() {

    if (
        lfibAudioTimer
    ) {

        clearInterval(
            lfibAudioTimer
        );

        lfibAudioTimer =
            null;

    }


    if (
        lfibAnswerTimer
    ) {

        clearInterval(
            lfibAnswerTimer
        );

        lfibAnswerTimer =
            null;

    }

}