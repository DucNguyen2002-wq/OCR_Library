import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getBook, resubmitBook } from '../api/books';
import { toast } from 'react-toastify';
import './AddBook.css';

const EditRejectedBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    publisher: '',
    year_published: '',
    isbn: '',
    image_url: '',
    description: '',
    rejection_info: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadBookData();
  }, [id]);

  const loadBookData = async () => {
    try {
      setFetching(true);
      const response = await getBook(id);
      if (response.data?.success) {
        const book = response.data.book;
        
        // Check if book is actually rejected
        if (book.approval_status !== 'rejected') {
          toast.error('Sách này không phải ở trạng thái bị từ chối');
          navigate('/my-books');
          return;
        }

        setBookData({
          title: book.title || '',
          author: Array.isArray(book.author) ? book.author.join(', ') : '',
          publisher: book.publisher || '',
          year_published: book.year_published || '',
          isbn: book.isbn || '',
          image_url: book.image_url || '',
          description: book.description || '',
          rejection_info: {
            reason: book.rejected_reason,
            date: book.rejected_at
          }
        });

        if (book.image_url) {
          setImagePreview(
            book.image_url.startsWith('http') 
              ? book.image_url 
              : `http://localhost:3000${book.image_url}`
          );
        }
      }
    } catch (error) {
      console.error('Error loading book:', error);
      toast.error('Không thể tải thông tin sách');
      navigate('/my-rejected-books');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const { value } = e.target;
    setBookData(prev => ({
      ...prev,
      image_url: value
    }));
    
    if (value) {
      setImagePreview(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!bookData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề sách');
      return;
    }

    if (!bookData.author.trim()) {
      toast.error('Vui lòng nhập tác giả');
      return;
    }

    try {
      setLoading(true);

      // Prepare data
      const submitData = {
        title: bookData.title.trim(),
        author: bookData.author.split(',').map(a => a.trim()).filter(a => a),
        publisher: bookData.publisher.trim(),
        year_published: bookData.year_published ? parseInt(bookData.year_published) : undefined,
        isbn: bookData.isbn.trim(),
        image_url: bookData.image_url.trim(),
        description: bookData.description.trim()
      };

      const response = await resubmitBook(id, submitData);
      
      if (response.success) {
        toast.success('Đã gửi lại sách thành công! Sách sẽ được xét duyệt lại.');
        setTimeout(() => {
          navigate('/my-books');
        }, 1500);
      }
    } catch (error) {
      console.error('Error resubmitting book:', error);
      const errorMsg = error.response?.data?.error || 'Không thể gửi lại sách';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="add-book-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải thông tin sách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-book-container">
      <div className="add-book-header">
        <div className="breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span className="separator">/</span>
          <Link to="/my-rejected-books">Sách bị từ chối</Link>
          <span className="separator">/</span>
          <span className="current">Chỉnh sửa & Gửi lại</span>
        </div>
        <h1>
          <i className="fas fa-edit"></i>
          Chỉnh Sửa & Gửi Lại Sách
        </h1>
        <p className="subtitle">
          Vui lòng cập nhật thông tin sách dựa trên lý do từ chối bên dưới
        </p>
      </div>

      {bookData.rejection_info && (
        <div className="rejection-notice">
          <div className="rejection-header">
            <i className="fas fa-exclamation-triangle"></i>
            <strong>Lý do từ chối:</strong>
          </div>
          <p className="rejection-reason">{bookData.rejection_info.reason || 'Không có lý do cụ thể'}</p>
          {bookData.rejection_info.date && (
            <p className="rejection-date">
              <i className="fas fa-clock"></i>
              Ngày từ chối: {new Date(bookData.rejection_info.date).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      )}

      <form className="add-book-form" onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <div className="form-section">
          <div className="section-header">
            <i className="fas fa-info-circle"></i>
            <h2>Thông tin cơ bản</h2>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">
                Tiêu đề sách <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={bookData.title}
                onChange={handleInputChange}
                placeholder="Nhập tiêu đề sách"
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
                value={bookData.author}
                onChange={handleInputChange}
                placeholder="Nguyễn Văn A, Trần Thị B"
                required
              />
              <small className="form-hint">Phân cách bằng dấu phẩy nếu có nhiều tác giả</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="publisher">Nhà xuất bản</label>
              <input
                type="text"
                id="publisher"
                name="publisher"
                value={bookData.publisher}
                onChange={handleInputChange}
                placeholder="Nhà xuất bản Kim Đồng"
              />
            </div>

            <div className="form-group">
              <label htmlFor="year_published">Năm xuất bản</label>
              <input
                type="number"
                id="year_published"
                name="year_published"
                value={bookData.year_published}
                onChange={handleInputChange}
                placeholder="2024"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="form-group">
              <label htmlFor="isbn">ISBN</label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={bookData.isbn}
                onChange={handleInputChange}
                placeholder="978-3-16-148410-0"
              />
            </div>
          </div>
        </div>

        {/* Image Section */}
        <div className="form-section">
          <div className="section-header">
            <i className="fas fa-image"></i>
            <h2>Hình ảnh bìa sách</h2>
          </div>
          
          <div className="form-row">
            <div className="form-group" style={{ flex: 2 }}>
              <label htmlFor="image_url">URL hình ảnh</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={bookData.image_url}
                onChange={handleImageChange}
                placeholder="https://example.com/book-cover.jpg"
              />
              <small className="form-hint">Nhập đường dẫn URL của hình ảnh bìa sách</small>
            </div>

            {imagePreview && (
              <div className="image-preview-container">
                <label>Xem trước</label>
                <div className="image-preview">
                  <img 
                    src={imagePreview} 
                    alt="Preview"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/200x280?text=Invalid+URL';
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="form-section">
          <div className="section-header">
            <i className="fas fa-align-left"></i>
            <h2>Mô tả chi tiết</h2>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <textarea
              id="description"
              name="description"
              value={bookData.description}
              onChange={handleInputChange}
              placeholder="Nhập mô tả về nội dung sách..."
              rows="6"
            />
            <small className="form-hint">
              Mô tả chi tiết giúp người đọc hiểu rõ hơn về nội dung sách
            </small>
          </div>
        </div>

        {/* Info Box */}
        <div className="info-box">
          <div className="info-icon">
            <i className="fas fa-lightbulb"></i>
          </div>
          <div className="info-content">
            <h3>Lưu ý khi gửi lại sách</h3>
            <ul>
              <li>Vui lòng đọc kỹ lý do từ chối ở phía trên</li>
              <li>Cập nhật đầy đủ thông tin theo yêu cầu</li>
              <li>Kiểm tra chính tả và độ chính xác của thông tin</li>
              <li>Sau khi gửi lại, sách sẽ được chuyển về trạng thái "Chờ duyệt"</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/my-rejected-books')}
            disabled={loading}
          >
            <i className="fas fa-times"></i>
            Hủy bỏ
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Đang gửi...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i>
                Gửi lại để xét duyệt
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRejectedBook;
