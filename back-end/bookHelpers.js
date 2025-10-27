// =============================================
// Book Helper Functions (MongoDB version)
// Purpose: Functions to handle books with authors relationship
// =============================================

const Book = require("./models/Book");
const User = require("./models/User");

/**
 * Get all books with their authors
 */
async function getAllBooksWithAuthors(userRole = "user") {
  try {
    // Admin thấy tất cả sách, User chỉ thấy sách đã approved
    const filter = userRole === "admin" ? {} : { approval_status: "approved" };

    const books = await Book.find(filter)
      .populate("created_by", "name")
      .populate("approved_by", "name")
      .sort({ createdAt: -1 })
      .lean();

    // Format lại để giống với response cũ
    return books.map((book) => ({
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
      created_by: book.created_by ? book.created_by._id : null,
      status: book.status,
      approval_status: book.approval_status,
      approved_by: book.approved_by ? book.approved_by._id : null,
      approved_at: book.approved_at,
      rejected_reason: book.rejected_reason,
      created_at: book.createdAt,
      updated_at: book.updatedAt,
      creator_name: book.created_by ? book.created_by.name : null,
      approver_name: book.approved_by ? book.approved_by.name : null,
      authors: book.authors || [],
    }));
  } catch (error) {
    console.error("Error in getAllBooksWithAuthors:", error);
    throw error;
  }
}

/**
 * Get single book with authors
 */
async function getBookWithAuthors(bookId) {
  try {
    const book = await Book.findById(bookId)
      .populate("created_by", "name")
      .populate("approved_by", "name")
      .lean();

    if (!book) {
      return null;
    }

    return {
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
      created_by: book.created_by ? book.created_by._id : null,
      status: book.status,
      approval_status: book.approval_status,
      approved_by: book.approved_by ? book.approved_by._id : null,
      approved_at: book.approved_at,
      rejected_reason: book.rejected_reason,
      created_at: book.createdAt,
      updated_at: book.updatedAt,
      creator_name: book.created_by ? book.created_by.name : null,
      approver_name: book.approved_by ? book.approved_by.name : null,
      authors: book.authors || [],
    };
  } catch (error) {
    console.error("Error in getBookWithAuthors:", error);
    throw error;
  }
}

/**
 * Create book with authors
 */
async function createBookWithAuthors(bookData, userId, userRole = "user") {
  try {
    // Admin tạo sách tự động approved, User tạo sách phải chờ duyệt
    const approvalStatus = userRole === "admin" ? "approved" : "pending";
    const approvedBy = userRole === "admin" ? userId : null;
    const approvedAt = userRole === "admin" ? new Date() : null;

    // Filter authors để loại bỏ các giá trị rỗng
    const authors = (bookData.authors || [])
      .filter((author) => author && author.trim())
      .map((author) => author.trim());

    const newBook = new Book({
      title: bookData.title,
      isbn: bookData.isbn || null,
      publisher: bookData.publisher || null,
      year_published: bookData.year_published || null,
      description: bookData.description || null,
      cover_front_url: bookData.cover_front_url || null,
      cover_inner_url: bookData.cover_inner_url || null,
      cover_back_url: bookData.cover_back_url || null,
      created_by: userId,
      status: bookData.status || "draft",
      approval_status: approvalStatus,
      approved_by: approvedBy,
      approved_at: approvedAt,
      authors: authors,
    });

    const savedBook = await newBook.save();
    return savedBook._id.toString();
  } catch (error) {
    console.error("Error in createBookWithAuthors:", error);
    throw error;
  }
}

/**
 * Update book with authors
 */
async function updateBookWithAuthors(bookId, bookData) {
  try {
    // Filter authors
    const authors = (bookData.authors || [])
      .filter((author) => author && author.trim())
      .map((author) => author.trim());

    const updateData = {
      title: bookData.title,
      isbn: bookData.isbn || null,
      publisher: bookData.publisher || null,
      year_published: bookData.year_published || null,
      description: bookData.description || null,
      cover_front_url: bookData.cover_front_url || null,
      cover_inner_url: bookData.cover_inner_url || null,
      cover_back_url: bookData.cover_back_url || null,
      status: bookData.status || "draft",
      authors: authors,
    };

    await Book.findByIdAndUpdate(bookId, updateData, { new: true });
    return true;
  } catch (error) {
    console.error("Error in updateBookWithAuthors:", error);
    throw error;
  }
}

/**
 * Delete book
 */
async function deleteBook(bookId) {
  try {
    await Book.findByIdAndDelete(bookId);
    return true;
  } catch (error) {
    console.error("Error in deleteBook:", error);
    throw error;
  }
}

/**
 * Approve book
 */
async function approveBook(bookId, adminId) {
  try {
    await Book.findByIdAndUpdate(bookId, {
      approval_status: "approved",
      approved_by: adminId,
      approved_at: new Date(),
      rejected_reason: null,
    });
    return true;
  } catch (error) {
    console.error("Error in approveBook:", error);
    throw error;
  }
}

/**
 * Reject book
 */
async function rejectBook(bookId, adminId, reason) {
  try {
    await Book.findByIdAndUpdate(bookId, {
      approval_status: "rejected",
      approved_by: adminId,
      approved_at: new Date(),
      rejected_reason: reason,
    });
    return true;
  } catch (error) {
    console.error("Error in rejectBook:", error);
    throw error;
  }
}

module.exports = {
  getAllBooksWithAuthors,
  getBookWithAuthors,
  createBookWithAuthors,
  updateBookWithAuthors,
  deleteBook,
  approveBook,
  rejectBook,
};
