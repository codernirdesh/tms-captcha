import fs from "fs";
import { Image } from "image-js";

import { evaluate_captcha } from "../src/evaluate";
import { KindEntry } from "../src/interface";
import { kinds } from "../src/kinds";
import { BASE_PATH } from "../src/config";

Object.values(kinds).map((kind: KindEntry) => {
  const kindPath = `${BASE_PATH}/${kind.data_path}`;

  // Check if the directory exists
  if (!fs.existsSync(kindPath)) {
    console.error(`Directory does not exist: ${kindPath}`);
    return;
  }

  let files = fs.readdirSync(kindPath).filter((file) => {
    const filePath = `${kindPath}/${file}`;
    try {
      // Ensure the file is accessible and is a valid file
      return fs.statSync(filePath).isFile();
    } catch {
      console.error(`Skipping invalid file: ${filePath}`);
      return false;
    }
  });

  if (!files || files.length === 0) {
    console.error(`No valid files found in directory: ${kindPath}`);
    return;
  }

  let data: Map<string, Array<Array<number>>> = new Map();

  let promises = files.map(async (filename) => {
    if (!filename) {
      console.error(`Encountered an empty filename in directory: ${kindPath}`);
      return;
    }

    const filePath = `${kindPath}/${filename}`;
    if (!filePath || filePath.trim() === "") {
      console.error(`Invalid file path: ${filePath}`);
      return;
    }

    try {
      let img = await Image.load(filePath);

      let res = await evaluate_captcha(img);

      if (res.length === 6) {
        res.map((item, index) => {
          let char: string = filename[index];

          if (!data.get(char)) {
            data.set(char, []);
          }

          data.get(char)?.push(item);
        });
      } else {
        console.error(`Invalid captcha length for file: ${filePath}`);
      }

      return res;
    } catch (error) {
      console.error(`Error processing file: ${filePath}`, error);
    }
  });

  Promise.all(promises).then(() => {
    let averaged_data: Map<string, Array<number>> = new Map();

    data.forEach((value, key: string) => {
      if (value.length > 1) {
        let sums = value.reduce((acc, new_val) => {
          let temp_summed =
            acc.map((item, index) => { return item + new_val[index]; });

          return temp_summed;
        });

        sums = sums.map((item) => item / value.length);

        averaged_data.set(key, sums);
      } else {
        averaged_data.set(key, value[0]);
      }
    });

    let json_data = JSON.stringify(Object.fromEntries(averaged_data));

    try {
      const outputPath = `${BASE_PATH}/data/${kind.write_name}`;
      fs.writeFileSync(outputPath, json_data);
      console.log(`Data written to: ${outputPath}`);
    } catch (error) {
      console.error(`Error writing data to file: ${BASE_PATH}/data/${kind.write_name}`, error);
    }
  });
});
