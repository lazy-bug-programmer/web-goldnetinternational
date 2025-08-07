/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { Plus, Edit, Trash2, Search, Filter, Moon, Sun, User } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { CDS } from "@/lib/domains/cds.domain";
import { UserProfile } from "@/lib/domains/user-profile.domain";
import {
  StockAccount,
  StockAccountType,
  StockAccountStatus,
} from "@/lib/domains/stock-account.domain";
import {
  StockTransaction,
  StockTransactionType,
} from "@/lib/domains/stock-transaction.domain";
import {
  createCDS,
  updateCDS,
  deleteCDS,
  listCDS,
  filterCDS,
} from "@/lib/actions/cds.action";
import {
  getUserProfileByUserId,
  updateUserProfile,
  createUserProfile,
} from "@/lib/actions/user-profile.action";
import {
  createStockAccount,
  updateStockAccount,
  deleteStockAccount,
  listStockAccounts,
  filterStockAccounts,
} from "@/lib/actions/stock-account.action";
import {
  createStockTransaction,
  updateStockTransaction,
  deleteStockTransaction,
  listStockTransactions,
  filterStockTransactions,
} from "@/lib/actions/stock-transaction.action";
import {
  listFirebaseUsers,
  FirebaseUser,
  createFirebaseUser,
  updateFirebaseUser,
  deleteFirebaseUser,
} from "@/lib/actions/user.action";

type Tab = "users" | "cds" | "stock-accounts" | "stock-transactions";

// Theme Context
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

const useTheme = () => useContext(ThemeContext);

// Theme Provider Component
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem("admin-theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    } else {
      // Check system preference
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    // Save theme preference
    localStorage.setItem("admin-theme", isDark ? "dark" : "light");

    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? "dark" : ""}>{children}</div>
    </ThemeContext.Provider>
  );
};

