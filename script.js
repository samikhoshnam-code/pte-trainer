let currentQuestion = 0;
let selectedType = "";
let filteredQuestions = [];
let score = 0;


function startType(type){

    selectedType = type;

    filteredQuestions = questions.filter(
        q => q.type === type
    );

    currentQuestion = 0;
    score = 0;


    document.getElementById("selected").innerHTML =
    type;


    if(filteredQuestions.length === 0){

        document.getElementById("result").innerHTML =
        `
        <h2>Coming Soon</h2>
        <p>No questions available.</p>
        `;

        return;
    }


    showQuestion();

}



function showQuestion(){

    let q = filteredQuestions[currentQuestion];


    document.getElementById("result").innerHTML =

    `
    <h2>${q.question}</h2>

    ${q.options.map(option =>

    `
    <button onclick="checkAnswer('${option}')">
    ${option}
    </button>

    `).join("")}

    `;

}



function checkAnswer(answer){

    let q = filteredQuestions[currentQuestion];


    if(answer === q.answer){

        score++;

        alert("Correct ✅");

    }else{

        alert(
        "Wrong ❌ Correct answer: "
        + q.answer
        );

    }


    currentQuestion++;


    if(currentQuestion < filteredQuestions.length){

        showQuestion();

    }
    else{

        document.getElementById("result").innerHTML =
        `
        <h2>Finished 🎉</h2>
        <p>
        Score: ${score}/${filteredQuestions.length}
        </p>
        `;

    }

}
