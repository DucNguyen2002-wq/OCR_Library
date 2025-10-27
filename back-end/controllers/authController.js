const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

/**
 * Login user
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  const { username, email, password } = req.body;
  const loginEmail = username || email;

  if (!loginEmail) {
    return res.status(400).json({
      success: false,
      error: "Email is required",
    });
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      error: "Password is required",
    });
  }

  try {
    // Tìm user theo email và populate role
    const user = await User.findOne({ email: loginEmail }).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không đúng",
      });
    }

    // Lấy thông tin role
    const role = await Role.findById(user.role_id).lean();

    if (!role) {
      console.error("Role not found for user:", user.email, "role_id:", user.role_id);
      return res.status(500).json({
        success: false,
        error: "Lỗi cấu hình hệ thống",
      });
    }

    console.log("Login successful:", { email: user.email, role: role.name });

    // Kiểm tra password với bcrypt
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: "Email hoặc mật khẩu không đúng",
      });
    }

    // Tạo JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: role.name,
        role_id: user.role_id,
        permissions: role.permissions,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      token: token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: role.name,
        permissions: role.permissions || {},
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi server",
    });
  }
};

/**
 * Register new user
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "Vui lòng điền đầy đủ thông tin",
    });
  }

  try {
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "Email đã được sử dụng",
      });
    }

    // Lấy role_id cho role 'user' (default role)
    const userRole = await Role.findOne({ name: "user" });

    if (!userRole) {
      return res.status(500).json({
        success: false,
        error: "Lỗi cấu hình hệ thống (không tìm thấy role mặc định)",
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const newUser = new User({
      email,
      name: fullname,
      password_hash: hashedPassword,
      role_id: userRole._id,
    });

    await newUser.save();

    res.json({
      success: true,
      message: "Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.",
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi server khi đăng ký",
    });
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const role = await Role.findById(user.role_id).lean();

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: role ? role.name : "user",
        permissions: role ? role.permissions || {} : {},
        created_at: user.createdAt,
      },
    });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy thông tin user",
    });
  }
};

/**
 * Logout user (client-side only - remove token)
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  // JWT stateless, logout chỉ cần client xóa token
  res.json({
    success: true,
    message: "Đăng xuất thành công",
  });
};

