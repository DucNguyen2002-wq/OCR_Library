const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  type: {
    type: String,
    enum: ['approved', 'rejected', 'resubmitted'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  is_read: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });

// Virtual for book details
notificationSchema.virtual('book', {
  ref: 'Book',
  localField: 'book_id',
  foreignField: '_id',
  justOne: true
});

module.exports = mongoose.model('Notification', notificationSchema);
