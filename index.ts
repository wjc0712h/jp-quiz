import { kanaDB } from './db/kana.js';


document.addEventListener("DOMContentLoaded", () => {
  window.location.hash = '';
  const main = document.getElementById("main")!;
  if (!main) return;

  function MainMenu () {
    main.innerHTML = `
        <div class="container">
    <header>
      <h1 class="main-title">Quiz</h1>
    </header>
    <div class="button-container">
      <h2><button id="kana-btn" class="styled-button">Kana</button></h2>
      <h2><button id="kanji-btn" class="styled-button">Kanji</button></h2>
    </div>
  </div>
      `;
  }
  /*
  Kana
  */
  function kanaQuiz() {
    function kanaMain() {
      main.innerHTML = `
        <h2>kana quiz</h2>
        <div id="practice-buttons">
          <button id="practice-hiragana">Practice Hiragana</button>
          <button id="practice-katakana">Practice Katakana</button>
        </div>
        <h6>options</h6>
        <div id="practice-options">
          <button id="practice-basics" class='selected'>basics</button>
          <button id="practice-dakuten">dakuten</button>
          <button id="practice-combination">combinations</button>
          <button id="practice-all">all</button>
        </div>
    `;
    //Actual Quiz
    function StartQuiz(str:any) {
      let hash = window.location.href.split('#')[1];
      if(hash == null || hash == '')
        hash = "basics"
      
      let blocks:any = [] //[0] char, [1] kr, [2] en
      //console.log(str, hash)
      
      kanaDB.forEach((kanaGroup) => {
        kanaGroup.forEach((kana) => {
          if(hash == "all" && kana.type[1] == str.split(' ')[1].toLowerCase()) {
            blocks.push([kana.character,kana.kr,kana.en])
          } else if(kana.type[0] == hash && kana.type[1] == str.split(' ')[1].toLowerCase())
            blocks.push([kana.character,kana.kr,kana.en])
        });
      });
      blocks = shuffleArray(blocks)
      //console.log(blocks)
      
      
      //quiz screen
      let gridHTML = `<div id="grid">`;
      blocks.forEach((block: any, index: any) => {
          gridHTML += `
              <div id="card-${index}" class="card">
                  <div>${index+1}</div>
                  <p>${block[0]}</p>
                  <input type="text" id="guess-${index}" autocomplete="off" placeholder="">
              </div>
          `;
      });
      gridHTML += `</div>`;
      
      // Update main content
      main.innerHTML = `
        <div id="kana-quiz">
        <h2>${str}</h2>
        ${gridHTML}
        <button id="submit-quiz">Submit</button>
        <a id="back-menu"href="">Menu</a>
        </div>
      `;
      let wrongCounter = 0;
      let correctCount = 0;
      let emptyCounter = 0;
      blocks.forEach((block: any, index: any) => {
        const input = document.getElementById(`guess-${index}`) as HTMLInputElement;
        const card = document.getElementById(`card-${index}`);
    
        input.addEventListener('blur', () => {
          const userGuess = input.value.trim().toLowerCase();
          //console.log(userGuess)
          if (userGuess === block[1].toLowerCase() || userGuess === block[2].toLowerCase()) {
            card?.classList.add("correct");
            card?.classList.remove("wrong");
            correctCount += 1;
          } else if (userGuess != '') {
            card?.classList.add("wrong");
            card?.classList.remove("correct");
            wrongCounter += 1;
            //console.log(wrongCounter)
          }
        });
      });
      function displayResults(block:any, wrongCount: number, correctCount: number, emptyCounter: number) {
        let resultHTML = 
        `
        <h1>SCORE: ${((block.length-wrongCount-emptyCounter)/block.length * 100).toFixed(2)}%</h1>
        <h6>wrong: ${wrongCount}/<span style="font-size: 1rem">${block.length}</span></h2>
        <h6>correct: ${correctCount}/<span style="font-size: 1rem">${block.length}</span></h2>
        <h6>not answered: ${emptyCounter}/<span style="font-size: 1rem">${block.length}</span></h2>
        <a id="back-menu"href="">Menu</a>

        `;
        main.innerHTML = resultHTML;
      }
      document.getElementById("submit-quiz")!.addEventListener("click", () => {
        blocks.forEach((block: any, index: any) => {
          const input = document.getElementById(`guess-${index}`) as HTMLInputElement;
          if (input.value == null || input.value == '') {
            emptyCounter += 1
          } 
        })
        displayResults(blocks, wrongCounter, correctCount, emptyCounter);
      })
  }
    //event for selecting hiragana or katakana
    const buttons = document.getElementById("practice-buttons")?.querySelectorAll("*")!;
    buttons.forEach((btn) => {
      btn.addEventListener("click",() => {
        StartQuiz(btn.textContent!.trim())
      })
    })
    //event for options
    const option_btn = document.getElementById("practice-options")?.querySelectorAll("*")!;
    option_btn.forEach((button) => {
      button.addEventListener("click", () => {
        option_btn.forEach((btn) => btn.classList.remove("selected"));
  
        button.classList.add("selected");
        window.location.hash = '';
        window.location.hash = button.textContent!.trim();
      });
    });
    }
    kanaMain()
  }

  /*
  Kanji
  */
  function kanjiQuiz() {
    function kanaMain() {
      main.innerHTML = `
        <h2>kanji quiz</h2>
        <div id="practice-buttons">
          <button id="practice-kanji">first year</button>
          <button id="practice-kanji">second year</button>
          <button id="practice-kanji">third year</button>
          <button id="practice-kanji">fourth year</button>
          <button id="practice-kanji">fifth year</button>
          <button id="practice-kanji">sixth year</button>
        </div>`
        // <h6>options</h6>
        // <div id="practice-options">
        //   <button id="practice-basics" class='selected'>basics</button>
        //   <button id="practice-dakuten">dakuten</button>
        //   <button id="practice-combination">combinations</button>
        //   <button id="practice-all">all</button>
        // </div>
  }
  kanaMain()
}
  
  
  
  MainMenu()
  const kanaBtn = document.getElementById("kana-btn");
  const kanjiBtn = document.getElementById("kanji-btn");

    kanaBtn?.addEventListener("click", () => kanaQuiz());
    kanjiBtn?.addEventListener("click", () => kanjiQuiz());
  }
);

//randomizing array, suggested by chatGPT
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Pick a random index
      [array[i], array[j]] = [array[j], array[i]];  // Swap elements
  }
  return array;
}

