const pathToFFmpeg = require("ffmpeg-static");
const { spawn } = require("child_process");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const multer = require("multer");
const express = require("express");
const router = express.Router();

const { TEMP_FILE_PATH, PUBLIC_PATH } = require("../utils");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

router.post("/form", upload.single("audio"), async (req, res) => {
    try {
        // res.contentType("mp3");
        const file = req.file;

        const inputPath = TEMP_FILE_PATH + `/input-${file.originalname}`;
        const outputPath = TEMP_FILE_PATH + `/output-${file.originalname}`;

        fs.writeFileSync(inputPath, file.buffer);

        ffmpeg(inputPath)
            // .audioCodec("libmp3lame")
            // .audioBitrate(128)
            // .audioChannels(2)
            .audioFilters("atempo=3/4", "asetrate=44100*4/3")
            .output(outputPath)
            // .on("error", (err) => {
            //     console.error(err);
            //     res.sendStatus(500);
            // })
            .on("end", () => {
                fs.unlinkSync(inputPath);

                res.sendFile(outputPath, (err) => {
                    if (err) {
                        console.error(err);
                        res.sendStatus(500);
                    } else {
                        fs.unlinkSync(outputPath);
                    }
                });
            })
            .run();
    } catch (err) {
        console.error(err);
        for (let file of fs.readdirSync(TEMP_FILE_PATH)) fs.unlinkSync(file);
        res.sendStatus(500);
    }
});

router.get("/link", async (req, res) => {
    try {
        const url = req.query.url;

        const fileName = url.split("/").at(-1);
        const inputPath = TEMP_FILE_PATH + `/input-${fileName}`;
        const outputPath = TEMP_FILE_PATH + `/output-${fileName}`;

        const response = await fetch(url);
        const buffer = await response.arrayBuffer();

        fs.writeFileSync(inputPath, Buffer.from(buffer));

        ffmpeg(inputPath)
            .audioFilters("atempo=3/4", "asetrate=44100*4/3")
            .output(outputPath)
            .on("end", () => {
                fs.unlinkSync(inputPath);

                res.sendFile(outputPath, (err) => {
                    if (err) {
                        console.error(err);
                        res.sendStatus(500);
                    } else {
                        fs.unlinkSync(outputPath);
                    }
                });
            })
            .run();
    } catch (err) {
        console.error(err);
        for (let file of fs.readdirSync(TEMP_FILE_PATH)) fs.unlinkSync(file);
        res.sendStatus(500);
    }
});

router.get("/link/video", async (req, res) => {
    try {
        const url = req.query.url;

        const fileName = url.split("/").at(-1);
        const imagePath = PUBLIC_PATH + "/image.png";
        const inputPath = TEMP_FILE_PATH + `/input-${fileName}`;
        const outputPath = TEMP_FILE_PATH + `/output-${fileName}.mp4`;

        const response = await fetch(url);
        const buffer = await response.arrayBuffer();

        // fs.writeFileSync(inputPath, Buffer.from(buffer));

        // prettier-ignore
        const ffmpeg = spawn(pathToFFmpeg, [
            "-loop", "1",
            "-i", imagePath,
            "-i", "-",
            "-af", "atempo=3/4,asetrate=44100*4/3",
            "-c:v", "libx264",
            "-c:a", "aac",
            "-shortest",
            outputPath,
        ]);

        ffmpeg.stdin.write(Buffer.from(buffer));
        ffmpeg.stdin.end();

        ffmpeg.on("close", () => {
            // fs.unlinkSync(inputPath);

            res.sendFile(outputPath, (err) => {
                if (err) {
                    console.error(err);
                    res.sendStatus(500);
                } else {
                    fs.unlinkSync(outputPath);
                }
            });
        });
    } catch (err) {
        console.error(err);
        for (let file of fs.readdirSync(TEMP_FILE_PATH)) fs.unlinkSync(file);
        res.sendStatus(500);
    }
});

module.exports = router;
