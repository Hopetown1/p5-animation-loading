
var DEBUG = false;

var SCENE_FIXED_SIZE = 1000.0;

var MIN_PARTICLE_SIZE = 4
var MAX_PARTICLE_SIZE = 14
var NORMAL_PARTICLE_SIZE = 5
var MERGE_PARTICLE_SIZE = 9
var INNER_PARTICLE_SIZE = 0;
var OUTER_PARTICLE_SIZE = 1;

var REORIENT_FRAME = 430;
var MERGE_FRAME = 550;

var DEFAULT_EVENT = 0;
var REORIENT_EVENT = 1;
var MERGE_EVENT = 2;

var TARGET_DIST_THRESHOLD = 50;
var MOUSE_DIST_THRESHOLD = 100;
var FADE_DIST_THRESHOLD = 100;

var RAD_180;
var COLOR_BLACK;
var COLOR_ALPHA;

var colorSchemes = [];
var particles = [];
var finalRotTarget;
var colorSchemeIndex = 0;
var frame = 0;
var sceneOffsetX = 0;
var sceneOffsetY = 0;
var sceneScaleOffset = 1;
var bounds = 0;
var ringCount = 0;


function setup() {
    let myCanvasDiv = document.getElementById('myCanvasDiv');
    let divWidth = myCanvasDiv.offsetWidth;
    let divHeight = myCanvasDiv.offsetHeight;
    
    var canvas = createCanvas(divWidth, divHeight);
    canvas.id("quantileAnimationCanvas");
    canvas.parent('myCanvasDiv'); // make this canvas a child of myCanvasDiv
    canvas.style("z-index", "1");
//   var canvas = createCanvas(windowWidth, windowHeight);
//   canvas.id("quantileAnimationCanvas");
// //   canvas.position(0, 0);
//     canvas.parent('myCanvasDiv'); // replace 'myCanvasDiv' with the ID of your div
//   canvas.style("z-index", "1");

  RAD_180 = radians(180);
  COLOR_BLACK = color(0);
  COLOR_ALPHA = color(0, 0, 0, 0);


  let MY_GREEN = color(26,188,156);
  let MY_CREAM = color(183,171,152);

  let COLOR_GREEN = color(58, 215, 143);
  let COLOR_ORANGE = color(255, 173, 101);
  let COLOR_BLUE = color(41, 157, 207);
  let COLOR_PINK = color(247, 117, 141);
  let COLOR_SAGE = color(185, 201, 149);
  let COLOR_BLONDE = color(243, 212, 145);
  let COLOR_ICE_BLUE = color(156, 226, 234);
  let COLOR_LILAC = color(214, 184, 196);

  colorSchemes = [
    [MY_GREEN, MY_CREAM],
    [MY_CREAM, MY_GREEN]
    // [COLOR_PINK, COLOR_ICE_BLUE],
    // [COLOR_BLUE, COLOR_LILAC],
    // [COLOR_GREEN, COLOR_SAGE],
    // [COLOR_ORANGE, COLOR_ICE_BLUE],
    // [COLOR_ORANGE, COLOR_LILAC],
    // [COLOR_GREEN, COLOR_LILAC],
    // [COLOR_PINK, COLOR_BLONDE],
    // [COLOR_BLUE, COLOR_SAGE]
  ];

  reset();

  finalRotTarget = new p5.Vector(SCENE_FIXED_SIZE / 2, SCENE_FIXED_SIZE / 2);
}


