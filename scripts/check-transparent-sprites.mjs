import { readFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const spritePaths = [
  "src/assets/girl-coral-motion-transparent.png",
  "src/assets/girl-sunshine-motion-transparent.png",
  "src/assets/girl-grape-motion-transparent.png",
  "src/assets/explorer-field-motion-transparent.png",
];

const paeth = (left, above, upperLeft) => {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance) return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
};

function inspectSprite(path) {
  const png = readFileSync(path);
  if (png.subarray(1, 4).toString() !== "PNG") throw new Error(`${path} 不是 PNG`);

  let cursor = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const imageData = [];
  while (cursor < png.length) {
    const length = png.readUInt32BE(cursor);
    const type = png.subarray(cursor + 4, cursor + 8).toString();
    const data = png.subarray(cursor + 8, cursor + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") imageData.push(data);
    else if (type === "IEND") break;
    cursor += length + 12;
  }

  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0) {
    throw new Error(`${path} 必须是 8 位、RGBA、非交错 PNG`);
  }

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const encoded = inflateSync(Buffer.concat(imageData));
  const decoded = Buffer.alloc(stride * height);
  let sourceOffset = 0;
  for (let row = 0; row < height; row += 1) {
    const filter = encoded[sourceOffset];
    sourceOffset += 1;
    const rowOffset = row * stride;
    for (let column = 0; column < stride; column += 1) {
      const raw = encoded[sourceOffset + column];
      const left = column >= bytesPerPixel ? decoded[rowOffset + column - bytesPerPixel] : 0;
      const above = row > 0 ? decoded[rowOffset - stride + column] : 0;
      const upperLeft = row > 0 && column >= bytesPerPixel ? decoded[rowOffset - stride + column - bytesPerPixel] : 0;
      const prediction = filter === 0 ? 0
        : filter === 1 ? left
          : filter === 2 ? above
            : filter === 3 ? Math.floor((left + above) / 2)
              : filter === 4 ? paeth(left, above, upperLeft)
                : (() => { throw new Error(`${path} 使用未知 PNG 滤镜 ${filter}`); })();
      decoded[rowOffset + column] = (raw + prediction) & 255;
    }
    sourceOffset += stride;
  }

  let transparent = 0;
  for (let index = 3; index < decoded.length; index += bytesPerPixel) {
    if (decoded[index] === 0) transparent += 1;
  }
  const ratio = transparent / (width * height);
  const cornerAlpha = [
    decoded[3],
    decoded[(width - 1) * 4 + 3],
    decoded[(height - 1) * stride + 3],
    decoded[(height * stride) - 1],
  ];
  if (ratio < 0.3 || cornerAlpha.some((alpha) => alpha !== 0)) {
    throw new Error(`${path} 的透明背景检查失败（透明占比 ${(ratio * 100).toFixed(1)}%）`);
  }
  console.log(`✓ ${path}：透明占比 ${(ratio * 100).toFixed(1)}%`);
}

spritePaths.forEach(inspectSprite);
