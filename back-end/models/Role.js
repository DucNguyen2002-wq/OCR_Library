const mongoose = require("mongoose");

const roleSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["admin", "user"],
    },
    permissions: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "roles",
  }
);

module.exports = mongoose.model("Role", roleSchema);
