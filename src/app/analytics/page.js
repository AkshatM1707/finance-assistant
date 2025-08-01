'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
  '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C',
  '#8DD1E1', '#D084D0'
];

export default function Analytics() {
  const router = useRouter();
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const timeRanges = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch analytics data');
      }

      const data = await response.json();
      setAnalyticsData(data);
      setError('');
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 border rounded-lg shadow-lg">
          <p className="text-foreground font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-card p-3 border rounded-lg shadow-lg">
          <p className="text-foreground font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Amount: ₹{data.value?.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">
            Transactions: {data.payload.count}
          </p>
        </div>
      );
    }
    return null;
  };

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
            <Button onClick={fetchAnalyticsData} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">Detailed insights into your financial patterns</p>
          </div>
          
          {/* Time Range Selector */}
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₹{analyticsData?.summary?.totalIncome?.toLocaleString() || 0}
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
                ₹{analyticsData?.summary?.totalExpenses?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                (analyticsData?.summary?.netSavings || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{analyticsData?.summary?.netSavings?.toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsData?.summary?.transactionCount || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Expenses by Category - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.categoryData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No expense data available for the selected period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Income vs Expenses - Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.monthlyData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Income"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      name="Expenses"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No monthly data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Daily Spending Trend - Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Spending Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.dailyData?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#8884d8" 
                      fill="#8884d8"
                      fillOpacity={0.6}
                      name="Daily Spending"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No daily spending data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Expenses - Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Top Expense Descriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {analyticsData?.topMerchants?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topMerchants} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="amount" fill="#8884d8" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  No expense description data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}