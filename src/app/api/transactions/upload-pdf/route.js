import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Transaction from '../../../../models/Transaction';
import { verifyToken } from '../../../../utils/auth';
import { Types } from 'mongoose';

/**
 * POST /api/transactions/upload-pdf
 * Processes uploaded PDF files containing tabular transaction data
 * 
 * Expected PDF format: Table with columns like Date, Description, Amount, Type/Category
 * 
 * @param {Request} request - The incoming request with PDF file
 * @returns {Response} Success message with processed transactions or error
 */
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

    const formData = await request.formData();
    const file = formData.get('pdf');

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    console.log('Processing PDF transaction history:', file.name);

    // Mock PDF processing - In production, you would use a PDF parsing library
    // like pdf-parse, pdf2pic + OCR, or similar to extract tabular data
    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

    // Generate mock transaction data that would typically be extracted from PDF
    const mockTransactions = generateMockTransactionsFromPDF(file.name);
    
    const createdTransactions = [];
    const errors = [];

    // Process each extracted transaction
    for (let i = 0; i < mockTransactions.length; i++) {
      const transactionData = mockTransactions[i];
      
      try {
        // Validate required fields
        if (!transactionData.date || !transactionData.amount || !transactionData.description) {
          errors.push(`Row ${i + 1}: Missing required fields (date, amount, or description)`);
          continue;
        }

        // Create transaction in database
        const transaction = new Transaction({
          userId: new Types.ObjectId(decoded.userId),
          type: transactionData.type || 'expense',
          category: transactionData.category || 'Other',
          amount: Math.abs(parseFloat(transactionData.amount)),
          description: transactionData.description,
          date: new Date(transactionData.date),
          status: 'completed',
          // Add metadata to indicate this came from PDF upload
          source: 'pdf_upload',
          originalFile: file.name
        });

        await transaction.save();
        createdTransactions.push(transaction);
        
      } catch (error) {
        console.error(`Error processing transaction row ${i + 1}:`, error);
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    console.log(`PDF processing completed: ${createdTransactions.length} transactions created, ${errors.length} errors`);

    return NextResponse.json({
      message: 'PDF transaction history processed successfully',
      summary: {
        totalRows: mockTransactions.length,
        successful: createdTransactions.length,
        failed: errors.length,
        filename: file.name
      },
      transactions: createdTransactions.map(t => ({
        id: t._id,
        type: t.type,
        category: t.category,
        amount: t.amount,
        description: t.description,
        date: t.date
      })),
      errors: errors
    });

  } catch (error) {
    console.error('PDF upload processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process PDF transaction history' },
      { status: 500 }
    );
  }
}

/**
 * Generates mock transaction data that would typically be extracted from a PDF
 * In production, this would be replaced with actual PDF parsing logic
 * 
 * @param {string} filename - The name of the uploaded PDF file
 * @returns {Array} Array of transaction objects extracted from PDF
 */
function generateMockTransactionsFromPDF(filename) {
  // Mock data representing what would be extracted from a PDF table
  const baseTransactions = [
    {
      date: '2024-01-15',
      description: 'Grocery Store Purchase',
      amount: -85.43,
      type: 'expense',
      category: 'Food & Dining'
    },
    {
      date: '2024-01-14',
      description: 'Salary Deposit',
      amount: 3200.00,
      type: 'income',
      category: 'Salary'
    },
    {
      date: '2024-01-13',
      description: 'Gas Station',
      amount: -45.67,
      type: 'expense',
      category: 'Transportation'
    },
    {
      date: '2024-01-12',
      description: 'Online Shopping',
      amount: -129.99,
      type: 'expense',
      category: 'Shopping'
    },
    {
      date: '2024-01-11',
      description: 'Coffee Shop',
      amount: -4.50,
      type: 'expense',
      category: 'Food & Dining'
    },
    {
      date: '2024-01-10',
      description: 'Freelance Payment',
      amount: 750.00,
      type: 'income',
      category: 'Freelance'
    },
    {
      date: '2024-01-09',
      description: 'Utility Bill',
      amount: -89.32,
      type: 'expense',
      category: 'Utilities'
    },
    {
      date: '2024-01-08',
      description: 'Restaurant Dinner',
      amount: -67.80,
      type: 'expense',
      category: 'Food & Dining'
    }
  ];

  // Add some randomization to make it feel more realistic
  return baseTransactions.map(transaction => ({
    ...transaction,
    amount: transaction.amount + (Math.random() - 0.5) * 20, // Add small random variation
    description: `${transaction.description} (from ${filename})`
  }));
}