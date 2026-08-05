let currentQuestion = 0;
let score = 0;
let selectedType = "";
let filteredQuestions = [];


function startType(type){

    selectedType = type;

    filteredQuestions = questions.filter(
        q => q.type === type
    );


    currentQuestion = 0;
    score = 0;


    if(filteredQuestions.length === 0){

        document.getElementById("result").innerHTML =
        `
        <h2>Coming Soon 🚀</h2>
        <p>No questions available for ${type} yet.</p>
        `;

        document.getElementById("selected").innerHTML =
        type;

        return;

    }


    showQuestion();

}




function showQuestion(){

    let q = filteredQuestions[currentQuestion];


    document.getElementById("selected").innerHTML =
    `
    ${selectedType}
    <br>
    Question ${currentQuestion + 1}/${filteredQuestions.length}
    `;



    document.getElementById("result").innerHTML =

    `
    <h2>${q.question}</h2>


    ${q.options.map(option =>

    `
    <button onclick="checkAnswer(this, '${option}')">
    ${option}
    </button>
    `

    ).join("")}

    `;


}




function checkAnswer(button, answer){


    let q = filteredQuestions[currentQuestion];


    let buttons =
    document.querySelectorAll("#result button");


    buttons.forEach(btn=>{
        btn.disabled = true;
    });



    if(answer.trim() === q.answer.trim()){


        score++;

        button.style.background="green";


    }
    else{


        button.style.background="red";


        buttons.forEach(btn=>{

            if(btn.innerText === q.answer){

                btn.style.background="green";

            }

        });


    }



    setTimeout(()=>{


        currentQuestion++;


        if(currentQuestion < filteredQuestions.length){

            showQuestion();

        }
        else{


            document.getElementById("result").innerHTML=

            `
            <h2>Completed 🎉</h2>

            <h3>
            Score: ${score}/${filteredQuestions.length}
            </h3>
            `;

        }


    },1000);



}
