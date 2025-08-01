import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  category: {
    type: String,
    enum: [
      'Food & Dining',
      'Transportation',
      'Entertainment',
      'Shopping',
      'Healthcare',
      'Utilities',
      'Other'
    ],
    required: true
  },
  period: {
    type: String,
    enum: ['monthly', 'weekly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  alerts: {
    enabled: {
      type: Boolean,
      default: true
    },
    threshold: {
      type: Number,
      default: 80 // percentage
    }
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

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);

export default Budget; 