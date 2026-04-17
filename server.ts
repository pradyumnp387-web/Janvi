import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Ensure directories exist
  const tempDir = path.join(process.cwd(), 'temp');
  const outputDir = path.join(process.cwd(), 'public', 'generated');
  await fs.ensureDir(tempDir);
  await fs.ensureDir(outputDir);

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/generate-video", async (req, res) => {
    const { imageUrl, script, partId } = req.body;

    if (!imageUrl || !script || !partId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const imagePath = path.join(tempDir, `${partId}.jpg`);
    const videoPath = path.join(outputDir, `${partId}.mp4`);
    const audioPath = path.join(tempDir, 'bg-music.mp3');

    try {
      // 1. Download image
      const response = await axios({
        url: imageUrl,
        responseType: 'stream',
      });
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);
      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => resolve());
        writer.on('error', reject);
      });

      // 2. Download placeholder background music if not exists
      if (!(await fs.pathExists(audioPath))) {
        const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        const audioResponse = await axios({ url: audioUrl, responseType: 'stream' });
        const audioWriter = fs.createWriteStream(audioPath);
        audioResponse.data.pipe(audioWriter);
        await new Promise<void>((resolve, reject) => {
          audioWriter.on('finish', () => resolve());
          audioWriter.on('error', reject);
        });
      }

      // 3. Generate Video with FFmpeg
      // We create a 5-second video from the image, add text overlay, and loop audio
      await new Promise<void>((resolve, reject) => {
        ffmpeg()
          .input(imagePath)
          .loop(5)
          .input(audioPath)
          .audioFilters('afade=t=out:st=4:d=1')
          .videoFilters([
            {
              filter: 'scale',
              options: '1080:1920:force_original_aspect_ratio=increase,crop=1080:1920'
            },
            {
              filter: 'drawtext',
              options: {
                text: script,
                fontcolor: 'white',
                fontsize: 64,
                box: 1,
                boxcolor: 'black@0.5',
                boxborderw: 20,
                x: '(w-text_w)/2',
                y: '(h-text_h)/2 + 400',
                shadowcolor: 'black',
                shadowx: 2,
                shadowy: 2
              }
            }
          ])
          .duration(5)
          .outputOptions('-pix_fmt yuv420p')
          .on('end', () => resolve())
          .on('error', (err) => {
            console.error('FFmpeg error:', err);
            reject(err);
          })
          .save(videoPath);
      });

      // Return the public URL
      const videoUrl = `/generated/${partId}.mp4`;
      res.json({ videoUrl });

    } catch (error) {
      console.error("Video generation failed:", error);
      res.status(500).json({ error: "Failed to generate video" });
    } finally {
      // Clean up temp image
      if (await fs.pathExists(imagePath)) {
        await fs.remove(imagePath);
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
