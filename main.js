title = "POPCORN";

description = `
[Hold] Cook/Move
[Release] Launch
`;

characters = [
  `
  ll
llllll
  `
  `
  yyy 
 yy  y
yyyy y
yyyyyy
 yyyy 
  yy  
  `
];

options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
};
/** @type {{pos: Vector, vel: Vector}}*/
let pot;
/** @type {{pos: Vector, vel: Vector, angle: Number}} */
let lid;
const potHeight = 30;
const potWidth = 60;
let needsInit;
let preCooking;
let cooking;
let cornCooked;
let catchTimer;
let cornLost;
let kernelArray;
let cookedArray;
let multiplier;

function update() {  
  if (!ticks) {
    needsInit = true;    
  }
  if (needsInit) {
    pot = {
      pos: vec(20, 20),
      vel: vec(0, 0),
    };
    lid = {
      pos: vec(20 + potWidth/2, 20 + potHeight),
      vel: vec(0, 0);
      angle: 0,
    };
    preCooking = true;
    cooking = false;
    cornCooked = 0;
    cornLost = 0;
    kernelArray = [];
    cookedArray = [];
    multiplier = difficulty;

    for (i = 0; i < 15; i++) {
      kernelArray.push({
        pos: vec(0,0),
        vel: vec(0,0),
      })
    }
  }

  if (preCooking || cooking) {
    // perform all kernel physics handling in this block
  }
}

addEventListener("load", onLoad);