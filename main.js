title = "POPCORN";

description = `
[Hold] Cook/Move
[Release] Launch
`;

characters = [
  `
  ll
llllll
  `,
  `
  yyy 
 yy  y
yyyy y
yyyyyy
 yyyy 
  yy  
  `,
];

options = {
  isPlayingBgm: true,
  isReplayEnabled: true,
};
/** @type {{pos: Vector, vel: Vector}}*/
let pot;
/** @type {{pos: Vector, vel: Vector, angle: Number}} */
let lid;
const potHeight = 35;
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
      pos: vec(20, 90), // Corresponds to left corner of pot
      vel: vec(0, 0),
    };
    lid = {
      pos: vec(20 + potWidth/2, 20 + potHeight),
      vel: vec(0, 0),
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
      });
    }
    needsInit = false;
  }

  // Do not draw objects in this block as they will disappear
  // the instant the button releases.
  if (preCooking || cooking) {
    // perform all kernel physics handling in this block
  }
  line(pot.pos, vec(pot.pos).add(potWidth, 0));
  line(pot.pos, vec(pot.pos).add(0, -potHeight));
  line(vec(pot.pos).add(potWidth, 0), vec(pot.pos).add(potWidth, -potHeight));
  char("a", pot.pos.x + potWidth / 2, pot.pos.y - potHeight - 7, 
    {
      scale: {x: 11, y: 3},
    });
}

addEventListener("load", onLoad);