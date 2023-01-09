const express = require("express");
const { json } = require("body-parser");
const { urlencoded } = require("express");
const getThreads = require("./routes/getThreads");
const getThreadId = require("./routes/getThreadId");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.use(getThreads);
app.use(getThreadId);

module.exports = app;
