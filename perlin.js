export function Perlin(scale, pixelWidth, pixelHeight, latticeWidth, latticeHeight, octives, persistance, lunacrity, amplitude) {
  this.scale = scale;
  this.pixel = {
    width: pixelWidth * scale,
    height: pixelHeight * scale,
  };
  this.lattice = {
    width: latticeWidth * scale,
    height: latticeHeight * scale,
  };
  this.octives = octives;
  this.persistance = persistance;
  this.lunacrity = lunacrity;
  this.amplitude = amplitude;
  this.permutations = [
    151, 160, 137, 91, 90, 15, 131, 13, 201, 95,
    96, 53, 194, 233, 7, 225, 140, 36, 103, 30,
    69, 142, 8, 99, 37, 240, 21, 10, 23, 190,
    6, 148, 247, 120, 234, 75, 0, 26, 197, 62,
    94, 252, 219, 203, 117, 35, 11, 32, 57, 177,
    33, 88, 237, 149, 56, 87, 174, 20, 125, 136,
    171, 168, 68, 175, 74, 165, 71, 134, 139, 48,
    27, 166, 77, 146, 158, 231, 83, 111, 229, 122,
    60, 211, 133, 230, 220, 105, 92, 41, 55, 46,
    245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
    1, 216, 80, 73, 209, 76, 132, 187, 208, 89,
    18, 169, 200, 196, 135, 130, 116, 188, 159, 86,
    164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
    226, 250, 124, 123, 5, 202, 38, 147, 118, 126,
    255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58,
    17, 182, 189, 28, 42, 223, 183, 170, 213, 119,
    248, 152, 2, 44, 154, 163, 70, 221, 153, 101,
    155, 167, 43, 172, 9, 129, 22, 39, 253, 19,
    98, 108, 110, 79, 113, 224, 232, 178, 185, 112,
    104, 218, 246, 97, 228, 251, 34, 242, 193, 238,
    210, 144, 12, 191, 179, 162, 241, 81, 51, 145,
    235, 249, 14, 239, 107, 49, 192, 214, 31,
    181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
    50, 45, 127, 4, 150, 254, 138, 236, 205, 93,
    222, 114, 67, 29, 24, 72, 243, 141, 128, 195,
    78, 66, 215, 61, 156, 180
  ];
  this.gradients = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
    [0, Math.sqrt(2)],
    [Math.sqrt(2), 0],
    [0, -Math.sqrt(2)],
    [-Math.sqrt(2), 0]
  ];
  this.chunk = null;
  this.fade = function (offset) {
    return 6 * offset ** 5 - 15 * offset ** 4 + 10 * offset ** 3;
  };
  this.interpolate = function (offset, valueOne, valueTwo) {
    return valueOne + offset * (valueTwo - valueOne);
  };
  this.noise = function (scrollX, scrollY, actualFrequencyWidth, actualFrequencyHeight, actualAmplitude, width, height) {
    const terrain = [];
    for (let y = scrollY; y < height + scrollY; y += this.pixel.height) {
      for (let x = scrollX; x < width + scrollX; x += this.pixel.width) {
        const offsetY = y % actualFrequencyHeight;
        const offsetX = x % actualFrequencyWidth;

        const topLeftDistance = [offsetX / actualFrequencyWidth, (-1 * offsetY) / actualFrequencyHeight];
        const topRightDistance = [(-1 * (actualFrequencyWidth - offsetX)) / actualFrequencyWidth, (-1 * offsetY) / actualFrequencyHeight];
        const bottomLeftDistance = [offsetX / actualFrequencyWidth, (actualFrequencyHeight - offsetY) / actualFrequencyHeight];
        const bottomRightDistance = [(-1 * (actualFrequencyWidth - offsetX)) / actualFrequencyWidth, (actualFrequencyHeight - offsetY) / actualFrequencyHeight];

        const distanceVectors = [topLeftDistance, topRightDistance, bottomLeftDistance, bottomRightDistance];

        const regionX = Math.floor(x / actualFrequencyWidth) * actualFrequencyWidth;
        const regionY = Math.floor(y / actualFrequencyHeight) * actualFrequencyHeight;

        const topLeftGradient = [regionX, regionY];
        const topRightGradient = [regionX + actualFrequencyWidth, regionY];
        const bottomLeftGradient = [regionX, regionY + actualFrequencyHeight];
        const bottomRightGradient = [regionX + actualFrequencyWidth, regionY + actualFrequencyHeight];

        const corners = [topLeftGradient, topRightGradient, bottomLeftGradient, bottomRightGradient];

        const gradientVectors = [];

        for (const z of corners) {
          const permutationX = this.permutations[Math.round(z[0]) % this.permutations.length];
          const permutationY = this.permutations[(permutationX + Math.round(z[1])) % this.permutations.length];
          gradientVectors.push(this.gradients[permutationY % this.gradients.length]);
        }

        const cornerValues = [];

        for (let j = 0; j < 4; j++) {
          cornerValues.push(distanceVectors[j][0] * gradientVectors[j][0] + distanceVectors[j][1] * gradientVectors[j][1]);
        }

        const top = this.interpolate(this.fade(topLeftDistance[0]), cornerValues[0], cornerValues[1]);
        const bottom = this.interpolate(this.fade(topLeftDistance[0]), cornerValues[2], cornerValues[3]);
        let value = this.interpolate(this.fade(Math.abs(topLeftDistance[1])), top, bottom);

        value = (value + 0.707) * actualAmplitude;
        terrain.push(value);
      }
    }

    return terrain;
  };
  this.loadChunk = function (scrollX, scrollY, width, height) {
    const layers = [];
    const terrain = [];
    const chunk = [];

    for (let i = 0; i < this.octives; i++) {
      const actualFrequencyWidth = this.lattice.width * this.lunacrity ** i;
      const actualFrequencyHeight = this.lattice.height * this.lunacrity ** i;
      const actualAmplitude = this.amplitude * this.persistance ** i;
      layers.push(this.noise(scrollX, scrollY, actualFrequencyWidth, actualFrequencyHeight, actualAmplitude, width, height));
    }

    for (const j in layers[0]) {
      let sum = 0;
      for (const i in layers) {
        sum += layers[i][j];
      }
      terrain.push(sum / layers.length);
    }

    for (let y = 0; y < height / this.pixel.height; y++) {
      const longitude = [];
      for (let x = 0; x < width / this.pixel.width; x++) {
        longitude.push(terrain[y * width / this.pixel.width + x]);
      }
      chunk.push(longitude);
    }

    this.chunk = chunk;
  };
}
