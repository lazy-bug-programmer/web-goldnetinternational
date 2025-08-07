/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getFirestore } from "firebase-admin/firestore";
import { UserProfile } from "@/lib/domains/user-profile.domain";
import admin from "@/lib/firebase/server";
import { convertTimestamps } from "../timestamp";

// Helper function to get Firestore instance
function getDb() {
  return getFirestore();
}

interface UserProfileResponse {
  success: boolean;
  error?: string;
  userProfileId?: string;
}

interface UserProfileListResponse {
  userProfiles: UserProfile[];
  error?: string;
}

/**
 * Interface for UserProfile filtering parameters
 */
export interface UserProfileFilterParams {
  name?: string;
  email?: string;
  ic?: string;
  bank_name?: string;
  limit?: number;
}

/**
 * Creates a new UserProfile entry in Firestore
 */
export async function createUserProfile(userProfile: UserProfile): Promise<UserProfileResponse> {
  try {
    const db = getDb();
    const userProfileCollection = "UserProfiles";

    // Check if user_id already exists
    const existingQuery = await db.collection(userProfileCollection)
      .where("user_id", "==", userProfile.user_id)
      .get();

    if (!existingQuery.empty) {
      return {
        success: false,
        error: "User profile with this user_id already exists",
      };
    }

    // Create a new document with auto-generated ID
    const userProfileRef = db.collection(userProfileCollection).doc();

    // Add timestamps
    const userProfileWithMetadata = {
      ...userProfile,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create the UserProfile document
    await userProfileRef.set(userProfileWithMetadata);

    return {
      success: true,
      userProfileId: userProfileRef.id,
    };
  } catch (error) {
    console.error("Error creating UserProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Updates an existing UserProfile entry in Firestore
 */
export async function updateUserProfile(
  userProfileId: string,
  userProfileData: Partial<UserProfile>
): Promise<UserProfileResponse> {
  try {
    const db = getDb();
    const userProfileCollection = "UserProfiles";

    // Reference to the UserProfile document
    const userProfileRef = db.collection(userProfileCollection).doc(userProfileId);

    // Get the current UserProfile data
    const userProfileSnapshot = await userProfileRef.get();

    if (!userProfileSnapshot.exists) {
      return {
        success: false,
        error: "UserProfile not found",
      };
    }

    // Add update timestamp
    const dataToUpdate = {
      ...userProfileData,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update the UserProfile
    await userProfileRef.update(dataToUpdate);

    return { success: true };
  } catch (error) {
    console.error("Error updating UserProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Gets a UserProfile entry by ID from Firestore
 */
export async function getUserProfileById(
  userProfileId: string
): Promise<{ userProfile: UserProfile | null; error?: string }> {
  try {
    const db = getDb();
    const userProfileCollection = "UserProfiles";

    // Reference to the UserProfile document
    const userProfileRef = db.collection(userProfileCollection).doc(userProfileId);

    // Get the UserProfile document
    const userProfileSnapshot = await userProfileRef.get();

    if (!userProfileSnapshot.exists) {
      return { userProfile: null, error: "UserProfile not found" };
    }

    // Get the raw data
    const rawData = userProfileSnapshot.data();

    // Add the ID to the UserProfile data
    const userProfileWithId = {
      id: userProfileId,
      ...rawData,
    };

    // Convert timestamps to serializable format
    const userProfileData = convertTimestamps(userProfileWithId) as UserProfile;

    return { userProfile: userProfileData };
  } catch (error) {
    console.error("Error getting UserProfile:", error);
    return {
      userProfile: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Gets a UserProfile entry by user_id from Firestore
 */
export async function getUserProfileByUserId(
  userId: string
): Promise<{ userProfile: UserProfile | null; error?: string }> {
  try {
    const db = getDb();
    const userProfileCollection = "UserProfiles";

    // Query for the UserProfile with the given user_id
    const query = await db.collection(userProfileCollection)
      .where("user_id", "==", userId)
      .get();

    if (query.empty) {
      return { userProfile: null, error: "UserProfile not found" };
    }

    // Get the first (and should be only) document
    const doc = query.docs[0];
    const rawData = doc.data();

    // Add the ID to the UserProfile data
    const userProfileWithId = {
      id: doc.id,
      ...rawData,
    };

    // Convert timestamps to serializable format
    const userProfileData = convertTimestamps(userProfileWithId) as UserProfile;

    return { userProfile: userProfileData };
  } catch (error) {
    console.error("Error getting UserProfile by user_id:", error);
    return {
      userProfile: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Deletes a UserProfile entry from Firestore
 */
export async function deleteUserProfile(userProfileId: string): Promise<UserProfileResponse> {
  try {
    const db = getDb();
    const userProfileCollection = "UserProfiles";

    // Reference to the UserProfile document
    const userProfileRef = db.collection(userProfileCollection).doc(userProfileId);

    // Get the current UserProfile data to check if it exists
    const userProfileSnapshot = await userProfileRef.get();

    if (!userProfileSnapshot.exists) {
      return {
        success: false,
        error: "UserProfile not found",
      };
    }

    // Delete the UserProfile
    await userProfileRef.delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting UserProfile:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Lists all UserProfile entries in Firestore
 */
export async function listUserProfiles(limit: number = 20): Promise<UserProfileListResponse> {
  try {
    const db = getDb();
    const userProfileCollection = "UserProfiles";

    // Create base query
    const query = db
      .collection(userProfileCollection)
      .limit(limit)
      .orderBy("created_at", "desc");

    // Execute the query
    const querySnapshot = await query.get();

    // Process the results
    const userProfiles: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      const rawData = doc.data();
      const userProfileWithId = {
        id: doc.id,
        ...rawData,
      };
      const userProfileData = convertTimestamps(userProfileWithId) as UserProfile;
      userProfiles.push(userProfileData);
    });

    return { userProfiles };
  } catch (error) {
    console.error("Error listing UserProfiles:", error);
    return {
      userProfiles: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Filter UserProfile entries based on provided criteria
 */
export async function filterUserProfiles(
  filterParams: UserProfileFilterParams
): Promise<UserProfileListResponse> {
  try {
    const db = getDb();
    const userProfileCollection = "UserProfiles";
    const { name, email, ic, bank_name, limit = 20 } = filterParams;

    // Create base query
    let query: any = db.collection(userProfileCollection);

    // Apply name filter if provided
    if (name) {
      query = query
        .where("name", ">=", name)
        .where("name", "<=", name + "\uf8ff");
    }

    // Apply IC filter if provided
    if (ic) {
      query = query.where("ic", "==", ic);
    }

    // Get all the results that match our filters so far
    const querySnapshot = await query.get();

    // Apply email and bank_name filters client-side for partial matching
    let filteredUserProfiles = querySnapshot.docs.map((doc: any) => {
      const rawData = doc.data();
      return {
        id: doc.id,
        ...rawData,
      };
    }) as UserProfile[];

    // Filter by email if provided
    if (email) {
      filteredUserProfiles = filteredUserProfiles.filter((userProfile) =>
        userProfile.email.toLowerCase().includes(email.toLowerCase())
      );
    }

    // Filter by bank_name if provided
    if (bank_name) {
      filteredUserProfiles = filteredUserProfiles.filter((userProfile) =>
        userProfile.bank_name.toLowerCase().includes(bank_name.toLowerCase())
      );
    }

    // Sort by creation date (descending)
    filteredUserProfiles.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    // Apply limit
    filteredUserProfiles = filteredUserProfiles.slice(0, limit);

    // Convert timestamps
    const userProfiles = filteredUserProfiles.map((userProfileItem) =>
      convertTimestamps(userProfileItem)
    ) as UserProfile[];

    return { userProfiles };
  } catch (error) {
    console.error("Error filtering UserProfiles:", error);
    return {
      userProfiles: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Search UserProfile entries by name
 */
export async function searchUserProfilesByName(
  searchTerm: string,
  limit: number = 20
): Promise<UserProfileListResponse> {
  try {
    return await filterUserProfiles({ name: searchTerm, limit });
  } catch (error) {
    console.error("Error searching UserProfiles by name:", error);
    return {
      userProfiles: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Search UserProfile entries by email
 */
export async function searchUserProfilesByEmail(
  searchTerm: string,
  limit: number = 20
): Promise<UserProfileListResponse> {
  try {
    return await filterUserProfiles({ email: searchTerm, limit });
  } catch (error) {
    console.error("Error searching UserProfiles by email:", error);
    return {
      userProfiles: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}