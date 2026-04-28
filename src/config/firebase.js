const admin = require('firebase-admin');
const { env } = require('./env');

if (!admin.apps.length) {
  if (env.firebaseClientEmail && env.firebasePrivateKey && env.firebaseProjectId) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey
      })
    });
  } else {
    admin.initializeApp();
  }
}

const db = admin.firestore();

module.exports = { admin, db };