function draw() {
  if (DEBUG) {
    background(0);
  } else {
    clear();
  }

  noStroke();

  push();

  translate(sceneOffsetX, sceneOffsetY);
  scale(sceneScaleOffset);

  for (let i = particles.length - 1; i > -1; i--) {
    let p = particles[i];
    let timing = frame + int(p.ringNum * 5);

    if (p.stage == DEFAULT_EVENT) {
      if (timing >= REORIENT_FRAME) {
        p.targetSize = NORMAL_PARTICLE_SIZE;
        p.stage = REORIENT_EVENT;
      }
    } else if (p.stage == REORIENT_EVENT) {
      if (timing >= MERGE_FRAME) {
        if (p.buddy == null) {
          p.setTargetOutOfBounds();
        }
        p.stage = MERGE_EVENT;
      }
    }

    if (p.stage == MERGE_EVENT) {
      if (p.willMerge && p.buddy != null) {
        p.target = p.buddy.pos.copy();
      }
    }

    p.move();

    if (p.stage == REORIENT_EVENT) {
      p.rotTarget = p.rotTarget.lerp(finalRotTarget, 0.05);
    }
    else if (p.stage == MERGE_EVENT) {
      if (p.buddy != null && p.willMerge && p.distToTarget < 1) {
        p.buddy.buddy = null;
        p.buddy.targetSize = MERGE_PARTICLE_SIZE;
        particles.splice(i, 1);
        continue;
      }

      if (p.kill) {
        if (p.isOutOfBounds()) {
          particles.splice(i, 1);
          continue;
        }
      }
    }

    let aim = p.pos.copy();
    aim.sub(p.rotTarget);
    aim.normalize();
    aim.rotate(RAD_180);

    let finalRot;

    if (p.distToTarget < TARGET_DIST_THRESHOLD) {
      let weight = map(p.distToTarget, 0, TARGET_DIST_THRESHOLD, 1, 0);
      let blendRot = p5.Vector.lerp(p.vel, aim, weight);
      finalRot = blendRot.heading();
    } else {
      finalRot = p.vel.heading();
    }

    let particleColor = COLOR_ALPHA;

    if (!p.isOutOfBounds()) {
      particleColor = lerpColor(
        colorSchemes[colorSchemeIndex][0], colorSchemes[colorSchemeIndex][1],
        map(p.pos.x, 0, bounds, 0, 1));

      let speedWeight = map(p.vel.mag(), 0, 3, 0, 1);
      particleColor = lerpColor(particleColor, p.fgColor, speedWeight);

      let edgeData = p.getClosestEdge();
      let edgeDistance = edgeData[1];

      if (edgeDistance < FADE_DIST_THRESHOLD) {
        particleColor = lerpColor(
          particleColor, COLOR_ALPHA,
          map(edgeDistance, FADE_DIST_THRESHOLD, 0, 0, 1));
      }
    }

    fill(particleColor);

    let ringSize = map(p.ringNum, 0, ringCount, INNER_PARTICLE_SIZE, OUTER_PARTICLE_SIZE);
    p.currentSize = lerp(p.currentSize, p.targetSize, 0.05) + ringSize;
    let finalSize = max(p.currentSize - p.vel.mag() * 2, MIN_PARTICLE_SIZE);

    push();
      translate(p.pos.x, p.pos.y);
      rotate(finalRot);
      p.display(finalSize);
    pop();
  }

  if (DEBUG) {
    noFill();
    stroke(255);
    rect(0, 0, bounds, bounds);
  }

  pop();

  if (DEBUG) {
    fill(255);
    text(frame, 20, height - 20);
  }

  frame++;
}


function mouseClicked() {
  if (DEBUG) {
    reset();
  }
}


function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   calculateSceneSizes();
  let divWidth = document.getElementById('myCanvasDiv').offsetWidth;
  let divHeight = document.getElementById('myCanvasDiv').offsetHeight;
  resizeCanvas(divWidth, divHeight);
  calculateSceneSizes();
}


function reset() {
  particles = [];
  frame = 0;
  colorSchemeIndex = int(random(colorSchemes.length));
  setupParticlesFromData();
}


function setupParticlesFromData() {
  SCENE_FIXED_SIZE = PARTICLES_DATA.SCENE_FIXED_SIZE;
  ringCount = PARTICLES_DATA.RING_COUNT;
  calculateSceneSizes();

  for (let i = 0; i < PARTICLES_DATA.particles.length; i++) {
    let newParticle = new Particle();
    newParticle.target.set(PARTICLES_DATA.particles[i].targetX, PARTICLES_DATA.particles[i].targetY);
    newParticle.particleId = PARTICLES_DATA.particles[i].particleId;
    newParticle.ringNum = PARTICLES_DATA.particles[i].ringNum;
    newParticle.num = PARTICLES_DATA.particles[i].num;
    newParticle.willMerge = PARTICLES_DATA.particles[i].willMerge;

    if (newParticle.willMerge) {
      newParticle.buddyId = PARTICLES_DATA.particles[i].buddy;
    }

    particles.push(newParticle);
  }

  // Assign buddies.
  for (let i = 0; i < particles.length; i++) {
    if (!particles[i].willMerge) {
      continue;
    }

    if (particles[i].buddyId != -1) {
      for (let j = 0; j < particles.length; j++) {
        if (particles[i].buddyId == particles[j].particleId) {
          particles[i].buddy = particles[j];
          particles[j].buddy = particles[i];
        }
      }
    } else {
      particles[i].buddy = null;
    }
  }
}


function calculateSceneSizes() {
  if (width > height) {
    sceneOffsetX = width / 2 - height / 2;
    sceneOffsetY = 0;
  } else {
    sceneOffsetX = 0;
    sceneOffsetY = height / 2 - width / 2;
  }

  sceneScaleOffset = max(min(width, height) / SCENE_FIXED_SIZE, 0.0001);
  bounds = min(width, height) / sceneScaleOffset;

  mouseX = 0;
  mouseY = 0;
}