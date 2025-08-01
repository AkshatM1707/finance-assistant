import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '../../../lib/db';
import Transaction from '../../../models/Transaction';
import { verifyToken } from '../../../utils/auth';

export async function GET(request) {
  try {
    await dbConnect();
    
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    // Build query with userId
    const query = { userId: new Types.ObjectId(decoded.userId) };

    // Add date filter based on timeRange
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    query.date = { $gte: startDate };

    // 1. Expenses by Category (Pie Chart Data)
    const categoryStats = await Transaction.aggregate([
      { $match: { ...query, type: 'expense' } },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { total: -1 } }
    ]);

    // 2. Monthly Income vs Expenses (Line Chart Data)
    const monthlyStats = await Transaction.aggregate([
      { 
        $match: { 
          userId: new Types.ObjectId(decoded.userId),
          date: { $gte: new Date(now.getFullYear(), 0, 1) } // Current year
        } 
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            year: { $year: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.month': 1 } }
    ]);

    // 3. Daily Spending Trend (Last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyStats = await Transaction.aggregate([
      { 
        $match: { 
          userId: new Types.ObjectId(decoded.userId),
          type: 'expense',
          date: { $gte: thirtyDaysAgo }
        } 
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // 4. Top Merchants/Descriptions
    const topMerchants = await Transaction.aggregate([
      { $match: { ...query, type: 'expense' } },
      { 
        $group: { 
          _id: '$description', 
          total: { $sum: '$amount' }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    // 5. Summary Statistics
    const totalIncome = await Transaction.aggregate([
      { $match: { ...query, type: 'income' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Transaction.aggregate([
      { $match: { ...query, type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Format monthly data for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const monthlyChartData = [];
    for (let i = 1; i <= 12; i++) {
      const monthData = { 
        month: monthNames[i - 1], 
        income: 0, 
        expenses: 0 
      };
      
      monthlyStats.forEach(stat => {
        if (stat._id.month === i) {
          if (stat._id.type === 'income') {
            monthData.income = stat.total;
          } else {
            monthData.expenses = stat.total;
          }
        }
      });
      
      monthlyChartData.push(monthData);
    }

    // Format daily data for chart
    const dailyChartData = dailyStats.map(day => ({
      date: `${day._id.day}/${day._id.month}`,
      amount: day.total
    }));

    // Format category data for pie chart
    const categoryChartData = categoryStats.map((cat, index) => ({
      name: cat._id,
      value: cat.total,
      count: cat.count
    }));

    return NextResponse.json({
      summary: {
        totalIncome: totalIncome[0]?.total || 0,
        totalExpenses: totalExpenses[0]?.total || 0,
        netSavings: (totalIncome[0]?.total || 0) - (totalExpenses[0]?.total || 0),
        transactionCount: categoryStats.reduce((sum, cat) => sum + cat.count, 0)
      },
      categoryData: categoryChartData,
      monthlyData: monthlyChartData,
      dailyData: dailyChartData,
      topMerchants: topMerchants.map(merchant => ({
        name: merchant._id,
        amount: merchant.total,
        count: merchant.count
      }))
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}