import { google } from 'googleapis';

const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Corrige as quebras da chave
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

export { auth };
