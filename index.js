const app = require('./src/app');
const port = 3000;
const functions = require("firebase-functions");

app.listen(port, () => {
  console.log(`App running at http://localhost:${port}`);
});

// Used as api deployment to firebase
exports.api = functions.https.onRequest(app)