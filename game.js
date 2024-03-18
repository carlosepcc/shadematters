const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function createRandomGradient(ctx, canvas) {
  // Randomly decide between linear and radial gradient
  const isRadial = Math.random() < 0.8;

  // Randomly choose the gradient type
  const gradient = isRadial
    ? ctx.createRadialGradient(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() * 100, // Inner circle radius
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        700 // Outer circle radius
      )
    : ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height // Start and end points
      );

  // Randomly assign colors to the gradient
  const colors = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "indigo",
    "violet",
  ];
  for (let i = 0; i < colors.length; i++) {
    const colorStop = Math.random();
    gradient.addColorStop(colorStop, colors[i]);
  }

  // Return the gradient
  return gradient;
}

// Generate a random gradient
const gradient = createRandomGradient(ctx, canvas);

// Fill the canvas with the random gradient
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Function to map floor color to unit stats
function mapColorToStats(color) {
  return {
    attack: color.r,
    agility: color.g,
    defense: color.b,
  };
}

// Define the Unit constructor function
function Unit(attack, agility, defense, x, y) {
  this.attack = attack;
  this.agility = agility;
  this.defense = defense;
  this.x = x; // x-coordinate on the canvas
  this.y = y; // y-coordinate on the canvas
}

// Method to draw a procedural unit shape based on stats
Unit.prototype.draw = function (ctx) {
  // Calculate size based on defense
  const size = 25 + this.defense / 10; // Example calculation
  const roundness = 10 - this.attack / 10; // Example calculation

  // Calculate color tone based on stats
  const r = this.attack; // Assuming attack influences red color
  const g = this.agility; // Assuming agility influences green color
  const b = this.defense; // Assuming defense influences blue color

  // Set the fill style to a color based on stats
  ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;

  // Calculate the number of sides based on attack
  const sides = Math.max(3, 10 - this.attack / 10); // Ensure at least 3 sides

  // Calculate the angle between each side
  const angle = (2 * Math.PI) / sides;

  // Generate a random rotation angle for the unit
  const rotationAngle = Math.random() * 2 * Math.PI; // Random angle in radians

  // Save the current context state
  ctx.save();

  // Translate to the unit's position
  ctx.translate(this.x, this.y);

  // Rotate the context
  ctx.rotate(rotationAngle);

  // Draw the n-gon
  ctx.beginPath();
  for (let i = 0; i <= sides; i++) {
    const x = size * Math.cos(i * angle);
    const y = size * Math.sin(i * angle);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fill();

  // Set the stroke style and line width for the outline
  ctx.strokeStyle = `rgb(${r - 20}, ${g - 20}, ${b - 20})`; // Black outline
  ctx.lineWidth = 2; // Thickness of the outline

  // Draw the outline
  ctx.stroke();

  // Restore the context state
  ctx.restore();
};

// Method to display unit stats
Unit.prototype.displayStats = function () {
  console.log(
    `Attack: ${this.attack}, Agility: ${this.agility}, Defense: ${this.defense}`
  );
};

// Function to simulate unit production
function produceUnit(stats, x, y) {
  // Create a new unit instance with the given stats and position
  const unit = new Unit(stats.attack, stats.agility, stats.defense, x, y);
  // Draw the unit on the canvas
  unit.displayStats();
  unit.draw(ctx);
}

// Function to handle mouse clicks
canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Capture floor color at click position
  const imageData = ctx.getImageData(x, y, 1, 1);
  const color = {
    r: imageData.data[0],
    g: imageData.data[1],
    b: imageData.data[2],
  };

  // Map color to stats
  const stats = mapColorToStats(color);
  // Produce unit at the click position
  produceUnit(stats, x, y);
});
