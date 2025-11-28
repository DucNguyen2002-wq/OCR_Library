const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    isbn: {
      type: String,
      default: null,
      trim: true,
    },
    publisher: {
      type: String,
      default: null,
      trim: true,
    },
    year_published: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    cover_front_url: {
      type: String,
      default: null,
    },
    cover_inner_url: {
      type: String,
      default: null,
    },
    cover_back_url: {
      type: String,
      default: null,
    },
    created_by: {
      type: String,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    approval_status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approved_at: {
      type: Date,
      default: null,
    },
    rejected_reason: {
      type: String,
      default: null,
    },
    approved_by: {
      type: String,
      ref: "User",
      default: null,
    },
    authors: {
      type: [String],
      default: [],
    },
    translator: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "books",
  }
);

// Thêm index cho tìm kiếm và filter
bookSchema.index({ created_by: 1 });
bookSchema.index({ approval_status: 1 });
bookSchema.index({ status: 1 });
bookSchema.index({ createdAt: -1 });
// Non-unique index cho ISBN - cho phép nhiều documents không có ISBN hoặc có ISBN giống nhau
bookSchema.index({ isbn: 1 }, { sparse: true });

module.exports = mongoose.model("Book", bookSchema);
