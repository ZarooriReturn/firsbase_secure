// api/getData.js

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const CryptoJS = require('crypto-js');
require('dotenv').config();

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
});
const firestore = getFirestore(app);

// Secret Key for AES decryption
const secretKey = process.env.SECRET_KEY;

// Decrypt function using AES
function decryptData(encryptedData) {
  const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

// Serverless function handler
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).send({ error: 'Only GET requests are allowed' });
    return;
  }

  try {
    const querySnapshot = await firestore.collection('testData').get();
    const data = querySnapshot.docs.map((doc) => decryptData(doc.data().data));
    res.status(200).send({ data });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send({ error: 'Failed to retrieve data' });
  }
}
