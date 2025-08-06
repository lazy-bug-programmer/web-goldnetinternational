"use client";

import { ChevronDown, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getStockAccountsByUserId } from "@/lib/actions/stock-account.action";
import { getStockTransactionsByAccountId } from "@/lib/actions/stock-transaction.action";
import { getCDSById } from "@/lib/actions/cds.action";
import { StockAccount, StockAccountStatus } from "@/lib/domains/stock-account.domain";
import { StockTransaction } from "@/lib/domains/stock-transaction.domain";
import { CDS } from "@/lib/domains/cds.domain";
import StockViewChartWidget from "@/components/stock-view-chart-widget";
import MarketInsightChartWidget from "@/components/market-insight-chart-widget";
import MarketInsightNewsWidget from "@/components/market-insight-news-widget";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [showCDSDetails, setShowCDSDetails] = useState(false);
  const [stockAccount, setStockAccount] = useState<StockAccount | null>(null);
  const [cdsData, setCdsData] = useState<CDS | null>(null);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Animation states
  const [animatedEstimatedTotal, setAnimatedEstimatedTotal] = useState<number>(0);
  const [animatedProfit, setAnimatedProfit] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationInterval, setAnimationInterval] = useState<NodeJS.Timeout | null>(null);
  const [previousEstimatedTotal, setPreviousEstimatedTotal] = useState<number>(0);
  const [previousProfit, setPreviousProfit] = useState<number>(0);

  // Fetch user's stock account data
  useEffect(() => {
    async function fetchUserData() {
      if (!user?.uid) return;

      setIsLoadingData(true);
      setDataError(null);

      try {
        // Get user's stock accounts
        const { stockAccounts, error: accountError } = await getStockAccountsByUserId(user.uid, 1);
        
        if (accountError) {
          setDataError(accountError);
          return;
        }

        if (stockAccounts.length > 0) {
          const account = stockAccounts[0];
          setStockAccount(account);
          setAnimatedEstimatedTotal(account.estimated_total);
          setAnimatedProfit(account.profit);

          // Fetch CDS data
          const { cds, error: cdsError } = await getCDSById(account.cds_id);
          if (!cdsError && cds) {
            setCdsData(cds);
          }

          // Fetch transactions for this account
          const { stockTransactions, error: transactionError } = await getStockTransactionsByAccountId(account.id!);
          if (!transactionError) {
            setTransactions(stockTransactions);
          }
        }
      } catch (err) {
        setDataError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoadingData(false);
      }
    }

    fetchUserData();
  }, [user]);

  // Animation logic
  useEffect(() => {
    if (!stockAccount || !stockAccount.estimated_total_time) return;

    const targetTime = new Date(stockAccount.estimated_total_time * 60000); // Convert minutes to milliseconds
    const currentTime = new Date();

    // Check if target time has already passed
    if (currentTime >= targetTime) {
      setAnimatedEstimatedTotal(stockAccount.estimated_total);
      setAnimatedProfit(stockAccount.profit);
      setIsAnimating(false);
      return;
    }

    setIsAnimating(true);
    setPreviousEstimatedTotal(stockAccount.estimated_total);
    setPreviousProfit(stockAccount.profit);

    const interval = setInterval(() => {
      const now = new Date();
      
      // Check if we've reached the target time
      if (now >= targetTime) {
        setAnimatedEstimatedTotal(stockAccount.estimated_total);
        setAnimatedProfit(stockAccount.profit);
        setIsAnimating(false);
        clearInterval(interval);
        return;
      }

      // Store previous values for comparison
      setAnimatedEstimatedTotal(prev => {
        setPreviousEstimatedTotal(prev);
        return prev;
      });
      setAnimatedProfit(prev => {
        setPreviousProfit(prev);
        return prev;
      });

      // Generate random fluctuation (±5% of original value)
      const fluctuationPercent = 0.95 + Math.random() * 0.1; // Between 0.95 and 1.05
      const estimatedTotalFluctuation = stockAccount.estimated_total * fluctuationPercent;
      
      // Correlate profit changes with estimated total changes
      // Calculate the change in estimated total from original value
      const estimatedTotalChange = estimatedTotalFluctuation - stockAccount.estimated_total;
      // Apply the same proportional change to profit
      const profitFluctuation = stockAccount.profit + estimatedTotalChange;

      setAnimatedEstimatedTotal(estimatedTotalFluctuation);
      setAnimatedProfit(profitFluctuation);
    }, 2000); // Update every 2 seconds

    setAnimationInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stockAccount]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [animationInterval]);

  // Loading state
  if (authLoading || isLoadingData) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (!user) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center space-y-4">
            <p className="text-red-600 dark:text-red-400">
              Please log in to access your dashboard
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
            Welcome
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {stockAccount ? 
              "This is the estimated total value of securities in the 1 CDS Account(s) below" :
              "Your account is being set up"
            }
          </p>
          <div className={`text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white ${isAnimating ? 'animate-pulse' : ''} flex items-center justify-center gap-2`}>
            {stockAccount ? `RM${animatedEstimatedTotal.toLocaleString("en-MY", { minimumFractionDigits: 2 })}` : "RM0.00"}
            {isAnimating && stockAccount && (
              <span className="text-2xl">
                {animatedEstimatedTotal > previousEstimatedTotal ? (
                  <span className="text-green-500">↗</span>
                ) : animatedEstimatedTotal < previousEstimatedTotal ? (
                  <span className="text-red-500">↘</span>
                ) : (
                  <span className="text-gray-400">→</span>
                )}
              </span>
            )}
          </div>
          {stockAccount && stockAccount.estimated_total_time && isAnimating && (
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Market fluctuation in Real Time
            </p>
          )}
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Account View
            </TabsTrigger>
            <TabsTrigger
              value="stock"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Stock View
            </TabsTrigger>
            <TabsTrigger
              value="market"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              Market Insight
            </TabsTrigger>
          </TabsList>

          {/* Account View Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-6 lg:p-8">
                {!stockAccount ? (
                  <InProcessMessage />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="space-y-4 flex-1">
                      <div className="flex items-center space-x-3">
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                          M+Online
                        </h2>
                        <button
                          onClick={() => setShowCDSDetails(!showCDSDetails)}
                          className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <ChevronDown
                            className={`h-6 w-6 transition-transform ${
                              showCDSDetails ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {showCDSDetails && cdsData && (
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            CDS Details
                          </h3>

                          <div className="space-y-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {cdsData.name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                (A Participating Organisation of Bursa Security
                                Berhad)
                              </p>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <p>{cdsData.addres}</p>
                              <p>Website: {cdsData.website}</p>
                              <p>SST REG. NO.: {cdsData.sst_reg}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  PAGE
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  1
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  CLIENT CODE :
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {stockAccount.client_code}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  REMISTER
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {stockAccount.remister_code}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  CDS NO.
                                </div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {stockAccount.cds_no}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                              Status
                            </span>
                          </div>
                          <div className={`font-semibold text-lg ${
                            stockAccount.status === StockAccountStatus.ACTIVE 
                              ? "text-green-600 dark:text-green-400" 
                              : "text-yellow-600 dark:text-yellow-400"
                          }`}>
                            {stockAccount.status === StockAccountStatus.ACTIVE ? "Active" : 
                             stockAccount.status === StockAccountStatus.PENDING ? "Pending" :
                             stockAccount.status === StockAccountStatus.INACTIVE ? "Inactive" : "Closed"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                              Last Transaction Date
                            </span>
                          </div>
                          <div className="text-gray-900 dark:text-white font-semibold text-lg">
                            {new Date(stockAccount.last_transaction_date).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                              Estimated Total
                            </span>
                          </div>
                          <div className={`text-gray-900 dark:text-white font-semibold text-lg ${isAnimating ? 'animate-pulse' : ''} flex items-center gap-2`}>
                            {animatedEstimatedTotal.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                            {isAnimating && (
                              <span className="text-sm">
                                {animatedEstimatedTotal > previousEstimatedTotal ? (
                                  <span className="text-green-500">↗</span>
                                ) : animatedEstimatedTotal < previousEstimatedTotal ? (
                                  <span className="text-red-500">↘</span>
                                ) : (
                                  <span className="text-gray-400">→</span>
                                )}
                              </span>
                            )}
                          </div>
                          {stockAccount.estimated_total_time && isAnimating && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              Fluctuating in Real Time
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock View Tab */}
          <TabsContent value="stock" className="space-y-6">
            {/* Portfolio Summary Card */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-6 lg:p-8">
                {!stockAccount ? (
                  <InProcessMessage />
                ) : !showTransactionDetails ? (
                  <>
                    <div className="text-center space-y-4 mb-8">
                      <p className="text-gray-600 dark:text-gray-400">
                        The estimated total value of securities is as below
                      </p>
                      <div className={`text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white ${isAnimating ? 'animate-pulse' : ''} flex items-center justify-center gap-2`}>
                        RM{animatedEstimatedTotal.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                        {isAnimating && (
                          <span className="text-2xl">
                            {animatedEstimatedTotal > previousEstimatedTotal ? (
                              <span className="text-green-500">↗</span>
                            ) : animatedEstimatedTotal < previousEstimatedTotal ? (
                              <span className="text-red-500">↘</span>
                            ) : (
                              <span className="text-gray-400">→</span>
                            )}
                          </span>
                        )}
                      </div>
                      {stockAccount.estimated_total_time && isAnimating && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Live market fluctuation in Real Time
                        </p>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Stocks that are denoted with (*) are securities balance
                        that are earmarked or suspended.
                      </p>
                    </div>

                    {/* Plan Basic Section */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Plan {stockAccount.type === 0 ? "Basic" : stockAccount.type === 1 ? "Premium" : stockAccount.type === 2 ? "Business" : "Investor"}
                      </h3>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 dark:text-gray-400">
                          Capital
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {stockAccount.capital.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-gray-600 dark:text-gray-400">
                          Profit
                        </span>
                        <span className={`font-semibold ${animatedProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'} ${isAnimating ? 'animate-pulse' : ''} flex items-center gap-2`}>
                          {animatedProfit.toLocaleString("en-MY", { minimumFractionDigits: 2 })}
                          {isAnimating && (
                            <span className="text-sm">
                              {animatedProfit > previousProfit ? (
                                <span className="text-green-500">↗</span>
                              ) : animatedProfit < previousProfit ? (
                                <span className="text-red-500">↘</span>
                              ) : (
                                <span className="text-gray-400">→</span>
                              )}
                            </span>
                          )}
                        </span>
                      </div>
                      {stockAccount.estimated_total_time && isAnimating && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                          Profit fluctuating in real-time
                        </div>
                      )}
                      <div className="text-right">
                        <button
                          onClick={() => setShowTransactionDetails(true)}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          View Transactions &gt;&gt;
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Transaction Details */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        Transaction Details
                      </h3>
                      <Select defaultValue="show-all">
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="show-all">Show All</SelectItem>
                          <SelectItem value="profit">Profit</SelectItem>
                          <SelectItem value="deposit">Deposit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Transaction Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="text-left py-3 text-gray-900 dark:text-white font-semibold">
                              Date
                            </th>
                            <th className="text-left py-3 text-gray-900 dark:text-white font-semibold">
                              Description
                            </th>
                            <th className="text-right py-3 text-gray-900 dark:text-white font-semibold">
                              Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.length === 0 ? (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                No transactions found
                              </td>
                            </tr>
                          ) : (
                            transactions.map((transaction, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-100 dark:border-gray-700"
                              >
                                <td className="py-4 text-gray-900 dark:text-white">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </td>
                                <td className="py-4 text-gray-600 dark:text-gray-400 max-w-md">
                                  {transaction.description}
                                </td>
                                <td className={`py-4 text-right font-semibold ${
                                  transaction.type === 0
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}>
                                  {transaction.type === 1 ? "-" : ""}
                                  {transaction.amount.toLocaleString("en-MY", {
                                    minimumFractionDigits: 2,
                                  })}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                      * All prices quoted in Malaysian Ringgit (MYR)
                    </div>

                    <div className="mt-4">
                      <button
                        onClick={() => setShowTransactionDetails(false)}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        &lt;&lt; Back to Account
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Market Overview Chart - Only show if user has account */}
            {stockAccount && (
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
                <CardContent className="p-6 lg:p-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Market Overview
                  </h2>

                  <StockViewChartWidget />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Market Insight Tab */}
          <TabsContent value="market" className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
              <CardContent className="p-6 lg:p-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Market Insight
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Check with our instruments for more information regarding the
                  markets!
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="w-full">
                    <MarketInsightChartWidget />
                  </div>
                  <div className="w-full">
                    <MarketInsightNewsWidget />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );

  // In Process Component
  function InProcessMessage() {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="animate-pulse rounded-full h-16 w-16 bg-blue-100 dark:bg-blue-900 mx-auto flex items-center justify-center">
          <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Account In Process</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Your stock account is currently being set up. This process usually takes 1-2 business days.
          You&apos;ll receive an email notification once your account is ready.
        </p>
      </div>
    );
  }
}