const settingsByLevel = {
  light: { contrast: 1.08, saturation: 1.04, brightness: 3, paperClean: .18, edge: .08, quantize: 1 },
  medium: { contrast: 1.18, saturation: 1.1, brightness: 6, paperClean: .42, edge: .18, quantize: 1 },
  strong: { contrast: 1.32, saturation: 1.16, brightness: 8, paperClean: .72, edge: .32, quantize: 18 },
};

const loadImage = (source) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("画作预览暂时打不开，请重新上传。"));
  image.src = source;
});

export async function enhanceDrawing(source, level) {
  if (!settingsByLevel[level]) return source;
  const settings = settingsByLevel[level];
  const image = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0);
  const frame = context.getImageData(0, 0, canvas.width, canvas.height);
  const sourcePixels = new Uint8ClampedArray(frame.data);
  const luminance = new Float32Array(canvas.width * canvas.height);

  for (let pixel = 0, offset = 0; offset < sourcePixels.length; pixel += 1, offset += 4) {
    luminance[pixel] = sourcePixels[offset] * .299 + sourcePixels[offset + 1] * .587 + sourcePixels[offset + 2] * .114;
  }

  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      const pixel = y * canvas.width + x;
      const offset = pixel * 4;
      if (!sourcePixels[offset + 3]) continue;
      let red = sourcePixels[offset];
      let green = sourcePixels[offset + 1];
      let blue = sourcePixels[offset + 2];
      const max = Math.max(red, green, blue);
      const min = Math.min(red, green, blue);
      const light = (max + min) / 2;
      const chroma = max - min;

      if (light > 172 && chroma < 48) {
        const clean = settings.paperClean * Math.min(1, (light - 172) / 58);
        red += (255 - red) * clean;
        green += (255 - green) * clean;
        blue += (255 - blue) * clean;
      }

      const gray = red * .299 + green * .587 + blue * .114;
      red = gray + (red - gray) * settings.saturation;
      green = gray + (green - gray) * settings.saturation;
      blue = gray + (blue - gray) * settings.saturation;
      red = (red - 128) * settings.contrast + 128 + settings.brightness;
      green = (green - 128) * settings.contrast + 128 + settings.brightness;
      blue = (blue - 128) * settings.contrast + 128 + settings.brightness;

      if (x > 0 && x < canvas.width - 1 && y > 0 && y < canvas.height - 1) {
        const horizontal = Math.abs(luminance[pixel - 1] - luminance[pixel + 1]);
        const vertical = Math.abs(luminance[pixel - canvas.width] - luminance[pixel + canvas.width]);
        const inkBoost = Math.min(38, (horizontal + vertical) * settings.edge);
        red -= inkBoost; green -= inkBoost; blue -= inkBoost;
      }

      if (settings.quantize > 1 && light < 235) {
        red = Math.round(red / settings.quantize) * settings.quantize;
        green = Math.round(green / settings.quantize) * settings.quantize;
        blue = Math.round(blue / settings.quantize) * settings.quantize;
      }
      frame.data[offset] = Math.max(0, Math.min(255, red));
      frame.data[offset + 1] = Math.max(0, Math.min(255, green));
      frame.data[offset + 2] = Math.max(0, Math.min(255, blue));
    }
  }
  context.putImageData(frame, 0, 0);
  return canvas.toDataURL("image/png");
}
