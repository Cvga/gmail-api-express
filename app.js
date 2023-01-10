const express = require("express");
const { json } = require("body-parser");
const { urlencoded } = require("express");
const gmail = require("./routes/gmail");
const morgan = require("morgan");

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));
app.use(morgan("tiny"));

app.use(gmail);

module.exports = app;
