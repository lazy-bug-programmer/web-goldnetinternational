"use server";

import { cookies } from "next/headers";

export async function createSessionCookie(idToken: string) {
  try {
    // Dynamic import to ensure Firebase Admin is initialized
    const { default: admin } = await import("@/lib/firebase/server");

    // Verify the ID token first
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Create session cookie with 5 days expiration
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
    const sessionCookie = await admin.auth().createSessionCookie(idToken, {
      expiresIn,
    });

    // Set the session cookie
    (await cookies()).set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return { success: true, uid: decodedToken.uid };
  } catch (error) {
    console.error("Error creating session cookie:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create session",
    };
  }
}

export async function revokeSession() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;

    if (sessionCookie) {
      // Dynamic import to ensure Firebase Admin is initialized
      const { default: admin } = await import("@/lib/firebase/server");

      // Verify and revoke the session
      const decodedClaims = await admin
        .auth()
        .verifySessionCookie(sessionCookie);
      await admin.auth().revokeRefreshTokens(decodedClaims.uid);
    }

    // Clear the session cookie
    (await cookies()).delete("session");

    return { success: true };
  } catch (error) {
    console.error("Error revoking session:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to revoke session",
    };
  }
}

export async function verifySession() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;

    if (!sessionCookie) {
      return { success: false, error: "No session found" };
    }

    // Dynamic import to ensure Firebase Admin is initialized
    const { default: admin } = await import("@/lib/firebase/server");

    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie);

    return { success: true, uid: decodedClaims.uid, claims: decodedClaims };
  } catch (error) {
    console.error("Error verifying session:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Invalid session",
    };
  }
}
