import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBook, deleteBook } from '../api/books';
import { toast } from 'react-toastify';
import './BookDetail.css';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        console.log('🔍 Fetching book with id:', id);
        const res = await getBook(id);
        console.log('📖 Full response:', res);
        console.log('📖 Response data:', res.data);
        console.log('📖 Response success:', res.data?.success);
        console.log('📖 Response book:', res.data?.book);
        
        if (res.data?.success && res.data?.book) {
          setBook(res.data.book);
          setSelectedImage(res.data.book.cover_front_url || '/placeholder-book.jpg');
        } else {
          console.error('❌ Invalid response structure:', res.data);
          setError(res.data?.error || 'Không tìm thấy sách');
        }
      } catch (e) {
        console.error('❌ Error fetching book:', e);
        console.error('❌ Error response:', e?.response);
        setError(e?.response?.data?.error || 'Không tìm thấy sách');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa sách này?')) return;
    try {
      await deleteBook(id);
      toast.success('Đã xóa sách thành công!');
      navigate('/books');
    } catch (e) {
      toast.error(e?.response?.data?.error || 'Không thể xóa sách');
    }
  };

  if (loading) {
    return (
      <div className="book-detail-page">
        <div className="container">
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Đang tải...</span>
            </div>
            <p>Đang tải thông tin sách...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-detail-page">
        <div className="container">
          <div className="error-container">
            <div className="error-icon">
              <i className="fas fa-exclamation-circle"></i>
            </div>
            <h3>{error}</h3>
            <Link to="/books" className="btn btn-primary">
              <i className="fas fa-arrow-left"></i> Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const images = [
    book.cover_front_url,
    book.cover_inner_url,
    book.cover_back_url
  ].filter(Boolean);

  const authors = Array.isArray(book.authors) 
    ? book.authors.join(', ') 
    : book.authors || 'Chưa rõ tác giả';

  return (
    <div className="book-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/"><i className="fas fa-home"></i> Trang chủ</Link>
          <span className="separator">/</span>
          <Link to="/books">Danh sách sách</Link>
          <span className="separator">/</span>
          <span className="current">{book.title}</span>
        </nav>

        {/* Book Detail Content */}
        <div className="book-detail-container">
          {/* Left: Images */}
          <div className="book-images">
            <div className="main-image">
              <img src={selectedImage} alt={book.title} />
            </div>
            {images.length > 1 && (
              <div className="image-thumbnails">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail ${selectedImage === img ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`${book.title} - ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="book-info-section">
            <h1 className="book-title">{book.title}</h1>

            <div className="book-rating">
              <div className="stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <span className="rating-text">5.0</span>
            </div>

            <div className="book-meta-info">
              <div className="meta-row">
                <span className="meta-label">Tác giả</span>
                <span className="meta-value">{authors}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Nhà xuất bản</span>
                <span className="meta-value">{book.publisher || 'Chưa rõ NXB'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Năm xuất bản</span>
                <span className="meta-value">{book.year_published || 'N/A'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">ISBN</span>
                <span className="meta-value">{book.isbn || 'N/A'}</span>
              </div>
              <div className="meta-row">
                <span className="meta-label">Trạng thái</span>
                <span className={`status-badge ${book.approval_status}`}>
                  {book.approval_status === 'approved' ? 'Đã duyệt' : 
                   book.approval_status === 'pending' ? 'Chờ duyệt' : 'Bị từ chối'}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="book-actions">
              <Link to={`/edit-book/${id}`} className="btn btn-primary">
                <i className="fas fa-edit"></i> Chỉnh sửa
              </Link>
              <button onClick={handleDelete} className="btn btn-danger">
                <i className="fas fa-trash"></i> Xóa
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        {book.description && (
          <div className="book-description-section">
            <h2 className="section-title">
              <i className="fas fa-info-circle"></i> Mô tả sản phẩm
            </h2>
            <div className="description-content">
              <p>{book.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
