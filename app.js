const express = require("express");
const { json } = require("body-parser");
const { urlencoded } = require("express");
const threads = require("./routes/threads");
const morgan = require("morgan");

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.use(threads);

module.exports = app;
