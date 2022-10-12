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
/** @type {{pos: Vector, anchor: Vector, vel: Vector, angle: Number}} */
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
/** @type {{pos: Vector, pastPos: Vector, vel: Vector}} */
let kernelArray;
/** @type {{pos: Vector, pastPos: Vector, vel: Vector}} */
let cookedArray;
/** @type {{pos: Vector, vel: Vector, lifetime: Number}} */
let flameArray;
let nextFlameTicks;
let nextPopTicks;
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
      anchor: vec(20, 20 + potHeight),
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
    nextFlameTicks = 30;
    nextPopTicks = 30;
    multiplier = difficulty;

    for (i = 0; i < 9; i++) {
      kernelArray.push({
        pos: vec(50 + rnd(-20, 20),50),
        pastPos: vec(50, 50),
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
  if (cooking) {
    --nextFlameTicks;
    --nextPopTicks;

    if (nextPopTicks <= 0) {
      nextPopTicks = rndi(30, 60);
      let pop = kernelArray.pop();
      pop.vel = vec(pop.vel).add(rnd(-4, 4), rnd(-6, -4));
      cookedArray.push(pop);
    }
    // we also perform the spawning (not handling!) of all flame particles in this block
    if (nextFlameTicks <= 0) {
      nextFlameTicks = rndi(30, 45);
      flameArray.push({
        pos: vec(pot.pos.x + rnd(potWidth), 100), // spawn the particle under the pot
        vel: vec(rnds(1), rnd(-1, 0)), // particle has random direction and speed
        lifetime: rndi(90, 120), // decrement every frame, remove when reaches 0
      })
    }
  }
  color("light_cyan");
  line(pot.pos, vec(pot.pos).add(potWidth, 0));
  color("cyan");
  line(pot.pos, vec(pot.pos).add(0, -potHeight));
  line(vec(pot.pos).add(potWidth, 0), vec(pot.pos).add(potWidth, -potHeight));
  char("a", pot.pos.x + potWidth / 2, pot.pos.y - potHeight - 5, 
    {
      scale: {x: 12, y: 3},
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
    --f.lifetime;
    if (f.lifetime <= 0) {
      return true;
    }
  })

  remove(kernelArray, (k) => {
    let kernelDim = 3;
    k.pastPos.set(k.pos);
    k.vel.y += 0.1;
    k.vel.mul(0.98);
    k.pos.add(k.vel);
    color("black");
    const c = box(k.pos, kernelDim).isColliding;
    if (c.rect.black || c.char.b) {
      color("transparent");
      const cx = arc(k.pastPos.x, k.pos.y, 3).isColliding;
      const cy = arc(k.pos.x, k.pastPos.y, 3).isColliding;
      // may desire to comment this out later
      if (!(cx.rect.black || cx.char.b)) {
        reflect(k, k.vel.x > 0 ? -PI : 0);
      }
      if (!(cy.rect.black || cy.char.b)) {
        reflect(k, k.vel.y > 0 ? -PI / 2 : PI / 2);
      }
    }
    if (c.char.a) {
      reflect(k, PI / 2);
    }
    if (c.rect.cyan) {
      reflect(k, k.pos.x < 50 ? 0 : PI, "cyan");
    }
    color("transparent");
    while (k.pos.y + k.vel.y > pot.pos.y - kernelDim)
    {
      if (k.vel.y > 0) k.vel.y *= -0.8;
      k.pos.y += -0.1;
    }
  })

  remove(cookedArray, (k) => {
    k.pastPos.set(k.pos);
    if (k.vel.y < 0.5 && rnd() > 0.996 && cooking)
    {
      k.vel = vec(k.vel).add(rnd(-2.5, 2.5), rnd(-3, -2));
    }
    k.vel.y += 0.1;
    k.vel.mul(0.98);
    k.pos.add(k.vel);
    color("black");
    const c = char("b", k.pos, {scale: {x: 0.5, y: 0.5}}).isColliding;
    if (c.rect.black || c.char.b) {
      color("transparent");
      const cx = arc(k.pastPos.x, k.pos.y, 3).isColliding;
      const cy = arc(k.pos.x, k.pastPos.y, 3).isColliding;
      // may desire to comment this out later
      if (!(cx.rect.black || cx.char.b)) {
        reflect(k, k.vel.x > 0 ? -PI : 0);
      }
      if (!(cy.rect.black || cy.char.b)) {
        reflect(k, k.vel.y > 0 ? -PI / 2 : PI / 2);
      }
    }
    if (c.char.a) {
      reflect(k, PI / 2);
    }
    if (c.rect.cyan) {
      reflect(k, k.pos.x < 50 ? 0 : PI, "cyan");
    }
    color("transparent");
    while (k.pos.y + k.vel.y > pot.pos.y - 3)
    {
      if (k.vel.y > 0) k.vel.y *= -0.8;
      k.pos.y += -0.1;
    }
  })
}
// Original code by Kenta Cho
// https://github.com/abagames
function reflect(b, a, c) {
  const oa = wrap(b.vel.angle - a - PI, -PI, PI);
  if (abs(oa) < PI / 2) {
    b.vel.addWithAngle(a, b.vel.length * cos(oa) * 1.7);
  }
  if (c != null) {
    color("transparent");
    for (let i = 0; i < 9; i++) {
      b.pos.addWithAngle(a, 1);
      if (!arc(b.pos, ballRadius).isColliding.rect[c]) {
        break;
      }
    }
  }
}

addEventListener("load", onLoad);