// Theme Toggle Button Component
const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors duration-200 ${
        isDark
          ? "bg-gray-700 text-yellow-400 hover:bg-gray-600"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      }`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

function AdminPageContent() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User Management State
  const [usersList, setUsersList] = useState<FirebaseUser[]>([]);
  const [userForm, setUserForm] = useState<{
    email: string;
    password: string;
  }>({ email: "", password: "" });
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);

  // User Profile Management State
  const [showUserProfileForm, setShowUserProfileForm] = useState(false);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);
  const [userProfileForm, setUserProfileForm] = useState<{
    name: string;
    ic: string;
    bank_account: string;
    bank_name: string;
    email: string;
  }>({
    name: '',
    ic: '',
    bank_account: '',
    bank_name: '',
    email: '',
  });
  const [editingUserProfile, setEditingUserProfile] = useState<string | null>(null);
  const [loadingUserProfile, setLoadingUserProfile] = useState(false);

  // CDS State
  const [cdsList, setCdsList] = useState<CDS[]>([]);
  const [cdsForm, setCdsForm] = useState<Partial<CDS>>({});
  const [editingCds, setEditingCds] = useState<string | null>(null);
  const [showCdsForm, setShowCdsForm] = useState(false);

  // Stock Account State
  const [stockAccounts, setStockAccounts] = useState<StockAccount[]>([]);
  const [stockAccountForm, setStockAccountForm] = useState<
    Partial<StockAccount>
  >({});
  const [editingStockAccount, setEditingStockAccount] = useState<string | null>(
    null
  );
  const [showStockAccountForm, setShowStockAccountForm] = useState(false);
  // Add available CDS list for dropdown
  const [availableCDS, setAvailableCDS] = useState<CDS[]>([]);
  const [loadingCDS, setLoadingCDS] = useState(false);
  // Add available users list for dropdown
  const [availableUsers, setAvailableUsers] = useState<FirebaseUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Stock Transaction State
  const [stockTransactions, setStockTransactions] = useState<
    StockTransaction[]
  >([]);
  const [stockTransactionForm, setStockTransactionForm] = useState<
    Partial<StockTransaction>
  >({});
  const [editingStockTransaction, setEditingStockTransaction] = useState<
    string | null
  >(null);
  const [showStockTransactionForm, setShowStockTransactionForm] =
    useState(false);
  // Add available stock accounts for transaction dropdown
  const [availableStockAccounts, setAvailableStockAccounts] = useState<
    StockAccount[]
  >([]);
  const [loadingStockAccounts, setLoadingStockAccounts] = useState(false);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<any>({});

  // Stock Account Detail Modal State
  const [showStockAccountDetail, setShowStockAccountDetail] = useState(false);
  const [selectedStockAccount, setSelectedStockAccount] = useState<StockAccount | null>(null);
  const [accountTransactions, setAccountTransactions] = useState<StockTransaction[]>([]);
  const [loadingAccountTransactions, setLoadingAccountTransactions] = useState(false);

  // Stock Transaction Form State for Account Detail Modal
  const [showAccountTransactionForm, setShowAccountTransactionForm] = useState(false);
  const [accountTransactionForm, setAccountTransactionForm] = useState<Partial<StockTransaction>>({});
  const [editingAccountTransaction, setEditingAccountTransaction] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Load all necessary data when switching to stock transactions
  useEffect(() => {
    if (activeTab === "stock-transactions") {
      loadAllReferenceData();
    }
  }, [activeTab]);

  // Load available CDS and users when stock account form is shown
  useEffect(() => {
    if (showStockAccountForm) {
      loadAvailableCDS();
      loadAvailableUsers();
    }
  }, [showStockAccountForm]);

  // Load available stock accounts when stock transaction form is shown
  useEffect(() => {
    if (showStockTransactionForm) {
      loadAvailableStockAccounts();
      loadAvailableUsers(); // Also load users for transaction form
    }
  }, [showStockTransactionForm]);

  const loadAvailableCDS = async () => {
    setLoadingCDS(true);
    try {
      const cdsResult = await listCDS(100); // Get more CDS for dropdown
      if (cdsResult.error) {
        setError(cdsResult.error);
      } else {
        setAvailableCDS(cdsResult.cds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load CDS");
    } finally {
      setLoadingCDS(false);
    }
  };

  const loadAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersResult = await listFirebaseUsers(100);
      if (usersResult.error) {
        setError(usersResult.error);
      } else {
        // Filter out disabled users and sort by email
        const activeUsers = usersResult.users
          .filter((user) => !user.disabled && user.email)
          .sort((a, b) => (a.email || "").localeCompare(b.email || ""));
        setAvailableUsers(activeUsers);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAvailableStockAccounts = async () => {
    setLoadingStockAccounts(true);
    try {
      const accountsResult = await listStockAccounts(100);
      if (accountsResult.error) {
        setError(accountsResult.error);
      } else {
        // Only show active accounts
        const activeAccounts = accountsResult.stockAccounts.filter(
          (account) => account.status === StockAccountStatus.ACTIVE
        );
        setAvailableStockAccounts(activeAccounts);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load stock accounts"
      );
    } finally {
      setLoadingStockAccounts(false);
    }
  };

  const loadAllReferenceData = async () => {
    try {
      // Load stock accounts for transaction display
      const accountsResult = await listStockAccounts(100);
      if (!accountsResult.error) {
        setStockAccounts(accountsResult.stockAccounts);
      }

      // Load CDS data
      const cdsResult = await listCDS(100);
      if (!cdsResult.error) {
        setCdsList(cdsResult.cds);
      }

      // Load users data
      const usersResult = await listFirebaseUsers(100);
      if (!usersResult.error) {
        const activeUsers = usersResult.users
          .filter((user) => !user.disabled && user.email)
          .sort((a, b) => (a.email || "").localeCompare(b.email || ""));
        setAvailableUsers(activeUsers);
      }
    } catch (err) {
      console.error("Error loading reference data:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      switch (activeTab) {
        case "users":
          const usersResult = await listFirebaseUsers(100);
          if (usersResult.error) {
            setError(usersResult.error);
          } else {
            setUsersList(usersResult.users);
          }
          break;
        case "cds":
          const cdsResult = await listCDS(50);
          if (cdsResult.error) {
            setError(cdsResult.error);
          } else {
            setCdsList(cdsResult.cds);
          }
          break;
        case "stock-accounts":
          const accountsResult = await listStockAccounts(50);
          if (accountsResult.error) {
            setError(accountsResult.error);
          } else {
            setStockAccounts(accountsResult.stockAccounts);
          }
          // Also load reference data for proper display
          await loadAllReferenceData();
          break;
        case "stock-transactions":
          const transactionsResult = await listStockTransactions(50);
          if (transactionsResult.error) {
            setError(transactionsResult.error);
          } else {
            setStockTransactions(transactionsResult.stockTransactions);
          }
          // Load reference data after getting transactions
          await loadAllReferenceData();
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // User Management Functions
  const handleCreateUser = async () => {
    if (!userForm.email || !userForm.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (userForm.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const result = await createFirebaseUser(userForm.email, userForm.password);
    if (result.success) {
      setShowUserForm(false);
      setUserForm({ email: "", password: "" });
      loadData();
    } else {
      setError(result.error || "Failed to create user");
    }
    setLoading(false);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    if (!userForm.email) {
      setError("Email is required");
      return;
    }

    if (userForm.password && userForm.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const updates: any = { email: userForm.email };
    if (userForm.password) {
      updates.password = userForm.password;
    }

    const result = await updateFirebaseUser(editingUser, updates);
    if (result.success) {
      setEditingUser(null);
      setShowUserForm(false);
      setUserForm({ email: "", password: "" });
      loadData();
    } else {
      setError(result.error || "Failed to update user");
    }
    setLoading(false);
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    setLoading(true);
    const result = await deleteFirebaseUser(uid);
    if (result.success) {
      loadData();
    } else {
      setError(result.error || "Failed to delete user");
    }
    setLoading(false);
  };

  // CDS Functions
  const handleCreateCds = async () => {
    if (
      !cdsForm.name ||
      !cdsForm.addres ||
      !cdsForm.website ||
      !cdsForm.sst_reg
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    const result = await createCDS(cdsForm as CDS);
    if (result.success) {
      setShowCdsForm(false);
      setCdsForm({});
      loadData();
    } else {
      setError(result.error || "Failed to create CDS");
    }
    setLoading(false);
  };

  const handleUpdateCds = async () => {
    if (!editingCds) return;

    setLoading(true);
    const result = await updateCDS(editingCds, cdsForm);
    if (result.success) {
      setEditingCds(null);
      setShowCdsForm(false);
      setCdsForm({});
      loadData();
    } else {
      setError(result.error || "Failed to update CDS");
    }
    setLoading(false);
  };

  const handleDeleteCds = async (id: string) => {
    if (!confirm("Are you sure you want to delete this CDS?")) return;

    setLoading(true);
    const result = await deleteCDS(id);
    if (result.success) {
      loadData();
    } else {
      setError(result.error || "Failed to delete CDS");
    }
    setLoading(false);
  };

  // Stock Account Functions
  const generateRandomCode = (length: number) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const generateCdsNo = () => {
    const part1 = Math.floor(100 + Math.random() * 900);
    const part2 = Math.floor(100 + Math.random() * 900);
    const part3 = Math.floor(100000000 + Math.random() * 900000000);
    return `${part1}-${part2}-${part3}`;
  };

  const handleCreateStockAccount = async () => {
    if (
      !stockAccountForm.cds_id ||
      !stockAccountForm.user_id ||
      stockAccountForm.type === undefined ||
      stockAccountForm.status === undefined
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const accountData = {
      ...stockAccountForm,
      client_code: generateRandomCode(7),
      remister_code: generateRandomCode(4),
      cds_no: generateCdsNo(),
      capital: Number(stockAccountForm.capital) || 0,
      profit: 0, // Default value of 0
      estimated_total: Number(stockAccountForm.estimated_total) || 0,
      last_transaction_date: new Date(),
    } as StockAccount;

    setLoading(true);
    const result = await createStockAccount(accountData);
    if (result.success) {
      setShowStockAccountForm(false);
      setStockAccountForm({});
      loadData();
    } else {
      setError(result.error || "Failed to create Stock Account");
    }
    setLoading(false);
  };

  const handleUpdateStockAccount = async () => {
    if (!editingStockAccount) return;

    setLoading(true);
    const result = await updateStockAccount(
      editingStockAccount,
      stockAccountForm
    );
    if (result.success) {
      setEditingStockAccount(null);
      setShowStockAccountForm(false);
      setStockAccountForm({});
      loadData();
    } else {
      setError(result.error || "Failed to update Stock Account");
    }
    setLoading(false);
  };

  const handleDeleteStockAccount = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Stock Account?")) return;

    setLoading(true);
    const result = await deleteStockAccount(id);
    if (result.success) {
      loadData();
    } else {
      setError(result.error || "Failed to delete Stock Account");
    }
    setLoading(false);
  };

  // Stock Transaction Functions
  const handleCreateStockTransaction = async () => {
    if (
      !stockTransactionForm.stock_account_id ||
      !stockTransactionForm.description ||
      !stockTransactionForm.amount
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const transactionData = {
      ...stockTransactionForm,
      amount: Number(stockTransactionForm.amount),
      date: stockTransactionForm.date || new Date(),
      type: stockTransactionForm.type || StockTransactionType.INCREASE,
    } as StockTransaction;

    setLoading(true);
    const result = await createStockTransaction(transactionData);
    if (result.success) {
      setShowStockTransactionForm(false);
      setStockTransactionForm({});
      loadData();
    } else {
      setError(result.error || "Failed to create Stock Transaction");
    }
    setLoading(false);
  };

  const handleUpdateStockTransaction = async () => {
    if (!editingStockTransaction) return;

    setLoading(true);
    const result = await updateStockTransaction(
      editingStockTransaction,
      stockTransactionForm
    );
    if (result.success) {
      setEditingStockTransaction(null);
      setShowStockTransactionForm(false);
      setStockTransactionForm({});
      loadData();
    } else {
      setError(result.error || "Failed to update Stock Transaction");
    }
    setLoading(false);
  };

  const handleDeleteStockTransaction = async (id: string) => {
    if (!confirm("Are you sure you want to delete this Stock Transaction?"))
      return;

    setLoading(true);
    const result = await deleteStockTransaction(id);
    if (result.success) {
      loadData();
    } else {
      setError(result.error || "Failed to delete Stock Transaction");
    }
    setLoading(false);
  };

  // Load transactions for a specific stock account
  const loadAccountTransactions = async (accountId: string) => {
    setLoadingAccountTransactions(true);
    try {
      const transactionsResult = await filterStockTransactions({
        stock_account_id: accountId,
        limit: 100
      });
      if (transactionsResult.error) {
        setError(transactionsResult.error);
      } else {
        setAccountTransactions(transactionsResult.stockTransactions);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoadingAccountTransactions(false);
    }
  };

  // Handle viewing stock account details
  const handleViewStockAccountDetail = async (account: StockAccount) => {
    setSelectedStockAccount(account);
    setShowStockAccountDetail(true);
    await loadAccountTransactions(account.id!);
  };

  // Handle creating transaction from account detail modal
  const handleCreateAccountTransaction = async () => {
    if (
      !selectedStockAccount ||
      !accountTransactionForm.description ||
      !accountTransactionForm.amount ||
      accountTransactionForm.type === undefined
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const transactionData = {
      ...accountTransactionForm,
      stock_account_id: selectedStockAccount.id!,
      amount: Number(accountTransactionForm.amount),
      date: accountTransactionForm.date || new Date(),
    } as StockTransaction;

    setLoading(true);
    const result = await createStockTransaction(transactionData);
    if (result.success) {
      setShowAccountTransactionForm(false);
      setAccountTransactionForm({});
      await loadAccountTransactions(selectedStockAccount.id!);
      // Refresh main data if we're on transactions tab
      if (activeTab === "stock-transactions") {
        await loadData();
      }
    } else {
      setError(result.error || "Failed to create Stock Transaction");
    }
    setLoading(false);
  };

  // Handle updating transaction from account detail modal
  const handleUpdateAccountTransaction = async () => {
    if (!editingAccountTransaction || !selectedStockAccount) return;

    setLoading(true);
    const result = await updateStockTransaction(
      editingAccountTransaction,
      accountTransactionForm
    );
    if (result.success) {
      setEditingAccountTransaction(null);
      setShowAccountTransactionForm(false);
      setAccountTransactionForm({});
      await loadAccountTransactions(selectedStockAccount.id!);
      // Refresh main data if we're on transactions tab
      if (activeTab === "stock-transactions") {
        await loadData();
      }
    } else {
      setError(result.error || "Failed to update Stock Transaction");
    }
    setLoading(false);
  };

  // Handle deleting transaction from account detail modal
  const handleDeleteAccountTransaction = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?") || !selectedStockAccount) return;

    setLoading(true);
    const result = await deleteStockTransaction(transactionId);
    if (result.success) {
      await loadAccountTransactions(selectedStockAccount.id!);
      // Refresh main data if we're on transactions tab
      if (activeTab === "stock-transactions") {
        await loadData();
      }
    } else {
      setError(result.error || "Failed to delete Stock Transaction");
    }
    setLoading(false);
  };

  // Load user profile for editing
  const loadUserProfile = async (userId: string) => {
    setLoadingUserProfile(true);
    try {
      const { userProfile, error: fetchError } = await getUserProfileByUserId(userId);
      
      if (fetchError && fetchError !== "UserProfile not found") {
        setError(fetchError);
      } else if (userProfile) {
        setSelectedUserProfile(userProfile);
        setUserProfileForm({
          name: userProfile.name,
          ic: userProfile.ic,
          bank_account: userProfile.bank_account,
          bank_name: userProfile.bank_name,
          email: userProfile.email,
        });
        setEditingUserProfile(userProfile.id!);
      } else {
        // No profile exists, prepare for creation
        const user = usersList.find(u => u.uid === userId);
        setSelectedUserProfile(null);
        setUserProfileForm({
          name: '',
          ic: '',
          bank_account: '',
          bank_name: '',
          email: user?.email || '',
        });
        setEditingUserProfile(null);
      }
    } catch (err) {
      setError('Failed to load user profile');
      console.error('Error loading user profile:', err);
    } finally {
      setLoadingUserProfile(false);
    }
  };

  // Handle viewing/editing user profile
  const handleViewUserProfile = async (userId: string) => {
    setShowUserProfileForm(true);
    await loadUserProfile(userId);
  };

  // Handle saving user profile
  const handleSaveUserProfile = async () => {
    if (!userProfileForm.name || !userProfileForm.email) {
      setError("Name and email are required");
      return;
    }

    setLoading(true);
    try {
      const profileData: UserProfile = {
        user_id: editingUserProfile ? selectedUserProfile!.user_id : usersList.find(u => userProfileForm.email === u.email)?.uid || '',
        name: userProfileForm.name,
        ic: userProfileForm.ic,
        bank_account: userProfileForm.bank_account,
        bank_name: userProfileForm.bank_name,
        email: userProfileForm.email,
      };

      let result;
      
      if (editingUserProfile && selectedUserProfile?.id) {
        // Update existing profile
        result = await updateUserProfile(selectedUserProfile.id, profileData);
      } else {
        // Create new profile
        result = await createUserProfile(profileData);
      }

      if (result.success) {
        setShowUserProfileForm(false);
        setSelectedUserProfile(null);
        setUserProfileForm({
          name: '',
          ic: '',
          bank_account: '',
          bank_name: '',
          email: '',
        });
        setEditingUserProfile(null);
        // Show success message
        setError(null);
      } else {
        setError(result.error || 'Failed to save user profile');
      }
    } catch (err) {
      setError('Failed to save user profile');
      console.error('Error saving user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderUsersTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          User Management
        </h3>
        <button
          onClick={() => {
            setUserForm({ email: "", password: "" });
            setEditingUser(null);
            setShowUserForm(true);
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
            isDark
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <Plus size={16} />
          Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table
          className={`min-w-full border rounded-lg ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              {["Email", "Display Name", "Email Verified", "Status", "Created", "Actions"].map((header) => (
                <th
                  key={header}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDark
                ? "bg-gray-800 divide-gray-700"
                : "bg-white divide-gray-200"
            }`}
          >
            {usersList.map((firebaseUser) => (
              <tr
                key={firebaseUser.uid}
                className={`transition-colors duration-150 ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                }`}
              >
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {firebaseUser.email || "No email"}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {firebaseUser.displayName || "Not set"}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      firebaseUser.emailVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {firebaseUser.emailVerified ? "Verified" : "Unverified"}
                  </span>
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      firebaseUser.disabled
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {firebaseUser.disabled ? "Disabled" : "Active"}
                  </span>
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {firebaseUser.creationTime
                    ? new Date(firebaseUser.creationTime).toLocaleDateString()
                    : "Unknown"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleViewUserProfile(firebaseUser.uid)}
                    className={`transition-colors duration-150 ${
                      isDark
                        ? "text-purple-400 hover:text-purple-300"
                        : "text-purple-600 hover:text-purple-900"
                    }`}
                    title="Manage User Profile"
                  >
                    <User size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setUserForm({
                        email: firebaseUser.email || "",
                        password: "",
                      });
                      setEditingUser(firebaseUser.uid);
                      setShowUserForm(true);
                    }}
                    className={`transition-colors duration-150 ${
                      isDark
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-indigo-600 hover:text-indigo-900"
                    }`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(firebaseUser.uid)}
                    className={`transition-colors duration-150 ${
                      isDark
                        ? "text-red-400 hover:text-red-300"
                        : "text-red-600 hover:text-red-900"
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCdsTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          CDS Management
        </h3>
        <button
          onClick={() => {
            setCdsForm({});
            setEditingCds(null);
            setShowCdsForm(true);
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
            isDark
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <Plus size={16} />
          Add CDS
        </button>
      </div>

      <div className="overflow-x-auto">
        <table
          className={`min-w-full border rounded-lg ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Name
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Address
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Website
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? "text-gray-300" : "text-gray-500"
                }`}
              >
                SST Registration
              </th>
              <th
                className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                  isDark ? "text-gray-300" : "text-gray-500"
                }`}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDark
                ? "bg-gray-800 divide-gray-700"
                : "bg-white divide-gray-200"
            }`}
          >
            {cdsList.map((cds) => (
              <tr
                key={cds.id}
                className={`transition-colors duration-150 ${
                  isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                }`}
              >
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {cds.name}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {cds.addres}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {cds.website}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {cds.sst_reg}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => {
                      setCdsForm(cds);
                      setEditingCds(cds.id!);
                      setShowCdsForm(true);
                    }}
                    className={`transition-colors duration-150 ${
                      isDark
                        ? "text-blue-400 hover:text-blue-300"
                        : "text-indigo-600 hover:text-indigo-900"
                    }`}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteCds(cds.id!)}
                    className={`transition-colors duration-150 ${
                      isDark
                        ? "text-red-400 hover:text-red-300"
                        : "text-red-600 hover:text-red-900"
                    }`}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStockAccountTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Stock Account Management
        </h3>
        <button
          onClick={() => {
            setStockAccountForm({});
            setEditingStockAccount(null);
            setShowStockAccountForm(true);
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
            isDark
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <Plus size={16} />
          Add Stock Account
        </button>
      </div>

      <div className="overflow-x-auto">
        <table
          className={`min-w-full border rounded-lg ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              {["Client Code", "CDS No", "CDS Name", "User Email", "Type", "Status", "Capital", "Actions"].map((header) => (
                <th
                  key={header}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDark
                ? "bg-gray-800 divide-gray-700"
                : "bg-white divide-gray-200"
            }`}
          >
            {stockAccounts.map((account) => {
              // Find the CDS name for display
              const cdsName =
                cdsList.find((cds) => cds.id === account.cds_id)?.name ||
                "Unknown CDS";

              // Find the user email for display
              const userEmail =
                availableUsers.find((user) => user.uid === account.user_id)
                  ?.email || "Unknown User";

              return (
                <tr
                  key={account.id}
                  className={`transition-colors duration-150 ${
                    isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                  }`}
                >
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {account.client_code}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {account.cds_no}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {cdsName}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {userEmail}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {StockAccountType[account.type]}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {StockAccountStatus[account.status]}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDark ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    ${account.capital.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewStockAccountDetail(account)}
                      className={`transition-colors duration-150 ${
                        isDark
                          ? "text-green-400 hover:text-green-300"
                          : "text-green-600 hover:text-green-900"
                      }`}
                      title="View Details & Transactions"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => {
                        setStockAccountForm(account);
                        setEditingStockAccount(account.id!);
                        setShowStockAccountForm(true);
                      }}
                      className={`transition-colors duration-150 ${
                        isDark
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-indigo-600 hover:text-indigo-900"
                      }`}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteStockAccount(account.id!)}
                      className={`transition-colors duration-150 ${
                        isDark
                          ? "text-red-400 hover:text-red-300"
                          : "text-red-600 hover:text-red-900"
                      }`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderStockTransactionTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3
          className={`text-lg font-semibold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Stock Transaction Management
        </h3>
        <button
          onClick={() => {
            setStockTransactionForm({});
            setEditingStockTransaction(null);
            setShowStockTransactionForm(true);
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
            isDark
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      <div className="overflow-x-auto">
        <table
          className={`min-w-full border rounded-lg ${
            isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
            <tr>
              {["Client Code", "Account Type", "User Email", "Date", "Transaction Type", "Description", "Amount", "Actions"].map((header) => (
                <th
                  key={header}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    isDark ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDark
                ? "bg-gray-800 divide-gray-700"
                : "bg-white divide-gray-200"
            }`}
          >
            {stockTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className={`px-6 py-4 text-center text-sm ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              stockTransactions.map((transaction) => {
                // Find the stock account for display
                const stockAccount = stockAccounts.find(
                  (account) => account.id === transaction.stock_account_id
                );

                // Find the user email for display
                const userEmail = stockAccount
                  ? availableUsers.find(
                      (user) => user.uid === stockAccount.user_id
                    )?.email || "Loading..."
                  : "No Account";

                return (
                  <tr
                    key={transaction.id}
                    className={`transition-colors duration-150 ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                    }`}
                  >
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        isDark ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {stockAccount?.client_code || "Loading..."}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {stockAccount
                        ? StockAccountType[stockAccount.type]
                        : "Loading..."}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {userEmail}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {StockTransactionType[transaction.type]}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {transaction.description}
                    </td>
                    <td
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setStockTransactionForm(transaction);
                          setEditingStockTransaction(transaction.id!);
                          setShowStockTransactionForm(true);
                        }}
                        className={`transition-colors duration-150 ${
                          isDark
                            ? "text-blue-400 hover:text-blue-300"
                            : "text-indigo-600 hover:text-indigo-900"
                        }`}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteStockTransaction(transaction.id!)
                        }
                        className={`transition-colors duration-150 ${
                          isDark
                            ? "text-red-400 hover:text-red-300"
                            : "text-red-600 hover:text-red-900"
                        }`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div className={`text-xs p-2 rounded ${
          isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-600"
        }`}>
          <p>Debug: Transactions: {stockTransactions.length}, Stock Accounts: {stockAccounts.length}, Users: {availableUsers.length}</p>
        </div>
      )}
    </div>
  );

  const renderForms = () => (
    <>
      {/* User Form Modal */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingUser ? "Edit User" : "Add User"}
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  }`}
                />
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Password {editingUser ? "(leave empty to keep current)" : "*"}
                </label>
                <input
                  type="password"
                  placeholder={editingUser ? "Leave empty to keep current" : "Minimum 6 characters"}
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  }`}
                />
              </div>
              {!editingUser && (
                <div
                  className={`text-xs p-2 rounded ${
                    isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <p>Password must be at least 6 characters long.</p>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={editingUser ? handleUpdateUser : handleCreateUser}
                disabled={loading}
                className={`px-4 py-2 rounded transition-colors duration-200 disabled:opacity-50 ${
                  isDark
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {loading ? "Processing..." : editingUser ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowUserForm(false);
                  setUserForm({ email: "", password: "" });
                  setEditingUser(null);
                }}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Form Modal */}
      {showUserProfileForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {editingUserProfile ? "Edit User Profile" : "Create User Profile"}
              </h3>
              <button
                onClick={() => {
                  setShowUserProfileForm(false);
                  setSelectedUserProfile(null);
                  setUserProfileForm({
                    name: '',
                    ic: '',
                    bank_account: '',
                    bank_name: '',
                    email: '',
                  });
                  setEditingUserProfile(null);
                }}
                className={`text-gray-500 hover:text-gray-700 ${
                  isDark ? "hover:text-gray-300" : ""
                }`}
              >
                ✕
              </button>
            </div>

            {loadingUserProfile ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">Loading profile...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Profile Information */}
                {selectedUserProfile && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    isDark ? "bg-gray-700" : "bg-gray-100"
                  }`}>
                    <h4 className="text-sm font-medium mb-2">Profile Info</h4>
                    <div className="text-xs space-y-1">
                      <p><strong>User ID:</strong> {selectedUserProfile.user_id}</p>
                      {selectedUserProfile.created_at && (
                        <p><strong>Created:</strong> {new Date(selectedUserProfile.created_at).toLocaleString()}</p>
                      )}
                      {selectedUserProfile.updated_at && (
                        <p><strong>Updated:</strong> {new Date(selectedUserProfile.updated_at).toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={userProfileForm.name}
                      onChange={(e) =>
                        setUserProfileForm({ ...userProfileForm, name: e.target.value })
                      }
                      placeholder="Enter full name"
                      className={`w-full p-2 border rounded transition-colors duration-200 ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={userProfileForm.email}
                      onChange={(e) =>
                        setUserProfileForm({ ...userProfileForm, email: e.target.value })
                      }
                      placeholder="Enter email address"
                      className={`w-full p-2 border rounded transition-colors duration-200 ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      IC Number
                    </label>
                    <input
                      type="text"
                      value={userProfileForm.ic}
                      onChange={(e) =>
                        setUserProfileForm({ ...userProfileForm, ic: e.target.value })
                      }
                      placeholder="Enter IC number"
                      className={`w-full p-2 border rounded transition-colors duration-200 ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className={`block text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={userProfileForm.bank_name}
                      onChange={(e) =>
                        setUserProfileForm({ ...userProfileForm, bank_name: e.target.value })
                      }
                      placeholder="Enter bank name"
                      className={`w-full p-2 border rounded transition-colors duration-200 ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    className={`block text-sm font-medium ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={userProfileForm.bank_account}
                    onChange={(e) =>
                      setUserProfileForm({ ...userProfileForm, bank_account: e.target.value })
                    }
                    placeholder="Enter bank account number"
                    className={`w-full p-2 border rounded transition-colors duration-200 ${
                      isDark
                        ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                        : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                    }`}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveUserProfile}
                    disabled={loading || loadingUserProfile}
                    className={`flex-1 px-4 py-2 rounded transition-colors duration-200 disabled:opacity-50 ${
                      isDark
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        Saving...
                      </>
                    ) : (
                      <>Save Profile</>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowUserProfileForm(false);
                      setSelectedUserProfile(null);
                      setUserProfileForm({
                        name: '',
                        ic: '',
                        bank_account: '',
                        bank_name: '',
                        email: '',
                      });
                      setEditingUserProfile(null);
                    }}
                    disabled={loading || loadingUserProfile}
                    className={`px-4 py-2 rounded transition-colors duration-200 ${
                      isDark
                        ? "bg-gray-600 text-white hover:bg-gray-700"
                        : "bg-gray-500 text-white hover:bg-gray-600"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CDS Form Modal */}
      {showCdsForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingCds ? "Edit CDS" : "Add CDS"}
            </h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={cdsForm.name || ""}
                onChange={(e) =>
                  setCdsForm({ ...cdsForm, name: e.target.value })
                }
                className={`w-full p-2 border rounded transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                }`}
              />
              <input
                type="text"
                placeholder="Address"
                value={cdsForm.addres || ""}
                onChange={(e) =>
                  setCdsForm({ ...cdsForm, addres: e.target.value })
                }
                className={`w-full p-2 border rounded transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                }`}
              />
              <input
                type="text"
                placeholder="Website"
                value={cdsForm.website || ""}
                onChange={(e) =>
                  setCdsForm({ ...cdsForm, website: e.target.value })
                }
                className={`w-full p-2 border rounded transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                }`}
              />
              <input
                type="text"
                placeholder="SST Registration"
                value={cdsForm.sst_reg || ""}
                onChange={(e) =>
                  setCdsForm({ ...cdsForm, sst_reg: e.target.value })
                }
                className={`w-full p-2 border rounded transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                }`}
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={editingCds ? handleUpdateCds : handleCreateCds}
                disabled={loading}
                className={`px-4 py-2 rounded transition-colors duration-200 disabled:opacity-50 ${
                  isDark
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {editingCds ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowCdsForm(false);
                  setCdsForm({});
                  setEditingCds(null);
                }}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Account Form Modal */}
      {showStockAccountForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingStockAccount ? "Edit Stock Account" : "Add Stock Account"}
            </h3>
            <div className="space-y-4">
              {/* User Selection Dropdown */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Select User *
                </label>
                <select
                  value={stockAccountForm.user_id || ""}
                  onChange={(e) =>
                    setStockAccountForm({
                      ...stockAccountForm,
                      user_id: e.target.value,
                    })
                  }
                  disabled={loadingUsers}
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  } ${loadingUsers ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {loadingUsers ? "Loading Users..." : "Select a User"}
                  </option>
                  {availableUsers.map((user) => (
                    <option key={user.uid} value={user.uid}>
                      {user.email}{" "}
                      {user.displayName ? `(${user.displayName})` : ""}
                    </option>
                  ))}
                </select>
                {availableUsers.length === 0 && !loadingUsers && (
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    No users available. Please ensure users are registered.
                  </p>
                )}
              </div>

              {/* CDS Selection Dropdown */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Select CDS *
                </label>
                <select
                  value={stockAccountForm.cds_id || ""}
                  onChange={(e) =>
                    setStockAccountForm({
                      ...stockAccountForm,
                      cds_id: e.target.value,
                    })
                  }
                  disabled={loadingCDS}
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  } ${loadingCDS ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <option value="">
                    {loadingCDS ? "Loading CDS..." : "Select a CDS"}
                  </option>
                  {availableCDS.map((cds) => (
                    <option key={cds.id} value={cds.id}>
                      {cds.name} - {cds.website}
                    </option>
                  ))}
                </select>
                {availableCDS.length === 0 && !loadingCDS && (
                  <p
                    className={`text-sm mt-1 ${
                      isDark ? "text-red-400" : "text-red-600"
                    }`}
                  >
                    No CDS available. Please create a CDS first.
                  </p>
                )}
              </div>

              {/* Account Type Selection */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Account Type *
                </label>
                <select
                  value={
                    stockAccountForm.type !== undefined
                      ? stockAccountForm.type.toString()
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setStockAccountForm({
                      ...stockAccountForm,
                      type:
                        value !== ""
                          ? (parseInt(value) as StockAccountType)
                          : undefined,
                    });
                  }}
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value={StockAccountType.BASIC.toString()}>
                    BASIC
                  </option>
                  <option value={StockAccountType.PREMIUM.toString()}>
                    PREMIUM
                  </option>
                  <option value={StockAccountType.BUSINESS.toString()}>
                    BUSINESS
                  </option>
                  <option value={StockAccountType.INVESTOR.toString()}>
                    INVESTOR
                  </option>
                </select>
              </div>

              {/* Account Status Selection */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Account Status *
                </label>
                <select
                  value={
                    stockAccountForm.status !== undefined
                      ? stockAccountForm.status.toString()
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setStockAccountForm({
                      ...stockAccountForm,
                      status:
                        value !== ""
                          ? (parseInt(value) as StockAccountStatus)
                          : undefined,
                    });
                  }}
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select Status</option>
                  <option value={StockAccountStatus.ACTIVE.toString()}>
                    ACTIVE
                  </option>
                  <option value={StockAccountStatus.INACTIVE.toString()}>
                    INACTIVE
                  </option>
                  <option value={StockAccountStatus.PENDING.toString()}>
                    PENDING
                  </option>
                  <option value={StockAccountStatus.CLOSED.toString()}>
                    CLOSED
                  </option>
                </select>
              </div>

              {/* Financial Information */}
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Initial Capital
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={stockAccountForm.capital || ""}
                  onChange={(e) =>
                    setStockAccountForm({
                      ...stockAccountForm,
                      capital: Number(e.target.value),
                    })
                  }
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Estimated Total
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={stockAccountForm.estimated_total || ""}
                  onChange={(e) =>
                    setStockAccountForm({
                      ...stockAccountForm,
                      estimated_total: Number(e.target.value),
                    })
                  }
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  }`}
                />
              </div>

              <div>
                <label
                 
                  className={`block text-sm font-medium mb-1 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Estimated Total Target Date
                </label>
                <input
                  type="datetime-local"
                  value={
                    stockAccountForm.estimated_total_time
                      ? new Date(stockAccountForm.estimated_total_time * 60000).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      // Convert datetime to minutes since epoch
                      const dateObj = new Date(dateValue);
                      const minutes = Math.floor(dateObj.getTime() / 60000);
                      setStockAccountForm({
                        ...stockAccountForm,
                        estimated_total_time: minutes,
                      });
                    } else {
                      setStockAccountForm({
                        ...stockAccountForm,
                        estimated_total_time: 0,
                      });
                    }
                  }}
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  }`}
                />
                {stockAccountForm.estimated_total_time && (
                  <p className={`text-xs mt-1 ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  }`}>
                    Stored as: {stockAccountForm.estimated_total_time} minutes since epoch
                    <br />
                    Date: {new Date(stockAccountForm.estimated_total_time * 60000).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Auto-generated fields info */}
              {!editingStockAccount && (
                <div
                  className={`text-xs p-2 rounded ${
                    isDark
                      ? "bg-gray-700 text-gray-300"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <p>
                    Note: Client Code, Register Code, and CDS Number will be
                    automatically generated.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={
                  editingStockAccount
                    ? handleUpdateStockAccount
                    : handleCreateStockAccount
                }
                disabled={
                  loading ||
                  loadingCDS ||
                  loadingUsers ||
                  availableCDS.length === 0 ||
                  availableUsers.length === 0
                }
                className={`px-4 py-2 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDark
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {loading
                  ? "Processing..."
                  : editingStockAccount
                  ? "Update"
                  : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowStockAccountForm(false);
                  setStockAccountForm({});
                  setEditingStockAccount(null);
                }}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Account Detail Modal */}
      {showStockAccountDetail && selectedStockAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-[90vw] max-w-6xl max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Stock Account Details</h3>
              <button
                onClick={() => {
                  setShowStockAccountDetail(false);
                  setSelectedStockAccount(null);
                  setAccountTransactions([]);
                }}
                className={`text-gray-500 hover:text-gray-700 ${
                  isDark ? "hover:text-gray-300" : ""
                }`}
              >
                ✕
              </button>
            </div>

            {/* Account Information */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-lg ${
              isDark ? "bg-gray-700" : "bg-gray-100"
            }`}>
              <div>
                <p className="text-sm font-medium">Client Code</p>
                <p className="text-lg">{selectedStockAccount.client_code}</p>
              </div>
              <div>
                <p className="text-sm font-medium">CDS Number</p>
                <p className="text-lg">{selectedStockAccount.cds_no}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Account Type</p>
                <p className="text-lg">{StockAccountType[selectedStockAccount.type]}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-lg">{StockAccountStatus[selectedStockAccount.status]}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Capital</p>
                <p className="text-lg text-green-600">${selectedStockAccount.capital.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">User Email</p>
                <p className="text-lg">
                  {availableUsers.find(user => user.uid === selectedStockAccount.user_id)?.email || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">CDS Name</p>
                <p className="text-lg">
                  {cdsList.find(cds => cds.id === selectedStockAccount.cds_id)?.name || "Unknown"}
                </p>
              </div>
            </div>

            {/* Transactions Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold">Transaction History</h4>
                <button
                  onClick={() => {
                    setAccountTransactionForm({ stock_account_id: selectedStockAccount.id });
                    setEditingAccountTransaction(null);
                    setShowAccountTransactionForm(true);
                  }}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 ${
                    isDark
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  <Plus size={16} />
                  Add Transaction
                </button>
              </div>

              {loadingAccountTransactions ? (
                <div className="text-center py-4">Loading transactions...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className={`min-w-full border rounded-lg ${
                    isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
                  }`}>
                    <thead className={isDark ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>
                        {["Date", "Type", "Description", "Amount", "Actions"].map((header) => (
                          <th
                            key={header}
                            className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                              isDark ? "text-gray-300" : "text-gray-500"
                            }`}
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${
                      isDark ? "bg-gray-800 divide-gray-700" : "bg-white divide-gray-200"
                    }`}>
                      {accountTransactions.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className={`px-4 py-4 text-center text-sm ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        accountTransactions.map((transaction) => (
                          <tr
                            key={transaction.id}
                            className={`transition-colors duration-150 ${
                              isDark ? "hover:bg-gray-700" : "hover:bg-gray-50"
                            }`}
                          >
                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                              isDark ? "text-gray-300" : "text-gray-500"
                            }`}>
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm ${
                              isDark ? "text-gray-300" : "text-gray-500"
                            }`}>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                transaction.type === StockTransactionType.INCREASE 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {StockTransactionType[transaction.type]}
                              </span>
                            </td>
                            <td className={`px-4 py-3 text-sm ${
                              isDark ? "text-gray-300" : "text-gray-500"
                            }`}>
                              {transaction.description}
                            </td>
                            <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${
                              transaction.type === StockTransactionType.INCREASE 
                                ? 'text-green-600' 
                                : 'text-red-600'
                            }`}>
                              {transaction.type === StockTransactionType.INCREASE ? '+' : '-'}
                              ${transaction.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => {
                                  setAccountTransactionForm(transaction);
                                  setEditingAccountTransaction(transaction.id!);
                                  setShowAccountTransactionForm(true);
                                }}
                                className={`transition-colors duration-150 ${
                                  isDark
                                    ? "text-blue-400 hover:text-blue-300"
                                    : "text-indigo-600 hover:text-indigo-900"
                                }`}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteAccountTransaction(transaction.id!)}
                                className={`transition-colors duration-150 ${
                                  isDark
                                    ? "text-red-400 hover:text-red-300"
                                    : "text-red-600 hover:text-red-900"
                                }`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Account Transaction Form Modal */}
      {showAccountTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60]">
          <div
            className={`p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto ${
              isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
            }`}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingAccountTransaction ? "Edit Transaction" : "Add Transaction"}
            </h3>
            <div className="space-y-4">
              {/* Transaction Date */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Transaction Date *
                </label>
                <input
                  type="date"
                  value={
                    accountTransactionForm.date
                      ? new Date(accountTransactionForm.date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    setAccountTransactionForm({
                      ...accountTransactionForm,
                      date: new Date(e.target.value),
                    })
                                   }
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  }`}
                />
              </div>

              {/* Transaction Type */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Transaction Type *
                </label>
                <select
                  value={
                    accountTransactionForm.type !== undefined
                      ? accountTransactionForm.type.toString()
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setAccountTransactionForm({
                      ...accountTransactionForm,
                      type: value !== "" ? (parseInt(value) as StockTransactionType) : undefined,
                    });
                  }}
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 focus:border-blue-500"
                  }`}
                >
                  <option value="">Select Type</option>
                  <option value={StockTransactionType.INCREASE.toString()}>INCREASE</option>
                  <option value={StockTransactionType.DECREASE.toString()}>DECREASE</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Description *
                </label>
                <textarea
                  placeholder="Enter transaction description"
                  value={accountTransactionForm.description || ""}
                  onChange={(e) =>
                    setAccountTransactionForm({
                      ...accountTransactionForm,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                  className={`w-full p-2 border rounded transition-colors duration-200 resize-none ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  }`}
                />
              </div>

              {/* Amount */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isDark ? "text-gray-300" : "text-gray-700"
                }`}>
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={accountTransactionForm.amount || ""}
                  onChange={(e) =>
                    setAccountTransactionForm({
                      ...accountTransactionForm,
                      amount: Number(e.target.value),
                    })
                  }
                  className={`w-full p-2 border rounded transition-colors duration-200 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500"
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={
                  editingAccountTransaction
                    ? handleUpdateAccountTransaction
                    : handleCreateAccountTransaction
                }
                disabled={loading}
                className={`px-4 py-2 rounded transition-colors duration-200 disabled:opacity-50 ${
                  isDark
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {loading ? "Processing..." : editingAccountTransaction ? "Update" : "Create"}
              </button>
              <button
                onClick={() => {
                  setShowAccountTransactionForm(false);
                  setAccountTransactionForm({});
                  setEditingAccountTransaction(null);
                }}
                className={`px-4 py-2 rounded transition-colors duration-200 ${
                  isDark
                    ? "bg-gray-600 text-white hover:bg-gray-700"
                    : "bg-gray-500 text-white hover:bg-gray-600"
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Check if user is logged in and is admin
  if (!user || !isAdmin) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}>
        <div className="text-center space-y-4">
          <h1 className={`text-2xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Access Denied
          </h1>
          <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>
            You don&apos;t have permission to access this page.
          </p>
          <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
            Only administrators can access this dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className={`text-3xl font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Admin Dashboard
            </h1>
            <p className={`text-sm mt-1 ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              Welcome, {user.email}
            </p>
          </div>
          <ThemeToggle />
        </div>

        {error && (
          <div
            className={`border px-4 py-3 rounded mb-4 ${
              isDark
                ? "bg-red-900 border-red-700 text-red-200"
                : "bg-red-100 border-red-400 text-red-700"
            }`}
          >
            {error}
            <button
              onClick={() => setError(null)}
              className={`float-right ${
                isDark ? "text-red-200" : "text-red-700"
              }`}
            >
              ×
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              activeTab === "users"
                ? isDark
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab("cds")}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              activeTab === "cds"
                ? isDark
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            CDS Management
          </button>
          <button
            onClick={() => setActiveTab("stock-accounts")}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              activeTab === "stock-accounts"
                ? isDark
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Stock Accounts
          </button>
          <button
            onClick={() => setActiveTab("stock-transactions")}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              activeTab === "stock-transactions"
                ? isDark
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500 text-white"
                : isDark
                ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Stock Transactions
          </button>
        </div>

        {/* Content Area */}
        <div
          className={`rounded-lg shadow p-6 ${
            isDark ? "bg-gray-800" : "bg-white"
          }`}
        >
          {loading && (
            <div
              className={`text-center py-4 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Loading...
            </div>
          )}

          {!loading && activeTab === "users" && renderUsersTable()}
          {!loading && activeTab === "cds" && renderCdsTable()}
          {!loading &&
            activeTab === "stock-accounts" &&
            renderStockAccountTable()}
          {!loading &&
            activeTab === "stock-transactions" &&
            renderStockTransactionTable()}
        </div>

        {/* Forms */}
        {renderForms()}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <ThemeProvider>
      <AdminPageContent />
    </ThemeProvider>
  );
}
