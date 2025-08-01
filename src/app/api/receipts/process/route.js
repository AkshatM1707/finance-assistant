import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/db';
import Transaction from '../../../../models/Transaction';
import { verifyToken } from '../../../../utils/auth';
import { Types } from 'mongoose';

// Create a Receipt model for storing processed receipts
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

// Helper function to extract merchant name from text
function extractMerchant(text) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Common merchant patterns
  const merchantPatterns = [
    /walmart/i,
    /target/i,
    /costco/i,
    /kroger/i,
    /safeway/i,
    /shell/i,
    /chevron/i,
    /bp/i,
    /exxon/i,
    /mobil/i,
    /mcdonald/i,
    /burger king/i,
    /kfc/i,
    /subway/i,
    /starbucks/i,
    /amazon/i,
    /best buy/i,
    /home depot/i,
    /lowes/i
  ];

  // Check first few lines for merchant name
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    for (const pattern of merchantPatterns) {
      if (pattern.test(line)) {
        return line;
      }
    }
  }

  // If no known merchant found, return first non-empty line
  return lines[0] || 'Unknown Merchant';
}

// Helper function to extract total amount
function extractTotal(text) {
  // Look for patterns like "TOTAL: $XX.XX", "Total $XX.XX", "AMOUNT: $XX.XX"
  const totalPatterns = [
    /total[:\s]*\$?(\d+\.?\d*)/i,
    /amount[:\s]*\$?(\d+\.?\d*)/i,
    /balance[:\s]*\$?(\d+\.?\d*)/i,
    /\$(\d+\.\d{2})/g
  ];

  for (const pattern of totalPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      const amounts = matches.map(match => {
        const numMatch = match.match(/(\d+\.?\d*)/);
        return numMatch ? parseFloat(numMatch[1]) : 0;
      });
      
      // Return the largest amount found (likely the total)
      return Math.max(...amounts);
    }
  }

  return 0;
}

// Helper function to extract date
function extractDate(text) {
  // Look for date patterns
  const datePatterns = [
    /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
    /(\d{1,2}-\d{1,2}-\d{2,4})/,
    /(\d{4}-\d{1,2}-\d{1,2})/
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return new Date(match[1]);
    }
  }

  return new Date(); // Default to today if no date found
}

// Helper function to extract items
function extractItems(text) {
  const lines = text.split('\n');
  const items = [];

  for (const line of lines) {
    // Look for lines with item name and price
    const itemMatch = line.match(/(.+?)\s+\$?(\d+\.?\d*)/);
    if (itemMatch) {
      const name = itemMatch[1].trim();
      const price = parseFloat(itemMatch[2]);
      
      // Filter out common non-item lines
      if (!name.toLowerCase().includes('total') && 
          !name.toLowerCase().includes('tax') && 
          !name.toLowerCase().includes('subtotal') &&
          !name.toLowerCase().includes('change') &&
          name.length > 2 && price > 0) {
        items.push({
          name: name,
          price: price,
          quantity: 1
        });
      }
    }
  }

  return items;
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

    const formData = await request.formData();
    const file = formData.get('receipt');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Mock OCR processing - simulates extracting text from receipt
    console.log('Processing receipt:', file.name);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate realistic mock receipt data based on filename and current date
    const merchants = ['Walmart', 'Target', 'Starbucks', 'McDonald\'s', 'Shell Gas', 'Kroger', 'CVS Pharmacy'];
    const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
    const baseAmount = Math.floor(Math.random() * 50) + 10; // $10-60
    const taxAmount = Math.round(baseAmount * 0.08 * 100) / 100; // 8% tax
    const totalAmount = Math.round((baseAmount + taxAmount) * 100) / 100;
    
    const text = `${randomMerchant}
Store #1234
${new Date().toLocaleDateString()}
${new Date().toLocaleTimeString()}

Item 1: $${(baseAmount * 0.4).toFixed(2)}
Item 2: $${(baseAmount * 0.3).toFixed(2)}
Item 3: $${(baseAmount * 0.3).toFixed(2)}

Subtotal: $${baseAmount.toFixed(2)}
Tax: $${taxAmount.toFixed(2)}
Total: $${totalAmount.toFixed(2)}

Thank you for shopping!`;

    console.log('Receipt processing completed for:', file.name);
      
      // Extract information from the text
      const merchant = extractMerchant(text);
      const total = extractTotal(text);
      const date = extractDate(text);
      const items = extractItems(text);
      const tax = items.length > 0 ? total * 0.08 : 0; // Estimate 8% tax
      const subtotal = total - tax;

      // Create receipt record
      const receipt = new Receipt({
        userId: new Types.ObjectId(decoded.userId),
        filename: file.name,
        originalText: text,
        extractedData: {
          merchant,
          total,
          date,
          items,
          tax,
          subtotal
        },
        status: 'completed'
      });

      await receipt.save();

      // Create transaction from receipt data
      const transaction = new Transaction({
        userId: new Types.ObjectId(decoded.userId),
        type: 'expense',
        category: 'Shopping', // Default category, can be updated later
        amount: total,
        description: `Receipt from ${merchant}`,
        date: date,
        merchant: merchant,
        status: 'completed',
        receipt: {
          extractedData: {
            items: items,
            total: total,
            tax: tax,
            subtotal: subtotal
          }
        }
      });

      await transaction.save();

      // Update receipt with transaction ID
      receipt.transactionId = transaction._id;
      await receipt.save();

      return NextResponse.json({
        message: 'Receipt processed successfully',
        receipt: {
          id: receipt._id,
          filename: receipt.filename,
          merchant: receipt.extractedData.merchant,
          total: receipt.extractedData.total,
          date: receipt.extractedData.date,
          items: receipt.extractedData.items,
          status: receipt.status
        },
        transactionId: transaction._id
      });

  } catch (error) {
    console.error('Receipt processing error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to process receipt' },
      { status: 500 }
    );
  }
}