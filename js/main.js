// If true, prevent submits with partial answers
var FORCE_ANSWERS = false;
// Negative score for wrong answer
var LOSS = 2;

// Global vars, because we don't care about good programming <3
var question;
var questionScore;
var questions;

// This is for IE, the most beautiful browser in the world :')
if (![].includes) {
  Array.prototype.includes = function(searchElement /*, fromIndex*/ ) {
    'use strict';
    var O = Object(this);
    var len = parseInt(O.length) || 0;
    if (len === 0) {
      return false;
    }
    var n = parseInt(arguments[1]) || 0;
    var k;
    if (n >= 0) {
      k = n;
    } else {
      k = len + n;
      if (k < 0) {k = 0;}
    }
    var currentElement;
    while (k < len) {
      currentElement = O[k];
      if (searchElement === currentElement ||
         (searchElement !== searchElement && currentElement !== currentElement)) {
        return true;
      }
      k++;
    }
    return false;
  };
}

function updateScore(delta) {
  var st = window.localStorage;

  // Get score from browser's local storage (and convert to integer)
  score = JSON.parse(st.getItem("score"));

  // First time the score is null
  if (score === null) {
    score = 0;
  }

  // Update with the given delta
  score += delta;
  st.setItem("score", score);

  // Update the view
  $("#score").text("Score: " + score);

  console.log("SCORE:", score);
}

function main() {
  console.log("INIT");

	// Put this code at the end of the <body>.
	document.querySelector("form").addEventListener("keyup", function(event) {
			if(event.key !== "Enter") return; // Use `.key` instead.
			document.querySelector("#submit").click(); // Things you want to do.
			event.preventDefault(); // No need to `return false;`.
	});

  // Init the score
  updateScore(0);

  // Get asd from "page.html#asd"
  var hash = window.location.hash.substr(1).toLowerCase();
  console.log("HASH", hash);

  // Use hash to choose between the different datasets
  var d1, d2;
  if (hash == "a") {
    d1 = $.get("data/normal_sent_A.txt");
    d2 = $.get("data/scrambled_sent_B.txt");
  } else if (hash == "b") {
    d1 = $.get("data/normal_sent_B.txt");
    d2 = $.get("data/scrambled_sent_A.txt");
  } else {
    // Wrong hash given to page :/
    console.log("WTF :/");
    $("#score").text("SOMETHING WENT WRONG");
    return;
  }

  // Setup submit button handler
  $("#submit").click(function (event) {
    console.log("SUBMIT");
    endLevel();
    event.preventDefault();
  });

  // Execute after both files are loaded
  $.when(d1, d2).done(function (f1, f2) {
    f1 = $.trim(f1[0]);
    f2 = $.trim(f2[0]);
    var merge = f1 + "\n" + f2;
    merge = merge.toLowerCase();

    // Split the file in lines (regex is platform-independent)
    var lines = merge.split(/\s*\r?\n/);
    // Split the lines in words
    questions = lines.map(function (l) { return l.split(/\s+/); });
    // Init the game
    startLevel();
  });
}

function startLevel() {
  // Choose a random question
  question = questions[Math.floor(Math.random() * questions.length)];
  console.log("QUESTION:", question);

  // No. of hints to give to the user
  var hints = 1 + Math.floor(Math.random() * 2);
  console.log("HINTS:", hints);

  // Get hints indexes
  var hintIndexes = [];
  while (hintIndexes.length != hints) {
    var guess = Math.floor(Math.random() * 4);
    if (!hintIndexes.includes(guess)) {
      hintIndexes.push(guess);
    }
  }

  // Set the score delta for this question (1 => 10, 2 => 5)
  questionScore = 5 * (3 - hints);

  // Update the view with the hints
  var i;
  var word;
  var wordId;
  for (i=0; i<4; i++) {
    wordId = "#word" + i;
    word = question[i];
    if (hintIndexes.includes(i)) {
      $(wordId).prop("disabled", true);
      $(wordId).val(word);
    } else {
      $(wordId).prop("disabled", false);
      $(wordId).val("");
    }
  }

  // Show the form (at page load it's hidden)
  $("form").show();
}

function endLevel() {
  var answer;
  var answers = [];
  var i;

  // Parse the answers
  for (i=0; i<4; i++) {
    answer = $.trim($("#word" + i).val()).toLowerCase();
    if (FORCE_ANSWERS && answer === "") {
      alert("Please complete the question");
      return;
    }
    answers.push(answer);
  }
  console.log("ANSWERS:", answers);

  // Check the answers
  var equal = true;
  for (i=0; i<4; i++) {
    console.log(question[i], answers[i]);
    if (question[i] != answers[i]) {
      equal = false;
      break;
    }
  }
  console.log("EQUAL", equal);

  // Update score
  var image;
  if (equal) {
    image = "#win";
    updateScore(questionScore);
  } else {
    image = "#lose";
    updateScore(-LOSS);
  }

  // Show beautiful image
  $(image).show(0).delay(0).fadeOut(500);

  // New level
  startLevel();
}

$(document).ready(main);

