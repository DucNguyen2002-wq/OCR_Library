import { useState, useRef } from 'react';
import { uploadAndScanBookCovers } from '../api/ocr';
import './BookCoverUploader.css';

const BookCoverUploader = ({ onDataExtracted, onClose }) => {
  const [covers, setCovers] = useState({
    spine: null,    // Thay front → spine
    inside: null,
    back: null
  });

  const [previews, setPreviews] = useState({
    spine: null,    // Thay front → spine
    inside: null,
    back: null
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const fileInputRefs = {
    spine: useRef(null),    // Thay front → spine
    inside: useRef(null),
    back: useRef(null)
  };

  const coverLabels = {
    spine: 'Gáy sách',      // Thay "Bìa trước" → "Gáy sách"
    inside: 'Bìa trong',
    back: 'Bìa sau'
  };

  const coverDescriptions = {
    spine: 'Tên sách + tác giả',    // Thay mô tả
    inside: 'ISBN, NXB, năm xuất bản',
    back: 'Tóm tắt nội dung'
  };

  const handleFileSelect = (coverType, file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn file ảnh (JPG, PNG, ...)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 10MB');
      return;
    }

    setError('');
    setCovers(prev => ({ ...prev, [coverType]: file }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({ ...prev, [coverType]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e, coverType) => {
    e.preventDefault();
    setDragOver(coverType);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e, coverType) => {
    e.preventDefault();
    setDragOver(null);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(coverType, file);
  };

  const handleFileInputChange = (coverType, e) => {
    const file = e.target.files[0];
    handleFileSelect(coverType, file);
  };

  const handleRemoveImage = (coverType) => {
    setCovers(prev => ({ ...prev, [coverType]: null }));
    setPreviews(prev => ({ ...prev, [coverType]: null }));
    if (fileInputRefs[coverType].current) {
      fileInputRefs[coverType].current.value = '';
    }
  };

  const handleScan = async () => {
    // Check if at least one cover is uploaded
    if (!covers.spine && !covers.inside && !covers.back) {
      setError('Vui lòng tải lên ít nhất 1 ảnh bìa sách');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use combined upload + scan workflow
      const result = await uploadAndScanBookCovers(covers);
      
      if (result.success) {
        setExtractedData(result);
        
        // Auto-fill form if callback is provided
        if (onDataExtracted) {
          onDataExtracted(result.bookData);
        }
      } else {
        setError(result.message || 'Quét bìa sách thất bại');
      }
    } catch (err) {
      console.error('Scan error:', err);
      setError(err.message || 'Có lỗi xảy ra khi quét bìa sách. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseData = () => {
    if (extractedData && onDataExtracted) {
      onDataExtracted(extractedData.bookData);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleReset = () => {
    setCovers({ spine: null, inside: null, back: null });
    setPreviews({ spine: null, inside: null, back: null });
    setExtractedData(null);
    setError('');
    Object.values(fileInputRefs).forEach(ref => {
      if (ref.current) ref.current.value = '';
    });
  };

  return (
    <div className="book-cover-uploader">
      <div className="uploader-header">
        <h2>📸 Quét bìa sách tự động</h2>
        <p className="uploader-subtitle">
          Tải lên ảnh bìa sách để tự động trích xuất thông tin
        </p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="upload-grid">
        {Object.keys(covers).map(coverType => (
          <div key={coverType} className="upload-box-wrapper">
            <label className="cover-label">
              {coverLabels[coverType]}
              <span className="cover-hint">{coverDescriptions[coverType]}</span>
            </label>
            
            <div
              className={`upload-box ${dragOver === coverType ? 'drag-over' : ''} ${
                previews[coverType] ? 'has-image' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, coverType)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, coverType)}
              onClick={() => !previews[coverType] && fileInputRefs[coverType].current?.click()}
            >
              {previews[coverType] ? (
                <div className="image-preview">
                  <img src={previews[coverType]} alt={coverLabels[coverType]} />
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(coverType);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">📷</span>
                  <p>Kéo thả ảnh vào đây</p>
                  <p className="upload-hint">hoặc click để chọn file</p>
                </div>
              )}
              
              <input
                ref={fileInputRefs[coverType]}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileInputChange(coverType, e)}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        ))}
      </div>

      {extractedData && (
        <div className="extracted-data-box">
          <h3>📄 Dữ liệu đã trích xuất</h3>
          
          {/* Hiển thị ảnh đã upload */}
          {extractedData.bookData.coverImages && (
            <div className="uploaded-covers-preview">
              {extractedData.bookData.coverImages.spine && (
                <div className="uploaded-cover-item">
                  <label>Gáy sách</label>
                  <img 
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${extractedData.bookData.coverImages.spine}`} 
                    alt="Gáy sách" 
                  />
                </div>
              )}
              {extractedData.bookData.coverImages.inside && (
                <div className="uploaded-cover-item">
                  <label>Bìa trong</label>
                  <img 
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${extractedData.bookData.coverImages.inside}`} 
                    alt="Bìa trong" 
                  />
                </div>
              )}
              {extractedData.bookData.coverImages.back && (
                <div className="uploaded-cover-item">
                  <label>Bìa sau</label>
                  <img 
                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${extractedData.bookData.coverImages.back}`} 
                    alt="Bìa sau" 
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="data-grid">
            {extractedData.bookData.title && (
              <div className="data-item">
                <strong>Tên sách:</strong>
                <span>{extractedData.bookData.title}</span>
                {extractedData.bookData.confidence?.title && (
                  <span className="confidence-badge">
                    {(extractedData.bookData.confidence.title * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            )}
            
            {extractedData.bookData.author && extractedData.bookData.author.length > 0 && (
              <div className="data-item">
                <strong>Tác giả:</strong>
                <span>{extractedData.bookData.author.join(', ')}</span>
              </div>
            )}
            
            {extractedData.bookData.publisher && (
              <div className="data-item">
                <strong>Nhà xuất bản:</strong>
                <span>{extractedData.bookData.publisher}</span>
              </div>
            )}
            
            {extractedData.bookData.year_published && (
              <div className="data-item">
                <strong>Năm xuất bản:</strong>
                <span>{extractedData.bookData.year_published}</span>
              </div>
            )}
            
            {extractedData.bookData.isbn && (
              <div className="data-item">
                <strong>ISBN:</strong>
                <span>{extractedData.bookData.isbn}</span>
              </div>
            )}
            
            {extractedData.bookData.description && (
              <div className="data-item full-width">
                <strong>Mô tả:</strong>
                <p className="description-text">{extractedData.bookData.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="uploader-actions">
        {extractedData ? (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleReset}
            >
              🔄 Quét lại
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleUseData}
            >
              ✅ Sử dụng dữ liệu này
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleScan}
              disabled={loading || (!covers.spine && !covers.inside && !covers.back)}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Đang quét...
                </>
              ) : (
                '🔍 Quét bìa sách'
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BookCoverUploader;
