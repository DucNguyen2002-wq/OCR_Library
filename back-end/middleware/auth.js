const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

/**
 * Middleware xác thực JWT token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Thiếu token xác thực" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ" });
    }
    req.user = user;
    next();
  });
};

/**
 * Middleware require authentication
 */
const requireAuth = authenticateToken;

/**
 * Middleware require admin role
 */
const requireAdmin = async (req, res, next) => {
  try {
    // Check role from JWT token first
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // Fallback: check from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(403).json({ message: "Không tìm thấy người dùng" });
    }

    // Check if user has admin role (string field)
    if (user.role === 'admin') {
      return next();
    }

    // If no admin role found
    return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  } catch (error) {
    console.error('requireAdmin error:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * Middleware check if user can modify book (admin or book owner)
 */
const requireBookModifyPermission = async (req, res, next) => {
  try {
    const Book = require("../models/Book");
    
    // Check if user has admin role from JWT token first
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    
    // Get user from database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(403).json({ message: "Không tìm thấy người dùng" });
    }
    
    // Get book
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách" });
    }

    // Check if admin (using string role field)
    const isAdmin = user.role === 'admin';
    
    // Check if owner (using created_by field, not user_id)
    const isOwner = book.created_by && book.created_by.toString() === user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: "Không có quyền chỉnh sửa sách này" });
    }

    next();
  } catch (error) {
    console.error('requireBookModifyPermission error:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  authenticateToken,
  requireAuth,
  requireAdmin,
  requireBookModifyPermission
};
