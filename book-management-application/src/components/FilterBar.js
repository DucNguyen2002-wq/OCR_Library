import React from 'react';
import './FilterBar.css';

const FilterBar = ({ filters, onFilterChange, categories, publishers, languages }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => 1990 + i).reverse();

  const handleCategoryChange = (e) => {
    onFilterChange({ ...filters, category: e.target.value });
  };

  const handlePublisherChange = (e) => {
    onFilterChange({ ...filters, publisher: e.target.value });
  };

  const handleYearChange = (e) => {
    onFilterChange({ ...filters, year: e.target.value });
  };

  const handleLanguageChange = (e) => {
    onFilterChange({ ...filters, language: e.target.value });
  };

  const handleSortChange = (e) => {
    onFilterChange({ ...filters, sortBy: e.target.value });
  };

  const handleReset = () => {
    onFilterChange({
      category: '',
      publisher: '',
      year: '',
      language: '',
      sortBy: 'newest'
    });
  };

  const activeFiltersCount = [
    filters.category,
    filters.publisher,
    filters.year,
    filters.language
  ].filter(f => f).length;

  return (
    <div className="filter-bar">
      <div className="filter-header">
        <h3>🔍 Bộ Lọc</h3>
        {activeFiltersCount > 0 && (
          <button onClick={handleReset} className="btn-reset-filters">
            🔄 Xóa Lọc ({activeFiltersCount})
          </button>
        )}
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <label htmlFor="category-filter">📚 Thể loại:</label>
          <select
            id="category-filter"
            value={filters.category}
            onChange={handleCategoryChange}
            className="filter-select"
          >
            <option value="">Tất cả thể loại</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="publisher-filter">🏢 Nhà xuất bản:</label>
          <select
            id="publisher-filter"
            value={filters.publisher}
            onChange={handlePublisherChange}
            className="filter-select"
          >
            <option value="">Tất cả NXB</option>
            {publishers.map(pub => (
              <option key={pub} value={pub}>{pub}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="year-filter">📅 Năm xuất bản:</label>
          <select
            id="year-filter"
            value={filters.year}
            onChange={handleYearChange}
            className="filter-select"
          >
            <option value="">Tất cả năm</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="language-filter">🌐 Ngôn ngữ:</label>
          <select
            id="language-filter"
            value={filters.language}
            onChange={handleLanguageChange}
            className="filter-select"
          >
            <option value="">Tất cả ngôn ngữ</option>
            {languages && languages.map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">🔢 Sắp xếp:</label>
          <select
            id="sort-filter"
            value={filters.sortBy}
            onChange={handleSortChange}
            className="filter-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="title-asc">Tên A → Z</option>
            <option value="title-desc">Tên Z → A</option>
            <option value="author-asc">Tác giả A → Z</option>
            <option value="author-desc">Tác giả Z → A</option>
            <option value="year-desc">Năm XB mới nhất</option>
            <option value="year-asc">Năm XB cũ nhất</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
