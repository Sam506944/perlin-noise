import { Perlin } from '/perlin.js';

export const canvas = document.getElementById('canvas');
export const context = canvas.getContext('2d');

canvas.width = 500;
canvas.height = 500;

const terrain = new Perlin(1, 1, 1, 100, 100, 4, 1, 1, 1);

let scrollX = 1000000000;
let scrollY = 1000000000;

function render(scrollX, scrollY) {
  terrain.loadChunk(scrollX, scrollY, canvas.width, canvas.height)

  for (let y = 0; y < canvas.width / terrain.pixel.width; y++) {
    for (let x = 0; x < canvas.height / terrain.pixel.height; x++) {
  
      const elevation = terrain.chunk[y][x];

      context.fillStyle = `rgb(${elevation * 300}, ${elevation * 300}, ${elevation * 200})`;
  
      context.beginPath();
    
      context.fillRect(x * terrain.pixel.height, y * terrain.pixel.height, terrain.pixel.height, terrain.pixel.height);
      context.stroke();
    }
  }
}


document.onkeydown = function(event) {
  if (event.keyCode === 39) scrollX += 100;
  if (event.keyCode === 37) scrollX -= 100;
  if (event.keyCode === 40) scrollY += 100;
  if (event.keyCode === 38) scrollY -= 100;
  render(scrollX, scrollY)
}

render(scrollX, scrollY)
