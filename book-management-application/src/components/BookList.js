import React from 'react';
import './BookList.css';

const BookList = ({ books, onEdit, onDelete }) => {
  if (books.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📚</div>
        <h3>Chưa có sách nào</h3>
        <p>Hãy thêm sách mới hoặc sử dụng OCR để quét thông tin sách</p>
      </div>
    );
  }

  return (
    <div className="book-list">
      {books.map(book => (
        <div key={book.id} className="book-card">
          <div className="book-header">
            <h3 className="book-title">{book.title}</h3>
            <div className="book-actions">
              <button 
                className="btn-edit"
                onClick={() => onEdit(book)}
                title="Chỉnh sửa"
              >
                ✏️
              </button>
              <button 
                className="btn-delete"
                onClick={() => onDelete(book.id)}
                title="Xóa"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div className="book-info">
            <div className="info-row">
              <span className="label">👤 Tác giả:</span>
              <span className="value">{book.author}</span>
            </div>
            <div className="info-row">
              <span className="label">📖 ISBN:</span>
              <span className="value">{book.isbn}</span>
            </div>
            <div className="info-row">
              <span className="label">🏷️ Thể loại:</span>
              <span className="value">{book.category}</span>
            </div>
            <div className="info-row">
              <span className="label">📅 Năm xuất bản:</span>
              <span className="value">{book.publishYear}</span>
            </div>
            <div className="info-row">
              <span className="label">🏢 Nhà xuất bản:</span>
              <span className="value">{book.publisher}</span>
            </div>
            {book.language && (
              <div className="info-row">
                <span className="label">🌐 Ngôn ngữ:</span>
                <span className="value">{book.language}</span>
              </div>
            )}
            {book.pages && (
              <div className="info-row">
                <span className="label">📄 Số trang:</span>
                <span className="value">{book.pages}</span>
              </div>
            )}
            {book.rating > 0 && (
              <div className="info-row">
                <span className="label">⭐ Đánh giá:</span>
                <span className="value rating">{'⭐'.repeat(book.rating)} ({book.rating}/5)</span>
              </div>
            )}
            {book.readingStatus && (
              <div className="info-row">
                <span className="label">📖 Trạng thái:</span>
                <span className={`value status-${book.readingStatus}`}>
                  {book.readingStatus === 'read' && '✅ Đã đọc'}
                  {book.readingStatus === 'reading' && '📖 Đang đọc'}
                  {book.readingStatus === 'toRead' && '📚 Chưa đọc'}
                </span>
              </div>
            )}
            {book.description && (
              <div className="book-description">
                <span className="label">📝 Mô tả:</span>
                <p>{book.description}</p>
              </div>
            )}
          </div>
          
          <div className="book-footer">
            <small>Ngày thêm: {new Date(book.createdAt).toLocaleDateString('vi-VN')}</small>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookList;
