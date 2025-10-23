import React from 'react';
import './Statistics.css';

const Statistics = ({ books }) => {
  // Calculate statistics
  const totalBooks = books.length;
  const totalAuthors = new Set(books.map(b => b.author)).size;
  const totalCategories = new Set(books.map(b => b.category)).size;
  const totalPublishers = new Set(books.map(b => b.publisher)).size;

  // Reading status statistics
  const readingStats = {
    read: books.filter(b => b.readingStatus === 'read').length,
    reading: books.filter(b => b.readingStatus === 'reading').length,
    toRead: books.filter(b => b.readingStatus === 'toRead' || !b.readingStatus).length
  };

  // Language statistics
  const languageStats = books.reduce((acc, book) => {
    const lang = book.language || 'Unknown';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});

  // Category statistics (top 5)
  const categoryStats = books.reduce((acc, book) => {
    acc[book.category] = (acc[book.category] || 0) + 1;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Rating statistics
  const ratedBooks = books.filter(b => b.rating > 0);
  const averageRating = ratedBooks.length > 0
    ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)
    : 0;

  // Year statistics
  const currentYear = new Date().getFullYear();
  const booksThisYear = books.filter(b => 
    new Date(b.createdAt).getFullYear() === currentYear
  ).length;

  return (
    <div className="statistics-container">
      <div className="stats-header">
        <h2>📊 Thống Kê Thư Viện</h2>
        <p>Tổng quan về bộ sưu tập sách của bạn</p>
      </div>

      {/* Main Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{totalBooks}</h3>
            <p>Tổng số sách</p>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✍️</div>
          <div className="stat-content">
            <h3>{totalAuthors}</h3>
            <p>Tác giả</p>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">🏷️</div>
          <div className="stat-content">
            <h3>{totalCategories}</h3>
            <p>Thể loại</p>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🏢</div>
          <div className="stat-content">
            <h3>{totalPublishers}</h3>
            <p>Nhà xuất bản</p>
          </div>
        </div>
      </div>

      {/* Reading Status */}
      <div className="stats-section">
        <h3>📖 Trạng Thái Đọc</h3>
        <div className="reading-stats">
          <div className="reading-stat completed">
            <div className="reading-bar">
              <div 
                className="reading-fill" 
                style={{ width: `${(readingStats.read / totalBooks) * 100}%` }}
              ></div>
            </div>
            <div className="reading-info">
              <span className="reading-label">✅ Đã đọc</span>
              <span className="reading-count">{readingStats.read} cuốn</span>
            </div>
          </div>

          <div className="reading-stat inprogress">
            <div className="reading-bar">
              <div 
                className="reading-fill" 
                style={{ width: `${(readingStats.reading / totalBooks) * 100}%` }}
              ></div>
            </div>
            <div className="reading-info">
              <span className="reading-label">📖 Đang đọc</span>
              <span className="reading-count">{readingStats.reading} cuốn</span>
            </div>
          </div>

          <div className="reading-stat pending">
            <div className="reading-bar">
              <div 
                className="reading-fill" 
                style={{ width: `${(readingStats.toRead / totalBooks) * 100}%` }}
              ></div>
            </div>
            <div className="reading-info">
              <span className="reading-label">📚 Chưa đọc</span>
              <span className="reading-count">{readingStats.toRead} cuốn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="stats-row">
        <div className="stats-section half">
          <h3>⭐ Đánh Giá Trung Bình</h3>
          <div className="rating-display">
            <span className="rating-number">{averageRating}</span>
            <span className="rating-stars">{'⭐'.repeat(Math.round(averageRating))}</span>
            <p className="rating-info">Từ {ratedBooks.length} đánh giá</p>
          </div>
        </div>

        <div className="stats-section half">
          <h3>🌐 Ngôn Ngữ</h3>
          <div className="language-stats">
            {Object.entries(languageStats).map(([lang, count]) => (
              <div key={lang} className="language-item">
                <span className="language-name">{lang}</span>
                <span className="language-count">{count} cuốn</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="stats-section">
        <h3>🏆 Top 5 Thể Loại</h3>
        <div className="category-stats">
          {topCategories.map(([category, count], index) => (
            <div key={category} className="category-item">
              <span className="category-rank">#{index + 1}</span>
              <span className="category-name">{category}</span>
              <span className="category-count">{count} cuốn</span>
              <div className="category-bar">
                <div 
                  className="category-fill" 
                  style={{ width: `${(count / totalBooks) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Facts */}
      <div className="stats-section">
        <h3>💡 Thông Tin Nhanh</h3>
        <div className="quick-facts">
          <div className="fact-item">
            <span className="fact-icon">📅</span>
            <span className="fact-text">
              Đã thêm <strong>{booksThisYear}</strong> cuốn sách trong năm nay
            </span>
          </div>
          <div className="fact-item">
            <span className="fact-icon">📈</span>
            <span className="fact-text">
              Tỷ lệ hoàn thành: <strong>{((readingStats.read / totalBooks) * 100).toFixed(1)}%</strong>
            </span>
          </div>
          <div className="fact-item">
            <span className="fact-icon">🎯</span>
            <span className="fact-text">
              Trung bình <strong>{(totalBooks / totalAuthors).toFixed(1)}</strong> cuốn/tác giả
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
