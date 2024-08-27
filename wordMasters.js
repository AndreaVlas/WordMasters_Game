const letters = document.querySelectorAll(".scoreboard-letter");
const loadingDiv = document.querySelector(".info-bar");
const answerLength = 5;
const Rounds = 6;

async function init() {
  let currentGuess = "";
  let currentRow = 0;
  let isLoading = true;

  const res = await fetch("https://words.dev-apis.com/word-of-the-day");
  const resObject = await res.json();
  const word = resObject.word.toUpperCase();
  const wordParts = word.split("");
  let done = false;
  setLoading(false);
  isLoading = false;
  console.log(word);

  function addLetter(letter) {
    if (currentGuess.length < answerLength) {
      currentGuess += letter;
    } else {
      currentGuess =
        currentGuess.substring(0, currentGuess.length - 1) + letter;
    }
    letters[answerLength * currentRow + currentGuess.length - 1].innerHTML =
      letter;
  }

  async function commit() {
    if (currentGuess.length !== answerLength) {
      return;
    }
    isLoading = true;
    setLoading(true);
    const res = await fetch("https://words.dev-apis.com/validate-word", {
      method: "POST",
      body: JSON.stringify({ word: currentGuess }),
    });

    const resObject = await res.json();
    const validWord = resObject.validWord;
    //const {validWord} = resObject;
    isLoading = false;
    setLoading(false);

    if (!validWord) {
      markInvalidWord();
      return;
    }

    const guessParts = currentGuess.split("");
    const map = makeMap(wordParts);
    for (i = 0; i < answerLength; i++) {
      if (guessParts[i] === wordParts[i]) {
        letters[currentRow * answerLength + i].classList.add("correct");
        map[guessParts[i]]--;
      }
    }

    for (let i = 0; i < answerLength; i++) {
      if (guessParts[i] === wordParts[i]) {
      } else if (map[guessParts[i]] && map[guessParts[i]] > 0) {
        allRight = false;
        letters[currentRow * answerLength + i].classList.add("close");
        map[guessParts[i]]--;
      } else {
        allRight = false;
        letters[currentRow * answerLength + i].classList.add("wrong");
      }
    }
    currentRow++;
    if (currentGuess === word) {
      alert("you win");
      document.querySelector(".brand").classList.add("winner");
      done = true;
      return;
    } else if (currentRow === Rounds) {
      alert(`you lost, the word was ${word}`);
      done = true;
    }
    currentGuess = "";
  }

  function backspace() {
    currentGuess = currentGuess.substring(0, currentGuess.length - 1);
    letters[answerLength * currentRow + currentGuess.length].innerHTML = "";
  }

  function markInvalidWord() {
    for (let i = 0; i < answerLength; i++) {
      letters[currentRow * answerLength + i].classList.remove("invalid");
      setTimeout(function () {
        letters[currentRow * answerLength + i].classList.add("invalid");
      }, 10);
    }
  }

  document.addEventListener("keydown", function handleKeyPress(event) {
    if (done || isLoading) {
      //
      return;
    }

    const action = event.key;
    console.log(action);

    switch (true) {
      case action === "Enter":
        commit();
        break;
      case action === "Backspace":
        backspace();
        break;
      case isLetter(action):
        addLetter(action.toUpperCase());
        break;
      default:
        console.warn("Unhandled action: ", action);
    }
  });
}
function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading) {
  loadingDiv.classList.toggle("hidden", !isLoading);
}

function makeMap(array) {
  const obj = {};
  for (let i = 0; i < array.length; i++) {
    const letter = array[i];
    if (obj[letter]) {
      obj[letter]++;
    } else {
      obj[letter] = 1;
    }
  }
  return obj;
}

init();
