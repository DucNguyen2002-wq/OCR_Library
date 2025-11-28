import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import ThemeToggle from './ThemeToggle';
import './Navbar-LayoutC.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportMenu, setShowReportMenu] = useState(false);
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
      {/* Topbar - Minimal */}
      <div className="topbar-minimal">
        <div className="container">
          <div className="topbar-content">
            {/* Logo */}
            <Link to="/" className="navbar-brand-minimal">
              <span className="brand-multi">Book</span>
              <span className="brand-shop">Library</span>
            </Link>

            {/* Topbar Links */}
            <div className="topbar-links-minimal">
              <Link to="/about">About</Link>
              <span className="separator">|</span>
              <Link to="/contact">Contact</Link>
              <span className="separator">|</span>
              <Link to="/help">Help</Link>
            </div>

            {/* User Account */}
            <div className="topbar-account-minimal">
              {user ? (
                <>
                  <ThemeToggle />
                  <NotificationDropdown />
                  <div className="dropdown">
                    <button className="btn-user-minimal">
                      <i className="fas fa-user-circle"></i>
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
                </>
              ) : (
                <div className="auth-buttons-minimal">
                  <ThemeToggle />
                  <Link to="/login" className="btn-auth">Sign In</Link>
                  <Link to="/register" className="btn-auth">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Header with Large Search */}
      <div className="header-search">
        <div className="container">
          <div className="header-search-content">
            {/* Search Form - Large */}
            <form onSubmit={handleSearch} className="search-form-large">
              <i className="fas fa-search search-icon-large"></i>
              <input 
                type="text" 
                className="search-input-large" 
                placeholder="Tìm kiếm sách, tác giả, nhà xuất bản..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn-search-large">
                <i className="fas fa-search"></i>
              </button>
            </form>

            {/* Contact Info - Compact */}
            <div className="contact-info-minimal">
              <i className="fas fa-phone-alt"></i>
              <span>+84 123 456 789</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Dot Separated */}
      <div className="nav-menu-minimal">
        <div className="container">
          <div className="nav-items-minimal">
            <Link to="/books" className="nav-link-minimal">
              <i className="fas fa-book"></i>
              All Books
            </Link>
            <span className="nav-dot">•</span>
            <Link to="/categories" className="nav-link-minimal">
              <i className="fas fa-th-large"></i>
              Categories
            </Link>
            {user && (
              <>
                <span className="nav-dot">•</span>
                <Link to="/add-book" className="nav-link-minimal">
                  <i className="fas fa-plus-circle"></i>
                  Add Book
                </Link>
                <span className="nav-dot">•</span>
                <div 
                  className="report-dropdown-minimal"
                  onMouseEnter={() => setShowReportMenu(true)}
                  onMouseLeave={() => setShowReportMenu(false)}
                >
                  <div className="nav-link-minimal">
                    <i className="fas fa-flag"></i>
                    Báo cáo
                  </div>
                  {showReportMenu && (
                    <div className="report-menu-minimal">
                      <Link to="/reports/updates" className="report-menu-item-minimal">
                        <i className="fas fa-sync-alt"></i>
                        <div>
                          <strong>Cập nhật</strong>
                          <small>Yêu cầu cập nhật thông tin sách</small>
                        </div>
                      </Link>
                      <Link to="/reports/delete-requests" className="report-menu-item-minimal">
                        <i className="fas fa-trash-alt"></i>
                        <div>
                          <strong>Yêu cầu xóa</strong>
                          <small>Gửi yêu cầu xóa sách</small>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
