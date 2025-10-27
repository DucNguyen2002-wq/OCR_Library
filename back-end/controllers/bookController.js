const bookHelpers = require("../bookHelpers");
const Book = require("../models/Book");
const { createNotification } = require("./notificationController");

/**
 * Get all books with search, sort, pagination
 * GET /api/books
 * User: chỉ thấy sách approved
 * Admin: thấy tất cả sách
 * 
 * @swagger
 * /api/books:
 *   get:
 *     summary: Lấy danh sách sách với tìm kiếm, sắp xếp, phân trang
 *     tags: [Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Số lượng sách mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo tiêu đề, tác giả, ISBN
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, year_published]
 *           default: createdAt
 *         description: Trường để sắp xếp
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Thứ tự sắp xếp
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: approval_status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Lọc theo trạng thái phê duyệt
 *     responses:
 *       200:
 *         description: Danh sách sách
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 books:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Book'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalBooks:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
exports.getAllBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'createdAt',
      order = 'desc',
      status,
      approval_status
    } = req.query;

    // Parse page và limit
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter = {};
    
    // Always show only approved books for public API
    // Admin should use /api/books/pending for pending books
    filter.approval_status = 'approved';
    
    console.log('getAllBooks - Showing only approved books');

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { authors: { $elemMatch: { $regex: search, $options: 'i' } } },
        { publisher: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Count total documents
    const totalBooks = await Book.countDocuments(filter);

    // Get paginated books
    const books = await Book.find(filter)
      .populate("created_by", "name email")
      .populate("approved_by", "name")
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Format response
    const formattedBooks = books.map((book) => ({
      _id: book._id, // Thêm _id để BookCard có thể dùng
      id: book._id,
      title: book.title,
      isbn: book.isbn,
      publisher: book.publisher,
      year_published: book.year_published,
      description: book.description,
      cover_front_url: book.cover_front_url,
      cover_inner_url: book.cover_inner_url,
      cover_back_url: book.cover_back_url,
      created_by: book.created_by ? book.created_by._id : null,
      status: book.status,
      approval_status: book.approval_status,
      approved_by: book.approved_by ? book.approved_by._id : null,
      approved_at: book.approved_at,
      rejected_reason: book.rejected_reason,
      created_at: book.createdAt,
      updated_at: book.updatedAt,
      creator_name: book.created_by ? book.created_by.name : null,
      creator_email: book.created_by ? book.created_by.email : null,
      approver_name: book.approved_by ? book.approved_by.name : null,
      authors: book.authors || [],
    }));

    res.json({
      success: true,
      books: formattedBooks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalBooks / limitNum),
        totalBooks,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalBooks / limitNum),
        hasPrevPage: pageNum > 1
      },
      userRole: req.user ? req.user.role : null,
    });
  } catch (err) {
    console.error("Get books error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách sách",
    });
  }
};

/**
 * Get pending books (Admin only)
 * GET /api/books/pending
 */
exports.getPendingBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter for pending books only
    const filter = { approval_status: 'pending' };

    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Get books
    const books = await Book.find(filter)
      .populate('created_by', 'name email')
      .populate('approved_by', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalBooks = await Book.countDocuments(filter);

    // Format books
    const formattedBooks = books.map(book => ({
      _id: book._id, // Thêm _id để frontend có thể dùng
      id: book._id,
      title: book.title,
      isbn: book.isbn,
      publisher: book.publisher,
      year_published: book.year_published,
      description: book.description,
      cover_front_url: book.cover_front_url,
      cover_inner_url: book.cover_inner_url,
      cover_back_url: book.cover_back_url,
      status: book.status,
      approval_status: book.approval_status,
      rejected_reason: book.rejected_reason,
      created_at: book.createdAt,
      updated_at: book.updatedAt,
      creator_name: book.created_by ? book.created_by.name : null,
      creator_email: book.created_by ? book.created_by.email : null,
      authors: book.authors || [],
    }));

    res.json({
      success: true,
      books: formattedBooks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalBooks / limitNum),
        totalBooks,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalBooks / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error("Get pending books error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách sách chờ duyệt",
    });
  }
};

