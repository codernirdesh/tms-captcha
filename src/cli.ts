import fs from "node:fs";
import { solve_captcha } from "./evaluate";

const imagePath = process.argv[2];

if (!imagePath) {
  console.error("Usage: node cli.js <image-path>");
  process.exit(1);
}

(async () => {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const result = await solve_captcha(base64Image);

  console.log("Captcha Result:", result);
})();