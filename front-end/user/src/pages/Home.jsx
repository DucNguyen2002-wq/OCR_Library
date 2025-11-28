import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedBooks } from '../api/books';
import BookCard from '../components/BookCard';
import { toast } from 'react-toastify';
import './Home.css';

const Home = () => {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedBooks();
  }, []);

  const loadFeaturedBooks = async () => {
    try {
      const response = await getFeaturedBooks();
      setFeaturedBooks(response.data.books || []);
    } catch (error) {
      console.error('Error loading featured books:', error);
      toast.error('Failed to load featured books');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h1 className="hero-title">
                Welcome to <span className="text-primary">BookLibrary</span>
              </h1>
              <p className="hero-subtitle">
                Discover, explore, and contribute to our extensive collection of books. 
                Share your favorite reads with the community.
              </p>
              <div className="hero-buttons">
                <Link to="/books" className="btn btn-primary btn-lg">
                  <i className="fas fa-book"></i> Browse Books
                </Link>
                <Link to="/add-book" className="btn btn-outline-primary btn-lg">
                  <i className="fas fa-plus"></i> Add Book
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="hero-image">
                <img src="/hero-books.svg" alt="Library" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-search"></i>
                </div>
                <h3>Search & Discover</h3>
                <p>Find books by title, author, publisher, or year. Advanced search filters available.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-share-alt"></i>
                </div>
                <h3>Share & Contribute</h3>
                <p>Add your own books to the library and share them with the community.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-user-circle"></i>
                </div>
                <h3>Manage Your Collection</h3>
                <p>Track your contributions and manage your personal book collection.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="featured-section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Books</h2>
            <Link to="/books" className="view-all-link">
              View All <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : featuredBooks.length > 0 ? (
            <div className="row">
              {featuredBooks.slice(0, 8).map((book) => (
                <div key={book._id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No featured books available.</p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="container text-center">
          <h2>Start Building Your Library Today</h2>
          <p>Join our community and contribute to the world's knowledge</p>
          <Link to="/register" className="btn btn-light btn-lg">
            <i className="fas fa-user-plus"></i> Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
