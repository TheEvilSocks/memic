// Lol, an anonymous function so you can't (easily) cheat.
(() => {
  const maxGuesses = 6;

  let chosenWord;
  let wrongChars = [];
  let rightChars = [];
  let guessCount = 0;
  let words;
  let top3k;

  let currentGuess = [];

  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.code === "Backspace") {
      event.preventDefault();
      if (currentGuess.length == 0) return;

      document.getElementById(`row-${guessCount}`).children[
        currentGuess.length - 1
      ].innerHTML = "";

      currentGuess = currentGuess.slice(0, -1);
      return;
    }

    if (event.code === "Enter") {
      event.preventDefault();
      if (currentGuess.length !== 5) return;
      console.log(
        currentGuess.join(""),
        chosenWord,
        currentGuess.join("") == chosenWord
      );

      if (!words.find((w) => w[0] == currentGuess.join(""))) {
        setInterval(() => {
          document
            .getElementById(`row-${guessCount}`)
            .classList.remove("shake");
        }, 820);
        document.getElementById(`row-${guessCount}`).classList.add("shake");
        return;
      }

      for (let i = 0; i < currentGuess.length; i++) {
        const currentTile = document.getElementById(`tile-${guessCount}-${i}`);

        if (chosenWord[i] === currentGuess[i]) {
          rightChars.push(currentGuess[i]);
          currentTile.classList.add("correct");
          continue;
        }

        if (chosenWord.includes(currentGuess[i])) {
          rightChars.push(currentGuess[i]);
          currentTile.classList.add("present");
          continue;
        }
        wrongChars.push(currentGuess[i]);
        currentTile.classList.add("wrong");
      }

      currentGuess = [];
      guessCount++;

      return;
    }

    if (!/^[A-z]$/.test(event.key)) return;
    event.preventDefault();
    if (currentGuess.length >= 5) return;
    document.getElementById(`row-${guessCount}`).children[
      currentGuess.length
    ].innerHTML = event.key;
    currentGuess.push(event.key);
  });

  fetch("words/en_US.json")
    .then((response) => response.json())
    .then((data) => {
      words = data;
      top3k = data.sort((a, b) => b[1] - a[1]).slice(0, 3000);
      document.getElementById("loading").style.display = "none";

      startGame();
    });

  function generateField(wordLength) {
    document.getElementById("game").innerHTML = "";
    for (let i = 0; i < maxGuesses; i++) {
      const row = document.createElement("div");
      row.classList.add("row");
      row.id = `row-${i}`;
      console.log(row);

      for (let j = 0; j < wordLength; j++) {
        const tile = document.createElement("div");
        tile.classList.add("tile");
        tile.id = `tile-${i}-${j}`;
        row.appendChild(tile);
      }

      document.getElementById("game").appendChild(row);
    }
  }

  function pickRandomWord() {
    let sum = 0;
    for (const [, weight] of top3k) sum += weight;

    const rand = Math.random() * sum;

    let total = 0;
    for (let i = 0; i < top3k.length; i++) {
      const word = top3k[i];
      total += word[1];
      if (rand <= total) {
        top3k[i][1] *= 0.69; // Lower the chance of encountering this word again
        return word[0];
      }
    }
  }

  function startGame() {
    chosenWord = pickRandomWord();
    wrongChars = [];
    rightChars = [];
    guessCount = 0;

    generateField(chosenWord.length);
    console.log(chosenWord);
  }

  generateField(5);
})();

setInterval(() => {
  for (let i = 0; i < 51; i++) {
    const randomColor = (((1 << 24) * Math.random()) | 0).toString(16);

    document.documentElement.style.setProperty(
      `--particle-${i + 1}`,
      `#${randomColor.padStart(6, "0")}`
    );
  }
}, 2500);
