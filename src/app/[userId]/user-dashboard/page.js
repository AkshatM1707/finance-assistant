'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Plus, DollarSign, TrendingUp, TrendingDown, Wallet, Upload, Filter } from 'lucide-react';

export default function UserDashboard({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const userId = resolvedParams.userId;
  
  const [timeRange, setTimeRange] = useState('month');
  const [showAddModal, setShowAddModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    expenses: 0,
    net: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const expenseCategoryOptions = [
    { value: 'Food & Dining', label: 'Food & Dining' },
    { value: 'Transportation', label: 'Transportation' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Healthcare', label: 'Healthcare' },
    { value: 'Utilities', label: 'Utilities' },
    { value: 'Other', label: 'Other' }
  ];

  const incomeCategoryOptions = [
    { value: 'Salary', label: 'Salary' },
    { value: 'Freelance', label: 'Freelance' },
    { value: 'Investment', label: 'Investment' },
    { value: 'Other', label: 'Other' }
  ];

  // Check authentication and user access
  useEffect(() => {
    if (!userId) return;
    
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (!response.ok) {
          router.push('/login');
          return;
        }
        
        const userData = await response.json();
        if (userData.userId !== userId) {
          router.push('/login');
          return;
        }
        
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [userId, router]);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/transactions?timeRange=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }

      const data = await response.json();
      setTransactions(data.transactions);
      setSummary(data.summary);
    } catch (error) {
      setError('Failed to load transactions');
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load transactions on component mount and when timeRange changes
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [timeRange, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // For income transactions, set category to 'Income' if not provided
      const transactionData = {
        ...formData,
        category: formData.type === 'income' ? (formData.category || 'Salary') : formData.category
      };

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      // Reset form and close modal
      setFormData({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddModal(false);

      // Refresh transactions immediately
      await fetchTransactions();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Get current category options based on transaction type
  const getCategoryOptions = () => {
    return formData.type === 'expense' ? expenseCategoryOptions : incomeCategoryOptions;
  };

  // Get recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Show loading if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Finance Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.firstName}! Manage your income and expenses.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Income</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">₹{summary.income.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">₹{summary.expenses.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Balance</p>
                  <p className={`text-2xl font-bold mt-1 ${summary.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{summary.net.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Section */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Transaction
                </Button>
                
              </CardContent>
            </Card>

            {/* Time Range Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRangeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mt-4 text-sm text-muted-foreground">
                  <p>Showing transactions for: <span className="font-medium text-foreground">
                    {timeRangeOptions.find(option => option.value === timeRange)?.label}
                  </span></p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Transactions Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Transactions</CardTitle>
                  <Button 
                    size="sm"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-2">Loading transactions...</p>
                    </div>
                  ) : recentTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-medium text-foreground mb-2">No transactions yet</h4>
                      <p className="text-muted-foreground mb-4">Start by adding your first transaction</p>
                      <Button 
                        onClick={() => setShowAddModal(true)}
                      >
                        Add First Transaction
                      </Button>
                    </div>
                  ) : (
                                         recentTransactions.map((transaction) => (
                       <div key={transaction._id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                         <div className="flex items-center space-x-3">
                           <Avatar className="w-10 h-10">
                             <AvatarFallback className={transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}>
                               {transaction.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                             </AvatarFallback>
                           </Avatar>
                           <div>
                             <p className="font-medium text-gray-800">{transaction.description}</p>
                             <div className="flex items-center gap-2">
                               <Badge variant="secondary">{transaction.category}</Badge>
                               <span className="text-sm text-gray-500">
                                 {new Date(transaction.date).toLocaleDateString()}
                               </span>
                             </div>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className={`font-semibold ${
                             transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                           }`}>
                             {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                           </p>
                         </div>
                       </div>
                     ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Add Transaction Dialog */}
        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Transaction</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-olive-green mb-2">Type</label>
                <div className="flex space-x-2">
                  <Button 
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, type: 'income', category: ''})}
                    className="flex-1"
                  >
                    Income
                  </Button>
                  <Button 
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'outline'}
                    onClick={() => setFormData({...formData, type: 'expense', category: ''})}
                    className="flex-1"
                  >
                    Expense
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-green mb-2">Description</label>
                <Input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  placeholder="Enter transaction description"
                />
              </div>

              {/* Show category dropdown only for expenses */}
              {formData.type === 'expense' && (
                <div>
                  <label className="block text-sm font-medium text-olive-green mb-2">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCategoryOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-olive-green mb-2">Amount (₹)</label>
                <Input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-olive-green mb-2">Date</label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Add Transaction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 