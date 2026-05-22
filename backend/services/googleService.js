require('dotenv').config();

const { OAuth2Client } = require('google-auth-library');

const clientId = process.env.GOOGLE_CLIENT_ID;

if (!clientId) {
  console.warn('GOOGLE_CLIENT_ID is not configured. Google token verification will fail until it is set.');
}

const oauth2Client = new OAuth2Client(clientId || undefined);

async function verifyGoogleToken(token) {
  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Invalid Google token payload');
    }

    const payload = await response.json();

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  }
}

module.exports = {
  verifyGoogleToken,
};