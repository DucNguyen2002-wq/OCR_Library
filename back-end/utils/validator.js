/**
 * Input validation and sanitization utilities
 * Chống XSS, SQL Injection, và các lỗ hổng bảo mật khác
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware để check validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Dữ liệu không hợp lệ',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules cho đăng ký
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên không được để trống')
    .isLength({ min: 2, max: 100 }).withMessage('Tên phải từ 2-100 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Tên chỉ được chứa chữ cái'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Mật khẩu phải có chữ hoa, chữ thường và số'),
  handleValidationErrors
];

/**
 * Validation rules cho đăng nhập
 */
const loginValidation = [
  body('username')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống'),
  handleValidationErrors
];

/**
 * Validation rules cho tạo/cập nhật sách
 */
const bookValidation = [
  body('title')
    .trim()
    .notEmpty().withMessage('Tiêu đề không được để trống')
    .isLength({ min: 1, max: 500 }).withMessage('Tiêu đề phải từ 1-500 ký tự')
    .escape(), // Chống XSS
  body('isbn')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^(?:\d{10}|\d{13})$/).withMessage('ISBN phải có 10 hoặc 13 chữ số'),
  body('publisher')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Nhà xuất bản tối đa 200 ký tự')
    .escape(),
  body('year_published')
    .optional({ checkFalsy: true })
    .isInt({ min: 1000, max: new Date().getFullYear() + 1 })
    .withMessage('Năm xuất bản không hợp lệ'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 5000 }).withMessage('Mô tả tối đa 5000 ký tự')
    .escape(),
  body('authors')
    .optional()
    .isArray().withMessage('Tác giả phải là mảng'),
  body('authors.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 }).withMessage('Tên tác giả phải từ 1-200 ký tự')
    .escape(),
  body('status')
    .optional()
    .isIn(['draft', 'published']).withMessage('Trạng thái không hợp lệ'),
  handleValidationErrors
];

/**
 * Validation rules cho MongoDB ObjectId
 */
const idValidation = [
  param('id')
    .notEmpty().withMessage('ID không được để trống')
    .matches(/^[a-f\d]{24}$/i).withMessage('ID không hợp lệ'),
  handleValidationErrors
];

/**
 * Validation rules cho pagination
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Trang phải là số nguyên dương')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit phải từ 1-100')
    .toInt(),
  query('sortBy')
    .optional()
    .isString()
    .isIn(['title', 'createdAt', 'year_published', 'name', 'email'])
    .withMessage('Trường sắp xếp không hợp lệ'),
  query('order')
    .optional()
    .isIn(['asc', 'desc']).withMessage('Thứ tự sắp xếp phải là asc hoặc desc'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Từ khóa tìm kiếm tối đa 200 ký tự')
    .escape(),
  handleValidationErrors
];

/**
 * Validation rules cho cập nhật profile
 */
const profileValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên không được để trống')
    .isLength({ min: 2, max: 100 }).withMessage('Tên phải từ 2-100 ký tự')
    .escape(),
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),
  body('address')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 500 }).withMessage('Địa chỉ tối đa 500 ký tự')
    .escape(),
  handleValidationErrors
];

/**
 * Validation rules cho đổi mật khẩu
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Mật khẩu phải có chữ hoa, chữ thường và số'),
  handleValidationErrors
];

/**
 * Validation cho approval status
 */
const approvalValidation = [
  body('approval_status')
    .notEmpty().withMessage('Trạng thái phê duyệt không được để trống')
    .isIn(['approved', 'rejected']).withMessage('Trạng thái phải là approved hoặc rejected'),
  body('rejected_reason')
    .if(body('approval_status').equals('rejected'))
    .notEmpty().withMessage('Lý do từ chối không được để trống khi rejected')
    .trim()
    .isLength({ max: 1000 }).withMessage('Lý do từ chối tối đa 1000 ký tự')
    .escape(),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  registerValidation,
  loginValidation,
  bookValidation,
  idValidation,
  paginationValidation,
  profileValidation,
  changePasswordValidation,
  approvalValidation
};
