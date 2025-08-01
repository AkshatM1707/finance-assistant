import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  currency: {
    type: String,
    default: 'USD'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  preferences: {
    theme: {
      type: String,
      default: 'dark'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    budgetAlerts: {
      type: Boolean,
      default: true
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

// Mongoose will automatically create indexes for unique fields

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
