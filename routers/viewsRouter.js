const express = require("express");
const router = express.Router();

const { VIEWS_PATH } = require("../utils");

router.get("/", (req, res) => {
    res.set("Content-Type", "text/html");
    res.sendFile(VIEWS_PATH + "/client.html");
});

module.exports = router;
