import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRejectedBooks } from '../api/books';
import { toast } from 'react-toastify';
import '../styles/MyRejectedBooks.css';

const MyRejectedBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0
  });

  useEffect(() => {
    loadRejectedBooks();
  }, []);

  const loadRejectedBooks = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getMyRejectedBooks({ page, limit: 10 });
      setBooks(response.data.books || []);
      setPagination({
        currentPage: response.data.pagination?.currentPage || 1,
        totalPages: response.data.pagination?.totalPages || 1,
        totalBooks: response.data.pagination?.totalBooks || 0
      });
    } catch (error) {
      console.error('Error loading rejected books:', error);
      toast.error('Không thể tải danh sách sách bị từ chối');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadRejectedBooks(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="rejected-books-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rejected-books-container">
      <div className="rejected-books-header">
        <div className="header-content">
          <div className="breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span className="separator">/</span>
            <Link to="/my-books">Sách của tôi</Link>
            <span className="separator">/</span>
            <span className="current">Sách bị từ chối</span>
          </div>
          <h1>
            <i className="fas fa-times-circle"></i>
            Sách Bị Từ Chối
          </h1>
          <p className="subtitle">
            Danh sách các sách của bạn đã bị từ chối. Vui lòng xem lý do và chỉnh sửa để gửi lại.
          </p>
        </div>
      </div>

      <div className="rejected-books-content">
        {books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>Không có sách bị từ chối</h3>
            <p>Tất cả sách của bạn đều đã được phê duyệt hoặc đang chờ xét duyệt.</p>
            <Link to="/my-books" className="btn-primary">
              <i className="fas fa-book"></i>
              Xem sách của tôi
            </Link>
          </div>
        ) : (
          <>
            <div className="results-info">
              <span className="count-badge">{pagination.totalBooks}</span>
              <span className="count-text">sách bị từ chối</span>
            </div>

            <div className="rejected-books-list">
              {books.map((book) => (
                <div key={book._id} className="rejected-book-card">
                  <div className="book-image">
                    {book.image_url ? (
                      <img 
                        src={book.image_url.startsWith('http') 
                          ? book.image_url 
                          : `http://localhost:3000${book.image_url}`
                        } 
                        alt={book.title}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x280?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="no-image">
                        <i className="fas fa-book"></i>
                      </div>
                    )}
                    <div className="status-badge rejected">
                      <i className="fas fa-times-circle"></i>
                      Bị từ chối
                    </div>
                  </div>

                  <div className="book-details">
                    <h3 className="book-title">{book.title}</h3>
                    
                    <div className="book-meta">
                      <div className="meta-item">
                        <i className="fas fa-user"></i>
                        <span>{book.author?.join(', ') || 'Không rõ tác giả'}</span>
                      </div>
                      {book.publisher && (
                        <div className="meta-item">
                          <i className="fas fa-building"></i>
                          <span>{book.publisher}</span>
                        </div>
                      )}
                      {book.year_published && (
                        <div className="meta-item">
                          <i className="fas fa-calendar"></i>
                          <span>{book.year_published}</span>
                        </div>
                      )}
                    </div>

                    {book.description && (
                      <p className="book-description">
                        {book.description.length > 150 
                          ? `${book.description.substring(0, 150)}...` 
                          : book.description
                        }
                      </p>
                    )}

                    <div className="rejection-info">
                      <div className="rejection-header">
                        <i className="fas fa-exclamation-triangle"></i>
                        <strong>Lý do từ chối:</strong>
                      </div>
                      <p className="rejection-reason">
                        {book.rejected_reason || 'Không có lý do cụ thể'}
                      </p>
                      {book.rejected_at && (
                        <p className="rejection-date">
                          <i className="fas fa-clock"></i>
                          Ngày từ chối: {new Date(book.rejected_at).toLocaleDateString('vi-VN')}
                        </p>
                      )}
                    </div>

                    <div className="book-actions">
                      <Link 
                        to={`/edit-rejected-book/${book._id}`} 
                        className="btn-resubmit"
                      >
                        <i className="fas fa-edit"></i>
                        Chỉnh sửa & Gửi lại
                      </Link>
                      <Link 
                        to={`/books/${book._id}`} 
                        className="btn-view"
                      >
                        <i className="fas fa-eye"></i>
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                  Trước
                </button>
                
                <div className="pagination-info">
                  Trang {pagination.currentPage} / {pagination.totalPages}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Tiếp
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyRejectedBooks;
