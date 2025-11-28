import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './ReportUpdates.css';

const DeleteRequests = () => {
  const [formData, setFormData] = useState({
    bookTitle: '',
    bookId: '',
    reason: '',
    details: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.bookTitle || !formData.reason) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      // TODO: Call API to submit delete request
      console.log('Delete request:', formData);
      toast.success('Yêu cầu xóa đã được gửi!');
      
      // Reset form
      setFormData({
        bookTitle: '',
        bookId: '',
        reason: '',
        details: '',
      });
    } catch (error) {
      console.error('Error submitting delete request:', error);
      toast.error('Có lỗi xảy ra khi gửi yêu cầu!');
    }
  };

  const deleteReasons = [
    'Thông tin sai lệch hoàn toàn',
    'Sách trùng lặp',
    'Nội dung không phù hợp',
    'Vi phạm bản quyền',
    'Spam hoặc quảng cáo',
    'Khác (mô tả chi tiết bên dưới)'
  ];

  return (
    <div className="report-page">
      {/* Hero Section - Clean Minimal */}
      <div className="hero-section-minimal">
        <div className="hero-content-minimal">
          <i className="fas fa-trash-alt hero-icon-minimal"></i>
          <h1 className="hero-title-minimal">Yêu cầu xóa sách</h1>
          <p className="hero-subtitle-minimal">
            Gửi yêu cầu xóa sách có <strong>thông tin sai lệch</strong> hoặc không phù hợp
          </p>
        </div>
      </div>

      <div className="container">
        {/* Form Container - Clean Card */}
        <div className="form-container-minimal">
          <form onSubmit={handleSubmit} className="report-form">
            <div className="form-group">
              <label htmlFor="bookTitle">
                <i className="fas fa-book"></i>
                Tên sách <span className="required">*</span>
              </label>
              <input
                type="text"
                id="bookTitle"
                name="bookTitle"
                className="form-control"
                placeholder="Nhập tên sách cần xóa"
                value={formData.bookTitle}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="bookId">
                <i className="fas fa-barcode"></i>
                Mã sách (nếu có)
              </label>
              <input
                type="text"
                id="bookId"
                name="bookId"
                className="form-control"
                placeholder="Nhập mã sách (tùy chọn)"
                value={formData.bookId}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reason">
                <i className="fas fa-clipboard-list"></i>
                Lý do xóa <span className="required">*</span>
              </label>
              <select
                id="reason"
                name="reason"
                className="form-control"
                value={formData.reason}
                onChange={handleChange}
                required
              >
                <option value="">-- Chọn lý do --</option>
                {deleteReasons.map((reason, index) => (
                  <option key={index} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="details">
                <i className="fas fa-comment-dots"></i>
                Mô tả chi tiết <span className="required">*</span>
              </label>
              <textarea
                id="details"
                name="details"
                className="form-control"
                rows="5"
                placeholder="Mô tả chi tiết lý do cần xóa sách này. Cung cấp bằng chứng nếu có."
                value={formData.details}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-submit">
                <i className="fas fa-paper-plane"></i>
                Gửi yêu cầu xóa
              </button>
              <button type="button" className="btn btn-cancel" onClick={() => window.history.back()}>
                <i className="fas fa-times"></i>
                Hủy
              </button>
            </div>
          </form>
        </div>

        {/* Info Section - Below Form */}
        <div className="info-section-minimal">
          <div className="alert alert-info">
            <i className="fas fa-exclamation-triangle"></i>
            <span>
              <strong>Lưu ý:</strong> Yêu cầu xóa sách sẽ được xem xét kỹ lưỡng. 
              Vui lòng cung cấp lý do rõ ràng và chính xác.
            </span>
          </div>

          <div className="policy-grid-minimal">
            <div className="policy-header-minimal">
              <div className="policy-header-icon-minimal">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Chính sách</h3>
            </div>

            <div className="policy-cards-minimal">
              <div className="policy-card-minimal">
                <div className="policy-card-number-minimal">1</div>
                <div className="policy-card-content-minimal">
                  <strong>Thời gian xét duyệt</strong>
                  <p>Yêu cầu sẽ được xét duyệt trong vòng 24-48 giờ.</p>
                </div>
              </div>

              <div className="policy-card-minimal">
                <div className="policy-card-number-minimal">2</div>
                <div className="policy-card-content-minimal">
                  <strong>Bằng chứng rõ ràng</strong>
                  <p>Cần cung cấp đầy đủ chứng cứ và bản sao chứng thực.</p>
                </div>
              </div>

              <div className="policy-card-minimal">
                <div className="policy-card-number-minimal">3</div>
                <div className="policy-card-content-minimal">
                  <strong>Không lạm dụng</strong>
                  <p>Không lạm dụng yêu cầu để tránh gây tổn thất.</p>
                </div>
              </div>

              <div className="policy-card-minimal">
                <div className="policy-card-number-minimal">4</div>
                <div className="policy-card-content-minimal">
                  <strong>Yêu cầu hợp lệ</strong>
                  <p>Yêu cầu phải hợp lệ và tuân thủ chính sách.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="warning-box-minimal">
            <i className="fas fa-exclamation-circle"></i>
            <p>
              <strong>Cảnh báo:</strong> Lạm dụng tính năng báo cáo 
              có thể dẫn đến việc tài khoản bị khóa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteRequests;
