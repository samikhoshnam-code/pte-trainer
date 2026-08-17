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

                            ${escapeWFDSafe(
                                question.text
                            )}

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


    if (
        wfdPracticeMode !==
        "mistake"
    ) {

        saveWFDProgress();

    }


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
   PLAY NORMAL WFD AUDIO
========================================================= */

function playWFD() {

    clearWFDTimers();


    const task =
        wfdQuestionQueue[
            wfdQueuePosition
        ];


    if (!task) {

        return;

    }


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
   CHECK NORMAL WFD
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


    if (!task) {

        return;

    }


    const expectedWords =
        normalizeWFDWords(
            task.question.text
        );


    const userWords =
        normalizeWFDWords(
            textarea.value
        );


    const remainingUserWords =
        [...userWords];


    const correctWords =
        [];


    const missingWords =
        [];


    expectedWords.forEach(
        expectedWord => {

            const index =
                remainingUserWords.indexOf(
                    expectedWord
                );


            if (
                index !== -1
            ) {

                correctWords.push(
                    expectedWord
                );


                remainingUserWords.splice(
                    index,
                    1
                );

            } else {

                missingWords.push(
                    expectedWord
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
        Store only the correct expected
        word when the user typed a wrong
        replacement.

        Example:

        Expected: skills
        User: skils

        Store:
        skills

        Do NOT store:
        skils
    */

    const typedWrongCount =
        Math.min(
            remainingUserWords.length,
            missingWords.length
        );


    for (
        let i = 0;
        i < typedWrongCount;
        i++
    ) {

        const correctTarget =
            missingWords[i];


        if (
            typeof recordWordMistake ===
            "function"
        ) {

            recordWordMistake(
                correctTarget
            );

        }

    }


    /*
        Correct words that already
        exist in Mistake Bank get
        correct history/streak.
    */

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
                    word => {

                        if (
                            correctWords.includes(
                                word
                            )
                        ) {

                            return `

                                <span
                                    class="
                                        correct-word
                                    "
                                >

                                    ${escapeWFDSafe(
                                        word
                                    )}

                                </span>

                            `;

                        }


                        return `

                            <span
                                class="
                                    wrong-word
                                "
                            >

                                ${escapeWFDSafe(
                                    word
                                )}

                            </span>

                        `;

                    }
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
   MISTAKE REVIEW QUESTION
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


    if (
        !task ||
        !task.focusWord
    ) {

        finishWFD();

        return;

    }


    /*
        IMPORTANT:

        The focus word is NOT displayed
        anywhere on the screen.

        It is only used internally for
        audio and answer checking.
    */

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

                Mistake Review

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


    if (
        !task ||
        !task.focusWord
    ) {

        finishWFD();

        return;

    }


    /*
        Only the target word is spoken.
        It is NOT displayed on screen.
    */

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


    const task =
        wfdQuestionQueue[
            wfdQueuePosition
        ];


    if (
        !task ||
        !task.focusWord
    ) {

        return;

    }


    const userWords =
        normalizeWFDWords(
            textarea.value
        );


    const userWord =
        userWords[0] ||
        "";


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

        /*
            Always update the CORRECT
            canonical word in the bank.
        */

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

                        Correct answer

                    </span>

                </div>

            </div>


            <div class="no-mistakes">

                Great job!


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

                Your answer was not correct.

                <br>

                The word has been kept
                in Mistake Review.

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

            const storedWord =
                normalizeWFDWord(
                    item.word
                );


            if (!storedWord) {

                return;

            }


            /*
                1. Exact match first.
            */

            let matchingQuestion =
                findQuestionByExactWord(
                    storedWord
                );


            let focusWord =
                storedWord;


            /*
                2. If exact match does not
                   exist, search for the
                   closest real WFD word.

                   This helps with older
                   mistake records such as:

                   skils
                   skills
                */

            if (
                !matchingQuestion
            ) {

                const fuzzy =
                    findClosestWFDWord(
                        storedWord
                    );


                if (fuzzy) {

                    matchingQuestion =
                        fuzzy.question;

                    focusWord =
                        fuzzy.word;

                }

            }


            if (
                matchingQuestion
            ) {

                reviewTasks.push({

                    question:
                        matchingQuestion,

                    focusWord:
                        focusWord

                });

            }

        }
    );


    /*
        Remove duplicate words.
    */

    const uniqueTasks =
        [];


    const seen =
        new Set();


    reviewTasks.forEach(
        task => {

            const key =
                normalizeWFDWord(
                    task.focusWord
                );


            if (
                seen.has(key)
            ) {

                return;

            }


            seen.add(key);

            uniqueTasks.push(
                task
            );

        }
    );


    if (
        uniqueTasks.length ===
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
        uniqueTasks;


    showWFDQuestion();

}


/* =========================================================
   FIND EXACT WORD
========================================================= */

function findQuestionByExactWord(
    targetWord
) {

    const normalizedTarget =
        normalizeWFDWord(
            targetWord
        );


    return (
        wfdQuestions.find(
            question => {

                const words =
                    normalizeWFDWords(
                        question.text
                    );


                return words.includes(
                    normalizedTarget
                );

            }
        ) ||
        null
    );

}


/* =========================================================
   FIND CLOSEST WORD
========================================================= */

function findClosestWFDWord(
    targetWord
) {

    const normalizedTarget =
        normalizeWFDWord(
            targetWord
        );


    if (!normalizedTarget) {

        return null;

    }


    let bestMatch =
        null;


    let bestDistance =
        Infinity;


    wfdQuestions.forEach(
        question => {

            const words =
                normalizeWFDWords(
                    question.text
                );


            words.forEach(
                word => {

                    if (
                        word.length < 4 &&
                        normalizedTarget.length < 4
                    ) {

                        return;

                    }


                    const distance =
                        levenshteinDistance(
                            normalizedTarget,
                            word
                        );


                    if (
                        distance <
                        bestDistance
                    ) {

                        bestDistance =
                            distance;


                        bestMatch = {

                            question:
                                question,

                            word:
                                word

                        };

                    }

                }
            );

        }
    );


    if (
        !bestMatch
    ) {

        return null;

    }


    const maxDistance =
        Math.max(
            1,
            Math.floor(
                normalizedTarget.length /
                3
            )
        );


    if (
        bestDistance >
        maxDistance
    ) {

        return null;

    }


    return bestMatch;

}


/* =========================================================
   LEVENSHTEIN DISTANCE
========================================================= */

function levenshteinDistance(
    a,
    b
) {

    const matrix =
        [];


    const aLength =
        a.length;


    const bLength =
        b.length;


    for (
        let i = 0;
        i <= aLength;
        i++
    ) {

        matrix[i] =
            [i];

    }


    for (
        let j = 0;
        j <= bLength;
        j++
    ) {

        matrix[0][j] =
            j;

    }


    for (
        let i = 1;
        i <= aLength;
        i++
    ) {

        for (
            let j = 1;
            j <= bLength;
            j++
        ) {

            if (
                a.charAt(
                    i - 1
                ) ===
                b.charAt(
                    j - 1
                )
            ) {

                matrix[i][j] =
                    matrix[
                        i - 1
                    ][
                        j - 1
                    ];

            } else {

                matrix[i][j] =
                    Math.min(

                        matrix[
                            i - 1
                        ][
                            j
                        ] + 1,

                        matrix[
                            i
                        ][
                            j - 1
                        ] + 1,

                        matrix[
                            i - 1
                        ][
                            j - 1
                        ] + 1

                    );

            }

        }

    }


    return matrix[
        aLength
    ][
        bLength
    ];

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


    if (
        wfdPracticeMode !==
        "mistake"
    ) {

        saveWFDProgress();

    }


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
   NORMALIZE SINGLE WORD
========================================================= */

function normalizeWFDWord(
    word
) {

    return String(
        word || ""
    )
        .toLowerCase()
        .replace(
            /[.,!?;:'"()[\]{}]/g,
            ""
        )
        .trim();

}


/* =========================================================
   NORMALIZE WORDS
========================================================= */

function normalizeWFDWords(
    text
) {

    return String(
        text || ""
    )
        .toLowerCase()
        .replace(
            /[.,!?;:'"()[\]{}]/g,
            ""
        )
        .split(/\s+/)
        .filter(
            Boolean
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeWFDSafe(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(
            value ?? ""
        );


    return div.innerHTML;

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
