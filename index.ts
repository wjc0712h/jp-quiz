import { kanaDB } from './db/kana.js';


document.addEventListener("DOMContentLoaded", () => {
  window.location.hash = '';
  const main = document.getElementById("main")!;
  if (!main) return;

  function MainMenu () {
    main.innerHTML = `
        <h2><button id="kana-btn">Kana</button></h2>
        <h2><button id="kanji-btn">Kanji</button></h2>
      `;
  }
  function kanaQuiz() {
    function kanaMain() {
      main.innerHTML = `
        <h2>kana</h2>
        <div id="practice-buttons">
          <button id="practice-hiragana">Practice Hiragana</button>
          <button id="practice-katakana">Practice Katakana</button>
        </div>
        <div id="practice-options">
          <button id="practice-all">all</button>
          <button id="practice-dakuten">dakuten</button>
          <button id="practice-combination">conbinations</button>
        </div>
    `;
    //Actual Quiz
    function StartQuiz(str:any) {
      const hash = window.location.href.split('#')[1];
      console.log(str, hash)
      console.log(kanaDB);
      
      kanaDB.forEach((kanaGroup) => {
        kanaGroup.forEach((kana) => {
          if(kana.type[0] == "basics" && kana.type[1] == str.split(' ')[1].toLowerCase())
            console.log(kana.character, kana.en);
        });
      });

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
  function kanjiQuiz() {
    main.innerHTML = `
      <h2>kanji</h2>
      <p>test</p>
  `;
  }
  MainMenu()
  const kanaBtn = document.getElementById("kana-btn");
  const kanjiBtn = document.getElementById("kanji-btn");

    kanaBtn?.addEventListener("click", () => kanaQuiz());
    kanjiBtn?.addEventListener("click", () => kanjiQuiz());
  }
);
