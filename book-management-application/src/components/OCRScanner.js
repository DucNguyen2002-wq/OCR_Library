import React, { useState, useRef, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import './OCRScanner.css';

const OCRScanner = ({ onDataExtracted }) => {
  const [image, setImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [stream, setStream] = useState(null);
  
  // Crop box states
  const [cropBox, setCropBox] = useState({
    x: 50,
    y: 100,
    width: 300,
    height: 200
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setExtractedText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setExtractedText('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Camera functions
  const startCamera = async () => {
    setIsCameraLoading(true);
    
    try {
      // Try with environment camera first (back camera on mobile)
      let constraints = {
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      let mediaStream;
      
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // If environment camera fails, try with any available camera
        console.log('Fallback to any camera');
        constraints = {
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      if (!mediaStream) {
        throw new Error('Không thể khởi tạo camera stream');
      }

      console.log('Camera stream obtained:', mediaStream.getVideoTracks());
      
      setStream(mediaStream);
      
      // Wait for next tick to ensure state is updated
      setTimeout(() => {
        if (videoRef.current && mediaStream) {
          console.log('Setting video srcObject');
          videoRef.current.srcObject = mediaStream;
          
          // Add event listener to play when metadata is loaded
          videoRef.current.onloadedmetadata = () => {
            console.log('Video metadata loaded');
            videoRef.current.play()
              .then(() => {
                console.log('Video playing successfully');
                setIsCameraOpen(true);
                setIsCameraLoading(false);
              })
              .catch(err => {
                console.error('Error playing video:', err);
                setIsCameraLoading(false);
                alert('Lỗi khi phát video: ' + err.message);
              });
          };

          // Add error handler
          videoRef.current.onerror = (err) => {
            console.error('Video element error:', err);
            setIsCameraLoading(false);
          };
        } else {
          console.error('videoRef.current not available');
          setIsCameraLoading(false);
        }
      }, 100);
      
    } catch (error) {
      console.error('Camera Error:', error);
      setIsCameraLoading(false);
      
      let errorMessage = 'Không thể truy cập camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Vui lòng cho phép quyền truy cập camera trong cài đặt trình duyệt.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'Không tìm thấy camera trên thiết bị.';
      } else if (error.name === 'NotReadableError') {
        errorMessage += 'Camera đang được sử dụng bởi ứng dụng khác.';
      } else {
        errorMessage += 'Lỗi: ' + error.message;
      }
      
      alert(errorMessage);
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      // Get container dimensions
      const containerRect = container.getBoundingClientRect();
      const videoRect = video.getBoundingClientRect();
      
      // Calculate scale factors
      const scaleX = video.videoWidth / videoRect.width;
      const scaleY = video.videoHeight / videoRect.height;
      
      // Calculate crop box position relative to video
      const cropX = cropBox.x * scaleX;
      const cropY = cropBox.y * scaleY;
      const cropWidth = cropBox.width * scaleX;
      const cropHeight = cropBox.height * scaleY;
      
      // Set canvas size to crop box size
      canvas.width = cropWidth;
      canvas.height = cropHeight;
      
      const context = canvas.getContext('2d');
      
      // Draw cropped portion
      context.drawImage(
        video,
        cropX, cropY, cropWidth, cropHeight,  // Source rectangle
        0, 0, cropWidth, cropHeight            // Destination rectangle
      );
      
      const imageData = canvas.toDataURL('image/jpeg', 0.95);
      setImage(imageData);
      setExtractedText('');
      stopCamera();
    }
  };

  // Crop box mouse handlers
  const handleCropMouseDown = (e, handle = null) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (handle) {
      setIsResizing(true);
      setResizeHandle(handle);
    } else {
      setIsDragging(true);
    }
    
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      boxX: cropBox.x,
      boxY: cropBox.y,
      boxWidth: cropBox.width,
      boxHeight: cropBox.height
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    if (isDragging) {
      // Move the crop box
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      
      let newX = dragStart.boxX + deltaX;
      let newY = dragStart.boxY + deltaY;
      
      // Constrain to container bounds
      newX = Math.max(0, Math.min(newX, containerRect.width - cropBox.width));
      newY = Math.max(0, Math.min(newY, containerRect.height - cropBox.height));
      
      setCropBox(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    } else if (isResizing) {
      // Resize the crop box
      const container = containerRef.current;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      let newBox = { ...cropBox };
      
      switch (resizeHandle) {
        case 'nw': // Top-left
          newBox.x = Math.max(0, dragStart.boxX + deltaX);
          newBox.y = Math.max(0, dragStart.boxY + deltaY);
          newBox.width = dragStart.boxWidth - deltaX;
          newBox.height = dragStart.boxHeight - deltaY;
          break;
        case 'ne': // Top-right
          newBox.y = Math.max(0, dragStart.boxY + deltaY);
          newBox.width = dragStart.boxWidth + deltaX;
          newBox.height = dragStart.boxHeight - deltaY;
          break;
        case 'sw': // Bottom-left
          newBox.x = Math.max(0, dragStart.boxX + deltaX);
          newBox.width = dragStart.boxWidth - deltaX;
          newBox.height = dragStart.boxHeight + deltaY;
          break;
        case 'se': // Bottom-right
          newBox.width = dragStart.boxWidth + deltaX;
          newBox.height = dragStart.boxHeight + deltaY;
          break;
        case 'n': // Top
          newBox.y = Math.max(0, dragStart.boxY + deltaY);
          newBox.height = dragStart.boxHeight - deltaY;
          break;
        case 's': // Bottom
          newBox.height = dragStart.boxHeight + deltaY;
          break;
        case 'w': // Left
          newBox.x = Math.max(0, dragStart.boxX + deltaX);
          newBox.width = dragStart.boxWidth - deltaX;
          break;
        case 'e': // Right
          newBox.width = dragStart.boxWidth + deltaX;
          break;
        default:
          break;
      }
      
      // Apply minimum size constraints
      newBox.width = Math.max(100, newBox.width);
      newBox.height = Math.max(100, newBox.height);
      
      // Constrain to container bounds
      if (newBox.x + newBox.width > containerRect.width) {
        newBox.width = containerRect.width - newBox.x;
      }
      if (newBox.y + newBox.height > containerRect.height) {
        newBox.height = containerRect.height - newBox.y;
      }
      
      setCropBox(newBox);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  // Add global mouse listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, cropBox]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const processImage = async () => {
    if (!image) {
      alert('Vui lòng chọn hình ảnh trước!');
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(
        image,
        'vie+eng', // Vietnamese and English
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text;
      setExtractedText(text);
      
      // Try to parse book information from text
      const bookData = parseBookInfo(text);
      
      if (Object.keys(bookData).length > 0) {
        alert('Đã trích xuất thông tin thành công! Nhấn "Sử dụng dữ liệu" để thêm sách.');
      }
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Lỗi khi xử lý hình ảnh. Vui lòng thử lại!');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const parseBookInfo = (text) => {
    const bookData = {};
    const lines = text.split('\n').filter(line => line.trim());

    // Simple parsing logic - can be improved
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      
      // Try to extract title (usually first few lines)
      if (index < 3 && !bookData.title && line.length > 3) {
        bookData.title = line.trim();
      }

      // Extract author
      if (lowerLine.includes('author') || lowerLine.includes('tác giả') || lowerLine.includes('by')) {
        bookData.author = line.replace(/author|tác giả|by/gi, '').replace(/[:]/g, '').trim();
      }

      // Extract ISBN
      const isbnMatch = line.match(/isbn[:\s]*([0-9-]+)/i);
      if (isbnMatch) {
        bookData.isbn = isbnMatch[1].trim();
      }

      // Extract year
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      if (yearMatch && !bookData.publishYear) {
        bookData.publishYear = yearMatch[0];
      }

      // Extract publisher
      if (lowerLine.includes('publisher') || lowerLine.includes('nhà xuất bản') || lowerLine.includes('nxb')) {
        bookData.publisher = line.replace(/publisher|nhà xuất bản|nxb/gi, '').replace(/[:]/g, '').trim();
      }
    });

    return bookData;
  };

  const handleUseData = () => {
    const bookData = parseBookInfo(extractedText);
    
    if (Object.keys(bookData).length === 0) {
      alert('Không tìm thấy thông tin sách. Vui lòng nhập thủ công.');
      return;
    }

    onDataExtracted({
      title: bookData.title || '',
      author: bookData.author || '',
      isbn: bookData.isbn || '',
      category: '',
      publishYear: bookData.publishYear || '',
      publisher: bookData.publisher || '',
      description: extractedText
    });
  };

  const handleReset = () => {
    setImage(null);
    setExtractedText('');
    setProgress(0);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="ocr-scanner">
      <div className="ocr-header">
        <h2>📷 Quét Thông Tin Sách Bằng OCR</h2>
        <p>Tải lên hình ảnh, sử dụng camera hoặc kéo thả để tự động trích xuất dữ liệu</p>
      </div>

      {/* Camera Mode with Crop Box */}
      {(isCameraOpen || isCameraLoading) && (
        <div className="camera-container" ref={containerRef}>
          {isCameraLoading && (
            <div className="camera-loading">
              <div className="loading-spinner"></div>
              <p>Đang mở camera...</p>
            </div>
          )}
          <video 
            ref={videoRef} 
            className="camera-preview" 
            autoPlay 
            playsInline 
            muted
            style={{ display: isCameraLoading ? 'none' : 'block' }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Google Lens Style Crop Box */}
          {!isCameraLoading && (
            <>
              <div className="crop-overlay"></div>
              <div 
                className="crop-box"
                style={{
                  left: `${cropBox.x}px`,
                  top: `${cropBox.y}px`,
                  width: `${cropBox.width}px`,
                  height: `${cropBox.height}px`
                }}
                onMouseDown={(e) => handleCropMouseDown(e)}
              >
                {/* Corner Handles */}
                <div className="resize-handle nw" onMouseDown={(e) => handleCropMouseDown(e, 'nw')}></div>
                <div className="resize-handle ne" onMouseDown={(e) => handleCropMouseDown(e, 'ne')}></div>
                <div className="resize-handle sw" onMouseDown={(e) => handleCropMouseDown(e, 'sw')}></div>
                <div className="resize-handle se" onMouseDown={(e) => handleCropMouseDown(e, 'se')}></div>
                
                {/* Edge Handles */}
                <div className="resize-handle n" onMouseDown={(e) => handleCropMouseDown(e, 'n')}></div>
                <div className="resize-handle s" onMouseDown={(e) => handleCropMouseDown(e, 's')}></div>
                <div className="resize-handle w" onMouseDown={(e) => handleCropMouseDown(e, 'w')}></div>
                <div className="resize-handle e" onMouseDown={(e) => handleCropMouseDown(e, 'e')}></div>
                
                {/* Crop Box Label */}
                <div className="crop-label">
                  <span>📏 Kéo để điều chỉnh vùng quét</span>
                </div>
              </div>
              
              <div className="camera-controls">
                <button onClick={capturePhoto} className="btn-capture">
                  📸 Chụp Vùng Đã Chọn
                </button>
                <button onClick={stopCamera} className="btn-close-camera">
                  ❌ Đóng Camera
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Upload Area - Hidden when camera is open */}
      {!isCameraOpen && !isCameraLoading && (
        <>
          <div className="input-mode-buttons">
            <button 
              onClick={startCamera}
              className="btn-camera"
              disabled={!!image}
            >
              📷 Mở Camera
            </button>
            <span className="mode-divider">hoặc</span>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="btn-upload"
              disabled={!!image}
            >
              📁 Chọn Từ Thiết Bị
            </button>
          </div>

          <div 
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !image && fileInputRef.current?.click()}
          >
            {!image ? (
              <>
                <div className="upload-icon">📤</div>
                <p className="upload-text">Kéo thả hình ảnh vào đây</p>
                <p className="upload-hint">Hỗ trợ: JPG, PNG, GIF</p>
              </>
            ) : (
              <img src={image} alt="Preview" className="preview-image" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
        </>
      )}

      {image && (
        <div className="ocr-actions">
          <button 
            onClick={processImage} 
            disabled={isProcessing}
            className="btn-process"
          >
            {isProcessing ? '⏳ Đang xử lý...' : '🔍 Quét & Trích Xuất'}
          </button>
          <button 
            onClick={handleReset}
            disabled={isProcessing}
            className="btn-reset"
          >
            🔄 Chọn Ảnh Khác
          </button>
        </div>
      )}

      {isProcessing && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="progress-text">{progress}% hoàn thành</p>
        </div>
      )}

      {extractedText && (
        <div className="result-container">
          <h3>📝 Văn Bản Trích Xuất:</h3>
          <div className="extracted-text">
            {extractedText}
          </div>
          <button 
            onClick={handleUseData}
            className="btn-use-data"
          >
            ✅ Sử Dụng Dữ Liệu Này
          </button>
        </div>
      )}

      <div className="ocr-tips">
        <h4>💡 Mẹo để có kết quả tốt nhất:</h4>
        <ul>
          <li><strong>📷 Sử dụng Camera:</strong> Nhấn "Mở Camera" để chụp ảnh trực tiếp từ thiết bị</li>
          <li><strong>📁 Upload File:</strong> Chọn ảnh từ thư viện hoặc kéo thả vào vùng upload</li>
          <li>Sử dụng hình ảnh có độ phân giải cao và rõ nét</li>
          <li>Đảm bảo văn bản trong ảnh không bị che khuất</li>
          <li>Ánh sáng tốt và góc chụp thẳng sẽ cho kết quả chính xác hơn</li>
          <li>Camera sẽ tự động sử dụng camera sau (nếu có) để chụp tốt hơn</li>
          <li>Hỗ trợ nhận dạng tiếng Việt và tiếng Anh</li>
        </ul>
      </div>
    </div>
  );
};

export default OCRScanner;
