const crypto = require('crypto');
const express = require('express');
const cron = require('node-cron');
const moment = require('moment-timezone');
const config = require('./config');
const lineHelper = require('./services/line-helper');
const Sheet = require('./services/google/google-sheet-helper');

const app = express();

app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf; },
}));
app.use(express.urlencoded({ extended: true }));

const sheetClient = new Sheet(config.google.sheetId);
let authorized = false;

async function readFromGoogleSheet(dataRange) {
  if (!authorized) {
    await sheetClient.getAuthorize();
    authorized = true;
  }

  const rows = await sheetClient.readData(dataRange);
  const dates = rows.map((row) => {
    const parts = row[1] ? row[1].split('/') : [];
    if (parts.length < 3) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }).filter(Boolean);

  const titles = rows.map((row) => row[0]);

  return { titleList: titles, dateList: dates };
}

function getUpcomingDates(dateList) {
  const now = moment().tz(config.timezone).format('YYYYMMDD');
  return dateList.filter((d) => moment(d).isAfter(now));
}

/*
 * 讀書會 schedule events
 */
cron.schedule(config.cron.schedule, async () => {
  console.log('Running scheduled notification check');
  try {
    const result = await readFromGoogleSheet(config.google.sheetRange);
    const upcoming = getUpcomingDates(result.dateList);

    if (upcoming.length > 0) {
      await lineHelper.notify(config.line.notifyUserId, config.notification.message);
    }
  } catch (error) {
    console.error('Cron job error:', error);
  }
});

app.get('/', async function (req, res) {
  try {
    const result = await readFromGoogleSheet(config.google.sheetRange);
    const upcoming = getUpcomingDates(result.dateList);
    res.json(upcoming);
  } catch (error) {
    console.error('Error reading schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function verifyLineSignature(req, res, next) {
  const channelSecret = config.line.channelSecret;
  const signature = req.headers['x-line-signature'];

  if (!signature) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  const expected = crypto
    .createHmac('SHA256', channelSecret)
    .update(req.rawBody)
    .digest('base64');

  if (signature !== expected) {
    return res.status(403).json({ error: 'Invalid signature' });
  }

  next();
}

app.post('/webhook', verifyLineSignature, (req, res) => {
  const events = req.body && req.body.events;

  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  res.status(200).json({ message: 'OK' });
});

module.exports = app;
