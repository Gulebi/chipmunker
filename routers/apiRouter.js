const pathToFFmpeg = require("ffmpeg-static");
const { spawn } = require("child_process");
const multer = require("multer");
const express = require("express");
const router = express.Router();

const { EFFECTS_ARRAY, PUBLIC_PATH, urlValidator } = require("../utils");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

router.post("/form", upload.single("audio"), async (req, res) => {
    try {
        const { effect } = req.body;

        const effectName = effect || "chipmunk";
        const effectString = EFFECTS_ARRAY.find((el) => el.name === effectName).string;

        const file = req.file;
        const inputBuffer = Buffer.from(file.buffer);

        // prettier-ignore
        const ffmpeg = spawn(pathToFFmpeg, [
            "-i", "-",
            "-af", effectString,
            "-f", "mp3",
            "-",
        ]);

        ffmpeg.stdin.end(inputBuffer);
        ffmpeg.stdout.pipe(res);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

router.get("/link", async (req, res) => {
    try {
        const { effect, url } = req.query;

        if (!urlValidator(url)) return res.sendStatus(400);

        const effectName = effect || "chipmunk";
        const effectString = EFFECTS_ARRAY.find((el) => el.name === effectName).string;

        const fileName = `output-${url.split("/").at(-1)}`;

        // prettier-ignore
        const ffmpeg = spawn(pathToFFmpeg, [
            "-i", url,
            "-af", effectString,
            "-f", "mp3",
            "-",
        ]);

        res.attachment(fileName);
        ffmpeg.stdout.pipe(res);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

router.get("/link/video", async (req, res) => {
    try {
        const { effect, url } = req.query;

        if (!urlValidator(url)) return res.sendStatus(400);

        const effectName = effect || "chipmunk";
        const effectString = EFFECTS_ARRAY.find((el) => el.name === effectName).string;

        const fileName = `output-${url.split("/").at(-1).split(".").slice(0, -1).join(".")}.mp4`;
        const imagePath = PUBLIC_PATH + "/image.png";

        // prettier-ignore
        const ffmpeg = spawn(pathToFFmpeg, [
            "-loop", "1",
            "-i", imagePath,
            "-i", url,
            "-af", effectString,
            "-c:v", "libx264",
            "-c:a", "aac",
            "-shortest",
            '-f', 'flv',
            "-",
        ]);

        res.attachment(fileName);
        ffmpeg.stdout.pipe(res);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

router.get("/effects", (req, res) => {
    try {
        res.send(EFFECTS_ARRAY.map((el) => el.name));
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;
