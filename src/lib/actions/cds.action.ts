/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getFirestore } from "firebase-admin/firestore";
import { CDS } from "@/lib/domains/cds.domain";
import admin from "@/lib/firebase/server";
import { convertTimestamps } from "../timestamp";

// Helper function to get Firestore instance
function getDb() {
  return getFirestore();
}

interface CDSResponse {
  success: boolean;
  error?: string;
  cdsId?: string;
}

interface CDSListResponse {
  cds: CDS[];
  error?: string;
}

/**
 * Interface for CDS filtering parameters
 */
export interface CDSFilterParams {
  name?: string;
  website?: string;
  sst_reg?: string;
  limit?: number;
}

/**
 * Creates a new CDS entry in Firestore
 */
export async function createCDS(cds: CDS): Promise<CDSResponse> {
  try {
    const db = getDb();
    const cdsCollection = "CDS";

    // Create a new document with auto-generated ID
    const cdsRef = db.collection(cdsCollection).doc();

    // Add timestamps
    const cdsWithMetadata = {
      ...cds,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create the CDS document
    await cdsRef.set(cdsWithMetadata);

    return {
      success: true,
      cdsId: cdsRef.id,
    };
  } catch (error) {
    console.error("Error creating CDS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Updates an existing CDS entry in Firestore
 */
export async function updateCDS(
  cdsId: string,
  cdsData: Partial<CDS>
): Promise<CDSResponse> {
  try {
    const db = getDb();
    const cdsCollection = "CDS";

    // Reference to the CDS document
    const cdsRef = db.collection(cdsCollection).doc(cdsId);

    // Get the current CDS data
    const cdsSnapshot = await cdsRef.get();

    if (!cdsSnapshot.exists) {
      return {
        success: false,
        error: "CDS not found",
      };
    }

    // Add update timestamp
    const dataToUpdate = {
      ...cdsData,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update the CDS
    await cdsRef.update(dataToUpdate);

    return { success: true };
  } catch (error) {
    console.error("Error updating CDS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Gets a CDS entry by ID from Firestore
 */
export async function getCDSById(
  cdsId: string
): Promise<{ cds: CDS | null; error?: string }> {
  try {
    const db = getDb();
    const cdsCollection = "CDS";

    // Reference to the CDS document
    const cdsRef = db.collection(cdsCollection).doc(cdsId);

    // Get the CDS document
    const cdsSnapshot = await cdsRef.get();

    if (!cdsSnapshot.exists) {
      return { cds: null, error: "CDS not found" };
    }

    // Get the raw data
    const rawData = cdsSnapshot.data();

    // Add the ID to the CDS data
    const cdsWithId = {
      id: cdsId,
      ...rawData,
    };

    // Convert timestamps to serializable format
    const cdsData = convertTimestamps(cdsWithId) as CDS;

    return { cds: cdsData };
  } catch (error) {
    console.error("Error getting CDS:", error);
    return {
      cds: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Deletes a CDS entry from Firestore
 */
export async function deleteCDS(cdsId: string): Promise<CDSResponse> {
  try {
    const db = getDb();
    const cdsCollection = "CDS";

    // Reference to the CDS document
    const cdsRef = db.collection(cdsCollection).doc(cdsId);

    // Get the current CDS data to check if it exists
    const cdsSnapshot = await cdsRef.get();

    if (!cdsSnapshot.exists) {
      return {
        success: false,
        error: "CDS not found",
      };
    }

    // Delete the CDS
    await cdsRef.delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting CDS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Lists all CDS entries in Firestore
 */
export async function listCDS(limit: number = 20): Promise<CDSListResponse> {
  try {
    const db = getDb();
    const cdsCollection = "CDS";

    // Create base query
    const query = db
      .collection(cdsCollection)
      .limit(limit)
      .orderBy("created_at", "desc");

    // Execute the query
    const querySnapshot = await query.get();

    // Process the results
    const cds: CDS[] = [];
    querySnapshot.forEach((doc) => {
      const rawData = doc.data();
      const cdsWithId = {
        id: doc.id,
        ...rawData,
      };
      const cdsData = convertTimestamps(cdsWithId) as CDS;
      cds.push(cdsData);
    });

    return { cds };
  } catch (error) {
    console.error("Error listing CDS:", error);
    return {
      cds: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Filter CDS entries based on provided criteria
 */
export async function filterCDS(
  filterParams: CDSFilterParams
): Promise<CDSListResponse> {
  try {
    const db = getDb();
    const cdsCollection = "CDS";
    const { name, website, sst_reg, limit = 20 } = filterParams;

    // Create base query
    let query: any = db.collection(cdsCollection);

    // Apply name filter if provided
    if (name) {
      query = query
        .where("name", ">=", name)
        .where("name", "<=", name + "\uf8ff");
    }

    // Apply SST registration filter if provided
    if (sst_reg) {
      query = query.where("sst_reg", "==", sst_reg);
    }

    // Get all the results that match our filters so far
    const querySnapshot = await query.get();

    // Apply website filter client-side for partial matching
    let filteredCDS = querySnapshot.docs.map((doc: any) => {
      const rawData = doc.data();
      return {
        id: doc.id,
        ...rawData,
      };
    }) as CDS[];

    // Filter by website if provided
    if (website) {
      filteredCDS = filteredCDS.filter((cds) =>
        cds.website.toLowerCase().includes(website.toLowerCase())
      );
    }

    // Sort by creation date (descending)
    filteredCDS.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    // Apply limit
    filteredCDS = filteredCDS.slice(0, limit);

    // Convert timestamps
    const cds = filteredCDS.map((cdsItem) =>
      convertTimestamps(cdsItem)
    ) as CDS[];

    return { cds };
  } catch (error) {
    console.error("Error filtering CDS:", error);
    return {
      cds: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Search CDS entries by name
 */
export async function searchCDSByName(
  searchTerm: string,
  limit: number = 20
): Promise<CDSListResponse> {
  try {
    return await filterCDS({ name: searchTerm, limit });
  } catch (error) {
    console.error("Error searching CDS by name:", error);
    return {
      cds: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
