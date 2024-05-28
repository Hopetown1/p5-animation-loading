function Particle() {

    this.isTransitioning = false;
    this.transitionRotation = 0;
    
    let quarterBounds = bounds / 4;
  
    this.pos = new p5.Vector(
      random(quarterBounds, bounds - quarterBounds),
      random(quarterBounds, bounds - quarterBounds));
  
    this.vel = new p5.Vector();
    this.acc = new p5.Vector();
    this.target = new p5.Vector();
  
    this.rotTarget = p5.Vector.fromAngle(radians(random(360)));
    this.rotTarget.mult(500);
    this.rotTarget.add(width / 2, height / 2);
  
    colorScheme = colorSchemes[colorSchemeIndex];
    this.fgColor = colorScheme[int(random(colorScheme.length))];
  
    this.particleId = -1;
    this.distToTarget = 0;
    this.speed = 0.25;
    this.maxSpeed = 1;
    this.maxForce = 10;
    this.stage = DEFAULT_EVENT;
    this.timeDelay = particles.length;
    this.willMerge = false;
    this.kill = false;
    this.buddyId = -1;
    this.buddy = null;
    this.currentSize = random(MIN_PARTICLE_SIZE, MAX_PARTICLE_SIZE);
    this.targetSize = this.currentSize;
    this.ringNum = 0;
    this.num = 0;
      


    this.move = function() {
      
      this.distToTarget = this.pos.dist(this.target);
      let proximityMult = 1;
  
      if (this.distToTarget < TARGET_DIST_THRESHOLD) {
        proximityMult = this.distToTarget / TARGET_DIST_THRESHOLD;
        this.vel.mult(0.9);
      } else {
        this.vel.mult(0.95);
      }

      if (this.distToTarget < 1) {
        this.isTransitioning = false;
      }

      if (this.distToTarget > 1) {
        let steer = this.target.copy();
        steer.sub(this.pos);
        steer.normalize();
        steer.mult(this.maxSpeed * proximityMult * this.speed);
        this.acc.add(steer);
      }
  
      let mousePos = new p5.Vector(
        (mouseX - sceneOffsetX) / sceneScaleOffset,
        (mouseY - sceneOffsetY) / sceneScaleOffset);
  
      let mouseDist = this.pos.dist(mousePos);
  
      if (mouseDist < MOUSE_DIST_THRESHOLD) {
        let push = this.pos.copy();
        push.sub(mousePos);
        push.normalize();
        push.mult((MOUSE_DIST_THRESHOLD / 2) - mouseDist * 0.05);
        this.acc.add(push);
      }
  
      this.vel.add(this.acc);
      this.vel.limit(this.maxForce * this.speed);
      this.pos.add(this.vel);
      this.acc.mult(0);
    }
  
    this.display = function(sizeMult) {
      beginShape();
      //Arrow
        // vertex(-0.67 * sizeMult, -0.67 * sizeMult);
        // vertex(0.64 * sizeMult, 0 * sizeMult);
        // vertex(-0.67 * sizeMult, 0.67 * sizeMult);
        // vertex(-0.67 * sizeMult, 0.512 * sizeMult);
        // vertex(0.36 * sizeMult, 0 * sizeMult);
        // vertex(-0.67 * sizeMult, -0.512 * sizeMult);
        
      //Traingle
        // vertex(0, -0.5 * sizeMult);
        // vertex(0.5 * sizeMult, 0.5 * sizeMult);
        // vertex(-0.5 * sizeMult, 0.5 * sizeMult);

      //Circle
      // ellipse(0, 0, sizeMult, sizeMult);

      //Square
      // rectMode(CENTER);
      // rect(0, 0, sizeMult, sizeMult);
      
      //Hollow Sqaure

      let particleColor = COLOR_ALPHA;

      if (!this.isOutOfBounds()) {
        particleColor = lerpColor(
          colorSchemes[colorSchemeIndex][0], colorSchemes[colorSchemeIndex][1],
          map(this.pos.x, 0, bounds, 0, 1));

        let speedWeight = map(this.vel.mag(), 0, 3, 0, 1);
        particleColor = lerpColor(particleColor, this.fgColor, speedWeight);

        let edgeData = this.getClosestEdge();
        let edgeDistance = edgeData[1];

        if (edgeDistance < FADE_DIST_THRESHOLD) {
          particleColor = lerpColor(
            particleColor, COLOR_ALPHA,
            map(edgeDistance, FADE_DIST_THRESHOLD, 0, 0, 1));
        }
      }

      noFill();
      stroke(particleColor);
      strokeWeight(sizeMult * 0.1); // Adjust the stroke weight as desired
      
      beginShape();
      vertex(-sizeMult / 2, -sizeMult / 2);
      vertex(sizeMult / 2, -sizeMult / 2);
      vertex(sizeMult / 2, sizeMult / 2);
      vertex(-sizeMult / 2, sizeMult / 2);
      endShape(CLOSE);

    }
    
  
    this.getClosestEdge = function() {
      let top = abs(this.pos.y);
      let bottom = abs(this.pos.y - bounds);
      let left = abs(this.pos.x);
      let right = abs(this.pos.x - bounds);
  
      let edgeDistances = [top, bottom, left, right];
      edgeDistances.sort();
  
      edges = [
        ["top", top],
        ["bottom", bottom],
        ["left", left],
        ["right", right]
      ]
  
      edges.sort(function(first, second) {
        return second[1] - first[1];
      });
  
      return edges[edges.length - 1];
    }
  
    this.setTargetOutOfBounds = function() {
      let edgeData = this.getClosestEdge();
      let closestEdge = edgeData[0];
  
      let offset = 200;
  
      if (closestEdge == "top") {
        this.target.set(random(bounds), -offset);
      } else if (closestEdge == "bottom") {
        this.target.set(random(bounds), bounds + offset);
      } else if (closestEdge == "left") {
        this.target.set(-offset, random(bounds));
      } else if (closestEdge == "right") {
        this.target.set(bounds + offset, random(bounds));
      }
  
      this.kill = true;  // This will trigger for it to be deleted when out of bounds.
    }
  
    this.isOutOfBounds = function() {
      return (
        this.pos.x < 0 ||
        this.pos.x > bounds ||
        this.pos.y < 0 ||
        this.pos.y > bounds);
    }
  }