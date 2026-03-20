const { google } = require('googleapis');
const config = require('../../config');

class Sheet {
  constructor(id) {
    this.id = id;
  }

  async getAuthorize() {
    const oAuth2Client = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );
    oAuth2Client.setCredentials({
      access_token: config.google.accessToken,
      refresh_token: config.google.refreshToken,
      expiry_date: config.google.tokenExpiry,
    });
    this.auth = oAuth2Client;
  }

  async getLength(target) {
    const sheets = google.sheets({ version: 'v4', auth: this.auth });
    const result = await sheets.spreadsheets.get({
      spreadsheetId: this.id,
      ranges: [],
      includeGridData: true,
    });

    const sheet = result.data.sheets.find(
      (s) => s.properties.title === target
    );
    if (!sheet) {
      throw new Error(`Sheet "${target}" not found`);
    }

    const rowData = sheet.data && sheet.data[0] && sheet.data[0].rowData;
    this.currentLength = rowData ? rowData.length : 1;
    return this.currentLength;
  }

  async readData(range) {
    const sheets = google.sheets({ version: 'v4', auth: this.auth });
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: this.id,
      range: range,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }
    return rows;
  }
}

module.exports = Sheet;
