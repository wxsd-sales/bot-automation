/* IMPORTS */

import { config } from 'dotenv';
config();
import express from 'express';
import { eventListener } from '../src/components/main.js';
import { botSetup, displayReminder, inactivityReminder } from '../src/components/main.js';
import { schedule } from 'node-cron';
import { mongoClient } from '../src/utils/db.js';

const router = express.Router();

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

/* FUNCTIONS */

mongoClient.connect((err) => {
  if (!err) {
    console.log('mongo connection established.');
    schedule(
      '0 9 * * *',
      async () => {
        displayReminder();
        inactivityReminder();
      },
      {
        timezone: 'America/New_York'
      }
    );
    // setInterval(() => {
    //   inactivityReminder();
    // }, 10000);
    botSetup();
    eventListener();
  } else {
    console.error('Error while trying to connect to MongoDB');
  }
});

router.post('/pingbot', async function (req, res) {
  console.info(new Date().toUTCString(), req.body);
  if (req.body.personEmail != null) {
    const body = {
      toPersonEmail: req.body.personEmail,
      text: 'Please send any message to the bot to get started!'
    };
    fetch(`${process.env.WEBEX_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.WEBEX_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
      .then((r) => {
        res.sendStatus(200);
        console.log('reponse', r.json());
      })
      .catch((e) => {
        res.sendStatus(500);
        console.log(e);
      });
  } else {
    res.sendStatus(400);
  }
});

router.get('/healthcheck', async function (req, res) {
  res.sendStatus(200);
});
export default router;
