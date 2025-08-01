'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetches dashboard data with comprehensive error handling
   * Includes authentication, network, and data validation checks
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(''); // Clear previous errors
      
      // Add timeout for network requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch('/api/transactions?limit=5', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Handle different HTTP status codes
      if (!response.ok) {
        if (response.status === 401) {
          console.warn('User authentication expired, redirecting to login');
          router.push('/login');
          return;
        } else if (response.status === 403) {
          throw new Error('Access denied. Please check your permissions.');
        } else if (response.status === 429) {
          throw new Error('Too many requests. Please wait a moment and try again.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again in a few minutes.');
        } else {
          throw new Error(`Request failed with status ${response.status}`);
        }
      }

      // Validate response data
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse dashboard response:', parseError);
        throw new Error('Invalid response format from server');
      }

      // Validate data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data received from server');
      }

      // Ensure required fields exist with defaults
      const validatedData = {
        transactions: Array.isArray(data.transactions) ? data.transactions : [],
        summary: {
          income: Number(data.summary?.income) || 0,
          expenses: Number(data.summary?.expenses) || 0,
          net: Number(data.summary?.net) || 0
        },
        pagination: data.pagination || { total: 0, page: 1, limit: 5, pages: 0 }
      };

      setDashboardData(validatedData);
      console.log('Dashboard data loaded successfully');
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Provide user-friendly error messages
      if (error.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (error.message.includes('fetch')) {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(error.message || 'Failed to load dashboard data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const summary = dashboardData?.summary || { income: 0, expenses: 0, net: 0 };
  const recentTransactions = dashboardData?.transactions?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here&apos;s your financial overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{summary.income?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                ₹{summary.expenses?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                summary.net >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{summary.net?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData?.pagination?.total || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => router.push('/transactions')}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Add Transaction
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full" 
                    onClick={() => router.push('/receipts')}
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Upload Receipt
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full" 
                    onClick={() => router.push('/analytics')}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Transactions</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => router.push('/transactions')}
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-foreground mb-2">No transactions yet</h4>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first transaction
                    </p>
                    <Button onClick={() => router.push('/transactions')}>
                      Add Transaction
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction._id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'income' ? (
                              <TrendingUp className="w-5 h-5" />
                            ) : (
                              <TrendingDown className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{transaction.description}</p>
                            <p className="text-sm text-muted-foreground">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}