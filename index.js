const cors = require("cors");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const { ROUTERS_PATH, PUBLIC_PATH } = require("./utils");

const viewsRouter = require(ROUTERS_PATH + "/viewsRouter");
const apiRouter = require(ROUTERS_PATH + "/apiRouter");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/static", express.static(PUBLIC_PATH));

app.use("/", viewsRouter);
app.use("/api", apiRouter);

app.listen(port, () => console.log("App running at http://localhost:3000/"));
