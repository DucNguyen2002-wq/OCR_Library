import React from 'react';
import './ExportImport.css';

const ExportImport = ({ books, onImport }) => {
  
  // Export to JSON
  const exportToJSON = () => {
    const dataStr = JSON.stringify(books, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `books-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Title', 'Author', 'ISBN', 'Category', 'Publisher', 'Year', 'Language', 'Pages', 'Rating', 'Reading Status', 'Description'];
    const csvRows = [headers.join(',')];

    books.forEach(book => {
      const row = [
        book.id,
        `"${book.title}"`,
        `"${book.author}"`,
        book.isbn,
        book.category,
        book.publisher,
        book.publishYear,
        book.language || 'N/A',
        book.pages || 'N/A',
        book.rating || 0,
        book.readingStatus || 'toRead',
        `"${(book.description || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvStr = csvRows.join('\n');
    const dataBlob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `books-backup-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import from JSON
  const importFromJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedBooks = JSON.parse(e.target.result);
        if (Array.isArray(importedBooks)) {
          if (window.confirm(`Bạn có muốn nhập ${importedBooks.length} cuốn sách? Dữ liệu hiện tại sẽ bị ghi đè.`)) {
            onImport(importedBooks);
            alert('Nhập dữ liệu thành công!');
          }
        } else {
          alert('File JSON không hợp lệ!');
        }
      } catch (error) {
        alert('Lỗi khi đọc file JSON: ' + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Import from CSV
  const importFromCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',');
        
        const importedBooks = lines.slice(1).map(line => {
          // Simple CSV parser (handles quoted values)
          const values = [];
          let current = '';
          let inQuotes = false;
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          values.push(current.trim());

          return {
            id: parseInt(values[0]) || Date.now() + Math.random(),
            title: values[1]?.replace(/^"|"$/g, '') || 'Unknown',
            author: values[2]?.replace(/^"|"$/g, '') || 'Unknown',
            isbn: values[3] || '',
            category: values[4] || 'Uncategorized',
            publisher: values[5] || 'Unknown',
            publishYear: parseInt(values[6]) || new Date().getFullYear(),
            language: values[7] || 'N/A',
            pages: parseInt(values[8]) || 0,
            rating: parseFloat(values[9]) || 0,
            readingStatus: values[10] || 'toRead',
            description: values[11]?.replace(/^"|"$/g, '').replace(/""/g, '"') || '',
            createdAt: new Date().toISOString()
          };
        });

        if (window.confirm(`Bạn có muốn nhập ${importedBooks.length} cuốn sách? Dữ liệu hiện tại sẽ bị ghi đè.`)) {
          onImport(importedBooks);
          alert('Nhập dữ liệu thành công!');
        }
      } catch (error) {
        alert('Lỗi khi đọc file CSV: ' + error.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Clear all data
  const clearAllData = () => {
    if (window.confirm('⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa TẤT CẢ dữ liệu? Hành động này không thể hoàn tác!')) {
      if (window.confirm('Xác nhận lần cuối: Xóa tất cả ' + books.length + ' cuốn sách?')) {
        onImport([]);
        alert('Đã xóa tất cả dữ liệu!');
      }
    }
  };

  return (
    <div className="export-import-container">
      <div className="export-import-header">
        <h2>💾 Quản Lý Dữ Liệu</h2>
        <p>Sao lưu, khôi phục và quản lý dữ liệu thư viện của bạn</p>
      </div>

      {/* Export Section */}
      <div className="data-section">
        <h3>📤 Xuất Dữ Liệu</h3>
        <p className="section-desc">Tải xuống dữ liệu sách của bạn để sao lưu</p>
        <div className="button-group">
          <button onClick={exportToJSON} className="btn-export json">
            <span className="btn-icon">📄</span>
            <div className="btn-text">
              <strong>Xuất JSON</strong>
              <small>Định dạng dữ liệu hoàn chỉnh</small>
            </div>
          </button>
          <button onClick={exportToCSV} className="btn-export csv">
            <span className="btn-icon">📊</span>
            <div className="btn-text">
              <strong>Xuất CSV</strong>
              <small>Tương thích Excel/Google Sheets</small>
            </div>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="data-section">
        <h3>📥 Nhập Dữ Liệu</h3>
        <p className="section-desc">Khôi phục dữ liệu từ file sao lưu</p>
        <div className="button-group">
          <label className="btn-import json">
            <input
              type="file"
              accept=".json"
              onChange={importFromJSON}
              style={{ display: 'none' }}
            />
            <span className="btn-icon">📄</span>
            <div className="btn-text">
              <strong>Nhập JSON</strong>
              <small>Chọn file .json</small>
            </div>
          </label>
          <label className="btn-import csv">
            <input
              type="file"
              accept=".csv"
              onChange={importFromCSV}
              style={{ display: 'none' }}
            />
            <span className="btn-icon">📊</span>
            <div className="btn-text">
              <strong>Nhập CSV</strong>
              <small>Chọn file .csv</small>
            </div>
          </label>
        </div>
      </div>

      {/* Statistics */}
      <div className="data-section info-section">
        <h3>📋 Thông Tin Hiện Tại</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Tổng số sách:</span>
            <span className="info-value">{books.length} cuốn</span>
          </div>
          <div className="info-item">
            <span className="info-label">Dung lượng ước tính:</span>
            <span className="info-value">
              {(JSON.stringify(books).length / 1024).toFixed(2)} KB
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Lần sao lưu cuối:</span>
            <span className="info-value">
              {localStorage.getItem('lastBackup') || 'Chưa có'}
            </span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="data-section danger-section">
        <h3>⚠️ Vùng Nguy Hiểm</h3>
        <p className="section-desc">Các hành động không thể hoàn tác</p>
        <button onClick={clearAllData} className="btn-danger">
          <span className="btn-icon">🗑️</span>
          <div className="btn-text">
            <strong>Xóa Tất Cả Dữ Liệu</strong>
            <small>Không thể khôi phục sau khi xóa</small>
          </div>
        </button>
      </div>

      {/* Tips */}
      <div className="tips-section">
        <h4>💡 Mẹo Sử Dụng</h4>
        <ul>
          <li>🔒 Sao lưu định kỳ để tránh mất dữ liệu</li>
          <li>📱 File JSON giữ nguyên định dạng dữ liệu</li>
          <li>📊 File CSV có thể mở bằng Excel/Google Sheets</li>
          <li>💾 Dữ liệu được lưu trong localStorage của trình duyệt</li>
          <li>⚡ Nhập file sẽ ghi đè toàn bộ dữ liệu hiện tại</li>
        </ul>
      </div>
    </div>
  );
};

export default ExportImport;
