import React from 'react';
import './SearchBar.css';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="search-bar">
      <div className="search-icon">🔍</div>
      <input
        type="text"
        placeholder="Tìm kiếm theo tên sách, tác giả hoặc ISBN..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
      {searchTerm && (
        <button 
          className="clear-button"
          onClick={() => onSearchChange('')}
          title="Xóa tìm kiếm"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default SearchBar;
