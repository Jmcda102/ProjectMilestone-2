/*
  File: quiz/script.js
  Project: IT 3203 Web Development, Milestone 2
  Author: Julien McDaniel
  Purpose: Checks the HTTP quiz answers, shows which are right or wrong,
           calculates the score, and shows pass or fail.
*/

// ===== 1. Answer key =====
// Each question has the correct answer and the text to show the user.
var answerKey = {
  q1: { type: "text",     correct: "transfer",                 show: "Transfer" },
  q2: { type: "radio",    correct: "b",                        show: "HTTP/1.1" },
  q3: { type: "radio",    correct: "c",                        show: "404" },
  q4: { type: "radio",    correct: "b",                        show: "QUIC (over UDP)" },
  q5: { type: "checkbox", correct: ["GET", "POST", "DELETE"],  show: "GET, POST, and DELETE" }
};

var PASSING_PERCENT = 80; // 4 out of 5 questions

// ===== 2. Get the page elements we need =====
var quizForm    = document.getElementById("quiz-form");
var formMessage = document.getElementById("form-message");
var resultsBox  = document.getElementById("results");
var scoreText   = document.getElementById("score-text");
var passText    = document.getElementById("pass-text");


// ===== 3. Helper functions to read the user's answers =====

// Returns the typed text for a fill in the blank question
function getTextAnswer(name) {
  return document.getElementById(name).value.trim().toLowerCase();
}

// Returns the value of the selected radio button, or "" if none
function getRadioAnswer(name) {
  var selected = document.querySelector('input[name="' + name + '"]:checked');
  if (selected) {
    return selected.value;
  }
  return "";
}

// Returns an array of all checked checkbox values
function getCheckboxAnswers(name) {
  var boxes = document.querySelectorAll('input[name="' + name + '"]:checked');
  var values = [];
  for (var i = 0; i < boxes.length; i++) {
    values.push(boxes[i].value);
  }
  return values;
}

// Gets the user's answer for any question based on its type
function getAnswer(name) {
  var type = answerKey[name].type;
  if (type === "text") {
    return getTextAnswer(name);
  } else if (type === "radio") {
    return getRadioAnswer(name);
  } else {
    return getCheckboxAnswers(name);
  }
}

// Returns true if the user left the question blank
function isBlank(answer) {
  return answer === "" || answer.length === 0;
}


// ===== 4. Check if one answer is correct =====
function isCorrect(name, answer) {
  var key = answerKey[name];

  if (key.type === "checkbox") {
    // Must pick every correct box and no wrong boxes
    if (answer.length !== key.correct.length) {
      return false;
    }
    for (var i = 0; i < key.correct.length; i++) {
      if (answer.indexOf(key.correct[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  return answer === key.correct;
}


// ===== 5. Clear old colors and messages =====
function clearFeedback() {
  formMessage.textContent = "";
  for (var name in answerKey) {
    var box = document.getElementById(name + "-box");
    box.classList.remove("correct", "incorrect", "unanswered");
    document.getElementById(name + "-feedback").textContent = "";
  }
}


// ===== 6. Handle the form submit (grade the quiz) =====
function gradeQuiz(event) {
  // Stop the form from reloading the page
  event.preventDefault();
  clearFeedback();

  // First make sure every question is answered
  var missing = 0;
  for (var name in answerKey) {
    if (isBlank(getAnswer(name))) {
      document.getElementById(name + "-box").classList.add("unanswered");
      missing++;
    }
  }

  if (missing > 0) {
    formMessage.textContent = "Please answer all questions. " + missing + " still blank.";
    resultsBox.classList.add("hidden");
    return;
  }

  // Grade each question and add up the score
  var score = 0;
  var total = 0;

  for (var q in answerKey) {
    total++;
    var box = document.getElementById(q + "-box");
    var feedback = document.getElementById(q + "-feedback");

    if (isCorrect(q, getAnswer(q))) {
      score++;
      box.classList.add("correct");
      feedback.textContent = "Correct";
    } else {
      box.classList.add("incorrect");
      feedback.textContent = "Incorrect. The correct answer is: " + answerKey[q].show;
    }
  }

  // Work out the percent and pass or fail
  var percent = Math.round((score / total) * 100);
  scoreText.textContent = "You scored " + score + " out of " + total + " (" + percent + "%).";

  if (percent >= PASSING_PERCENT) {
    passText.textContent = "PASS - Nice work.";
    passText.className = "pass-text pass";
  } else {
    passText.textContent = "FAIL - Review the pages and try again.";
    passText.className = "pass-text fail";
  }

  // Show the results box and scroll to it
  resultsBox.classList.remove("hidden");
  resultsBox.scrollIntoView({ behavior: "smooth" });
}


// ===== 7. Handle the Retake button (reset the quiz) =====
function resetQuiz() {
  // The form clears the inputs by itself. We clear our colors and results.
  clearFeedback();
  resultsBox.classList.add("hidden");
  scoreText.textContent = "";
  passText.textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}


// ===== 8. Remove the orange "unanswered" mark once the user answers =====
function markAnswered(event) {
  var box = event.target.closest(".question");
  if (box) {
    box.classList.remove("unanswered");
  }
}


// ===== 9. Event listeners =====
quizForm.addEventListener("submit", gradeQuiz);
quizForm.addEventListener("reset", resetQuiz);
quizForm.addEventListener("input", markAnswered);
quizForm.addEventListener("change", markAnswered);
