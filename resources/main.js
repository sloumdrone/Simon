var turn = 0;
var gameState = false;
var audioPlaying = false;
var clickable = false;
var playerClickCount = -1;
var audioContext = new AudioContext();
var osc = audioContext.createOscillator();
var gainNode = audioContext.createGain();
var frequencies = {
  0 : 164.81,
  1 : 220.0,
  2 : 277.18,
  3 : 329.63,
  "top-left slice" : 164.81,
  "top-right slice" : 220,
  "bottom-left slice" : 277.18,
  "bottom-right slice" : 329.63
}
var gamePattern = [];
var playerPattern = [];

$(document).ready(attachClickHandlers);

function attachClickHandlers(){
  $('.slice').mousedown(sendFrequency);
  $('body').mouseup(stopPlaying);
  $('span').click(function(){
    if (!gameState){
      $('.indicator').css('background-color','green');
      newGame();
    }
  })
}

function sendFrequency(){
  if (clickable){
    var classList = $(this).attr('class');
    playerPattern.push(frequencies[classList]);
    audioPlaying = true;
    return play(frequencies[classList]);
  }
}

function addSoundToArray(){
  var randNote = Math.floor(Math.random() * 4);
  gamePattern.push(frequencies[randNote]);
  $('.counter').text(gamePattern.length);
}

function play(note){
  osc.frequency.setValueAtTime( note, 0 );
  gainNode.gain.value = 0.5;
}

function stopPlaying(){
  gainNode.gain.value = 0.0;
  if (turn && audioPlaying){
    audioPlaying = false;
    playerClickCount++;
    checkPatternMatch();
  }
}

function checkPatternMatch(){
  if (gamePattern[playerClickCount] !== playerPattern[playerClickCount]){
    playerPattern = [];
    $('.indicator').css('background-color','red');
    gameState = false;
    clickable = false;
    play(100.27);
    setTimeout(function(){
      stopPlaying()
    },1200);
  } else {
    if (gamePattern.length === playerPattern.length) {
        playerPattern = [];
        turn = 0;
        playerClickCount = -1;
        clickable = false;
        gameFlow();
    }
  }
}

function aiTurn(){
  var currentSound = 0;
  setTimeout(function(){
      nextSound();
  },500);


  function nextSound(){
    setTimeout(function(){
      play(gamePattern[currentSound]);
      $('.slice[tone="' + gamePattern[currentSound] + '"]').toggleClass('aiPlay');
    },300)

    setTimeout(function(){
      stopPlaying();
      $('.slice[tone="' + gamePattern[currentSound] + '"]').toggleClass('aiPlay');
      currentSound++;
      if (currentSound < gamePattern.length){
        return nextSound();
      } else {
        clickable = true;
        turn = 1;
        gameFlow();
      }
    },700);

  }
}

function newGame(){
  gamePattern = [];
  playerPattern = [];
  gameState = true;
  audioPlaying = false;
  clickable = false;
  playerClickCount = -1;
  turn = 0;

  gameFlow();
}

function gameFlow(){
  if (!turn){
    addSoundToArray();
    aiTurn();
  }
}


osc.connect(gainNode);
gainNode.connect(audioContext.destination);
osc.type = 'triangle';
osc.start();
gainNode.gain.value = 0.0;
