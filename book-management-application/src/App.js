import React, { useState, useEffect } from 'react';
import './App.css';
import BookList from './components/BookList';
import BookForm from './components/BookForm';
import OCRScanner from './components/OCRScanner';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import Statistics from './components/Statistics';
import ExportImport from './components/ExportImport';
import { generateSampleBooks, getCategories, getPublishers, getLanguages } from './data/sampleBooks';

function App() {
  const [books, setBooks] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // list, add, ocr, statistics, data
  const [filters, setFilters] = useState({
    category: '',
    publisher: '',
    year: '',
    language: '',
    sortBy: 'newest'
  });

  // Load books from localStorage on mount
  useEffect(() => {
    const savedBooks = localStorage.getItem('books');
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    } else {
      // If no saved books, load sample books
      const sampleBooks = generateSampleBooks();
      setBooks(sampleBooks);
    }
  }, []);

  // Save books to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('books', JSON.stringify(books));
  }, [books]);

  const addBook = (book) => {
    const newBook = {
      ...book,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };
    setBooks([...books, newBook]);
    setActiveTab('list');
  };

  const updateBook = (updatedBook) => {
    setBooks(books.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    ));
    setEditingBook(null);
    setActiveTab('list');
  };

  const deleteBook = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      setBooks(books.filter(book => book.id !== id));
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setActiveTab('add');
  };

  // Load sample books manually
  const loadSampleBooks = () => {
    if (window.confirm('Bạn có muốn tải 100 cuốn sách mẫu? Dữ liệu hiện tại sẽ bị ghi đè.')) {
      const sampleBooks = generateSampleBooks();
      setBooks(sampleBooks);
      localStorage.setItem('books', JSON.stringify(sampleBooks));
      alert('Đã tải 100 cuốn sách mẫu thành công!');
    }
  };

  // Import data handler
  const handleImport = (importedBooks) => {
    setBooks(importedBooks);
    localStorage.setItem('books', JSON.stringify(importedBooks));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      category: '',
      publisher: '',
      year: '',
      language: '',
      sortBy: 'newest'
    });
    setSearchTerm('');
  };

  // Apply filters and sorting
  const getFilteredAndSortedBooks = () => {
    let result = [...books];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      result = result.filter(book => book.category === filters.category);
    }

    // Apply publisher filter
    if (filters.publisher) {
      result = result.filter(book => book.publisher === filters.publisher);
    }

    // Apply year filter
    if (filters.year) {
      result = result.filter(book => book.publishYear === parseInt(filters.year));
    }

    // Apply language filter
    if (filters.language) {
      result = result.filter(book => book.language === filters.language);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => b.id - a.id);
        break;
      case 'oldest':
        result.sort((a, b) => a.id - b.id);
        break;
      case 'title-asc':
        result.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
        break;
      case 'title-desc':
        result.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
        break;
      case 'author-asc':
        result.sort((a, b) => a.author.localeCompare(b.author, 'vi'));
        break;
      case 'author-desc':
        result.sort((a, b) => b.author.localeCompare(a.author, 'vi'));
        break;
      case 'year-desc':
        result.sort((a, b) => b.publishYear - a.publishYear);
        break;
      case 'year-asc':
        result.sort((a, b) => a.publishYear - b.publishYear);
        break;
      default:
        break;
    }

    return result;
  };

  const filteredBooks = getFilteredAndSortedBooks();

  return (
    <div className="App">
      <header className="app-header">
        <h1>📚 Hệ Thống Quản Lý Sách</h1>
        <p className="subtitle">Quản lý thư viện với công nghệ OCR</p>
      </header>

      <nav className="navigation">
        <button 
          className={activeTab === 'list' ? 'active' : ''}
          onClick={() => setActiveTab('list')}
        >
          📋 Danh Sách Sách
        </button>
        <button 
          className={activeTab === 'add' ? 'active' : ''}
          onClick={() => {
            setActiveTab('add');
            setEditingBook(null);
          }}
        >
          ➕ Thêm Sách
        </button>
        <button 
          className={activeTab === 'ocr' ? 'active' : ''}
          onClick={() => setActiveTab('ocr')}
        >
          📷 Quét OCR
        </button>
        <button 
          className={activeTab === 'statistics' ? 'active' : ''}
          onClick={() => setActiveTab('statistics')}
        >
          📊 Thống Kê
        </button>
        <button 
          className={activeTab === 'data' ? 'active' : ''}
          onClick={() => setActiveTab('data')}
        >
          💾 Quản Lý Dữ Liệu
        </button>
        <button 
          className="load-sample-btn"
          onClick={loadSampleBooks}
        >
          📦 Tải Sách Mẫu
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'list' && (
          <>
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
            <FilterBar 
              filters={filters}
              onFilterChange={(newFilters) => setFilters(newFilters)}
              onReset={resetFilters}
              categories={getCategories()}
              publishers={getPublishers()}
              languages={getLanguages()}
            />
            <div className="stats">
              <p>Tổng số sách: <strong>{books.length}</strong></p>
              {(searchTerm || filters.category || filters.publisher || filters.year || filters.language) && (
                <p>Kết quả lọc: <strong>{filteredBooks.length}</strong></p>
              )}
            </div>
            <BookList 
              books={filteredBooks}
              onEdit={handleEdit}
              onDelete={deleteBook}
            />
          </>
        )}

        {activeTab === 'add' && (
          <BookForm 
            book={editingBook}
            onSubmit={editingBook ? updateBook : addBook}
            onCancel={() => {
              setEditingBook(null);
              setActiveTab('list');
            }}
          />
        )}

        {activeTab === 'ocr' && (
          <OCRScanner 
            onDataExtracted={(data) => {
              setEditingBook(data);
              setActiveTab('add');
            }}
          />
        )}

        {activeTab === 'statistics' && (
          <Statistics books={books} />
        )}

        {activeTab === 'data' && (
          <ExportImport 
            books={books}
            onImport={handleImport}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© 2025 Book Management System - Powered by React & Tesseract OCR</p>
      </footer>
    </div>
  );
}

export default App;
