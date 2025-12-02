import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchBookByImage } from '../api/ocr';
import BookCard from '../components/BookCard';
import { toast } from 'react-toastify';
import './OCRBookSearch.css';

const OCRBookSearch = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [ocrData, setOcrData] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Reset previous results
    setSearchResults(null);
    setOcrData(null);
  };

  const handleSearch = async () => {
    if (!selectedImage) {
      toast.error('Please select a book cover image');
      return;
    }

    try {
      setSearching(true);
      toast.info('Processing image with OCR...', { autoClose: 2000 });

      const response = await searchBookByImage(selectedImage);

      console.log('[OCR Frontend] Full response:', response);
      console.log('[OCR Frontend] Results:', response.data?.results);
      console.log('[OCR Frontend] Books:', response.data?.books);

      if (response.success) {
        const books = response.data.books || response.data.results || [];
        setSearchResults(books);
        setOcrData({
          rawText: response.data.ocr?.raw_text,
          confidence: response.data.ocr?.confidence,
          extracted: response.data.extracted
        });

        if (books.length === 0) {
          toast.warning('No books found matching this cover');
        } else {
          toast.success(`Found ${books.length} matching book(s)!`);
        }
      } else {
        toast.error('Search failed: ' + response.message);
      }
    } catch (error) {
      console.error('OCR search error:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to search. Please try again.'
      );
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setSearchResults(null);
    setOcrData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="ocr-search-page">
      <div className="container">
        {/* Hero Section - Centered */}
        <div className="hero-section-minimal">
          <div className="hero-content-minimal">
            <i className="fas fa-camera hero-icon-minimal"></i>
            <h1 className="hero-title-minimal">Tìm Sách Bằng Hình Ảnh</h1>
            <p className="hero-subtitle-minimal">
              Chụp hoặc tải lên ảnh bìa sách để tìm trong thư viện
            </p>
          </div>
        </div>

        <div className="ocr-search-container">
          {/* Upload Section */}
          <div className="upload-section">
            <div className="upload-card">
              <h3><i className="fas fa-upload"></i> Tải Ảnh Bìa Sách</h3>
              
              <div className="upload-area">
                {imagePreview ? (
                  <div className="preview-container">
                    <img src={imagePreview} alt="Book cover preview" />
                    <button 
                      className="btn-remove-preview" 
                      onClick={handleReset}
                      title="Remove image"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{ display: 'none' }}
                    />
                    <div className="upload-placeholder">
                      <i className="fas fa-image"></i>
                      <p>Nhấn để chọn ảnh hoặc kéo thả vào đây</p>
                      <small>Hỗ trợ: JPG, PNG, WebP (Tối đa 10MB)</small>
                    </div>
                  </label>
                )}
              </div>

              <div className="upload-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSearch}
                  disabled={!selectedImage || searching}
                >
                  {searching ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Đang tìm kiếm...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-search"></i> Tìm Sách
                    </>
                  )}
                </button>
                
                {selectedImage && !searching && (
                  <button className="btn btn-secondary" onClick={handleReset}>
                    <i className="fas fa-redo"></i> Làm Mới
                  </button>
                )}
              </div>
            </div>

            {/* OCR Info */}
            {ocrData && (
              <div className="ocr-info-card">
                <h4><i className="fas fa-robot"></i> Thông Tin Nhận Diện</h4>
                
                <div className="ocr-details">
                  <div className="ocr-item">
                    <label>Tên sách:</label>
                    <span>{ocrData.extracted?.title || 'Không xác định'}</span>
                  </div>
                  <div className="ocr-item">
                    <label>Tác giả:</label>
                    <span>{ocrData.extracted?.author || 'Không xác định'}</span>
                  </div>
                  {ocrData.extracted?.alternative_title && (
                    <div className="ocr-item">
                      <label>Tên phụ:</label>
                      <span>{ocrData.extracted.alternative_title}</span>
                    </div>
                  )}
                  <div className="ocr-item">
                    <label>Độ chính xác:</label>
                    <span className="confidence-badge">
                      {Math.round((ocrData.extracted?.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>

                <details className="ocr-raw-text">
                  <summary>Xem văn bản OCR gốc</summary>
                  <pre>{ocrData.rawText}</pre>
                </details>
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="results-section">
            {searching && (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin fa-3x"></i>
                <p>Đang xử lý ảnh với AI...</p>
                <small>Quá trình này có thể mất vài giây</small>
              </div>
            )}

            {!searching && searchResults && (
              <div className="results-container">
                <div className="results-header">
                  <h3>
                    <i className="fas fa-book"></i> Kết Quả Tìm Kiếm ({searchResults.length})
                  </h3>
                </div>

                {searchResults.length === 0 ? (
                  <div className="empty-results">
                    <i className="fas fa-inbox fa-3x"></i>
                    <p>Không tìm thấy sách phù hợp</p>
                    <small>Thử tải lên ảnh rõ hơn hoặc bìa sách khác</small>
                  </div>
                ) : (
                  <div className="books-grid">
                    {searchResults.map((book) => (
                      <div key={book._id} className="book-grid-item">
                        {book.matchScore && (
                          <div className="match-badge-overlay">
                            {book.matchScore}% Trùng khớp
                          </div>
                        )}
                        <BookCard book={book} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!searching && !searchResults && (
              <div className="placeholder-state">
                <i className="fas fa-search fa-3x"></i>
                <p>Tải lên ảnh bìa sách để bắt đầu tìm kiếm</p>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="help-section">
          <h3><i className="fas fa-question-circle"></i> Cách Sử Dụng</h3>
          <div className="help-steps">
            <div className="help-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Chụp hoặc Tải Ảnh</h4>
                <p>Chụp ảnh bìa sách rõ nét hoặc tải lên ảnh có sẵn</p>
              </div>
            </div>
            <div className="help-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>AI Xử Lý</h4>
                <p>AI đọc văn bản trên bìa sách và trích xuất thông tin</p>
              </div>
            </div>
            <div className="help-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Xem Kết Quả</h4>
                <p>Duyệt qua các sách phù hợp và xem chi tiết</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRBookSearch;
