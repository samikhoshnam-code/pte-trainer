/* =========================================================
   WFD PRACTICE ENGINE
========================================================= */

let currentWFD = 0;

let wfdQuestionQueue = [];

let wfdQueuePosition = 0;

let wfdPracticeMode =
    "sequential";

let wfdAudioTimer = null;

let wfdAnswerTimer = null;

let wfdAudioSeconds = 0;

let wfdAnswerSeconds = 0;

let wfdAudioFinished = false;

let wfdTotalScore = 0;


/* =========================================================
   USER-SPECIFIC PROGRESS KEY
========================================================= */

function getWFDProgressKey() {

    if (
        typeof getUserStorageKey ===
        "function"
    ) {

        return getUserStorageKey(
            "pte_wfd_progress"
        );

    }


    return "pte_wfd_progress";

}


/* =========================================================
   START
========================================================= */

function startWFDPractice(
    mode = "sequential",
    options = {}
) {

    wfdPracticeMode =
        mode;

    currentWFD =
        0;

    wfdQueuePosition =
        0;

    wfdTotalScore =
        0;


    if (
        !options.forceNew &&
        mode !== "mistake" &&
        hasSavedWFDProgress()
    ) {

        showWFDResumeScreen();

        return;

    }


    createWFDQueue();


    if (
        wfdQuestionQueue.length ===
        0
    ) {

        showNoWFDQuestions();

        return;

    }


    saveWFDProgress();

    showWFDQuestion();

}


/* =========================================================
   CREATE QUEUE
========================================================= */

function createWFDQueue() {

    wfdQuestionQueue =
        wfdQuestions.map(
            question => ({

                question:
                    question,

                focusWord:
                    null

            })
        );


    if (
        wfdPracticeMode ===
        "random"
    ) {

        shuffleWFDQueue();

    }

}


/* =========================================================
   SHUFFLE
========================================================= */

function shuffleWFDQueue() {

    for (
        let i =
            wfdQuestionQueue.length - 1;

        i > 0;

        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            wfdQuestionQueue[i],
            wfdQuestionQueue[j]
        ] =
        [
            wfdQuestionQueue[j],
            wfdQuestionQueue[i]
        ];

    }

}


/* =========================================================
   CHANGE MODE
========================================================= */

