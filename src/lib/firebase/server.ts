/* eslint-disable @typescript-eslint/no-explicit-any */
import admin from "firebase-admin";

// Initialize Firebase Admin if it hasn't been initialized yet
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PRIVATE_SA_PROJECT_ID,
        clientEmail: process.env.NEXT_PRIVATE_CLIENT_EMAIL,
        privateKey: process.env.NEXT_PRIVATE_SA_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n"
        ),
      }),
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error: any) {
    console.error("Firebase admin initialization error", error.stack);
    throw error;
  }
} else {
  console.log("Firebase Admin already initialized");
}

export default admin;
export { admin };
