const { admin, db } = require('../config/firebase');
const { env } = require('../config/env');

async function verifyFirebaseSetup() {
  try {
    const app = admin.app();
    const projectId = app.options.projectId || env.firebaseProjectId || 'unknown';

    await db.collection('_healthchecks').doc('backend').set(
      {
        ok: true,
        checkedAt: Date.now(),
        source: 'verifyFirebase.js'
      },
      { merge: true }
    );

    console.log(`Firebase Admin initialized successfully for project: ${projectId}`);
    console.log('Firestore write check succeeded (_healthchecks/backend).');
    process.exit(0);
  } catch (error) {
    console.error('Firebase verification failed.');
    console.error(error.message);
    process.exit(1);
  }
}

verifyFirebaseSetup();
