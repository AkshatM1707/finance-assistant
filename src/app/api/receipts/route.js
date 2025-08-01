import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import { verifyToken } from '../../../utils/auth';
import { Types } from 'mongoose';

// Import the Receipt model
const mongoose = require('mongoose');

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

const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', ReceiptSchema);

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

    // Fetch receipts for the authenticated user
    const receipts = await Receipt.find({ 
      userId: new Types.ObjectId(decoded.userId) 
    })
    .sort({ createdAt: -1 })
    .limit(50);

    // Format receipts for frontend
    const formattedReceipts = receipts.map(receipt => ({
      id: receipt._id,
      filename: receipt.filename,
      merchant: receipt.extractedData?.merchant || 'Unknown',
      amount: receipt.extractedData?.total || 0,
      date: receipt.extractedData?.date || receipt.createdAt,
      category: 'Shopping', // Default category
      status: receipt.status,
      extractedData: receipt.extractedData,
      transactionId: receipt.transactionId,
      createdAt: receipt.createdAt
    }));

    return NextResponse.json({
      receipts: formattedReceipts
    });

  } catch (error) {
    console.error('Get receipts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}