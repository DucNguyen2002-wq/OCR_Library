import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createBook } from '../api/books';
import { toast } from 'react-toastify';
import BookCoverUploader from '../components/BookCoverUploader';
import './AddBook.css';

export default function AddBook() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showOCRUploader, setShowOCRUploader] = useState(false);
  const [form, setForm] = useState({
    title: '',
    authors: '',
    translator: '',
    publisher: '',
    year_published: '',
    isbn: '',
    cover_front_url: '',
    description: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOCRDataExtracted = (bookData) => {
    // Auto-fill form with OCR data
    setForm(prev => ({
      ...prev,
      title: bookData.title || prev.title,
      authors: bookData.authors ? bookData.authors.join(', ') : prev.authors,
      translator: bookData.translator || prev.translator,
      publisher: bookData.publisher || prev.publisher,
      year_published: bookData.year_published || prev.year_published,
      isbn: bookData.isbn || prev.isbn,
      description: bookData.description || prev.description,
      // Ưu tiên front cover, fallback sang spine cover (already full URL from Cloudinary or server)
      cover_front_url: bookData.coverImages?.front || bookData.coverImages?.spine || prev.cover_front_url
    }));
    
    setShowOCRUploader(false);
    toast.success('✅ Dữ liệu đã được tự động điền vào form!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title.trim()) {
      toast.error('❌ Vui lòng nhập tiêu đề sách');
      return;
    }

    setLoading(true);
    try {
      const authorsArray = form.authors.trim() 
        ? form.authors.split(',').map(a => a.trim()).filter(a => a)
        : [];

      const payload = {
        title: form.title.trim(),
        authors: authorsArray,
        translator: form.translator.trim() || undefined,
        publisher: form.publisher.trim() || undefined,
        year_published: form.year_published ? parseInt(form.year_published) : undefined,
        isbn: form.isbn.trim() || undefined,
        cover_front_url: form.cover_front_url.trim() || undefined,
        description: form.description.trim() || undefined
      };
      
      const res = await createBook(payload);
      
      if (res?.success) {
        toast.success('🎉 Thêm sách thành công! Sách đang chờ admin kiểm duyệt.', {
          autoClose: 3000,
          position: 'top-center'
        });
        
        // Đợi 1.5s để hiển thị toast rồi chuyển trang
        setTimeout(() => {
          navigate('/books');
        }, 1500);
      } else {
        toast.error('❌ ' + (res?.error || 'Không thể thêm sách'));
      }
    } catch (e) {
      console.error('Error adding book:', e);
      const errorMsg = e?.response?.data?.error || 'Không thể thêm sách. Vui lòng thử lại!';
      toast.error('❌ ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-book-page">
      <div className="container">
        {/* Hero Section - Centered */}
        <div className="hero-section-minimal">
          <div className="hero-content-minimal">
            <i className="fas fa-plus-circle hero-icon-minimal"></i>
            <h1 className="hero-title-minimal">Thêm Sách Mới</h1>
            
            {/* Action Buttons */}
            <div className="hero-actions">
              <button
                type="button"
                className="btn-ocr-hero"
                onClick={() => setShowOCRUploader(true)}
              >
                <i className="fas fa-camera"></i>
                Quét bìa sách (OCR)
              </button>
              <Link to="/books" className="btn-back-hero">
                <i className="fas fa-arrow-left"></i>
                Quay lại
              </Link>
            </div>
          </div>
        </div>

        {/* OCR Modal */}
        {showOCRUploader && (
          <div className="modal-overlay" onClick={() => setShowOCRUploader(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button
                className="modal-close"
                onClick={() => setShowOCRUploader(false)}
              >
                ✕
              </button>
              <BookCoverUploader
                onDataExtracted={handleOCRDataExtracted}
                onClose={() => setShowOCRUploader(false)}
              />
            </div>
          </div>
        )}

        {/* Form Container - Clean Card */}
        <div className="form-container-minimal">
            <form className="book-form" onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-info-circle"></i> Thông tin cơ bản
              </h3>
              
              <div className="form-group">
                <label htmlFor="title">
                  Tiêu đề <span className="required">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="form-control"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Nhập tiêu đề sách"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="authors">
                  Tác giả <span className="hint">(phân cách bằng dấu phẩy)</span>
                </label>
                <input
                  id="authors"
                  name="authors"
                  type="text"
                  className="form-control"
                  value={form.authors}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn A, Trần Thị B"
                />
                <small className="form-text">
                  Ví dụ: Nguyễn Nhật Ánh, Tô Hoài
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="translator">
                  Người dịch <span className="hint">(nếu có)</span>
                </label>
                <input
                  id="translator"
                  name="translator"
                  type="text"
                  className="form-control"
                  value={form.translator}
                  onChange={handleChange}
                  placeholder="Nguyễn Văn C"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="publisher">Nhà xuất bản</label>
                  <input
                    id="publisher"
                    name="publisher"
                    type="text"
                    className="form-control"
                    value={form.publisher}
                    onChange={handleChange}
                    placeholder="NXB Kim Đồng"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="year_published">Năm xuất bản</label>
                  <input
                    id="year_published"
                    name="year_published"
                    type="number"
                    className="form-control"
                    value={form.year_published}
                    onChange={handleChange}
                    placeholder="2024"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="isbn">ISBN</label>
                <input
                  id="isbn"
                  name="isbn"
                  type="text"
                  className="form-control"
                  value={form.isbn}
                  onChange={handleChange}
                  placeholder="978-3-16-148410-0"
                />
                <small className="form-text">
                  Mã số ISBN quốc tế (nếu có)
                </small>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">
                <i className="fas fa-image"></i> Ảnh bìa và mô tả
              </h3>

              {form.cover_front_url && (
                <div className="form-group">
                  <label>Ảnh bìa sách</label>
                  <div className="book-cover-display">
                    <div className="image-preview">
                      <img 
                        src={form.cover_front_url} 
                        alt="Ảnh bìa" 
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/280x400?text=Không+tìm+thấy+ảnh';
                        }} 
                      />
                      <div className="image-info">
                        <i className="fas fa-check-circle"></i>
                        <span>Ảnh bìa đã được tải lên</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="cover_front_url">URL Ảnh bìa <span className="hint">(tùy chọn)</span></label>
                <input
                  id="cover_front_url"
                  name="cover_front_url"
                  type="text"
                  className="form-control"
                  value={form.cover_front_url}
                  onChange={handleChange}
                  placeholder="https://example.com/cover.jpg"
                />
                <small className="form-text">
                  Hoặc sử dụng chức năng quét OCR để tự động tải ảnh bìa
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả</label>
                <textarea
                  id="description"
                  name="description"
                  className="form-control"
                  value={form.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Mô tả ngắn gọn về nội dung, tác giả, giá trị của cuốn sách..."
                ></textarea>
                <small className="form-text">
                  Mô tả chi tiết giúp người đọc hiểu rõ hơn về cuốn sách
                </small>
              </div>
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Đang thêm...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check"></i> Thêm sách
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
              >
                <i className="fas fa-redo"></i> Làm mới
              </button>
            </div>

            <div className="info-box">
              <i className="fas fa-info-circle"></i>
              <div>
                <strong>Lưu ý:</strong> Sách của bạn sẽ được gửi đến admin để kiểm duyệt. 
                Sau khi được phê duyệt, sách sẽ xuất hiện trong danh sách công khai.
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
