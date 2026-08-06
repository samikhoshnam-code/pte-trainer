const params = new URLSearchParams(window.location.search);
const urlType = params.get("type");

if (urlType) {
    window.onload = () => {
        startType(urlType);
    };
}
let currentQuestion = 0;
let selectedType = "";
let filteredQuestions = [];
let score = 0;


function startType(type){

    selectedType = type;


    if(type === "WFD"){

        startWFD();
        return;

    }


    filteredQuestions = questions.filter(
        q => q.type === type
    );


    currentQuestion = 0;
    score = 0;


    if(filteredQuestions.length === 0){

        document.getElementById("result").innerHTML =
        `
        <h2>Coming Soon</h2>
        `;

        return;

    }


    showQuestion();

}



function startWFD(){


currentQuestion=0;


showWFD();


}



function showWFD(){


let q = wfdQuestions[currentQuestion];


document.getElementById("selected").innerHTML =
"WFD Practice";


document.getElementById("result").innerHTML =

`

<h2>
Listen and type what you hear
</h2>


<button onclick="playWFD()">
🔊 Play Audio
</button>


<br><br>


<textarea 
id="wfdAnswer"
rows="5"
placeholder="Type what you hear..."
></textarea>


<br>


<button onclick="checkWFD()">
Submit
</button>


<div id="feedback"></div>


`;

}



function playWFD(){


let q=wfdQuestions[currentQuestion];


let speech=new SpeechSynthesisUtterance(q.text);


speech.lang="en-US";

speech.rate=0.8;


window.speechSynthesis.speak(speech);


}



function checkWFD(){


let userText =
document.getElementById("wfdAnswer").value;


let correct =
wfdQuestions[currentQuestion].text;



let result =
compareWords(userText,correct);



document.getElementById("feedback").innerHTML=

`

<h3>
Score: ${result.percent}%
</h3>

<p>
${result.html}
</p>


<button onclick="nextWFD()">
Next Question
</button>

`;

}



function compareWords(user, correct){


let userWords =
user.toLowerCase().split(" ");


let correctWords =
correct.toLowerCase().split(" ");



let html="";

let correctCount=0;



correctWords.forEach(word=>{


if(userWords.includes(word)){

html+=
`<span style="color:green">
${word}
</span> `;

correctCount++;

}

else{

html+=
`<span style="color:red">
${word}
</span> `;

}


});


return {

percent:
Math.round(
(correctCount/correctWords.length)*100
),

html:html

};


}




function nextWFD(){


currentQuestion++;


if(currentQuestion < wfdQuestions.length){

showWFD();

}

else{


document.getElementById("result").innerHTML=

`

<h2>
WFD Completed 🎉
</h2>

`;

}


}
