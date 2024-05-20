// const { OAuth2Client } = require("google-auth-library");
// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// async function verifyGoogleToken(idToken) {
//   const ticket = await client.verifyIdToken({
//     idToken,
//     audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
//   });
//   const payload = ticket.getPayload();
//   return payload; // contains user information and token expiration details
// }

// module.exports = verifyGoogleToken;
