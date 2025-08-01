
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '../../../lib/db';
import Transaction from '../../../models/Transaction';
import { verifyToken } from '../../../utils/auth';

/**
 * GET /api/transactions
 * Retrieves paginated transactions for the authenticated user
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 50, max: 100)
 * - timeRange: 'week', 'month', 'year', 'all' (default: 'month')
 * - type: 'income', 'expense', or 'all' (default: 'all')
 * - category: Filter by specific category
 * 
 * @param {Request} request - The incoming request
 * @returns {Response} Paginated transactions with summary statistics
 */
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

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    
    // Pagination parameters with validation
    let page = parseInt(searchParams.get('page')) || 1;
    let limit = parseInt(searchParams.get('limit')) || 50;
    
    // Validate pagination parameters
    if (page < 1) page = 1;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100; // Max 100 items per page
    
    console.log(`Fetching transactions: page=${page}, limit=${limit}, timeRange=${timeRange}, type=${type || 'all'}`);

    // Build query - convert userId to ObjectId
    const query = { userId: new Types.ObjectId(decoded.userId) };
    
    // Add type filter
    if (type && type !== 'all') {
      query.type = type;
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add date filter based on timeRange
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
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
      case 'custom':
        // For custom, don't apply date filter - show all transactions
        break;
      default:
        // For any other case, show all transactions
        break;
    }

    // Only apply date filter if not 'custom' or other cases
    if (timeRange !== 'custom' && ['today', 'week', 'month', 'quarter', 'year'].includes(timeRange)) {
      query.date = { $gte: startDate };
    }

    // Get transactions with pagination - Enhanced error handling
    let transactions, total, incomeTotal, expenseTotal, categoryStats;
    
    try {
      // Fetch transactions with pagination
      transactions = await Transaction.find(query)
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(); // Use lean() for better performance
        
      if (!transactions) {
        throw new Error('Failed to fetch transactions');
      }
      
    } catch (dbError) {
      console.error('Database query error (transactions):', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch transactions from database' },
        { status: 500 }
      );
    }

    try {
      // Get total count for pagination
      total = await Transaction.countDocuments(query);
      
    } catch (dbError) {
      console.error('Database count error:', dbError);
      return NextResponse.json(
        { error: 'Failed to count transactions' },
        { status: 500 }
      );
    }

    try {
      // Calculate summary statistics using the same query conditions
      [incomeTotal, expenseTotal, categoryStats] = await Promise.all([
        Transaction.aggregate([
          { $match: { ...query, type: 'income' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Transaction.aggregate([
          { $match: { ...query, type: 'expense' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]),
        Transaction.aggregate([
          { $match: query },
          { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
          { $sort: { total: -1 } }
        ])
      ]);
      
    } catch (dbError) {
      console.error('Database aggregation error:', dbError);
      // Continue with partial data if aggregation fails
      incomeTotal = [{ total: 0 }];
      expenseTotal = [{ total: 0 }];
      categoryStats = [];
    }

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      summary: {
        income: incomeTotal[0]?.total || 0,
        expenses: expenseTotal[0]?.total || 0,
        net: (incomeTotal[0]?.total || 0) - (expenseTotal[0]?.total || 0),
        categoryStats
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
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

    const { type, category, amount, description, date, merchant, location, notes } = await request.json();

    // Validation
    if (!type || !amount || !description || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    // For expenses, category is required. For income, use default if not provided
    if (type === 'expense' && !category) {
      return NextResponse.json(
        { error: 'Category is required for expenses' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Set default category for income if not provided
    const finalCategory = type === 'income' ? (category || 'Salary') : category;

    // Create transaction
    const transaction = new Transaction({
      userId: new Types.ObjectId(decoded.userId),
      type,
      category: finalCategory,
      amount,
      description,
      date: new Date(date),
      merchant,
      location,
      notes
    });

    await transaction.save();

    return NextResponse.json(
      { 
        message: 'Transaction created successfully',
        transaction
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
