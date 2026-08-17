/* =========================================================
   PTE TRAINER - PRACTICE ROUTER
========================================================= */


/* =========================================================
   URL PARAMETERS
========================================================= */

const params =
    new URLSearchParams(
        window.location.search
    );


const module =
    params.get(
        "module"
    );


const type =
    params.get(
        "type"
    );


const mode =
    params.get(
        "mode"
    );


/* =========================================================
   ELEMENTS
========================================================= */

const moduleTitle =
    document.getElementById(
        "module-title"
    );


const content =
    document.getElementById(
        "content"
    );


/* =========================================================
   LOAD PRACTICE
========================================================= */

function loadPractice() {

    if (!module) {

        if (moduleTitle) {

            moduleTitle.textContent =
                "PTE Practice";

        }


        if (content) {

            content.innerHTML = `

                <div class="completed">

                    <h2>
                        No Module Selected
                    </h2>


                    <p>
                        Please choose a practice module.
                    </p>


                    <button
                        class="back-button"
                        onclick="
                            location.href='index.html'
                        "
                    >

                        ← Back to Home

                    </button>

                </div>

            `;

        }


        return;

    }


    if (
        moduleTitle
    ) {

        moduleTitle.textContent =
            capitalizeFirstLetter(
                module
            );

    }


    /* =====================================================
       LISTENING
    ===================================================== */

    if (
        module === "listening"
    ) {

        showListening();

        return;

    }


    /* =====================================================
       OTHER MODULES
    ===================================================== */

    showComingSoon(
        capitalizeFirstLetter(
            module
        )
    );

}


/* =========================================================
   LISTENING MENU / ROUTER
========================================================= */

function showListening() {

    /*
        WFD
    */

    if (
        type === "wfd"
    ) {

        /*
            Mistake Review
        */

        if (
            mode === "mistake"
        ) {

            if (
                typeof startWFDMistakeReview ===
                "function"
            ) {

                startWFDMistakeReview();

            } else {

                showModuleError(
                    "WFD Mistake Review",
                    "WFD Mistake Review function is not available."
                );

            }


            return;

        }


        /*
            Normal WFD
        */

        startWFD();

        return;

    }


    /*
        LFIB
    */

    if (
        type === "lfib"
    ) {

        /*
            Mistake Review
        */

        if (
            mode === "mistake"
        ) {

            if (
                typeof startLFIBMistakeReview ===
                "function"
            ) {

                startLFIBMistakeReview();

            } else {

                showModuleError(
                    "LFIB Mistake Review",
                    "LFIB Mistake Review function is not available."
                );

            }


            return;

        }


        /*
            Normal LFIB
        */

        startLFIB();

        return;

    }


    /*
        Main Listening Menu
    */

    renderListeningMenu();

}


/* =========================================================
   LISTENING MENU
========================================================= */

function renderListeningMenu() {

    if (!content) {

        return;

    }


    content.innerHTML = `

        <div class="wfd-box listening-menu">

            <h2>

                Listening Practice

            </h2>


            <p>

                Choose your listening practice type.

            </p>


            <div
                class="
                    listening-menu-buttons
                "
            >

                <!-- =====================
                     WFD
                ====================== -->

                <button
                    type="button"
                    class="
                        listening-menu-btn
                        wfd-btn
                    "
                    onclick="
                        startWFD()
                    "
                >

                    <span
                        class="
                            listening-icon
                        "
                    >

                        🎧

                    </span>


                    <span
                        class="
                            listening-btn-content
                        "
                    >

                        <strong>

                            WFD - Write From Dictation

                        </strong>


                        <small>

                            Listen and type the sentence

                        </small>

                    </span>


                    <span
                        class="
                            listening-arrow
                        "
                    >

                        →

                    </span>

                </button>


                <!-- =====================
                     LFIB
                ====================== -->

                <button
                    type="button"
                    class="
                        listening-menu-btn
                        lfib-btn
                    "
                    onclick="
                        startLFIB()
                    "
                >

                    <span
                        class="
                            listening-icon
                        "
                    >

                        📝

                    </span>


                    <span
                        class="
                            listening-btn-content
                        "
                    >

                        <strong>

                            LFIB - Listening Fill in the Blanks

                        </strong>


                        <small>

                            Listen and type the missing words

                        </small>

                    </span>


                    <span
                        class="
                            listening-arrow
                        "
                    >

                        →

                    </span>

                </button>


                <!-- =====================
                     MISTAKES
                ====================== -->

                <button
                    type="button"
                    class="
                        listening-menu-btn
                        mistakes-btn
                    "
                    onclick="
                        location.href='mistakes.html'
                    "
                >

                    <span
                        class="
                            listening-icon
                        "
                    >

                        📚

                    </span>


                    <span
                        class="
                            listening-btn-content
                        "
                    >

                        <strong>

                            My Mistakes

                        </strong>


                        <small>

                            Review WFD and LFIB mistakes

                        </small>

                    </span>


                    <span
                        class="
                            listening-arrow
                        "
                    >

                        →

                    </span>

                </button>


                <!-- =====================
                     BACK
                ====================== -->

                <button
                    type="button"
                    class="
                        listening-menu-btn
                        secondary
                    "
                    onclick="
                        location.href='index.html'
                    "
                >

                    <span
                        class="
                            listening-icon
                        "
                    >

                        ←

                    </span>


                    <span
                        class="
                            listening-btn-content
                        "
                    >

                        <strong>

                            Back to Home

                        </strong>

                    </span>

                </button>

            </div>

        </div>

    `;

}


/* =========================================================
   START WFD
========================================================= */

function startWFD() {

    if (
        typeof startWFDPractice ===
        "function"
    ) {

        startWFDPractice(
            "sequential"
        );

        return;

    }


    showModuleError(
        "WFD",
        "WFD module is not available."
    );

}


/* =========================================================
   START LFIB
========================================================= */

function startLFIB() {

    if (
        typeof startLFIBPractice ===
        "function"
    ) {

        startLFIBPractice(
            "sequential"
        );

        return;

    }


    showModuleError(
        "LFIB",
        "LFIB module is not available."
    );

}


/* =========================================================
   COMING SOON
========================================================= */

function showComingSoon(
    moduleName
) {

    if (!content) {

        return;

    }


    content.innerHTML = `

        <div class="completed">

            <h2>

                ${moduleName}

            </h2>


            <p>

                This module is under development.

            </p>


            <button
                class="back-button"
                onclick="
                    location.href='index.html'
                "
            >

                ← Back to Home

            </button>

        </div>

    `;

}


/* =========================================================
   ERROR
========================================================= */

function showModuleError(
    moduleName,
    message
) {

    if (!content) {

        return;

    }


    content.innerHTML = `

        <div class="completed">

            <h2>

                ${moduleName}

            </h2>


            <p>

                ${message}

            </p>


            <button
                class="back-button"
                onclick="
                    location.href='practice.html?module=listening'
                "
            >

                ← Back to Listening

            </button>

        </div>

    `;

}


/* =========================================================
   CAPITALIZE
========================================================= */

function capitalizeFirstLetter(
    text
) {

    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

loadPractice();