function changeWFDPracticeMode(
    mode
) {

    clearWFDProgress();

    wfdPracticeMode =
        mode;


    startWFDPractice(
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

function backToListeningFromWFD() {

    window.speechSynthesis.cancel();

    clearWFDTimers();


    location.href =
        "practice.html?module=listening";

}


/* =========================================================
   PROGRESS
========================================================= */

function hasSavedWFDProgress() {

    return (
        localStorage.getItem(
            getWFDProgressKey()
        ) !==
        null
    );

}


function getSavedWFDProgress() {

    try {

        const saved =
            localStorage.getItem(
                getWFDProgressKey()
            );


        if (!saved) {

            return null;

        }


        return JSON.parse(
            saved
        );

    } catch (error) {

        console.error(
            "Could not load WFD progress:",
            error
        );

        return null;

    }

}


function saveWFDProgress() {

    if (
        wfdPracticeMode ===
        "mistake"
    ) {

        return;

    }


    if (
        !wfdQuestionQueue.length ||
        !wfdQuestionQueue[
            wfdQueuePosition
        ]
    ) {

        return;

    }


    const currentQuestion =
        wfdQuestionQueue[
            wfdQueuePosition
        ];


    const progress = {

        questionId:
            currentQuestion.question.id,

        queueIds:
            wfdQuestionQueue.map(
                item =>
                    item.question.id
            ),

        queuePosition:
            wfdQueuePosition,

        mode:
            wfdPracticeMode,

        savedAt:
            new Date().toISOString()

    };


    localStorage.setItem(
        getWFDProgressKey(),
        JSON.stringify(
            progress
        )
    );

}


function clearWFDProgress() {

    localStorage.removeItem(
        getWFDProgressKey()
    );

}


/* =========================================================
   RESUME
========================================================= */

function resumeWFDProgress() {

    const saved =
        getSavedWFDProgress();


    if (!saved) {

        startWFDFromBeginning();

        return;

    }


    wfdPracticeMode =
        saved.mode ||
        "sequential";


    const savedQueue =
        saved.queueIds
            .map(
                id => {

                    const question =
                        wfdQuestions.find(
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
        !savedQueue.length
    ) {

        startWFDFromBeginning();

        return;

    }


    wfdQuestionQueue =
        savedQueue;


    wfdQueuePosition =
        Math.min(
            saved.queuePosition,
            wfdQuestionQueue.length - 1
        );


    currentWFD =
        wfdQuestions.indexOf(
            wfdQuestionQueue[
                wfdQueuePosition
            ].question
        );


    showWFDQuestion();

}


/* =========================================================
   START FROM BEGINNING
========================================================= */

function startWFDFromBeginning() {

    clearWFDProgress();


    wfdPracticeMode =
        "sequential";


    startWFDPractice(
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

function startWFDFromQuestion(
    questionId
) {

    const index =
        wfdQuestions.findIndex(
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


    clearWFDProgress();


    wfdPracticeMode =
        "sequential";


    wfdQuestionQueue =
        wfdQuestions
            .slice(index)
            .map(
                question => ({

                    question:
                        question,

                    focusWord:
                        null

                })
            );


    wfdQueuePosition =
        0;

    currentWFD =
        index;

    wfdTotalScore =
        0;


    saveWFDProgress();

    showWFDQuestion();

}


/* =========================================================
   SEARCH
========================================================= */

function searchWFDQuestions(
    inputId
) {

    const input =
        document.getElementById(
            inputId
        );


    const results =
        document.getElementById(
            "wfd-search-results"
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
        wfdQuestions.filter(
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
                            startWFDFromQuestion(
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

function showWFDResumeScreen() {

    const saved =
        getSavedWFDProgress();


    if (!saved) {

        startWFDFromBeginning();

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
                        resumeWFDProgress()
                    "
                >

                    ▶ Continue

                </button>


                <button
                    class="resume-new"
                    onclick="
                        startWFDFromBeginning()
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
                        id="wfd-search-start"
                        type="text"
                        placeholder="
                            Question number or word...
                        "
                    >


                    <button
                        onclick="
                            searchWFDQuestions(
                                'wfd-search-start'
                            )
                        "
                    >

                        Search

                    </button>

                </div>


                <div
                    id="wfd-search-results"
                    class="search-results"
                ></div>

            </div>


            <button
                class="back-button full-back"
                onclick="
                    backToListeningFromWFD()
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

function showWFDQuestion() {

    clearWFDTimers();


    wfdAudioSeconds =
        0;

    wfdAnswerSeconds =
        0;

    wfdAudioFinished =
        false;


    const task =
        wfdQuestionQueue[
            wfdQueuePosition
        ];


    if (!task) {

        finishWFD();

        return;

    }


    saveWFDProgress();


    if (
        wfdPracticeMode ===
        "mistake"
    ) {

        showWFDMistakeReviewQuestion();

        return;

    }


    const question =
        task.question;


    currentWFD =
        wfdQuestions.indexOf(
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
                        🎧 WFD Mistakes
                    </span>


                    <div
                        id="wfd-mistake-summary"
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


        <div class="wfd-box">

            <div class="search-section">

                <div class="search-title">

                    🔎 Find a Question

                </div>


                <div class="search-row">

                    <input
                        id="wfd-search-question"
                        type="text"
                        placeholder="
                            Question number or word...
                        "
                    >


                    <button
                        onclick="
                            searchWFDQuestions(
                                'wfd-search-question'
                            )
                        "
                    >

                        Search

                    </button>

                </div>


                <div
                    id="wfd-search-results"
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
                                wfdPracticeMode ===
                                "sequential"
                                    ? "active"
                                    : ""
                            }
                        "
                        onclick="
                            changeWFDPracticeMode(
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
                                wfdPracticeMode ===
                                "random"
                                    ? "active"
                                    : ""
                            }
                        "
                        onclick="
                            changeWFDPracticeMode(
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
                    ${wfdQueuePosition + 1}
                    /
                    ${wfdQuestionQueue.length}

                </span>

            </div>


            <h2>

                WFD - Write From Dictation

            </h2>


            <p>

                Listen carefully and type
                what you hear.

            </p>


            <div id="wfd-status">

                Preparing audio...

            </div>


            <div class="timers">

                <div id="audio-time">

                    🔊 Audio Time: 0s

                </div>


                <div id="answer-time">

                    ✍️ Answer Time: 0s

                </div>

            </div>


            <textarea
                id="wfd-answer"
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
                        backToListeningFromWFD()
                    "
                >

                    ← Back to Listening

                </button>


                <button
                    id="wfd-check-btn"
                    class="check-button"
                    onclick="
                        checkWFD()
                    "
                    disabled
                >

                    Check Answer

                </button>


                <button
                    id="wfd-next-btn"
                    class="next-button"
                    onclick="
                        nextWFD()
                    "
                    disabled
                >

                    Next Question →

                </button>

            </div>


            <div
                id="wfd-feedback"
            ></div>

        </div>

    `;


    displayWFDMistakeSummary();


    setTimeout(
        () => {

            playWFD();

        },
        3000
    );

}


/* =========================================================
   PLAY AUDIO
========================================================= */

function playWFD() {

    clearWFDTimers();


    const task =
        wfdQuestionQueue[
            wfdQueuePosition
        ];


    const question =
        task.question;


    const status =
        document.getElementById(
            "wfd-status"
        );


    const audioTime =
        document.getElementById(
            "audio-time"
        );


    const answerTime =
        document.getElementById(
            "answer-time"
        );


    const textarea =
        document.getElementById(
            "wfd-answer"
        );


    const checkButton =
        document.getElementById(
            "wfd-check-btn"
        );


    const nextButton =
        document.getElementById(
            "wfd-next-btn"
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


    wfdAudioSeconds =
        0;

    wfdAnswerSeconds =
        0;

    wfdAudioFinished =
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


    wfdAudioTimer =
        setInterval(
            () => {

                wfdAudioSeconds++;


                audioTime.textContent =
                    `🔊 Audio Time: ${wfdAudioSeconds}s`;

            },
            1000
        );


    speech.onend =
        () => {

            clearInterval(
                wfdAudioTimer
            );


            wfdAudioTimer =
                null;


            wfdAudioFinished =
                true;


            status.textContent =
                "✍️ Type your answer";


            textarea.disabled =
                false;


            checkButton.disabled =
                false;


            nextButton.disabled =
                false;


            textarea.placeholder =
                "Type your answer...";


            textarea.focus();


            startWFDAnswerTimer();

        };


    window.speechSynthesis.speak(
        speech
    );

}


/* =========================================================
   ANSWER TIMER
========================================================= */

function startWFDAnswerTimer() {

    clearInterval(
        wfdAnswerTimer
    );


    wfdAnswerSeconds =
        0;


    const answerTime =
        document.getElementById(
            "answer-time"
        );


    if (!answerTime) {

        return;

    }


    answerTime.textContent =
        "✍️ Answer Time: 0s";


    wfdAnswerTimer =
        setInterval(
            () => {

                wfdAnswerSeconds++;


                answerTime.textContent =
                    `✍️ Answer Time: ${wfdAnswerSeconds}s`;

            },
            1000
        );

}


/* =========================================================
   CHECK WFD
========================================================= */

function checkWFD() {

    if (
        !wfdAudioFinished
    ) {

        return;

    }


    clearInterval(
        wfdAnswerTimer
    );


    wfdAnswerTimer =
        null;


    if (
        wfdPracticeMode ===
        "mistake"
    ) {

        checkWFDMistake();

        return;

    }


    const textarea =
        document.getElementById(
            "wfd-answer"
        );


    const feedback =
        document.getElementById(
            "wfd-feedback"
        );


    const task =
        wfdQuestionQueue[
            wfdQueuePosition
        ];


    const expectedWords =
        normalizeWFDWords(
            task.question.text
        );


    const userWords =
        normalizeWFDWords(
            textarea.value
        );


    const correctWords =
        [];


    expectedWords.forEach(
        word => {

            if (
                userWords.includes(
                    word
                )
            ) {

                correctWords.push(
                    word
                );

            }

        }
    );


    const correct =
        correctWords.length;


    const total =
        expectedWords.length;


    const percent =
        total > 0
            ? Math.round(
                (
                    correct /
                    total
                ) * 100
            )
            : 0;


    /*
        Only words that the user
        actually typed incorrectly
        are stored.
    */

    const wrongUserWords =
        userWords.filter(
            word =>
                !expectedWords.includes(
                    word
                )
        );


    wrongUserWords.forEach(
        word => {

            if (
                typeof recordWordMistake ===
                "function"
            ) {

                recordWordMistake(
                    word
                );

            }

        }
    );


    correctWords.forEach(
        word => {

            if (
                typeof recordWordCorrect ===
                "function"
            ) {

                recordWordCorrect(
                    word
                );

            }

        }
    );


    wfdTotalScore +=
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
                    words correct

                </span>

            </div>

        </div>


        <div class="word-result">

            ${expectedWords
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
        "wfd-check-btn"
    ).disabled =
        true;


    document.getElementById(
        "wfd-next-btn"
    ).disabled =
        false;


    displayWFDMistakeSummary();

}


/* =========================================================
   MISTAKE REVIEW
========================================================= */

function showWFDMistakeReviewQuestion() {

    clearWFDTimers();


    const task =
        wfdQuestionQueue[
            wfdQueuePosition
        ];


    const content =
        document.getElementById(
            "content"
        );


    content.innerHTML = `

        <div class="mistake-panel">

            <div class="mistake-header">

                <span>

                    🔴 WFD Mistake Review

                </span>


                <span>

                    ${wfdQueuePosition + 1}
                    /
                    ${wfdQuestionQueue.length}

                </span>

            </div>

        </div>


        <div class="wfd-box">

            <div class="question-number">

                Review Word

            </div>


            <h2>

                Listen carefully

            </h2>


            <p>

                Type the word you hear.

            </p>


            <div id="wfd-status">

                Preparing audio...

            </div>


            <div class="timers">

                <div id="audio-time">

                    🔊 Audio Time: 0s

                </div>


                <div id="answer-time">

                    ✍️ Answer Time: 0s

                </div>

            </div>


            <textarea
                id="wfd-answer"
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
                        exitWFDMistakeReview()
                    "
                >

                    ← Back to Listening

                </button>


                <button
                    id="wfd-check-btn"
                    class="check-button"
                    onclick="
                        checkWFD()
                    "
                    disabled
                >

                    Check Word

                </button>


                <button
                    id="wfd-next-btn"
                    class="next-button"
                    onclick="
                        nextWFD()
                    "
                    disabled
                >

                    Next Word →

                </button>

            </div>


            <div
                id="wfd-feedback"
            ></div>

        </div>

    `;


    setTimeout(
        () => {

            playWFDMistakeWord();

        },
        3000
    );

}


/* =========================================================
   PLAY MISTAKE WORD
========================================================= */

function playWFDMistakeWord() {

    const task =
        wfdQuestionQueue[
            wfdQueuePosition
        ];


    playWFDSpeech(
        task.focusWord
    );

}


/* =========================================================
   SPEAK MISTAKE WORD
========================================================= */

function playWFDSpeech(
    text
) {

    clearWFDTimers();


    const status =
        document.getElementById(
            "wfd-status"
        );


    const audioTime =
        document.getElementById(
            "audio-time"
        );


    const answerTime =
        document.getElementById(
            "answer-time"
        );


    const textarea =
        document.getElementById(
            "wfd-answer"
        );


    const checkButton =
        document.getElementById(
            "wfd-check-btn"
        );


    const nextButton =
        document.getElementById(
            "wfd-next-btn"
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


    wfdAudioSeconds =
        0;

    wfdAnswerSeconds =
        0;

    wfdAudioFinished =
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


    wfdAudioTimer =
        setInterval(
            () => {

                wfdAudioSeconds++;


                audioTime.textContent =
                    `🔊 Audio Time: ${wfdAudioSeconds}s`;

            },
            1000
        );


    speech.onend =
        () => {

            clearInterval(
                wfdAudioTimer
            );


            wfdAudioTimer =
                null;


            wfdAudioFinished =
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


            startWFDAnswerTimer();

        };


    window.speechSynthesis.speak(
        speech
    );

}


/* =========================================================
   CHECK MISTAKE WORD
========================================================= */

function checkWFDMistake() {

    const textarea =
        document.getElementById(
            "wfd-answer"
        );


    const feedback =
        document.getElementById(
            "wfd-feedback"
        );


    const userWord =
        normalizeWFDWords(
            textarea.value
        )[0] || "";


    const task =
        wfdQuestionQueue[
            wfdQueuePosition
        ];


    const targetWord =
        normalizeWFDWord(
            task.focusWord
        );


    if (!userWord) {

        feedback.innerHTML = `

            <p class="error">

                Please type the word first.

            </p>

        `;


        startWFDAnswerTimer();

        return;

    }


    const isCorrect =
        userWord ===
        targetWord;


    if (
        typeof recordReviewResult ===
        "function"
    ) {

        recordReviewResult(
            targetWord,
            isCorrect
        );

    }


    const bank =
        typeof getMistakeBank ===
        "function"
            ? getMistakeBank()
            : {};


    const updated =
        bank[targetWord] ||
        null;


    textarea.disabled =
        true;


    document.getElementById(
        "wfd-check-btn"
    ).disabled =
        true;


    document.getElementById(
        "wfd-next-btn"
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

function startWFDMistakeReview() {

    const weak =
        typeof getWeakWords ===
        "function"
            ? getWeakWords()
            : [];


    if (
        weak.length ===
        0
    ) {

        alert(
            "You don't have any WFD weak words yet."
        );

        return;

    }


    const reviewTasks =
        [];


    weak.forEach(
        item => {

            const targetWord =
                normalizeWFDWord(
                    item.word
                );


            const matchingQuestion =
                wfdQuestions.find(
                    question =>
                        normalizeWFDWords(
                            question.text
                        ).includes(
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
            "No matching WFD questions were found."
        );

        return;

    }


    wfdPracticeMode =
        "mistake";


    wfdTotalScore =
        0;


    wfdQueuePosition =
        0;


    wfdQuestionQueue =
        reviewTasks;


    showWFDQuestion();

}


/* =========================================================
   EXIT REVIEW
========================================================= */

function exitWFDMistakeReview() {

    window.speechSynthesis.cancel();

    clearWFDTimers();


    location.href =
        "mistakes.html";

}


/* =========================================================
   NEXT QUESTION
========================================================= */

function nextWFD() {

    window.speechSynthesis.cancel();

    clearWFDTimers();


    wfdQueuePosition++;


    if (
        wfdQueuePosition >=
        wfdQuestionQueue.length
    ) {

        finishWFD();

        return;

    }


    saveWFDProgress();

    showWFDQuestion();

}


/* =========================================================
   FINISH
========================================================= */

function finishWFD() {

    window.speechSynthesis.cancel();

    clearWFDTimers();


    const reviewMode =
        wfdPracticeMode ===
        "mistake";


    if (!reviewMode) {

        clearWFDProgress();

    }


    const averageScore =
        wfdQuestionQueue.length >
        0

            ? Math.round(
                wfdTotalScore /
                wfdQuestionQueue.length
            )

            : 0;


    document.getElementById(
        "content"
    ).innerHTML = `

        <div class="completed">

            <h2>

                ${
                    reviewMode
                        ? "🎯 WFD Mistake Review Completed"
                        : "🎉 WFD Completed"
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
                ${wfdQuestionQueue.length}

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
                                startWFDMistakeReview()
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
                    startWFDPractice(
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
                    startWFDPractice(
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
                    backToListeningFromWFD()
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

function showNoWFDQuestions() {

    document.getElementById(
        "content"
    ).innerHTML = `

        <div class="completed">

            <h2>

                No WFD Questions Available

            </h2>


            <p>

                The WFD question bank
                is currently empty.

            </p>


            <button
                class="back-button"
                onclick="
                    backToListeningFromWFD()
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

function displayWFDMistakeSummary() {

    const summary =
        document.getElementById(
            "wfd-mistake-summary"
        );


    if (!summary) {

        return;

    }


    if (
        typeof getAllMistakes !==
        "function" ||
        typeof getWeakWords !==
        "function"
    ) {

        summary.textContent =
            "Mistake Bank unavailable";

        return;

    }


    const mistakes =
        getAllMistakes();


    const weak =
        getWeakWords();


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

function normalizeWFDWord(
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


function normalizeWFDWords(
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

function clearWFDTimers() {

    if (
        wfdAudioTimer
    ) {

        clearInterval(
            wfdAudioTimer
        );

        wfdAudioTimer =
            null;

    }


    if (
        wfdAnswerTimer
    ) {

        clearInterval(
            wfdAnswerTimer
        );

        wfdAnswerTimer =
            null;

    }

}