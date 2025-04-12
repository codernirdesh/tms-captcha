import { solve_captcha } from "./evaluate";
import { ResultTypes, SolveResult } from "./interface";
import { Image } from 'image-js';
import { BASE_PATH } from "./config";

/**
 * Processes an image and extracts text.
 * @param imagePath - Path to the image file.
 * @returns Extracted text as a string.
 */
async function processImage(imagePath: string): Promise<string> {
  const image = await Image.load(`${BASE_PATH}/${imagePath}`);
  const result = await solve_captcha(`${BASE_PATH}/${imagePath}`);
  if (result.type === ResultTypes.Success) {
    return result.value || "";
  }
  throw new Error("Failed to process image");
}

export { solve_captcha, ResultTypes, SolveResult, processImage };