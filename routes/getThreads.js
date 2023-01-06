const express = require("express");
require("dotenv").config();
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const http = require("http");
const url = require("url");
const open = require("open");
const destroyer = require("server-destroy");
const keys = require("../credentials.json");

const router = express.Router();

router.get("/threads", async (req, res) => {
  console.log("Executing Get Threads...");
  res.setHeader("Content-Type", "text/html");
  try {
    const oAuth2Client = new OAuth2Client(
      keys.web.client_id,
      keys.web.client_secret,
      keys.web.redirect_uris[0]
    );

    const openAuthenticate = async () => {
      const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: "https://www.googleapis.com/auth/gmail.readonly",
        prompt: "consent",
      });

      open(authorizeUrl, { wait: false }).then((cp) => cp.unref());
    };

    const getAuthClientByCode = async (code) => {
      if (code) {
        console.log("Authentication successful! Please return to the console.");

        const tokenResponse = await oAuth2Client.getToken(code);

        oAuth2Client.setCredentials(tokenResponse.tokens);
        console.info("Tokens acquired.");

        return oAuth2Client;
      }
    };

    async function listThreads() {
      if (!req.query.code) {
        await openAuthenticate();
      } else {
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
    }

    const threads = await listThreads();

    console.log("Get Threads executed successfully...");

    res.status(200).json(threads);
  } catch (err) {
    console.log(`Error executing Get Threads: ${err}`);
    return res.status(err.code).send(err.message);
  }
});

module.exports = router;
