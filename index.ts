const url = process.env.MATRIX_URL;
if (!url) {
  throw new Error("MATRIX_URL is not defined in the environment variables.");
}

async function updatePixels(pixels: number[]) {
  const url = `${process.env.MATRIX_URL}/update`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: pixels,
      }),
    });

    console.log(`Updated pixels, response status: ${response.status}`);
  } catch (error) {
    console.error("Error updating pixels:", error);
  }
}

// const pixels = new Array(64 * 32).fill(0).map(() => Math.floor(Math.random() * 2 ** 16)); // rgb565
// updatePixels(pixels);

const video = process.argv[2] || "badapple.mp4";

// console.log(`Playing video: ${video}`);

import { spawn } from "child_process";

// ffmpeg -re -i bad_apple.mp4 -vf "scale=64:32:force_original_aspect_ratio=decrease,pad=64:32:(ow-iw)/2:(oh-ih)/2" -r 30 -pix_fmt rgb565le -f rawvideo pipe:1
const ffmpeg = spawn("ffmpeg", [
  "-re",

  "-i",
  video,

  "-vf",
  "scale=64:32:force_original_aspect_ratio=decrease,pad=64:32:(ow-iw)/2:(oh-ih)/2",

  "-r",
  "1",

  "-pix_fmt",
  "rgb565le",

  "-f",
  "rawvideo",

  "pipe:1",
  //
]);

ffmpeg.stdout.on("data", (data) => {
  console.log(`Received ${data.length} bytes of pixel data`);
  const pixels = new Uint16Array(data.buffer);
  updatePixels(Array.from(pixels));
});

ffmpeg.stderr.on("data", (data) => {
  console.error(`ffmpeg error: ${data}`);
});

ffmpeg.on("close", (code) => {
  console.log(`ffmpeg process exited with code ${code}`);
});