/**
 * Get rejected books (Admin only)
 * GET /api/books/rejected
 */
exports.getRejectedBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Filter for rejected books only
    const filter = { approval_status: 'rejected' };

    // Build sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    // Get books
    const books = await Book.find(filter)
      .populate('created_by', 'name email')
      .populate('approved_by', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalBooks = await Book.countDocuments(filter);

    // Format books
    const formattedBooks = books.map(book => ({
      _id: book._id, // Thêm _id để frontend có thể dùng
      id: book._id,
      title: book.title,
      isbn: book.isbn,
      publisher: book.publisher,
      year_published: book.year_published,
      description: book.description,
      cover_front_url: book.cover_front_url,
      cover_inner_url: book.cover_inner_url,
      cover_back_url: book.cover_back_url,
      status: book.status,
      approval_status: book.approval_status,
      rejected_reason: book.rejected_reason,
      created_at: book.createdAt,
      updated_at: book.updatedAt,
      creator_name: book.created_by ? book.created_by.name : null,
      creator_email: book.created_by ? book.created_by.email : null,
      authors: book.authors || [],
    }));

    res.json({
      success: true,
      books: formattedBooks,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalBooks / limitNum),
        totalBooks,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalBooks / limitNum),
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error("Get rejected books error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách sách bị từ chối",
    });
  }
};

/**
 * Get my rejected books (User own rejected books)
 * GET /api/books/my-rejected
 */
exports.getMyRejectedBooks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Filter for user's rejected books
    const books = await Book.find({ 
      created_by: userId,
      approval_status: 'rejected' 
    })
      .sort({ updatedAt: -1 })
      .lean();

    // Format books
    const formattedBooks = books.map(book => ({
      _id: book._id, // Thêm _id để frontend có thể dùng
      id: book._id,
      title: book.title,
      isbn: book.isbn,
      publisher: book.publisher,
      year_published: book.year_published,
      description: book.description,
      cover_front_url: book.cover_front_url,
      cover_inner_url: book.cover_inner_url,
      cover_back_url: book.cover_back_url,
      status: book.status,
      approval_status: book.approval_status,
      rejected_reason: book.rejected_reason,
      created_at: book.createdAt,
      updated_at: book.updatedAt,
      authors: book.authors || [],
    }));

    res.json({
      success: true,
      books: formattedBooks
    });
  } catch (err) {
    console.error("Get my rejected books error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy danh sách sách bị từ chối",
    });
  }
};

/**
 * Get featured books (latest approved books)
 * GET /api/books/featured
 */
exports.getFeaturedBooks = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const books = await bookHelpers.searchBooks({
      approval_status: 'approved',
      sortBy: 'createdAt',
      order: 'desc',
      limit: limit,
      page: 1
    });

    res.status(200).json({
      success: true,
      data: books.books
    });
  } catch (error) {
    console.error('Error getting featured books:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy sách nổi bật'
    });
  }
};

/**
 * Get single book by ID
 * GET /api/books/:id
 */
exports.getBookById = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await bookHelpers.getBookWithAuthors(id);

    console.log("📖 getBookById - Book data:", JSON.stringify(book, null, 2));

    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy sách",
      });
    }

    res.json({
      success: true,
      book: book,
    });
  } catch (err) {
    console.error("Get book error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi lấy thông tin sách",
    });
  }
};

/**
 * Create new book
 * POST /api/books
 * User: tạo sách với approval_status = pending
 * Admin: tạo sách với approval_status = approved
 */
