import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listBooks } from '../api/books';
import { toast } from 'react-toastify';
import './Categories.css';

const Categories = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await listBooks({ approval_status: 'approved' });
      const booksData = response.data.books || [];
      setBooks(booksData);
      
      // Group books by category
      const groupedCategories = booksData.reduce((acc, book) => {
        const category = book.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(book);
        return acc;
      }, {});
      
      setCategories(groupedCategories);
    } catch (error) {
      console.error('Error loading books:', error);
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = {
    'Fiction': 'fa-book-open',
    'Non-Fiction': 'fa-book',
    'Science': 'fa-flask',
    'Technology': 'fa-laptop-code',
    'History': 'fa-landmark',
    'Biography': 'fa-user',
    'Children': 'fa-child',
    'Comics': 'fa-laugh',
    'Education': 'fa-graduation-cap',
    'Business': 'fa-briefcase',
    'Art': 'fa-palette',
    'Cooking': 'fa-utensils',
    'Health': 'fa-heartbeat',
    'Travel': 'fa-plane',
    'Religion': 'fa-cross',
    'Poetry': 'fa-feather-alt',
    'Drama': 'fa-theater-masks',
    'Philosophy': 'fa-brain',
    'default': 'fa-book'
  };

  const getIconForCategory = (category) => {
    return categoryIcons[category] || categoryIcons['default'];
  };

  const categoryColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
    '#F8B739', '#52B788', '#E76F51', '#2A9D8F'
  ];

  const getCategoryColor = (index) => {
    return categoryColors[index % categoryColors.length];
  };

  const filteredBooks = selectedCategory === 'all' 
    ? books 
    : categories[selectedCategory] || [];

  if (loading) {
    return (
      <div className="categories-page">
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="container py-5">
        {/* Page Header */}
        <div className="page-header text-center mb-5">
          <h1 className="display-4 mb-3">
            <i className="fas fa-th-large text-primary"></i> Book Categories
          </h1>
          <p className="lead text-muted">
            Explore our collection organized by categories
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="category-tabs mb-5">
          <button 
            className={`category-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            <i className="fas fa-border-all"></i> All Books ({books.length})
          </button>
          {Object.keys(categories).map((category) => (
            <button 
              key={category}
              className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              <i className={`fas ${getIconForCategory(category)}`}></i> 
              {category} ({categories[category].length})
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        {selectedCategory === 'all' ? (
          <div className="categories-grid">
            {Object.keys(categories).map((category, index) => (
              <div 
                key={category} 
                className="category-card"
                onClick={() => setSelectedCategory(category)}
                style={{ borderTopColor: getCategoryColor(index) }}
              >
                <div 
                  className="category-icon"
                  style={{ backgroundColor: getCategoryColor(index) }}
                >
                  <i className={`fas ${getIconForCategory(category)}`}></i>
                </div>
                <h3 className="category-name">{category}</h3>
                <p className="category-count">
                  {categories[category].length} 
                  {categories[category].length === 1 ? ' book' : ' books'}
                </p>
                <div className="category-preview">
                  {categories[category].slice(0, 3).map((book) => (
                    <div key={book._id} className="preview-book">
                      <img 
                        src={book.coverImage || '/placeholder-book.png'} 
                        alt={book.title}
                      />
                    </div>
                  ))}
                </div>
                <button className="btn-view-category">
                  View All <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Books List for Selected Category */
          <div className="books-list">
            <div className="list-header mb-4">
              <h2>
                <i className={`fas ${getIconForCategory(selectedCategory)}`}></i>
                {selectedCategory}
              </h2>
              <p className="text-muted">
                {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
              </p>
            </div>
            <div className="row">
              {filteredBooks.map((book) => (
                <div key={book._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                  <Link to={`/books/${book._id}`} className="book-item">
                    <div className="book-image">
                      <img 
                        src={book.coverImage || '/placeholder-book.png'} 
                        alt={book.title}
                      />
                    </div>
                    <div className="book-info">
                      <h4 className="book-title">{book.title}</h4>
                      <p className="book-author">
                        <i className="fas fa-user"></i> {book.author}
                      </p>
                      <p className="book-year">
                        <i className="fas fa-calendar"></i> {book.publicationYear}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {Object.keys(categories).length === 0 && (
          <div className="empty-state text-center py-5">
            <i className="fas fa-box-open fa-5x text-muted mb-4"></i>
            <h3>No Categories Found</h3>
            <p className="text-muted">Start adding books to create categories</p>
            <Link to="/add-book" className="btn btn-primary mt-3">
              <i className="fas fa-plus"></i> Add Your First Book
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
