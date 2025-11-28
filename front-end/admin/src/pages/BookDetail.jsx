import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Layout/Sidebar';
import Topbar from '../components/Layout/Topbar';
import { getBook, approveBook, rejectBook } from '../api/books';

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    loadBookDetail();
  }, [id]);

  const loadBookDetail = async () => {
    try {
      setLoading(true);
      const res = await getBook(id);
      console.log('📖 Book detail response:', res);
      console.log('📖 Book data:', res?.book);
      console.log('📖 Success flag:', res?.success);
      
      if (res?.success && res?.book) {
        const bookData = res.book;
        console.log('✅ Setting book data:', bookData);
        setBook(bookData);
        setSelectedImage(bookData.cover_front_url || '/placeholder-book.jpg');
      } else {
        console.error('❌ Invalid response:', res);
        setError('Không tìm thấy sách');
      }
    } catch (e) {
      console.error('❌ Error loading book:', e);
      setError(e?.response?.data?.error || 'Không thể tải thông tin sách');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!window.confirm('Bạn có chắc muốn duyệt sách này?')) return;
    
    try {
      setApproving(true);
      await approveBook(id);
      alert('✅ Đã duyệt sách thành công! Ảnh đang được upload lên Cloudinary...');
      navigate('/admin/books');
    } catch (e) {
      console.error('Error approving book:', e);
      alert('❌ Lỗi khi duyệt: ' + (e.response?.data?.error || e.message));
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason || reason.trim() === '') {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setRejecting(true);
      await rejectBook(id, reason);
      alert('✅ Đã từ chối sách');
      navigate('/admin/books');
    } catch (e) {
      console.error('Error rejecting book:', e);
      alert('❌ Lỗi khi từ chối: ' + (e.response?.data?.error || e.message));
    } finally {
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Topbar />
          <main style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Đang tải...</span>
            </div>
            <p style={{ marginTop: '1rem' }}>Đang tải thông tin sách...</p>
          </main>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Topbar />
          <main style={{ padding: '2rem' }}>
            <div className="alert alert-danger">
              <i className="fas fa-exclamation-circle"></i> {error || 'Không tìm thấy sách'}
            </div>
            <button onClick={() => navigate('/admin/books')} className="btn btn-secondary">
              <i className="fas fa-arrow-left"></i> Quay lại
            </button>
          </main>
        </div>
      </div>
    );
  }

  const images = [
    book.cover_front_url,
    book.cover_inner_url,
    book.cover_back_url
  ].filter(Boolean);

  const authors = Array.isArray(book.authors) 
    ? book.authors.join(', ') 
    : book.authors || 'Chưa rõ tác giả';

  const getStatusBadge = (status) => {
    if (status === 'approved') return <span className="badge bg-success">Đã duyệt</span>;
    if (status === 'pending') return <span className="badge bg-warning">Chờ duyệt</span>;
    if (status === 'rejected') return <span className="badge bg-danger">Bị từ chối</span>;
    return <span className="badge bg-secondary">{status}</span>;
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ padding: '2rem', flex: 1 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <button onClick={() => navigate('/admin/books')} className="btn btn-link" style={{ padding: 0, marginBottom: '0.5rem' }}>
                <i className="fas fa-arrow-left"></i> Quay lại danh sách
              </button>
              <h2 style={{ margin: 0 }}>Chi tiết sách {getStatusBadge(book.approval_status)}</h2>
            </div>
            {book.approval_status === 'pending' && (
              <div>
                <button 
                  onClick={handleApprove} 
                  className="btn btn-success me-2"
                  disabled={approving}
                >
                  {approving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Đang duyệt...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check"></i> Duyệt sách
                    </>
                  )}
                </button>
                <button 
                  onClick={handleReject} 
                  className="btn btn-danger"
                  disabled={rejecting}
                >
                  {rejecting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Đang từ chối...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-times"></i> Từ chối
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="row">
            {/* Left: Images */}
            <div className="col-md-5">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-images"></i> Hình ảnh sách
                  </h5>
                  
                  {/* Main Image */}
                  <div style={{ 
                    backgroundColor: '#fafafa', 
                    borderRadius: '8px', 
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px'
                  }}>
                    <img 
                      src={selectedImage} 
                      alt={book.title}
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                      onError={(e) => {
                        e.target.src = '/placeholder-book.jpg';
                      }}
                    />
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {images.map((img, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedImage(img)}
                          style={{
                            width: '80px',
                            height: '80px',
                            border: selectedImage === img ? '2px solid #007bff' : '2px solid #dee2e6',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                        >
                          <img 
                            src={img} 
                            alt={`${book.title} - ${index + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = '/placeholder-book.jpg';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {images.length === 0 && (
                    <div className="alert alert-warning">
                      <i className="fas fa-exclamation-triangle"></i> Chưa có ảnh
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Information */}
            <div className="col-md-7">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title mb-3">
                    <i className="fas fa-info-circle"></i> Thông tin sách
                  </h5>

                  <table className="table table-borderless">
                    <tbody>
                      <tr>
                        <th style={{ width: '150px', color: '#6c757d' }}>Tiêu đề:</th>
                        <td><strong style={{ fontSize: '1.1rem' }}>{book.title}</strong></td>
                      </tr>
                      <tr>
                        <th style={{ color: '#6c757d' }}>Tác giả:</th>
                        <td>{authors}</td>
                      </tr>
                      {book.translator && (
                        <tr>
                          <th style={{ color: '#6c757d' }}>Người dịch:</th>
                          <td>{book.translator}</td>
                        </tr>
                      )}
                      <tr>
                        <th style={{ color: '#6c757d' }}>Nhà xuất bản:</th>
                        <td>{book.publisher || 'Chưa rõ'}</td>
                      </tr>
                      <tr>
                        <th style={{ color: '#6c757d' }}>Năm xuất bản:</th>
                        <td>{book.year_published || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th style={{ color: '#6c757d' }}>ISBN:</th>
                        <td><code>{book.isbn || 'N/A'}</code></td>
                      </tr>
                      <tr>
                        <th style={{ color: '#6c757d' }}>Trạng thái:</th>
                        <td>{getStatusBadge(book.approval_status)}</td>
                      </tr>
                      {book.creator_name && (
                        <tr>
                          <th style={{ color: '#6c757d' }}>Người đóng góp:</th>
                          <td>
                            <i className="fas fa-user"></i> {book.creator_name}
                            {book.creator_email && <small className="text-muted"> ({book.creator_email})</small>}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th style={{ color: '#6c757d' }}>Ngày tạo:</th>
                        <td>{new Date(book.created_at).toLocaleString('vi-VN')}</td>
                      </tr>
                      {book.updated_at && (
                        <tr>
                          <th style={{ color: '#6c757d' }}>Cập nhật:</th>
                          <td>{new Date(book.updated_at).toLocaleString('vi-VN')}</td>
                        </tr>
                      )}
                      {book.rejected_reason && (
                        <tr>
                          <th style={{ color: '#6c757d' }}>Lý do từ chối:</th>
                          <td>
                            <div className="alert alert-danger mb-0">
                              <i className="fas fa-times-circle"></i> {book.rejected_reason}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {book.description && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #dee2e6' }}>
                      <h6 style={{ marginBottom: '0.75rem', color: '#6c757d' }}>
                        <i className="fas fa-align-left"></i> Mô tả:
                      </h6>
                      <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{book.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
