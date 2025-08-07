"use server";

import admin from "@/lib/firebase/server";

export interface FirebaseUser {
  uid: string;
  email?: string;
  displayName?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  disabled: boolean;
  creationTime?: string;
  lastSignInTime?: string;
}

interface UserListResponse {
  users: FirebaseUser[];
  error?: string;
}

interface UserResponse {
  success: boolean;
  error?: string;
  uid?: string;
}

/**
 * Lists all Firebase Auth users
 */
export async function listFirebaseUsers(
  limit: number = 100
): Promise<UserListResponse> {
  try {
    const listUsersResult = await admin.auth().listUsers(limit);

    const users: FirebaseUser[] = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    }));

    return { users };
  } catch (error) {
    console.error("Error listing Firebase users:", error);
    return {
      users: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get Firebase user by UID
 */
export async function getFirebaseUserById(
  uid: string
): Promise<{ user: FirebaseUser | null; error?: string }> {
  try {
    const userRecord = await admin.auth().getUser(uid);

    const user: FirebaseUser = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      phoneNumber: userRecord.phoneNumber,
      emailVerified: userRecord.emailVerified,
      disabled: userRecord.disabled,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
    };

    return { user };
  } catch (error) {
    console.error("Error getting Firebase user:", error);
    return {
      user: null,
      error: error instanceof Error ? error.message : "User not found",
    };
  }
}

/**
 * Search Firebase users by email
 */
export async function searchFirebaseUsersByEmail(
  email: string
): Promise<UserListResponse> {
  try {
    const listUsersResult = await admin.auth().listUsers(1000); // Get more users for searching

    const filteredUsers = listUsersResult.users
      .filter(
        (userRecord) =>
          userRecord.email &&
          userRecord.email.toLowerCase().includes(email.toLowerCase())
      )
      .map((userRecord) => ({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        phoneNumber: userRecord.phoneNumber,
        emailVerified: userRecord.emailVerified,
        disabled: userRecord.disabled,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
      }));

    return { users: filteredUsers };
  } catch (error) {
    console.error("Error searching Firebase users:", error);
    return {
      users: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Creates a new Firebase Auth user
 */
export async function createFirebaseUser(
  email: string,
  password: string
): Promise<UserResponse> {
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      emailVerified: false,
    });

    return {
      success: true,
      uid: userRecord.uid,
    };
  } catch (error) {
    console.error("Error creating Firebase user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Updates an existing Firebase Auth user
 */
export async function updateFirebaseUser(
  uid: string,
  updates: {
    email?: string;
    password?: string;
    disabled?: boolean;
  }
): Promise<UserResponse> {
  try {
    await admin.auth().updateUser(uid, updates);

    return { success: true };
  } catch (error) {
    console.error("Error updating Firebase user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Deletes a Firebase Auth user
 */
export async function deleteFirebaseUser(uid: string): Promise<UserResponse> {
  try {
    await admin.auth().deleteUser(uid);

    return { success: true };
  } catch (error) {
    console.error("Error deleting Firebase user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
