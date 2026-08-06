const question = {

    text: "The government should invest more money in education.",

    answers: [
        "Agree",
        "Disagree",
        "Not sure"
    ]

};


const questionText = document.getElementById("question-text");
const answerArea = document.getElementById("answer-area");


function loadQuestion(){

    questionText.innerHTML = question.text;


    answerArea.innerHTML = "";


    question.answers.forEach(answer => {


        const button = document.createElement("button");

        button.innerText = answer;


        button.style.margin = "5px";


        button.onclick = function(){

            console.log("Selected:", answer);

        };


        answerArea.appendChild(button);

    });

}



loadQuestion();
