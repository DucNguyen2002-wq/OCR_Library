const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role_id: {
      type: String,
      ref: "Role",
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "users",
  }
);

// Index cho tìm kiếm nhanh (loại bỏ index: true vì đã dùng userSchema.index)
userSchema.index({ role_id: 1 });

module.exports = mongoose.model("User", userSchema);
