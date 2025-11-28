import React from 'react';
import { Link } from 'react-router-dom';
import './BookCard.css';

const BookCard = ({ book }) => {
  // Get book ID from _id or id field
  const bookId = book._id || book.id;
  
  console.log('📚 BookCard - book data:', { _id: book._id, id: book.id, title: book.title });
  
  // Handle multiple image sources: cover_front_url, image, or placeholder
  const imageUrl = book.cover_front_url 
    || (book.image ? `http://localhost:3000${book.image}` : null)
    || '/placeholder-book.jpg';
  
  const statusBadge = book.approval_status === 'approved' 
    ? <span className="badge badge-success">Approved</span>
    : book.approval_status === 'rejected'
    ? <span className="badge badge-danger">Rejected</span>
    : <span className="badge badge-warning">Pending</span>;

  return (
    <div className="book-card">
      <div className="book-image">
        <Link to={`/books/${bookId}`}>
          <img src={imageUrl} alt={book.title} />
        </Link>
        <div className="book-overlay">
          <Link to={`/books/${bookId}`} className="btn btn-sm btn-primary">
            <i className="fas fa-eye"></i> View Details
          </Link>
        </div>
      </div>
      <div className="book-info">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <h6 className="book-title">
            <Link to={`/books/${bookId}`}>{book.title}</Link>
          </h6>
          {statusBadge}
        </div>
        <p className="book-author">
          <i className="fas fa-user"></i> {book.authors?.join(', ') || book.author || 'Chưa rõ tác giả'}
        </p>
        <p className="book-publisher">
          <i className="fas fa-building"></i> {book.publisher || 'Chưa rõ NXB'}
        </p>
        <div className="book-meta">
          <span className="book-year">
            <i className="fas fa-calendar"></i> {book.year_published || book.publication_year || 'N/A'}
          </span>
          {book.quantity !== undefined && (
            <span className="book-quantity">
              <i className="fas fa-book"></i> {book.quantity} available
            </span>
          )}
        </div>
        {book.description && (
          <p className="book-description">
            {book.description.substring(0, 100)}
            {book.description.length > 100 && '...'}
          </p>
        )}
        {book.contributor && (
          <p className="book-contributor">
            <small>
              <i className="fas fa-upload"></i> Contributed by {book.contributor.fullname}
            </small>
          </p>
        )}
      </div>
    </div>
  );
};

export default BookCard;
