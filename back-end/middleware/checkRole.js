/**
 * Middleware kiểm tra quyền truy cập theo role
 */

// Kiểm tra user có role admin
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }

  // Kiểm tra role là admin
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Chỉ admin mới có quyền truy cập",
    });
  }

  next();
}

// Kiểm tra user đã đăng nhập (cả user và admin đều được)
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }

  next();
}

// Kiểm tra quyền sửa/xóa sách (chỉ admin)
function requireBookModifyPermission(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }

  // Parse permissions nếu là string (từ JWT token)
  let permissions = req.user.permissions || {};
  if (typeof permissions === 'string') {
    try {
      permissions = JSON.parse(permissions);
    } catch (e) {
      permissions = {};
    }
  }

  // Admin có quyền manage_books và delete
  if (
    req.user.role === "admin" &&
    permissions.can_manage_books &&
    permissions.can_delete
  ) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Bạn không có quyền sửa/xóa sách",
  });
}

// Kiểm tra quyền thêm sách (user và admin đều được)
function requireBookCreatePermission(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }

  const permissions = req.user.permissions || {};

  // Admin và user đều có quyền thêm sách
  if (req.user.role === "admin" || req.user.role === "user") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Bạn không có quyền thêm sách",
  });
}

module.exports = {
  requireAdmin,
  requireAuth,
  requireBookModifyPermission,
  requireBookCreatePermission,
};
