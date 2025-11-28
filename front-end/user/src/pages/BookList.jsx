import React, { useState, useEffect } from 'react';
import { listBooks, searchBooks } from '../api/books';
import BookCard from '../components/BookCard';
import { toast } from 'react-toastify';
import './BookList.css';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);

  useEffect(() => {
    loadBooks();
  }, [search, sortBy, order, page]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 24, // Tăng từ 12 lên 24 sách mỗi trang
        sortBy,
        order,
        approval_status: 'approved'
      };

      const response = search 
        ? await searchBooks(search, params)
        : await listBooks(params);

      console.log('📚 Books response:', response.data);
      console.log('📚 First book:', response.data.books?.[0]);
      
      setBooks(response.data.books || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setTotalBooks(response.data.pagination?.totalBooks || 0);
    } catch (error) {
      console.error('Error loading books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    loadBooks();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(1);
  };

  const handleOrderChange = (e) => {
    setOrder(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="books-page">
      <div className="container">
        {/* Hero Section - Centered */}
        <div className="hero-section-minimal">
          <div className="hero-content-minimal">
            <i className="fas fa-book-open hero-icon-minimal"></i>
            <h1 className="hero-title-minimal">Thư Viện Sách</h1>
            <p className="hero-subtitle-minimal">
              Khám phá <strong>{totalBooks}</strong> đầu sách trong bộ sưu tập
            </p>
          </div>
        </div>

        {/* Search Zone Card - Single Card */}
        <div className="search-zone-card">
          <form onSubmit={handleSearch} className="search-zone-form">
            <div className="search-input-zone">
              <i className="fas fa-search search-icon-zone"></i>
              <input
                type="text"
                className="search-input-zone-text"
                placeholder="Tìm kiếm theo tên sách, tác giả, nhà xuất bản..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <select 
              className="sort-select-zone" 
              value={sortBy} 
              onChange={handleSortChange}
            >
              <option value="createdAt">Ngày thêm</option>
              <option value="title">Tên sách</option>
              <option value="author">Tác giả</option>
              <option value="publication_year">Năm xuất bản</option>
            </select>

            <select 
              className="order-select-zone" 
              value={order} 
              onChange={handleOrderChange}
            >
              <option value="desc">Giảm dần</option>
              <option value="asc">Tăng dần</option>
            </select>

            <button type="submit" className="btn-search-zone">
              <i className="fas fa-search"></i>
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Đang tải...</span>
            </div>
            <p className="loading-text">Đang tải dữ liệu...</p>
          </div>
        ) : books.length > 0 ? (
          <>
            <div className="books-grid">
              {books.map((book) => (
                <div key={book._id} className="book-grid-item">
                  <BookCard book={book} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page - 1)}
                        disabled={page === 1}
                      >
                        <i className="fas fa-chevron-left"></i> Trước
                      </button>
                    </li>

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= page - 1 && pageNum <= page + 1)
                      ) {
                        return (
                          <li
                            key={pageNum}
                            className={`page-item ${page === pageNum ? 'active' : ''}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      } else if (pageNum === page - 2 || pageNum === page + 2) {
                        return (
                          <li key={`ellipsis-${pageNum}`} className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        );
                      }
                      return null;
                    }).filter(Boolean)}

                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(page + 1)}
                        disabled={page === totalPages}
                      >
                        Sau <i className="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-book-open"></i>
            </div>
            <h3>Không tìm thấy sách</h3>
            <p className="text-muted">
              {search ? `Không có kết quả cho "${search}"` : 'Chưa có sách nào trong thư viện'}
            </p>
            {search && (
              <button 
                className="btn btn-primary" 
                onClick={() => { setSearch(''); setPage(1); }}
              >
                <i className="fas fa-times"></i> Xóa tìm kiếm
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookList;
