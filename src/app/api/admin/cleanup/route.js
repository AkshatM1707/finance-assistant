import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import { verifyToken } from '../../../../utils/auth';
import { Types } from 'mongoose';

// Import models
const mongoose = require('mongoose');

// Receipt Schema
const ReceiptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filename: { type: String, required: true },
  originalText: { type: String, required: true },
  extractedData: {
    merchant: String,
    total: Number,
    date: Date,
    items: [{
      name: String,
      price: Number,
      quantity: { type: Number, default: 1 }
    }],
    tax: Number,
    subtotal: Number
  },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
}, {
  timestamps: true
});

// Transaction Schema
const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  merchant: { type: String },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  receipt: {
    extractedData: {
      items: [{
        name: String,
        price: Number,
        quantity: { type: Number, default: 1 }
      }],
      total: Number,
      tax: Number,
      subtotal: Number
    }
  }
}, {
  timestamps: true
});

const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', ReceiptSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

/**
 * DELETE /api/admin/cleanup
 * Removes test data and dummy receipts from the database
 * 
 * @param {Request} request - The incoming request
 * @returns {Response} Success message or error
 */
export async function DELETE(request) {
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

    console.log('Starting cleanup of test data...');

    // Delete test receipts (files with test names or mock data)
    const testReceiptPatterns = [
      /test-receipt/i,
      /whatsapp/i,
      /dummy/i,
      /mock/i
    ];

    let deletedReceipts = 0;
    let deletedTransactions = 0;

    // Find and delete test receipts
    for (const pattern of testReceiptPatterns) {
      const receipts = await Receipt.find({
        userId: new Types.ObjectId(decoded.userId),
        filename: { $regex: pattern }
      });

      for (const receipt of receipts) {
        // Delete associated transaction if exists
        if (receipt.transactionId) {
          await Transaction.findByIdAndDelete(receipt.transactionId);
          deletedTransactions++;
        }
        
        // Delete receipt
        await Receipt.findByIdAndDelete(receipt._id);
        deletedReceipts++;
      }
    }

    // Also delete transactions that were created from mock receipts
    const mockTransactions = await Transaction.find({
      userId: new Types.ObjectId(decoded.userId),
      $or: [
        { merchant: { $in: ['Shell Gas', 'Walmart', 'Target', 'Starbucks', 'McDonald\'s', 'Kroger', 'CVS Pharmacy'] } },
        { description: { $regex: /receipt from/i } }
      ]
    });

    for (const transaction of mockTransactions) {
      await Transaction.findByIdAndDelete(transaction._id);
      deletedTransactions++;
    }

    console.log(`Cleanup completed: ${deletedReceipts} receipts, ${deletedTransactions} transactions deleted`);

    return NextResponse.json({
      message: 'Test data cleanup completed successfully',
      deleted: {
        receipts: deletedReceipts,
        transactions: deletedTransactions
      }
    });

  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup test data' },
      { status: 500 }
    );
  }
}