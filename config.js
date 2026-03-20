require('dotenv').config();

const required = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_ACCESS_TOKEN',
  'GOOGLE_REFRESH_TOKEN',
  'LINE_CHANNEL_ACCESS_TOKEN',
  'LINE_CHANNEL_SECRET',
  'GOOGLE_SHEET_ID',
  'LINE_NOTIFY_USER_ID',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error('Missing required environment variables:', missing.join(', '));
  console.error('See .env.example for documentation.');
  process.exit(1);
}

module.exports = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob',
    accessToken: process.env.GOOGLE_ACCESS_TOKEN,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    tokenExpiry: parseInt(process.env.GOOGLE_TOKEN_EXPIRY, 10) || undefined,
    sheetId: process.env.GOOGLE_SHEET_ID,
    sheetRange: process.env.GOOGLE_SHEET_RANGE || '第34組!A4:B100',
  },
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    notifyUserId: process.env.LINE_NOTIFY_USER_ID,
  },
  cron: {
    schedule: process.env.CRON_SCHEDULE || '0 10 * * *',
  },
  notification: {
    message: process.env.NOTIFICATION_MESSAGE || 'Robot提醒 今晚有研討會喔！',
  },
  timezone: process.env.TIMEZONE || 'Asia/Taipei',
  port: process.env.PORT || 3000,
};
