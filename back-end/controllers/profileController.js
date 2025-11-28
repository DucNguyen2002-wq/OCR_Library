const Book = require("../models/Book");
const User = require("../models/User");
const bcrypt = require("bcrypt");

/**
 * Get user profile
 * GET /api/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('role_id', 'role_name')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng'
    });
  }
};

/**
 * Get user's contributed books
 * GET /api/profile/books
 */
exports.getUserBooks = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const approval_status = req.query.approval_status;

    const filter = { user_id: userId };
    if (approval_status) {
      filter.approval_status = approval_status;
    }

    const skip = (page - 1) * limit;
    const books = await Book.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalBooks = await Book.countDocuments(filter);

    res.json({
      success: true,
      data: {
        books,
        totalBooks,
        totalPages: Math.ceil(totalBooks / limit),
        currentPage: page
      }
    });
  } catch (err) {
    console.error('Get user books error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sách'
    });
  }
};

/**
 * Get user profile stats
 * GET /api/profile/stats
 */
exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const total = await Book.countDocuments({ user_id: userId });
    const approved = await Book.countDocuments({
      user_id: userId,
      approval_status: "approved",
    });
    const pending = await Book.countDocuments({
      user_id: userId,
      approval_status: "pending",
    });
    const rejected = await Book.countDocuments({
      user_id: userId,
      approval_status: "rejected",
    });

    res.json({
      success: true,
      data: {
        total,
        approved,
        pending,
        rejected
      }
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê'
    });
  }
};

/**
 * Get user profile stats (old endpoint for backward compatibility)
 * GET /api/profile/stats
 */
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await Book.countDocuments({ created_by: userId });
    const approved = await Book.countDocuments({
      created_by: userId,
      approval_status: "approved",
    });
    const pending = await Book.countDocuments({
      created_by: userId,
      approval_status: "pending",
    });

    res.json({
      success: true,
      total,
      approved,
      pending,
    });
  } catch (err) {
    console.error("Get stats error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy thống kê",
    });
  }
};

/**
 * Update user profile
 * PUT /api/profile/update
 */
exports.updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;

  if (!name || name.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Tên không được để trống",
    });
  }

  try {
    await User.findByIdAndUpdate(req.user.id, {
      name: name.trim(),
      phone: phone?.trim() || null,
      address: address?.trim() || null,
    });

    res.json({
      success: true,
      message: "Cập nhật thông tin thành công",
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi cập nhật thông tin",
    });
  }
};

/**
 * Change user password
 * PUT /api/profile/change-password
 */
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      error: "Vui lòng nhập đầy đủ thông tin",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      error: "Mật khẩu mới phải có ít nhất 6 ký tự",
    });
  }

  try {
    // Get current user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy người dùng",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Mật khẩu hiện tại không đúng",
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password_hash = newPasswordHash;
    await user.save();

    res.json({
      success: true,
      message: "Đổi mật khẩu thành công",
    });
  } catch (err) {
    console.error("Change password error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi đổi mật khẩu",
    });
  }
};