exports.createBook = async (req, res) => {
  console.log("📚 CREATE BOOK - User:", req.user?.email, "| Role:", req.user?.role);
  console.log("📚 CREATE BOOK - Data:", req.body);
  
  const {
    title,
    authors,
    publisher,
    year_published,
    isbn,
    cover_front_url,
    cover_inner_url,
    cover_back_url,
    description,
    status,
  } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      error: "Tiêu đề là bắt buộc",
    });
  }

  try {
    const bookId = await bookHelpers.createBookWithAuthors(
      {
        title,
        authors: authors || [],
        publisher,
        year_published,
        isbn,
        cover_front_url,
        cover_inner_url,
        cover_back_url,
        description,
        status: status || "draft",
      },
      req.user.id,
      req.user.role
    );

    const message =
      req.user.role === "admin"
        ? "Thêm sách thành công!"
        : "Sách đã được gửi và đang chờ Admin phê duyệt";

    res.json({
      success: true,
      message: message,
      bookId: bookId,
    });
  } catch (err) {
    console.error("Create book error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi thêm sách",
    });
  }
};

/**
 * Update book
 * PUT /api/books/:id
 * Admin only (via middleware)
 */
exports.updateBook = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    authors,
    publisher,
    year_published,
    isbn,
    cover_front_url,
    cover_inner_url,
    cover_back_url,
    description,
    status,
  } = req.body;

  if (!title) {
    return res.status(400).json({
      success: false,
      error: "Tiêu đề là bắt buộc",
    });
  }

  try {
    const updated = await bookHelpers.updateBookWithAuthors(id, {
      title,
      authors: authors || [],
      publisher,
      year_published,
      isbn,
      cover_front_url,
      cover_inner_url,
      cover_back_url,
      description,
      status: status || "draft",
    });

    if (updated) {
      res.json({
        success: true,
        message: "Cập nhật sách thành công",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Không tìm thấy sách",
      });
    }
  } catch (err) {
    console.error("Update book error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi cập nhật sách",
    });
  }
};

/**
 * Resubmit rejected book
 * PUT /api/books/:id/resubmit
 * User can update and resubmit their rejected book
 */
exports.resubmitBook = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    authors,
    publisher,
    year_published,
    isbn,
    cover_front_url,
    cover_inner_url,
    cover_back_url,
    description,
  } = req.body;

  try {
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy sách",
      });
    }

    // Check if user owns this book
    if (book.created_by.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Bạn không có quyền cập nhật sách này",
      });
    }

    // Check if book is rejected
    if (book.approval_status !== 'rejected') {
      return res.status(400).json({
        success: false,
        error: "Chỉ có thể gửi lại sách đã bị từ chối",
      });
    }

    // Update book info
    book.title = title || book.title;
    book.authors = authors || book.authors;
    book.publisher = publisher || book.publisher;
    book.year_published = year_published || book.year_published;
    book.isbn = isbn || book.isbn;
    book.cover_front_url = cover_front_url || book.cover_front_url;
    book.cover_inner_url = cover_inner_url || book.cover_inner_url;
    book.cover_back_url = cover_back_url || book.cover_back_url;
    book.description = description || book.description;

    // Reset approval status to pending
    book.approval_status = 'pending';
    book.rejected_reason = null;
    book.approved_by = null;
    book.approved_at = null;

    await book.save();

    res.json({
      success: true,
      message: "Đã gửi lại sách để kiểm duyệt",
      book: {
        id: book._id,
        title: book.title,
        approval_status: book.approval_status
      }
    });
  } catch (err) {
    console.error("Resubmit book error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi gửi lại sách",
    });
  }
};

/**
 * Delete book
 * DELETE /api/books/:id
 * Admin only (via middleware)
 */
