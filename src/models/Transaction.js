import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Food & Dining',
      'Transportation',
      'Entertainment',
      'Shopping',
      'Healthcare',
      'Utilities',
      'Salary',
      'Freelance',
      'Investment',
      'Other'
    ]
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  merchant: {
    type: String,
    trim: true,
    default: null
  },
  location: {
    type: String,
    trim: true,
    default: null
  },
  receipt: {
    filename: String,
    url: String,
    extractedData: {
      total: Number,
      tax: Number,
      items: [{
        name: String,
        price: Number
      }]
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Mongoose will automatically create indexes for referenced fields

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction; 