const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const multer = require("multer");
const express = require("express");
const router = express.Router();

const { TEMP_FILE_PATH } = require("../utils");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
});

router.post("/", upload.single("audio"), async (req, res) => {
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
                        // res.sendStatus(500);
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

module.exports = router;
