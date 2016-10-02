$(function () {

  var ROCK = "rock";
  var PAPER = "paper";
  var SCISSORS = "scissors";
  var UNDECIDED = "undecided";

  var WIN = "WIN";
  var LOSE = "LOSE";
  var TIE = "TIE";

  var allPossibleChoices = [ROCK, PAPER, SCISSORS];

  var btnRock = $("#btnRock");
  var btnPaper = $("#btnPaper");
  var btnScissors = $("#btnScissors");
  var btnPlay = $("#btnPlay");
  var btnReset = $("#btnReset");

  var playerCard = $("#playerCard");
  var aiCard = $("#aiCard");

  var $wins = $("#wins");
  var $ties = $("#ties");
  var $losses = $("#losses");

  var gameTime = $("#gameTime");
  var roundTime = $("#roundTime");
  var currentRound = $("#currentRound");
  var roundResult = $("#roundResult");
  var history = $("#history");

  var roundTimeTimerId;

  var roundChoicesAndOutcome;
  var roundHistory;
  var roundNumber;

  var wins;
  var ties;
  var losses;

  var gameStartTime;
  var roundStartTime;

  init();
  resetPlayerChoices();

  function init() {
    btnRock.click(onRockSelected);
    btnPaper.click(onPaperSelected);
    btnScissors.click(onScissorsSelected);
    btnPlay.click(onPlayClicked);
    btnReset.click(onResetClicked);
    setInterval(updateGameTime, 1000);

    initGameData();
    initNewRound();
  }

  function initGameData() {
    resetPlayerChoices();
    roundHistory = [];
    roundNumber = 0;
    gameStartTime = new Date();
    wins = 0;
    ties = 0;
    losses = 0;
  }

  function resetPlayerChoices() {
    roundChoicesAndOutcome = new RoundChoiceAndOutcome();
    roundChoicesAndOutcome.roundId = roundNumber;
  }

  function initNewRound() {
    playerCard.removeClass().addClass(UNDECIDED);
    aiCard.removeClass().addClass(UNDECIDED);

    btnPlay.prop("disabled", true);
    btnReset.prop("disabled", true);
    currentRound.text(roundNumber);
    roundStartTime = new Date();
    roundTimeTimerId = setInterval(updateRoundTime, 1000);
    updateRoundTime();
    updateGameTime();
    updateScoreBoard();
    roundResult.text("-");
    incrementRoundNumberAndUpdateUi();
    resetPlayerChoices();
  }

  function updateGameTime() {
    var now = new Date();
    var diff = now - gameStartTime;
    gameTime.text(msToTime(diff));
  }
  
  function updateRoundTime() {
    var now = new Date();
    var diff = now - roundStartTime;
    roundTime.text(msToTime(diff));
  }

  function incrementRoundNumberAndUpdateUi() {
    roundNumber++;
    currentRound.text(roundNumber);
  }

  function updateScoreBoard() {
    $wins.text(wins);
    $ties.text(ties);
    $losses.text(losses);
  }

  function msToTime(s) {
    var ms = s % 1000;
    s = (s - ms) / 1000;
    var secs = s % 60;
    s = (s - secs) / 60;
    var mins = s % 60;
    var hrs = (s - mins) / 60;

    return hrs + 'h: ' + mins + 'm: ' + secs + 's';
  }

  function onRockSelected() {
    roundChoicesAndOutcome.playerChoice = ROCK;
    btnPlay.prop("disabled", false);
    updateUiBasedOnPlayerChoice();
  }

  function onPaperSelected() {
    roundChoicesAndOutcome.playerChoice = PAPER;
    btnPlay.prop("disabled", false);
    updateUiBasedOnPlayerChoice();
  }

  function onScissorsSelected() {
    roundChoicesAndOutcome.playerChoice = SCISSORS;
    btnPlay.prop("disabled", false);
    updateUiBasedOnPlayerChoice();
  }

  function updateUiBasedOnPlayerChoice() {
    playerCard.removeClass().addClass(roundChoicesAndOutcome.playerChoice);
  }

  function onPlayClicked() {
    btnRock.prop("disabled", true);
    btnPaper.prop("disabled", true);
    btnScissors.prop("disabled", true);
    btnPlay.prop("disabled", true);
    generateAiDecisionAndShowGameResult();
    updateScoreModelAndUi();
    updateHistoryUi();
    clearInterval(roundTimeTimerId);
    btnReset.prop("disabled", false);
  }

  function onResetClicked() {
    btnRock.prop("disabled", false);
    btnPaper.prop("disabled", false);
    btnScissors.prop("disabled", false);
    btnPlay.prop("disabled", true);
    btnReset.prop("disabled", true);

    initNewRound();
  }

  function saveRoundHistory() {
    roundHistory.push(roundChoicesAndOutcome);
    if (roundHistory.length > 5) {
      roundHistory.shift();
    }
  }

  function generateAiDecisionAndShowGameResult() {
    roundChoicesAndOutcome.aiChoice = generateAiChoice();
    roundChoicesAndOutcome.outcome = calculateRoundOutcome(roundChoicesAndOutcome.playerChoice, roundChoicesAndOutcome.aiChoice);

    aiCard.removeClass().addClass(roundChoicesAndOutcome.aiChoice);
    roundResult.text(roundChoicesAndOutcome.outcome);
    saveRoundHistory();
  }

  function updateScoreModelAndUi() {
    if (roundChoicesAndOutcome.outcome == WIN) {
      wins++;
    } else if (roundChoicesAndOutcome.outcome == TIE) {
      ties++;
    } else if (roundChoicesAndOutcome.outcome == LOSE) {
      losses++;
    }
    updateScoreBoard();
  }

  function updateHistoryUi() {
    history.empty();
    for (var i = roundHistory.length - 1; i >= 0; i--) {
      var rh = roundHistory[i];
      var roundHistoryText = rh.roundId + ": " + rh.playerChoice + " VS " + rh.aiChoice + " = " + rh.outcome;
      var $p = $("<p/>");
      $p.text(roundHistoryText);
      $p.appendTo(history);
    }
  }

  function generateAiChoice() {
    var ROUND_AMOUNT_TO_CONSIDER = 4;
    if (roundHistory.length >= ROUND_AMOUNT_TO_CONSIDER) {
      var previousPlayerChoice = null;
      for (var i = roundHistory.length - 1; i >= roundHistory.length - ROUND_AMOUNT_TO_CONSIDER; i--) {
        if (previousPlayerChoice != null && previousPlayerChoice != roundHistory[i].playerChoice) {
          previousPlayerChoice = null;
          break;
        }
        previousPlayerChoice = roundHistory[i].playerChoice;
      }
      if (previousPlayerChoice != null) {
        return getWinningMoveAgainstSelection(previousPlayerChoice);
      }
    }
    return allPossibleChoices[Math.floor(Math.random() * allPossibleChoices.length)];
  }

  function calculateRoundOutcome(playerChoice, aiChoice) {
    if (playerChoice == aiChoice) {
      return TIE;
    }
    if (playerChoice == ROCK) {
      if (aiChoice == PAPER) {
        return LOSE;
      }
      if (aiChoice == SCISSORS) {
        return WIN;
      }
    }
    if (playerChoice == PAPER) {
      if (aiChoice == ROCK) {
        return WIN;
      }
      if (aiChoice == SCISSORS) {
        return LOSE;
      }
    }
    if (playerChoice == SCISSORS) {
      if (aiChoice == ROCK) {
        return LOSE;
      }
      if (aiChoice == PAPER) {
        return WIN;
      }
    }
  }

  function getWinningMoveAgainstSelection(selection) {
    if (selection == ROCK) {
      return PAPER;
    }
    if (selection == PAPER) {
      return SCISSORS;
    }
    if (selection == SCISSORS) {
      return ROCK;
    }
  }

  function RoundChoiceAndOutcome() {
    var roundId;
    var playerChoice;
    var aiChoice;
    var outcome;

    return this;
  }
});