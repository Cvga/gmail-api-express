const express = require("express");
require("dotenv").config();
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");

const keys = require("../credentials.json");

const router = express.Router();

const oAuth2Client = new OAuth2Client(
  keys.web.client_id,
  keys.web.client_secret,
  keys.web.redirect_uris[2]
);

const getAuthClientByCode = async (code) => {
  if (code) {
    console.log("Authentication successful! Please return to the console.");

    if (
      !oAuth2Client.credentials.access_token &&
      !oAuth2Client.credentials.refresh_token
    ) {
      const tokenResponse = await oAuth2Client.getToken(code);

      console.log("TOKENS GENERADOS", tokenResponse.tokens);
      oAuth2Client.setCredentials(tokenResponse.tokens);
    } else {
      oAuth2Client.refreshAccessToken();
    }

    return oAuth2Client;
  }
};

router.get("/authenticate", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, DELETE, PATCH, OPTIONS"
  );

  try {
    const authenticationUri = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: "https://www.googleapis.com/auth/gmail.readonly",
      prompt: "consent",
    });

    return res.status(200).json({ authenticationUri });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get("/threads", async (req, res) => {
  console.log("Executing Get Threads...");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, DELETE, PATCH, OPTIONS"
  );

  try {
    async function listThreads() {
      const auth = await getAuthClientByCode(req.query.code);

      const gmail = google.gmail({ version: "v1", auth });

      const res = await gmail.users.threads.list({
        userId: "me",
      });

      const threads = res.data.threads;

      if (!threads || !threads.length) {
        console.log("No threads found.");
        return;
      }

      return threads;
    }

    const threads = await listThreads();

    console.log("Get Threads executed successfully...");

    res.status(200).json(threads);
  } catch (err) {
    console.log(`Error executing Get Threads: ${err}`);
    return res.status(err.code).send(err.message);
  }
});

router.get("/threads/:id", async (req, res) => {
  console.log("Executing Get Threads by Id...");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "1800");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "PUT, POST, GET, DELETE, PATCH, OPTIONS"
  );

  console.log({ code: req.query.code, id: req.params.id });

  try {
    async function getThreadId(id) {
      console.log("GENERATE TOKEN");
      const auth = await getAuthClientByCode(req.query.code);

      console.log("GENERATED AUTH: ", auth);

      const gmail = google.gmail({ version: "v1", auth });

      const res = await gmail.users.threads.get({
        id: id,
        userId: "me",
      });

      const thread = res.data;

      if (!thread || thread.length === 0) {
        console.log("No threads found.");
        return;
      }

      let rawConversation = thread.messages;

      let conversation = [];

      rawConversation.forEach((rawMessage) => {
        const header = rawMessage.payload.headers;

        var date = header.filter((obj) => {
          return obj.name === "Date";
        });

        var from = header.filter((obj) => {
          return obj.name === "From";
        });

        var to = header.filter((obj) => {
          return obj.name === "To";
        });

        var message = {
          to: to[0].value,
          from: from[0].value,
          date: date[0].value,
          message: rawMessage.snippet,
        };
        conversation.push(message);
      });
      return conversation;
    }

    const conversation = await getThreadId(req.params.id);

    console.log("Get Threads by Id executed successfully...");

    res.status(200).json(conversation);
  } catch (err) {
    console.log(`Error executing Get Threads by Id: ${err}`);
    return res.status(err.code).send(err.message);
  }
});

module.exports = router;
