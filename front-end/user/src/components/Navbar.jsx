import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Topbar */}
      <div className="topbar bg-secondary py-2">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <div className="topbar-links">
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
              <Link to="/help">Help</Link>
            </div>
            <div className="topbar-account">
              {user ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <NotificationDropdown />
                  <div className="dropdown">
                    <button className="btn btn-sm btn-light dropdown-toggle">
                      {user.name}
                    </button>
                    <div className="dropdown-menu">
                      <Link to="/profile" className="dropdown-item">Profile</Link>
                      <Link to="/my-books" className="dropdown-item">My Books</Link>
                      <Link to="/my-rejected-books" className="dropdown-item">
                        <i className="fas fa-times-circle text-danger mr-1"></i>
                        Rejected Books
                      </Link>
                      <button onClick={handleLogout} className="dropdown-item">Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link to="/login" className="btn btn-sm btn-light">Sign In</Link>
                  <Link to="/register" className="btn btn-sm btn-light ml-2">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar bg-light py-3">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center w-100">
            {/* Logo */}
            <Link to="/" className="navbar-brand">
              <span className="brand-multi text-primary bg-dark px-2">Book</span>
              <span className="brand-shop text-dark bg-primary px-2 ml-n1">Library</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="search-form">
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search for books..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="input-group-append">
                  <button type="submit" className="btn bg-transparent text-primary">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </form>

            {/* Contact Info */}
            <div className="contact-info text-right">
              <p className="mb-0">Library Service</p>
              <h6 className="mb-0">+84 123 456 789</h6>
            </div>
          </div>
        </div>
      </nav>

      {/* Navigation Menu */}
      <div className="nav-menu bg-dark">
        <div className="container">
          <div className="d-flex align-items-center">
            <Link to="/books" className="nav-link text-light">
              <i className="fas fa-book mr-2"></i>
              All Books
            </Link>
            <Link to="/categories" className="nav-link text-light">
              <i className="fas fa-list mr-2"></i>
              Categories
            </Link>
            {user && (
              <Link to="/add-book" className="nav-link text-light">
                <i className="fas fa-plus mr-2"></i>
                Add Book
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
