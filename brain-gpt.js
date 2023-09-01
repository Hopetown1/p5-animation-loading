var gpt_brain_namespace = (function() {
  var constellation = [];
      var n;
      var d;
      
      function setup() {
        var div = document.getElementById('brain-div'); // Replace with your div ID
        var width = div.offsetWidth;
        var height = div.offsetHeight;
          smooth(); // Add this line
        var canvas = createCanvas(width, height);
        canvas.parent('brain-div');
        pixelDensity(displayDensity());
        n = 200;
      
        for (var i = 0; i <= n; i++) {
          constellation.push(new star());
        }
        strokeWeight(0.75);
        stroke('#1ABC9C');
      }
                          
      function draw() {
      
        background('#0D0D0D');
      
        for (var i = 0; i < constellation.length; i++) {
          constellation[i].update();
          for (var j = 0; j < constellation.length; j++) {
            if (i > j) { // "if (i > j)" => to check one time distance between two stars
              d = constellation[i].loc.dist(constellation[j].loc); // Distance between two stars
              if (d <= width / 8) { // if d is less than width/10 px, we draw a line between the two stars
                line(constellation[i].loc.x, constellation[i].loc.y, constellation[j].loc.x, constellation[j].loc.y)
              }
            }
          }
        }
      
      }
      
      function star() {
      
        this.a = random(5 * TAU); // "5*TAU" => render will be more homogeneous
        this.r = random(width * .4, width * .25); // first position will looks like a donut
        this.loc = createVector(width / 2 + sin(this.a) * this.r, height / 2 + cos(this.a) * this.r);
        this.speed = createVector();
        this.speed = p5.Vector.random2D();
        //this.speed.random2D();
        this.bam = createVector();
        this.m;
      
      
        this.update = function() {
            this.bam = p5.Vector.random2D(); // movement of star will be a bit erractic
            //this.bam.random2D();
            this.bam.mult(0.45);
            this.speed.add(this.bam);
            var distance = dist(this.loc.x, this.loc.y, mouseX, mouseY);
                  if (distance > width * 1.2) { // or whatever limit you want
                // Apply some default behavior, or do nothing
                return; // Skip the rest of the update for this star
                  }
            // speed is done according distance between loc and the mouse :
            this.m = constrain(map(dist(this.loc.x, this.loc.y, mouseX, mouseY), 0, width  * 1.2, 8, .05), .05, 8); // constrain => avoid returning "not a number"
            this.speed.normalize().mult(this.m);
      
            // No colision detection, instead loc is out of bound
            // it reappears on the opposite side :
            if (dist(this.loc.x, this.loc.y, width / 2, height / 2) > (width / 2) * 0.98) {
              if (this.loc.x < width / 2) {
                this.loc.x = width - this.loc.x - 4; // "-4" => avoid blinking stuff
              } else if (this.loc.x > width / 2) {
                this.loc.x = width - this.loc.x + 4; // "+4"  => avoid blinking stuff
              }
              if (this.loc.y < height / 2) {
                this.loc.y = width - this.loc.y - 4;
              } else if (this.loc.x > height / 2) {
                this.loc.y = width - this.loc.y + 4;
              }
            }
            this.loc = this.loc.add(this.speed);
          } // End of update()
      } // End of class
    })();