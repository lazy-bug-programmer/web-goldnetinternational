/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getFirestore } from "firebase-admin/firestore";
import {
  StockTransaction,
  StockTransactionType,
} from "@/lib/domains/stock-transaction.domain";
import admin from "@/lib/firebase/server";
import { convertTimestamps } from "../timestamp";

// Helper function to get Firestore instance
function getDb() {
  return getFirestore();
}

interface StockTransactionResponse {
  success: boolean;
  error?: string;
  stockTransactionId?: string;
}

interface StockTransactionListResponse {
  stockTransactions: StockTransaction[];
  error?: string;
}

/**
 * Interface for StockTransaction filtering parameters
 */
export interface StockTransactionFilterParams {
  stock_account_id?: string;
  type?: StockTransactionType;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  description?: string;
  limit?: number;
}

/**
 * Creates a new StockTransaction entry in Firestore
 */
export async function createStockTransaction(
  stockTransaction: StockTransaction
): Promise<StockTransactionResponse> {
  try {
    const db = getDb();
    const stockTransactionCollection = "StockTransactions";

    // Create a new document with auto-generated ID
    const stockTransactionRef = db.collection(stockTransactionCollection).doc();

    // Add timestamps
    const stockTransactionWithMetadata = {
      ...stockTransaction,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create the StockTransaction document
    await stockTransactionRef.set(stockTransactionWithMetadata);

    return {
      success: true,
      stockTransactionId: stockTransactionRef.id,
    };
  } catch (error) {
    console.error("Error creating StockTransaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Updates an existing StockTransaction entry in Firestore
 */
export async function updateStockTransaction(
  stockTransactionId: string,
  stockTransactionData: Partial<StockTransaction>
): Promise<StockTransactionResponse> {
  try {
    const db = getDb();
    const stockTransactionCollection = "StockTransactions";

    // Reference to the StockTransaction document
    const stockTransactionRef = db
      .collection(stockTransactionCollection)
      .doc(stockTransactionId);

    // Get the current StockTransaction data
    const stockTransactionSnapshot = await stockTransactionRef.get();

    if (!stockTransactionSnapshot.exists) {
      return {
        success: false,
        error: "StockTransaction not found",
      };
    }

    // Add update timestamp
    const dataToUpdate = {
      ...stockTransactionData,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Update the StockTransaction
    await stockTransactionRef.update(dataToUpdate);

    return { success: true };
  } catch (error) {
    console.error("Error updating StockTransaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Gets a StockTransaction entry by ID from Firestore
 */
export async function getStockTransactionById(
  stockTransactionId: string
): Promise<{ stockTransaction: StockTransaction | null; error?: string }> {
  try {
    const db = getDb();
    const stockTransactionCollection = "StockTransactions";

    // Reference to the StockTransaction document
    const stockTransactionRef = db
      .collection(stockTransactionCollection)
      .doc(stockTransactionId);

    // Get the StockTransaction document
    const stockTransactionSnapshot = await stockTransactionRef.get();

    if (!stockTransactionSnapshot.exists) {
      return { stockTransaction: null, error: "StockTransaction not found" };
    }

    // Get the raw data
    const rawData = stockTransactionSnapshot.data();

    // Add the ID to the StockTransaction data
    const stockTransactionWithId = {
      id: stockTransactionId,
      ...rawData,
    };

    // Convert timestamps to serializable format
    const stockTransactionData = convertTimestamps(
      stockTransactionWithId
    ) as StockTransaction;

    return { stockTransaction: stockTransactionData };
  } catch (error) {
    console.error("Error getting StockTransaction:", error);
    return {
      stockTransaction: null,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Deletes a StockTransaction entry from Firestore
 */
export async function deleteStockTransaction(
  stockTransactionId: string
): Promise<StockTransactionResponse> {
  try {
    const db = getDb();
    const stockTransactionCollection = "StockTransactions";

    // Reference to the StockTransaction document
    const stockTransactionRef = db
      .collection(stockTransactionCollection)
      .doc(stockTransactionId);

    // Get the current StockTransaction data to check if it exists
    const stockTransactionSnapshot = await stockTransactionRef.get();

    if (!stockTransactionSnapshot.exists) {
      return {
        success: false,
        error: "StockTransaction not found",
      };
    }

    // Delete the StockTransaction
    await stockTransactionRef.delete();

    return { success: true };
  } catch (error) {
    console.error("Error deleting StockTransaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Lists all StockTransaction entries in Firestore
 */
export async function listStockTransactions(
  limit: number = 20
): Promise<StockTransactionListResponse> {
  try {
    const db = getDb();
    const stockTransactionCollection = "StockTransactions";

    // Create base query
    const query = db
      .collection(stockTransactionCollection)
      .limit(limit)
      .orderBy("created_at", "desc");

    // Execute the query
    const querySnapshot = await query.get();

    // Process the results
    const stockTransactions: StockTransaction[] = [];
    querySnapshot.forEach((doc) => {
      const rawData = doc.data();
      const stockTransactionWithId = {
        id: doc.id,
        ...rawData,
      };
      const stockTransactionData = convertTimestamps(
        stockTransactionWithId
      ) as StockTransaction;
      stockTransactions.push(stockTransactionData);
    });

    return { stockTransactions };
  } catch (error) {
    console.error("Error listing StockTransactions:", error);
    return {
      stockTransactions: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Filter StockTransaction entries based on provided criteria
 */
export async function filterStockTransactions(
  filterParams: StockTransactionFilterParams
): Promise<StockTransactionListResponse> {
  try {
    const db = getDb();
    const stockTransactionCollection = "StockTransactions";
    const {
      stock_account_id,
      type,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      description,
      limit = 20,
    } = filterParams;

    // Create base query
    let query: any = db.collection(stockTransactionCollection);

    // Apply stock_account_id filter if provided
    if (stock_account_id) {
      query = query.where("stock_account_id", "==", stock_account_id);
    }

    // Apply type filter if provided
    if (type !== undefined) {
      query = query.where("type", "==", type);
    }

    // Get all the results that match our filters so far
    const querySnapshot = await query.get();

    // Apply additional filters client-side
    let filteredTransactions = querySnapshot.docs.map((doc: any) => {
      const rawData = doc.data();
      return {
        id: doc.id,
        ...rawData,
      };
    }) as StockTransaction[];

    // Filter by date range if provided
    if (startDate) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => new Date(transaction.date) >= startDate
      );
    }

    if (endDate) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => new Date(transaction.date) <= endDate
      );
    }

    // Filter by amount range if provided
    if (minAmount !== undefined) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.amount >= minAmount
      );
    }

    if (maxAmount !== undefined) {
      filteredTransactions = filteredTransactions.filter(
        (transaction) => transaction.amount <= maxAmount
      );
    }

    // Filter by description if provided
    if (description) {
      filteredTransactions = filteredTransactions.filter((transaction) =>
        transaction.description
          .toLowerCase()
          .includes(description.toLowerCase())
      );
    }

    // Sort by creation date (descending)
    filteredTransactions.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });

    // Apply limit
    filteredTransactions = filteredTransactions.slice(0, limit);

    // Convert timestamps
    const stockTransactions = filteredTransactions.map((stockTransaction) =>
      convertTimestamps(stockTransaction)
    ) as StockTransaction[];

    return { stockTransactions };
  } catch (error) {
    console.error("Error filtering StockTransactions:", error);
    return {
      stockTransactions: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get StockTransactions by stock account ID
 */
export async function getStockTransactionsByAccountId(
  stockAccountId: string,
  limit: number = 20
): Promise<StockTransactionListResponse> {
  try {
    return await filterStockTransactions({
      stock_account_id: stockAccountId,
      limit,
    });
  } catch (error) {
    console.error("Error getting StockTransactions by account ID:", error);
    return {
      stockTransactions: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get StockTransactions by date range
 */
export async function getStockTransactionsByDateRange(
  startDate: Date,
  endDate: Date,
  limit: number = 20
): Promise<StockTransactionListResponse> {
  try {
    return await filterStockTransactions({ startDate, endDate, limit });
  } catch (error) {
    console.error("Error getting StockTransactions by date range:", error);
    return {
      stockTransactions: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Get StockTransactions by type
 */
export async function getStockTransactionsByType(
  type: StockTransactionType,
  limit: number = 20
): Promise<StockTransactionListResponse> {
  try {
    return await filterStockTransactions({ type, limit });
  } catch (error) {
    console.error("Error getting StockTransactions by type:", error);
    return {
      stockTransactions: [],
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
