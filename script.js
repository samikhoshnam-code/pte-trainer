let currentQuestion = 0;
let score = 0;


function startPractice(){

    currentQuestion = 0;
    score = 0;

    showQuestion();

}



function showQuestion(){

    let q = questions[currentQuestion];


    document.getElementById("selected").innerHTML =
    q.type;


    document.getElementById("result").innerHTML = `

    <h2>${q.question}</h2>

    ${q.options.map(option =>

    `
    <button class="answer-btn" 
    onclick="checkAnswer('${option}')">
    ${option}
    </button>
    `

    ).join("")}


    `;

}



function checkAnswer(selectedAnswer){

    let q = questions[currentQuestion];


    console.log("Selected:", selectedAnswer);
    console.log("Correct:", q.answer);


    if(selectedAnswer.trim() === q.answer.trim()){

        score++;

        alert("Correct ✅");

    }

    else{

        alert(
        "Wrong ❌\nCorrect answer: "
        + q.answer
        );

    }


    currentQuestion++;


    if(currentQuestion < questions.length){

        showQuestion();

    }

    else{


        document.getElementById("result").innerHTML = `

        <h2>Practice Completed 🎉</h2>

        <h3>
        Score: ${score}/${questions.length}
        </h3>

        `;


    }

}
