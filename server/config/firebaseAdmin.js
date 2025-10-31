import admin from "firebase-admin";

const serviceAccount =
  "config/jersey-d0a02-firebase-adminsdk-fbsvc-9dd260b2d3.json";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;
