import React, { useState, useEffect } from 'react';
import './BookForm.css';

const BookForm = ({ book, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    publishYear: '',
    publisher: '',
    description: '',
    language: '',
    pages: '',
    rating: 0,
    readingStatus: 'toRead'
  });

  useEffect(() => {
    if (book) {
      setFormData(book);
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim()) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên sách, Tác giả, ISBN)');
      return;
    }

    onSubmit(formData);
    
    // Reset form if adding new book
    if (!book) {
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        publishYear: '',
        publisher: '',
        description: '',
        language: '',
        pages: '',
        rating: 0,
        readingStatus: 'toRead'
      });
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      publishYear: '',
      publisher: '',
      description: ''
    });
  };

  return (
    <div className="book-form-container">
      <div className="form-header">
        <h2>{book ? '✏️ Chỉnh Sửa Sách' : '➕ Thêm Sách Mới'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="book-form">
        <div className="form-group">
          <label htmlFor="title">
            Tên sách <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Nhập tên sách"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="author">
            Tác giả <span className="required">*</span>
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="Nhập tên tác giả"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="isbn">
              ISBN <span className="required">*</span>
            </label>
            <input
              type="text"
              id="isbn"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              placeholder="Nhập mã ISBN"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Thể loại</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="VD: Văn học, Khoa học..."
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="publishYear">Năm xuất bản</label>
            <input
              type="number"
              id="publishYear"
              name="publishYear"
              value={formData.publishYear}
              onChange={handleChange}
              placeholder="VD: 2024"
              min="1000"
              max="2100"
            />
          </div>

          <div className="form-group">
            <label htmlFor="publisher">Nhà xuất bản</label>
            <input
              type="text"
              id="publisher"
              name="publisher"
              value={formData.publisher}
              onChange={handleChange}
              placeholder="Nhập tên nhà xuất bản"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="language">Ngôn ngữ</label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleChange}
            >
              <option value="">Chọn ngôn ngữ</option>
              <option value="Tiếng Việt">Tiếng Việt</option>
              <option value="English">English</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="pages">Số trang</label>
            <input
              type="number"
              id="pages"
              name="pages"
              value={formData.pages}
              onChange={handleChange}
              placeholder="VD: 300"
              min="1"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rating">Đánh giá ⭐</label>
            <select
              id="rating"
              name="rating"
              value={formData.rating}
              onChange={handleChange}
            >
              <option value="0">Chưa đánh giá</option>
              <option value="1">⭐ 1 - Tệ</option>
              <option value="2">⭐⭐ 2 - Không hay</option>
              <option value="3">⭐⭐⭐ 3 - Tạm được</option>
              <option value="4">⭐⭐⭐⭐ 4 - Hay</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 - Xuất sắc</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="readingStatus">Trạng thái đọc 📖</label>
            <select
              id="readingStatus"
              name="readingStatus"
              value={formData.readingStatus}
              onChange={handleChange}
            >
              <option value="toRead">📚 Chưa đọc</option>
              <option value="reading">📖 Đang đọc</option>
              <option value="read">✅ Đã đọc</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Nhập mô tả về sách..."
            rows="4"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            {book ? '💾 Cập Nhật' : '➕ Thêm Sách'}
          </button>
          <button type="button" onClick={handleReset} className="btn-reset">
            🔄 Làm Mới
          </button>
          <button type="button" onClick={onCancel} className="btn-cancel">
            ❌ Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookForm;
