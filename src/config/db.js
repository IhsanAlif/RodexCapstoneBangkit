// const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json'); // Path to your Firebase Admin SDK key file

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     storageBucket: 'YOUR_GCS_BUCKET_NAME.appspot.com' // Replace with your GCS bucket name
// });

// const db = admin.firestore();

// module.exports = db;


var admin = require("firebase-admin");

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://capstone-426015-default-rtdb.firebaseio.com",
  storageBucket: 'capstone-426015_cloudbuild.appspot.com' // Replace with your GCS bucket name
});

const db = admin.firestore();
module.exports = db;