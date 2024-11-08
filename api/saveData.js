// api/saveData.js

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const CryptoJS = require('crypto-js');
require('dotenv').config();

// Initialize Firebase Admin SDK with environment variables
const app = initializeApp({
  credential: applicationDefault(),
  projectId: process.env.FIREBASE_PROJECT_ID,
});
const firestore = getFirestore(app);

// Secret Key for AES encryption
const secretKey = process.env.SECRET_KEY;

// Encrypt function using AES
function encryptData(data) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

// Serverless function handler
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Only POST requests are allowed' });
    return;
  }

  const { data } = req.body;
  if (!data) {
    res.status(400).send({ error: 'Data is required' });
    return;
  }

  // Encrypt the data before storing it in Firestore
  const encryptedData = encryptData({ data });

  try {
    // Save the encrypted data in Firestore collection "testData"
    await firestore.collection('testData').add({ data: encryptedData });
    res.status(200).send({ message: 'Data saved successfully!' });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send({ error: 'Failed to save data' });
  }
}

