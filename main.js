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
let rot1Complete;
let rot1Ticks;
let rot2Complete;
let nextCornTicks;
let completeTicks;
let scr;
let cornSpawned;
let initTicks;
let pAngle;

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
      pos: vec(20 + potWidth/2, 20 + potHeight - 3),
      anchor: vec(20, 20 + potHeight - 3),
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
    catchArray = [];
    flameArray = [];
    nextFlameTicks = 30;
    nextPopTicks = 30;
    multiplier = difficulty;
    pAngle = 0;
    rot1Complete = false;
    rot1Ticks = 0;
    rot2Complete = false;
    scr = 0;
    nextCornTicks = 0;
    cornSpawned = 0;
    completeTicks = 0;
    initTicks = 0;

    for (i = 0; i < 15; i++) {
      kernelArray.push({
        pos: vec(50 + rnd(-potWidth / 2, potWidth / 2),70 + rnd(-10, 10)),
        pastPos: vec(50, 50),
        vel: vec((rnd(-1, 1)),0),
      });
    }
    needsInit = false;
  }
  initTicks++;
  if (input.isPressed && initTicks > 60) {
    if (rot2Complete) {
      // move lid left
      
      lid.anchor.x = Math.max(lid.anchor.x - (0.8 * difficulty), 42);
    } else if (!cooking) {
      cooking = true;
      preCooking = false;
    }
  }
  if (rot2Complete && !(input.isPressed)) {
    // move lid right
    lid.anchor.x = Math.min(lid.anchor.x + (0.8 * difficulty), 120);
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

    // pop corn
    if (nextPopTicks <= 0) {
      nextPopTicks = rndi(30, 60);
      let pop = null;
      if (kernelArray.length >= 1) {
        pop = kernelArray.pop()
        pop.vel = vec(pop.vel).add(rnd(-4, 4), rnd(-6, -4));
        cookedArray.push(pop);
        ++cornCooked;
      }
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
  
  if (postCooking) {
    if (rot1Complete) ++rot1Ticks;
    // rotate lid
    if (lid.anchor.x > 14 && !rot1Complete) lid.anchor.x -= 0.5;
    if (lid.angle > -PI / 2) {
      lid.angle -= 0.075;
    } else {
      rot1Complete = true;
    }
    if (scr < 50 && rot1Ticks > 50) scr += 0.1 + scr / 10;
    if (rot1Complete && rot1Ticks > 50 && !rot2Complete) {
      if (lid.anchor.x < 80) {
        lid.anchor.x += 1;
        lid.anchor.x = Math.min(lid.anchor.x, 80);
      } else {
        rot2Complete = true;
      }
      if (lid.angle > -PI) {
        lid.angle -= 0.075;
        lid.angle = Math.max(lid.angle, -PI);
      } 
    }
    if (rot2Complete && cornSpawned < cornCooked) {
      ++nextCornTicks;
      if (nextCornTicks > 60) {
        nextCornTicks = 0;
        ++cornSpawned;
        catchArray.push({
          pos: vec(rnd(20, 80), (-10)),
          vel: vec(rnd(-0.5, 0.5), 0),
        })
      }
    }
  }
  color("light_cyan");
  line(vec(pot.pos).add(0, scr), vec(pot.pos).add(potWidth, scr));
  color("cyan");
  if (!rot2Complete) line(vec(pot.pos).add(0, scr), vec(pot.pos).add(0, -potHeight + scr));
  if (!rot2Complete) line(vec(pot.pos).add(potWidth, scr), vec(pot.pos).add(potWidth, -potHeight + scr));
  lid.pos = vec(lid.anchor).addWithAngle(lid.angle, potWidth / 2);
  char("a", vec(lid.pos).add(0, Math.min(scr, 30)), 
    {
      scale: {x: 9.5 * Math.cos(lid.angle) - 3 * Math.sin(lid.angle), y: 12 * Math.sin(lid.angle) + 3 * Math.cos(lid.angle)},
      rotation: lid.angle / (PI / 2),
    });
  color("transparent");
  if (rot2Complete) color("cyan");
  // supremely evil collision hack (do not attempt)
  line(vec(lid.anchor.x - 3, lid.anchor.y + 29), vec(lid.anchor.x - 57, lid.anchor.y + 29));
  // this is where we can actually handle moving and drawing the flame particles we spawned
  remove(flameArray, (f) => {
    // adjust the flames position using its velocity

    color("yellow");
    particle(50, 99 + scr, 1, .7, pAngle + PI);
    color("red");
    particle(50, 102 + scr, 1, .7, sin(0.2));

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
    k.vel.mul(0.96);
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
    while (k.pos.y + k.vel.y > pot.pos.y + scr - kernelDim)
    {
      if (k.vel.y > 0) k.vel.y *= -0.8;
      k.pos.y += -0.1;
    }
    if (k.pos.y < -10 || k.pos.y > 110) return true;
  })

  remove(cookedArray, (k) => {
    k.pastPos.set(k.pos);
    // randomly fling kernels upwards
    if (k.vel.y < 0.5 && rnd() > 0.993 && cooking)
    {
      k.vel = vec(k.vel).add(rnd(-2.5, 2.5), rnd(-3, -2));
    }
    if (rot1Complete) {
      if (rot1Ticks == 1) k.vel.x = k.vel.x + rnd(-2, 2);
      k.vel.y += -0.5;
      k.vel.y = Math.min(k.vel.y, -6);
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
    while (k.pos.y + k.vel.y > pot.pos.y + scr - 3)
    {
      if (k.vel.y > 0) k.vel.y *= -0.8;
      k.pos.y += -0.1;
    }

    if (k.pos.y < -10 || k.pos.y > 110) return true;
  })

  remove(catchArray, (ke) => {
    ke.vel.y += 0.1 * (1 + difficulty / 5);
    ke.vel.mul(0.98);
    ke.pos.add(ke.vel);
    color("black");
    const c = char("b", ke.pos, {scale: {x: 0.5, y: 0.5}}).isColliding;
    if (c.rect.cyan) {
      addScore(multiplier, ke.pos);
      multiplier *= 1.1;
      play("lucky");
      return true;
    }

    if (ke.pos.y > 110) {
      ++cornLost;
      return true;
    }
  })

  if (cornCooked > 0 && cornLost >= cornCooked || cornLost > (Math.max(8 - difficulty, 1))) {
    end();
  }

  if (cornSpawned == cornCooked && postCooking && catchArray.length <= 0) ++completeTicks;
  if (completeTicks > 180) {
    needsInit = true;
  }
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
      if (!arc(b.pos, 3).isColliding.rect[c]) {
  lid.pos.y += scr;
        break;
      }
    }
  }
}

addEventListener("load", onLoad);