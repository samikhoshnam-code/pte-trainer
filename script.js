let currentQuestion = 0;
let score = 0;


function startPractice(){

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
<button onclick="checkAnswer('${option}')">
${option}
</button>

`

).join("")}

`;

}



function checkAnswer(answer){

let q = questions[currentQuestion];


if(answer === q.answer){

score++;

alert("Correct ✅");

}

else{

alert("Wrong ❌");

}


currentQuestion++;


if(currentQuestion < questions.length){

showQuestion();

}

else{

document.getElementById("result").innerHTML=

`
<h2>Finished 🎉</h2>
<p>Your Score: ${score}/${questions.length}</p>
`;

}

}
