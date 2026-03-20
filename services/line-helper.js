const LineBot = require('./linebot/line_init');

const model = {};

model.notify = async function (userId, message) {
  if (!userId) throw new Error('LINE user ID is required');
  if (!message) throw new Error('Notification message is required');

  try {
    await LineBot.pushText(userId, message);
  } catch (error) {
    console.error('Failed to send LINE notification:', error.message);
    throw error;
  }
};

module.exports = model;
