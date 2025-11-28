import React, { useState } from 'react';
import { toast } from 'react-toastify';
import './ReportUpdates.css';

const ReportUpdates = () => {
  const [formData, setFormData] = useState({
    bookTitle: '',
    bookId: '',
    currentInfo: '',
    suggestedUpdate: '',
    reason: '',
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
    if (!formData.bookTitle || !formData.suggestedUpdate || !formData.reason) {
      toast.error('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    try {
      // TODO: Call API to submit update request
      console.log('Update request:', formData);
      toast.success('Yêu cầu cập nhật đã được gửi!');
      
      // Reset form
      setFormData({
        bookTitle: '',
        bookId: '',
        currentInfo: '',
        suggestedUpdate: '',
        reason: '',
      });
    } catch (error) {
      console.error('Error submitting update request:', error);
      toast.error('Có lỗi xảy ra khi gửi yêu cầu!');
    }
  };

  return (
    <div className="report-page">
      {/* Hero Section - Clean Minimal */}
      <div className="hero-section-minimal">
        <div className="hero-content-minimal">
          <i className="fas fa-sync-alt hero-icon-minimal"></i>
          <h1 className="hero-title-minimal">Yêu cầu cập nhật thông tin sách</h1>
          <p className="hero-subtitle-minimal">
            Giúp chúng tôi cập nhật thông tin <strong>chính xác hơn</strong> về sách
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
                placeholder="Nhập tên sách cần cập nhật"
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
              <label htmlFor="currentInfo">
                <i className="fas fa-info-circle"></i>
                Thông tin hiện tại
              </label>
              <textarea
                id="currentInfo"
                name="currentInfo"
                className="form-control"
                rows="3"
                placeholder="Thông tin hiện tại của sách (nếu có)"
                value={formData.currentInfo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="suggestedUpdate">
                <i className="fas fa-edit"></i>
                Thông tin cần cập nhật <span className="required">*</span>
              </label>
              <textarea
                id="suggestedUpdate"
                name="suggestedUpdate"
                className="form-control"
                rows="4"
                placeholder="Mô tả thông tin cần cập nhật (tác giả, nhà xuất bản, năm xuất bản, v.v.)"
                value={formData.suggestedUpdate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reason">
                <i className="fas fa-comment-dots"></i>
                Lý do cập nhật <span className="required">*</span>
              </label>
              <textarea
                id="reason"
                name="reason"
                className="form-control"
                rows="3"
                placeholder="Giải thích lý do cần cập nhật thông tin này"
                value={formData.reason}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-submit">
                <i className="fas fa-paper-plane"></i>
                Gửi yêu cầu
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
            <i className="fas fa-info-circle"></i>
            <span>
              <strong>Lưu ý:</strong> Yêu cầu cập nhật sẽ được xem xét kỹ lưỡng. 
              Vui lòng cung cấp thông tin chính xác và đầy đủ.
            </span>
          </div>

          <div className="policy-grid-minimal">
            <div className="policy-header-minimal">
              <div className="policy-header-icon-minimal">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3>Hướng dẫn</h3>
            </div>

            <div className="policy-cards-minimal">
              <div className="policy-card-minimal">
                <div className="policy-card-number-minimal">1</div>
                <div className="policy-card-content-minimal">
                  <strong>Thông tin chính xác</strong>
                  <p>Cung cấp thông tin chính xác về sách cần cập nhật.</p>
                </div>
              </div>

              <div className="policy-card-minimal">
                <div className="policy-card-number-minimal">2</div>
                <div className="policy-card-content-minimal">
                  <strong>Mô tả rõ ràng</strong>
                  <p>Mô tả rõ ràng thông tin nào cần thay đổi.</p>
                </div>
              </div>

              <div className="policy-card-minimal">
                <div className="policy-card-number-minimal">3</div>
                <div className="policy-card-content-minimal">
                  <strong>Giải thích lý do</strong>
                  <p>Giải thích lý do để xem xét nhanh hơn.</p>
                </div>
              </div>

              <div className="policy-card-minimal">
                <div className="policy-card-number-minimal">4</div>
                <div className="policy-card-content-minimal">
                  <strong>Thời gian xử lý</strong>
                  <p>Yêu cầu sẽ được xem xét trong 24-48 giờ.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="warning-box-minimal">
            <i className="fas fa-check-circle"></i>
            <p>
              <strong>Thông tin:</strong> Mọi yêu cầu cập nhật đều được ghi nhận 
              và xem xét cẩn thận để đảm bảo tính chính xác của dữ liệu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportUpdates;
