alert("app.js loaded");

let currentQuestion = 0;

const questionText = document.getElementById("question-text");
const answerArea = document.getElementById("answer-area");
const nextBtn = document.getElementById("next-btn");
const questionTitle = document.getElementById("question-title");

function loadQuestion(index) {

    const question = questions[index];

    questionTitle.textContent =
        `${question.type} (${index + 1}/${questions.length})`;

    questionText.textContent = question.question;

    answerArea.innerHTML = "";

    question.options.forEach(option => {

        const button = document.createElement("button");

        button.textContent = option;

        button.style.margin = "5px";

        button.onclick = () => {

            if (option === question.answer) {
                button.style.background = "#4CAF50";
                button.style.color = "white";
            } else {
                button.style.background = "#f44336";
                button.style.color = "white";
            }

        };

        answerArea.appendChild(button);

    });

}

nextBtn.addEventListener("click", () => {

    currentQuestion++;

    if (currentQuestion >= questions.length) {
        currentQuestion = 0;
    }

    loadQuestion(currentQuestion);

});

loadQuestion(currentQuestion);
