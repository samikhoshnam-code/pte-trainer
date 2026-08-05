let currentQuestion = 0;
let score = 0;
let selectedType = "";


function startType(type){

selectedType = type;

currentQuestion = 0;
score = 0;


showQuestion();

}



function showQuestion(){


let filteredQuestions =
questions.filter(q => q.type === selectedType);



if(filteredQuestions.length === 0){

document.getElementById("result").innerHTML=

`
<h2>No questions available</h2>
<p>This section is under development.</p>
`;

return;

}



let q = filteredQuestions[currentQuestion];


document.getElementById("selected").innerHTML =
q.type;



document.getElementById("result").innerHTML =

`

<h2>${q.question}</h2>


${q.options.map(option =>

`

<button onclick="checkAnswer('${option}')">

${option}

</button>

`

).join("")}

`;

}



function checkAnswer(answer){


let filteredQuestions =
questions.filter(q => q.type === selectedType);


let q = filteredQuestions[currentQuestion];


if(answer === q.answer){

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


if(currentQuestion < filteredQuestions.length){

showQuestion();

}

else{


document.getElementById("result").innerHTML=

`

<h2>Finished 🎉</h2>

<h3>
Score: ${score}/${filteredQuestions.length}
</h3>

`;

}


}
