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
let postCooking;
let cornCooked;
let catchTimer;
let cornLost;
/** @type {{pos: Vector, vel: Vector}} */
let kernelArray;
/** @type {{pos: Vector, vel: Vector}} */
let cookedArray;
/** @type {{pos: Vector, vel: Vector, lifetime: Number}} */
let flameArray;
let nextFlameTicks;
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
    postCooking = false;
    cornCooked = 0;
    cornLost = 0;
    kernelArray = [];
    cookedArray = [];
    flameArray = [];
    nextFlameTicks = 0;
    multiplier = difficulty;

    for (i = 0; i < 15; i++) {
      kernelArray.push({
        pos: vec(0,0),
        vel: vec(0,0),
      });
    }
    needsInit = false;
  }

  if (input.isPressed && ticks > 60) {
    if (postCooking) {
      // move lid right
    } else if (!cooking) {
      cooking = true;
      preCooking = false;
    }
  }
  if (postCooking && !(input.isPressed)) {
    // move lid left
  }
  if (input.isJustReleased && cooking) {
    cooking = false;
    postCooking = true;
  }

  // Do not draw objects in this block as they will disappear
  // the instant the button releases.
  if (preCooking || cooking) {
    if (cooking) ++nextFlameTicks;
    // perform all kernel physics handling in this block

    // we also perform the spawning (not handling!) of all flame particles in this block
    if (nextFlameTicks >= 10) {
      nextFlameTicks = 0;
      flameArray.push({
        pos: vec(pot.pos.x + rnd(potWidth), 100), // spawn the particle under the pot
        vel: vec(rnds(1), rnd(-1, 0)), // particle has random direction and speed
        lifetime: rndi(90, 120), // decrement every frame, remove when reaches 0
      })
    }
  }
  line(pot.pos, vec(pot.pos).add(potWidth, 0));
  line(pot.pos, vec(pot.pos).add(0, -potHeight));
  line(vec(pot.pos).add(potWidth, 0), vec(pot.pos).add(potWidth, -potHeight));
  char("a", pot.pos.x + potWidth / 2, pot.pos.y - potHeight - 7, 
    {
      scale: {x: 11, y: 3},
    });

  // this is where we can actually handle moving and drawing the flame particles we spawned
  remove(flameArray, (f) => {
    // adjust the flames position using its velocity

    // draw a box at flame's current position
    box(vec(f.pos), 3);

    // also have room to mess with the flame's velocity; apply random scalars to simulate
    // air friction or air currents; could also use a sin() or cos() to generate wave motion
    // and apply to one of the axes of velocity
    // also feel free to add stuff like spawn particles off the flames randomly

    // kill the flame if too old
    if (f.lifetime <= 0) {
      return true;
    }
  })
}

addEventListener("load", onLoad);