const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Define the size of the grid cells
const cellSize = 40;

// Initialize the grid
const gridWidth = canvas.width / cellSize;
const gridHeight = canvas.height / cellSize;
// Initialize the grid with random colors for each cell
const grid = new Array(gridHeight).fill(null).map(() =>
  new Array(gridWidth).fill(null).map(() => {
    const red = Math.floor(Math.random() * 256); // Red value for attack
    const green = Math.floor(Math.random() * 256); // Green value for agility
    const blue = Math.floor(Math.random() * 256); // Blue value for health
    return { red, green, blue };
  })
);
// draw each cell with its corresponding color. This will visually represent the soil properties on the grid.
function drawGrid() {
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      const cellColor = grid[i][j];
      ctx.fillStyle = `rgb(${cellColor.red}, ${cellColor.green}, ${cellColor.blue})`;
      ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
      ctx.strokeStyle = "#ccc";
      ctx.strokeRect(j * cellSize, i * cellSize, cellSize, cellSize);
    }
  }
}

class Unit {
  constructor(color, x, y) {
    this.color = color;
    this.attack = color.red; // Assuming red affects attack
    this.defense = color.blue; // Assuming blue affects defense
    this.agility = color.green; // Assuming green affects agility
    this.x = x; // Add x position
    this.y = y; // Add y position
  }

  draw(ctx, x, y) {
    const radius = cellSize / 2; // Assuming cellSize is the size of the cell
    const centerX = x * cellSize + radius;
    const centerY = y * cellSize + radius;
    const shapeType = 6;
    const angle = (2 * Math.PI) / shapeType;

    ctx.beginPath();
    for (let i = 0; i < shapeType; i++) {
      let xx = centerX + radius * Math.cos(angle * i);
      let yy = centerY + radius * Math.sin(angle * i);
      if (i === 0) {
        ctx.moveTo(xx, yy);
      } else {
        ctx.lineTo(xx, yy);
      }
    }
    ctx.closePath();
    ctx.fillStyle = `rgb(${this.color.red}, ${this.color.green}, ${this.color.blue})`;
    ctx.fill();
    ctx.strokeStyle = "#ccc"; // Light stroke color
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

class Building {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.intervalId = null; // Store the interval ID
  }

  draw(ctx) {
    const offsetX = (cellSize - this.width * cellSize) / 2;
    const offsetY = (cellSize - this.height * cellSize) / 2;
    ctx.fillStyle = `rgb(${this.color.red + 30}, ${this.color.green + 30}, ${
      this.color.blue + 30
    })`;
    ctx.fillRect(
      this.x * cellSize + offsetX,
      this.y * cellSize + offsetY,
      this.width * cellSize,
      this.height * cellSize
    );
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x * cellSize + offsetX,
      this.y * cellSize + offsetY,
      this.width * cellSize,
      this.height * cellSize
    );
  }

  static existsAt(x, y, buildings) {
    return buildings.some((building) => building.x === x && building.y === y);
  }

  produceUnits() {
    const emptyCells = this.findEmptyCells();
    if (emptyCells.length === 0) {
      console.log("No empty cells next to the building.");
      return;
    }
    const unitColor = this.color; // Assuming the building's color affects the unit's stats
    const [x, y] = emptyCells[0]; // Assuming you have logic to determine the x and y positions
    const newUnit = new Unit(unitColor, x, y); // Pass x and y to the constructor
    newUnit.draw(ctx, x, y);
    units.push(newUnit); // Add the new unit to the units array

    {
      const maxStat = Math.max(
        newUnit.attack,
        newUnit.defense,
        newUnit.agility
      );
      let emoji = "";
      if (maxStat === newUnit.attack) {
        emoji = "⚔";
      } else if (maxStat === newUnit.defense) {
        emoji = "🛡";
      } else {
        emoji = "⚡"; // Using ⚡ for agility, you can change this to any other emoji you prefer
      }

      console.info(`%c${emoji} Unit produced`, "color:limegreen");
      console.info(newUnit);
    }
  }

  startProducingUnits() {
    // Calculate the interval based on the color.green value
    // Assuming a higher green value results in a shorter interval
    const interval = 255000 / this.color.green;

    // Clear any existing interval for this building
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Start a new interval for producing units
    this.intervalId = setInterval(() => this.produceUnits(), interval);
  }

  findEmptyCells() {
    const directions = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]; // Right, Down, Left, Up
    const emptyCells = [];

    for (const [dx, dy] of directions) {
      const newX = this.x + dx;
      const newY = this.y + dy;

      // Check if the cell is within the grid bounds and not occupied by a building or unit
      if (
        newX >= 0 &&
        newX < gridWidth &&
        newY >= 0 &&
        newY < gridHeight &&
        !Building.existsAt(newX, newY, buildings) &&
        !units.some((unit) => unit.x === newX && unit.y === newY) // Check if the cell is not occupied by a unit
      ) {
        emptyCells.push([newX, newY]);
      }
    }

    return emptyCells;
  }
}

// Initialize the list of buildings
const buildings = [];
// Initialize the list of units
const units = [];

function placeBuilding(x, y) {
  if (Building.existsAt(x, y, buildings)) {
    console.log("A building already exists at this location.");
    return;
  }

  const cellColor = grid[y][x];
  const buildingSize = 0.8; // 80% of the cell size
  const building = new Building(x, y, buildingSize, buildingSize, {
    red: cellColor.red,
    green: cellColor.green,
    blue: cellColor.blue,
  });
  // Example: Adjust building stats based on cell color
  building.attack = cellColor.red;
  building.health = cellColor.blue;
  building.agility = cellColor.green;
  buildings.push(building);
}

// Function to handle click events on the canvas
canvas.addEventListener("click", function (event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Calculate the grid cell that was clicked
  const gridX = Math.floor(x / cellSize);
  const gridY = Math.floor(y / cellSize);

  // Create a new building at the clicked location
  // For simplicity, we'll use a fixed color and size for now
  placeBuilding(gridX, gridY);
  const lastBuilding = buildings.at(-1);
  lastBuilding.startProducingUnits();
  // Redraw the canvas to include the new building
  init();
});

function init() {
  // Clear the entire canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the grid
  drawGrid();

  // Draw all buildings
  buildings.forEach((building) => building.draw(ctx));

  // Draw all units
  units.forEach((unit) => unit.draw(ctx, unit.x, unit.y));
}

// Start the game
init();