exports.deleteBook = async (req, res) => {
  const { id } = req.params;

  try {
    console.log('🗑️ DELETE BOOK REQUEST - ID:', id);
    console.log('ID type:', typeof id);
    console.log('ID length:', id?.length);
    
    // Validate MongoDB ObjectId format
    const mongoose = require('mongoose');
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid ObjectId format:', id);
      return res.status(400).json({
        success: false,
        error: "ID sách không hợp lệ",
      });
    }
    
    // Get book info before deleting to extract Cloudinary URLs
    const book = await Book.findById(id);
    
    if (!book) {
      console.log('❌ Book not found:', id);
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy sách",
      });
    }

    console.log('📖 Found book:', {
      title: book.title,
      cover_front_url: book.cover_front_url,
      cover_inner_url: book.cover_inner_url,
      cover_back_url: book.cover_back_url
    });

    // Extract Cloudinary public IDs from URLs and delete them
    const cloudinary = require('cloudinary').v2;
    
    const deleteCloudinaryImage = async (imageUrl) => {
      // Check if imageUrl exists and is a string
      if (!imageUrl || typeof imageUrl !== 'string') {
        return; // No URL to delete
      }
      
      // Only delete if it's a Cloudinary URL
      if (!imageUrl.includes('cloudinary.com')) {
        return; // Not a Cloudinary URL (might be local /uploads/ URL)
      }
      
      try {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{ext}
        const matches = imageUrl.match(/\/book-covers\/([^/.]+)/);
        if (matches && matches[1]) {
          const publicId = `book-covers/${matches[1]}`;
          const result = await cloudinary.uploader.destroy(publicId);
          console.log(`🗑️  Deleted from Cloudinary: ${publicId}`, result);
        }
      } catch (err) {
        console.error(`Error deleting from Cloudinary: ${err.message}`);
      }
    };

    // Delete all book cover images from Cloudinary
    await Promise.all([
      deleteCloudinaryImage(book.cover_front_url),
      deleteCloudinaryImage(book.cover_inner_url),
      deleteCloudinaryImage(book.cover_back_url)
    ]);

    // Delete book from database
    const deleted = await bookHelpers.deleteBook(id);

    if (deleted) {
      res.json({
        success: true,
        message: "Xóa sách và ảnh thành công",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Không tìm thấy sách",
      });
    }
  } catch (err) {
    console.error("Delete book error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({
      success: false,
      error: err.message || "Lỗi khi xóa sách",
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

/**
 * Approve book
 * PUT /api/books/:id/approve
 * Admin only
 */
exports.approveBook = async (req, res) => {
  const { id } = req.params;

  try {
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy sách",
      });
    }

    console.log('📚 Approving book:', book.title);
    console.log('� Cover URLs:', {
      front: book.cover_front_url,
      inner: book.cover_inner_url,
      back: book.cover_back_url
    });

    // Ảnh đã được upload lên Cloudinary khi OCR, không cần upload lại
    // Chỉ cần cập nhật trạng thái

    book.approval_status = 'approved';
    book.approved_by = req.user.id;
    book.approved_at = new Date();
    book.rejected_reason = null;

    await book.save();

    // Create notification for book creator
    try {
      await createNotification(
        book.created_by,
        book._id,
        'approved',
        'Sách được phê duyệt',
        `Sách "${book.title}" của bạn đã được phê duyệt và xuất bản thành công.`
      );
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the approval if notification fails
    }

    res.json({
      success: true,
      message: "Phê duyệt sách thành công",
      book: {
        id: book._id,
        cover_front_url: book.cover_front_url,
        cover_inner_url: book.cover_inner_url,
        cover_back_url: book.cover_back_url,
      }
    });
  } catch (err) {
    console.error("Approve book error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi phê duyệt sách: " + err.message,
    });
  }
};

/**
 * Reject book
 * PUT /api/books/:id/reject
 * Admin only
 */
exports.rejectBook = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim() === '') {
    return res.status(400).json({
      success: false,
      error: "Vui lòng nhập lý do từ chối",
    });
  }

  try {
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({
        success: false,
        error: "Không tìm thấy sách",
      });
    }

    book.approval_status = 'rejected';
    book.rejected_reason = reason;
    book.approved_at = new Date();

    await book.save();

    // Create notification for book creator
    try {
      await createNotification(
        book.created_by,
        book._id,
        'rejected',
        'Sách bị từ chối',
        `Sách "${book.title}" của bạn đã bị từ chối. Lý do: ${reason}`
      );
    } catch (notifError) {
      console.error('Error creating notification:', notifError);
      // Don't fail the rejection if notification fails
    }

    res.json({
      success: true,
      message: "Từ chối sách thành công",
    });
  } catch (err) {
    console.error("Reject book error:", err);
    res.status(500).json({
      success: false,
      error: "Lỗi khi từ chối sách",
    });
  }
};
