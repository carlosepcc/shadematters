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

class Building {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
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
}

// Initialize the list of buildings
const buildings = [];

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

  // Redraw the canvas to include the new building
  init();
});

// Modify the init function to clear the canvas and then draw the grid and all buildings
function init() {
  // Clear the entire canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the grid
  drawGrid();

  // Draw all buildings
  buildings.forEach((building) => building.draw(ctx));
}

// Start the game
init();
