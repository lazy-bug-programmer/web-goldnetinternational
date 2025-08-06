/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getFirestore } from "firebase-admin/firestore";
import {
  StockAccount,
  StockAccountStatus,
  StockAccountType,
} from "@/lib/domains/stock-account.domain";
import admin from "@/lib/firebase/server";
import { convertTimestamps } from "../timestamp";

// Helper function to get Firestore instance
function getDb() {
  return getFirestore();
}

interface StockAccountResponse {
  success: boolean;
  error?: string;
  stockAccountId?: string;
}

interface StockAccountListResponse {
  stockAccounts: StockAccount[];
  error?: string;
}

/**
 * Interface for StockAccount filtering parameters
 */
export interface StockAccountFilterParams {
  client_code?: string;
  cds_id?: string;
  user_id?: string; // Add user_id filter
  type?: StockAccountType;
  status?: StockAccountStatus;
  minCapital?: number;
  maxCapital?: number;
  limit?: number;
}

/**
 * Creates a new StockAccount entry in Firestore
 */
export async function createStockAccount(
  stockAccount: StockAccount
): Promise<StockAccountResponse> {
  try {
    const db = getDb();
    const stockAccountCollection = "StockAccounts";

    // Create a new document with auto-generated ID
    const stockAccountRef = db.collection(stockAccountCollection).doc();

    // Add timestamps
    const stockAccountWithMetadata = {
      ...stockAccount,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create the StockAccount document
    await stockAccountRef.set(stockAccountWithMetadata);

    return {
      success: true,
      stockAccountId: stockAccountRef.id,
    };
  } catch (error) {
    console.error("Error creating StockAccount:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Updates an existing StockAccount entry in Firestore
 */
export async function updateStockAccount(
  stockAccountId: string,
  stockAccountData: Partial<StockAccount>
): Promise<StockAccountResponse> {
  try {
    const db = getDb();
    const stockAccountCollection = "StockAccounts";

    // Reference to the StockAccount document
    const stockAccountRef = db
      .collection(stockAccountCollection)
      .doc(stockAccountId);

    // Get the current StockAccount data
    const stockAccountSnapshot = await stockAccountRef.get();

    if (!stockAccountSnapshot.exists) {
      return {
        success: false,
        error: "StockAccount not found",
      };
    }

    // Add update timestamp
    const dataToUpdate = {
      ...stockAccountData,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update the StockAccount
    await stockAccountRef.update(dataToUpdate);

    return { success: true };
  } catch (error) {
    console.error("Error updating StockAccount:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Gets a StockAccount entry by ID from Firestore
 */
export async function getStockAccountById(
  stockAccountId: string
): Promise<{ stockAccount: StockAccount | null; error?: string }> {
  try {
    const db = getDb();
    const stockAccountCollection = "StockAccounts";

    // Reference to the StockAccount document
    const stockAccountRef = db
      .collection(stockAccountCollection)
      .doc(stockAccountId);

    // Get the StockAccount document
    const stockAccountSnapshot = await stockAccountRef.get();

    if (!stockAccountSnapshot.exists) {
      return { stockAccount: null, error: "StockAccount not found" };
    }

    // Get the raw data
    const rawData = stockAccountSnapshot.data();

    // Add the ID to the StockAccount data
    const stockAccountWithId = {
      id: stockAccountId,
      ...rawData,
    };

    // Convert timestamps to serializable format
    const stockAccountData = convertTimestamps(
      stockAccountWithId
    ) as StockAccount;

    return { stockAccount: stockAccountData };
  } catch (error) {
    console.error("Error getting StockAccount:", error);
    return {
      stockAccount: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Deletes a StockAccount entry from Firestore
 */
export async function deleteStockAccount(
  stockAccountId: string
): Promise<StockAccountResponse> {
  try {
    const db = getDb();
    const stockAccountCollection = "StockAccounts";

    // Reference to the StockAccount document
    const stockAccountRef = db
      .collection(stockAccountCollection)
      .doc(stockAccountId);

    // Get the current StockAccount data to check if it exists
    const stockAccountSnapshot = await stockAccountRef.get();

    if (!stockAccountSnapshot.exists) {
      return {
        success: false,
        error: "StockAccount not found",
      };
    }

    // Delete the StockAccount
    await stockAccountRef.delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting StockAccount:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Lists all StockAccount entries in Firestore
 */
export async function listStockAccounts(
  limit: number = 20
): Promise<StockAccountListResponse> {
  try {
    const db = getDb();
    const stockAccountCollection = "StockAccounts";

    // Create base query
    const query = db
      .collection(stockAccountCollection)
      .limit(limit)
      .orderBy("created_at", "desc");

    // Execute the query
    const querySnapshot = await query.get();

    // Process the results
    const stockAccounts: StockAccount[] = [];
    querySnapshot.forEach((doc) => {
      const rawData = doc.data();
      const stockAccountWithId = {
        id: doc.id,
        ...rawData,
      };
      const stockAccountData = convertTimestamps(
        stockAccountWithId
      ) as StockAccount;
      stockAccounts.push(stockAccountData);
    });

    return { stockAccounts };
  } catch (error) {
    console.error("Error listing StockAccounts:", error);
    return {
      stockAccounts: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Filter StockAccount entries based on provided criteria
 */
export async function filterStockAccounts(
  filterParams: StockAccountFilterParams
): Promise<StockAccountListResponse> {
  try {
    const db = getDb();
    const stockAccountCollection = "StockAccounts";
    const {
      client_code,
      cds_id,
      user_id, // Add user_id filter
      type,
      status,
      minCapital,
      maxCapital,
      limit = 20,
    } = filterParams;

    // Create base query
    let query: any = db.collection(stockAccountCollection);

    // Apply client_code filter if provided
    if (client_code) {
      query = query.where("client_code", "==", client_code);
    }

    // Apply cds_id filter if provided
    if (cds_id) {
      query = query.where("cds_id", "==", cds_id);
    }

    // Apply user_id filter if provided
    if (user_id) {
      query = query.where("user_id", "==", user_id);
    }

    // Apply type filter if provided
    if (type !== undefined) {
      query = query.where("type", "==", type);
    }

    // Apply status filter if provided
    if (status !== undefined) {
      query = query.where("status", "==", status);
    }

    // Get all the results that match our filters so far
    const querySnapshot = await query.get();

    // Apply capital range filter client-side
    let filteredStockAccounts = querySnapshot.docs.map((doc: any) => {
      const rawData = doc.data();
      return {
        id: doc.id,
        ...rawData,
      };
    }) as StockAccount[];

    // Filter by capital range if provided
    if (minCapital !== undefined) {
      filteredStockAccounts = filteredStockAccounts.filter(
        (account) => account.capital >= minCapital
      );
    }

    if (maxCapital !== undefined) {
      filteredStockAccounts = filteredStockAccounts.filter(
        (account) => account.capital <= maxCapital
      );
    }

    // Sort by creation date (descending)
    filteredStockAccounts.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    // Apply limit
    filteredStockAccounts = filteredStockAccounts.slice(0, limit);

    // Convert timestamps
    const stockAccounts = filteredStockAccounts.map((stockAccount) =>
      convertTimestamps(stockAccount)
    ) as StockAccount[];

    return { stockAccounts };
  } catch (error) {
    console.error("Error filtering StockAccounts:", error);
    return {
      stockAccounts: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Search StockAccount entries by client code
 */
export async function searchStockAccountByClientCode(
  clientCode: string,
  limit: number = 20
): Promise<StockAccountListResponse> {
  try {
    return await filterStockAccounts({ client_code: clientCode, limit });
  } catch (error) {
    console.error("Error searching StockAccount by client code:", error);
    return {
      stockAccounts: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get StockAccounts by CDS ID
 */
export async function getStockAccountsByCDSId(
  cdsId: string,
  limit: number = 20
): Promise<StockAccountListResponse> {
  try {
    return await filterStockAccounts({ cds_id: cdsId, limit });
  } catch (error) {
    console.error("Error getting StockAccounts by CDS ID:", error);
    return {
      stockAccounts: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Update StockAccount status
 */
export async function updateStockAccountStatus(
  stockAccountId: string,
  status: StockAccountStatus
): Promise<StockAccountResponse> {
  try {
    return await updateStockAccount(stockAccountId, { status });
  } catch (error) {
    console.error("Error updating StockAccount status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get StockAccounts by User ID
 */
export async function getStockAccountsByUserId(
  userId: string,
  limit: number = 20
): Promise<StockAccountListResponse> {
  try {
    return await filterStockAccounts({ user_id: userId, limit });
  } catch (error) {
    console.error("Error getting StockAccounts by User ID:", error);
    return {
      stockAccounts: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
