
document.querySelector("#nojs").remove();
document.querySelector("main").style.display = 'inherit';
scrollHeight();

// Redraw when viewport is modified
window.addEventListener('resize', function(event){
  scrollHeight();
});

function scrollHeight() {
  var content = document.querySelector('#parchment');
  var container = document.querySelector('#contain');

  // SVG feTurbulence can modify all others elements, that's why it's in absolute
  // so for a better effect, absolute height is defined by his content.
  content.style.height = container.offsetHeight + 'px';
}

function randInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// function getUniqueChars() {
//   let chars = [];
//   chars.push("text length: " + presetTexts.reduce( (acc, text) => acc + text.length, 0));
//   presetTexts.forEach( text => {
//     let currentChar = '';
//     for(let i = 0; i < text.length; i++) {
//       currentChar = text.charAt(i);
//       if(!chars.includes(currentChar)) chars.push(currentChar);
//     }
//   })
//   document.querySelector("#bookpage").innerText = chars.join(' ');
// }

function generateMagicWord() {
  let randInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  let btnChars = 'qweasdzxcrtyfghvbnuiojklmop';
  let magicWord = [...Array(randInclusive(4, 8))].reduce((word, i) => word += btnChars.charAt(randInclusive(0, btnChars.length - 1)), '');

  document.querySelector("#btn-magic-word").innerText = magicWord;
}



function printNames(generator) {
  let time = Date.now();

  let intro = document.querySelector("#intro");
  if(intro) intro.remove();


  let fontStyles = ['cardinalregular', 'cardinal_alternateregular', 'carolingiaregular', 'elementary_gothicregular', 'pr_uncial2003','forget_me_knotroman', 'monday_routinesregular','nagietharegular','nagietharegular','photograph_signatureregular','retro_signatureregular','a_agreement_signatureregular','a_agreement_signatureregular','a_agreement_signatureregular','a_agreement_signatureregular','antro_vectrabolder','british_shorthairregular','charlotte_southernsouthern','charlotte_southernsouthern'];


  // Delete current names
  document.querySelectorAll(".wicumarian-name").forEach( div => div.remove() );

  let maxNames = randInclusive(1, 10);

  // Create names and append them
  for(let i = 0; i < maxNames; i++) {
    let newDiv = document.createElement("div");
    newDiv.setAttribute("class", "wicumarian-name");
    newDiv.innerText = generator.getName() + ' ' + generator.getName();
    newDiv.style.fontFamily = fontStyles[randInclusive(0, fontStyles.length - 1)];

    document.querySelector("#bookpage").append(newDiv);
  }

  // Redraw features
  generateMagicWord();
  scrollHeight();

  time = Date.now() - time;
  responseTimes.times.push(time);
  responseTimes.avg = responseTimes.times.reduce( (acc, t) => {
    return acc + t}, 0) / responseTimes.times.length;

  if(responseTimes.avg > 20) responseTimes.overTimeCount++;

  if(responseTimes.overTimeCount > 3 && noiseFilterEnabled) {
    alert("ATTENZIONE: la Vibrazione ha rilevato che il tuo dispositivo sembra rispondere troppo lentamente al flusso magico sprigionato dal Registro. Alcune componenti grafiche verranno disabilitate.");

    let parch = document.querySelector("#parchment");
    parch.style.filter = "none";
    parch.style.backgroundImage = "none";
    noiseFilterEnabled = false;
  }
}






generateMagicWord();

let start = Date.now();

let responseTimes = {times: [15], avg: 0, overTimeCount: 0};
let noiseFilterEnabled = true;

const generator = new NameGenerator();
generator.createDatabaseFromText(divinaCommedia, 'syl');

//Print JSON strings to page (for copying)
// let content = generator.nameBitsDatabase.map( obj => {
//   let strObj = {
//     syl: obj.syl,
//     prev: Array.from(obj.prev),
//     next: Array.from(obj.next),
//     occurrences: obj.occurrences
//   }
//   return strObj;
// });

//document.querySelector("#bookpage").innerHTML = JSON.stringify(content);

//generator.importBits(jsonDB);

console.log("Database created in ", Date.now() - start, "ms");

