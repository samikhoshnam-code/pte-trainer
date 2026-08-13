const params =
    new URLSearchParams(
        window.location.search
    );


const module =
    params.get("module");


const mode =
    params.get("mode");


const type =
    params.get("type");


const moduleTitle =
    document.getElementById(
        "module-title"
    );


const content =
    document.getElementById(
        "content"
    );


/* =========================
   LOAD PRACTICE
========================= */

function loadPractice() {

    if (!module) {

        moduleTitle.textContent =
            "No module selected";

        return;

    }


    if (
        module === "listening"
    ) {

        moduleTitle.textContent =
            "Listening";

        showListening();

        return;

    }


    moduleTitle.textContent =
        module
            .charAt(0)
            .toUpperCase() +
        module.slice(1);


    content.innerHTML = `

        <div class="completed">

            <h2>
                Coming Soon
            </h2>


            <p>
                This module is under development.
            </p>


            <button
                class="listening-menu-btn secondary"
                onclick="
                    location.href='index.html'
                "
            >

                ← Back to Home

            </button>

        </div>

    `;

}


/* =========================
   LISTENING MENU
========================= */

function showListening() {

    /*
        Direct WFD
    */

    if (
        type === "wfd"
    ) {

        startWFD();

        return;

    }


    /*
        Direct LFIB
    */

    if (
        type === "lfib"
    ) {

        if (
            mode === "mistake"
        ) {

            if (
                typeof startLFIBMistakeReview ===
                "function"
            ) {

                startLFIBMistakeReview();

            }

        } else {

            startLFIB();

        }

        return;

    }


    /*
        Main Listening menu
    */

    content.innerHTML = `

        <div class="listening-menu">

            <div class="listening-menu-subtitle">

                Choose a Listening practice type

            </div>


            <div class="listening-menu-buttons">


                <button
                    class="
                        listening-menu-btn
                        wfd-btn
                    "
                    onclick="
                        startWFD()
                    "
                >

                    <span class="listening-icon">
                        🎧
                    </span>


                    <span class="listening-btn-content">

                        <strong>
                            WFD
                        </strong>

                        <small>
                            Write From Dictation
                        </small>

                    </span>


                    <span class="listening-arrow">
                        →
                    </span>

                </button>


                <button
                    class="
                        listening-menu-btn
                        lfib-btn
                    "
                    onclick="
                        startLFIB()
                    "
                >

                    <span class="listening-icon">
                        📝
                    </span>


                    <span class="listening-btn-content">

                        <strong>
                            LFIB
                        </strong>

                        <small>
                            Listening Fill in the Blanks
                        </small>

                    </span>


                    <span class="listening-arrow">
                        →
                    </span>

                </button>


                <button
                    class="
                        listening-menu-btn
                        mistakes-btn
                    "
                    onclick="
                        location.href='mistakes.html'
                    "
                >

                    <span class="listening-icon">
                        📚
                    </span>


                    <span class="listening-btn-content">

                        <strong>
                            My Mistakes
                        </strong>

                        <small>
                            WFD & LFIB Mistakes
                        </small>

                    </span>


                    <span class="listening-arrow">
                        →
                    </span>

                </button>


                <button
                    class="
                        listening-menu-btn
                        secondary
                    "
                    onclick="
                        location.href='index.html'
                    "
                >

                    <span class="listening-icon">
                        ←
                    </span>


                    <span class="listening-btn-content">

                        <strong>
                            Back to Home
                        </strong>

                    </span>

                </button>

            </div>

        </div>

    `;

}


/* =========================
   START WFD
========================= */

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


    content.innerHTML = `

        <div class="completed">

            <h2>
                WFD module is loading...
            </h2>

        </div>

    `;

}


/* =========================
   START LFIB
========================= */

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


    content.innerHTML = `

        <div class="completed">

            <h2>
                LFIB module is loading...
            </h2>


            <p>
                Please check that
                lfib.js is loaded.
            </p>

        </div>

    `;

}


/* =========================
   INIT
========================= */

loadPractice();