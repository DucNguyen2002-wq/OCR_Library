import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listBooks } from '../api/books';
import BookCard from '../components/BookCard';
import { toast } from 'react-toastify';
import './MyBooks.css';

const MyBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  useEffect(() => {
    loadMyBooks();
  }, [filter]);

  const loadMyBooks = async () => {
    try {
      setLoading(true);
      const params = {
        sortBy: 'createdAt',
        order: 'desc'
      };

      if (filter !== 'all') {
        params.approval_status = filter;
      }

      const response = await listBooks(params);
      
      // Filter books by current user (assuming API returns user's books when authenticated)
      // If API doesn't filter, we need to get user info and filter client-side
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userBooks = response.data.books.filter(
        book => book.contributor && book.contributor._id === user._id
      );
      
      setBooks(userBooks);
    } catch (error) {
      console.error('Error loading my books:', error);
      toast.error('Failed to load your books');
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    return {
      total: books.length,
      pending: books.filter(b => b.approval_status === 'pending').length,
      approved: books.filter(b => b.approval_status === 'approved').length,
      rejected: books.filter(b => b.approval_status === 'rejected').length,
    };
  };

  const stats = getStats();

  return (
    <div className="my-books-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1>My Contributed Books</h1>
          <Link to="/add-book" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add New Book
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <i className="fas fa-book"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Books</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon approved">
              <i className="fas fa-check-circle"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.approved}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rejected">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="stat-info">
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({stats.approved})
          </button>
          <button
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : books.length > 0 ? (
          <div className="row">
            {books.map((book) => (
              <div key={book._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <BookCard book={book} />
                <div className="book-actions">
                  <Link 
                    to={`/edit-book/${book._id}`} 
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="fas fa-edit"></i> Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-book fa-4x text-muted mb-3"></i>
            <h3>No books found</h3>
            <p className="text-muted">
              {filter === 'all' 
                ? "You haven't contributed any books yet." 
                : `You don't have any ${filter} books.`}
            </p>
            <Link to="/add-book" className="btn btn-primary">
              <i className="fas fa-plus"></i> Add Your First Book
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBooks;
