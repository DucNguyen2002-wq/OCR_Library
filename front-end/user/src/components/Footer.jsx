import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
            <h5 className="footer-title">BookLibrary</h5>
            <p className="footer-text">
              Your online library management system. Discover, share, and manage books with ease.
            </p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
            <h6 className="footer-subtitle">Quick Links</h6>
            <ul className="footer-menu">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/books">Browse Books</Link></li>
              <li><Link to="/add-book">Add Book</Link></li>
              <li><Link to="/my-books">My Books</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
            <h6 className="footer-subtitle">Account</h6>
            <ul className="footer-menu">
              <li><Link to="/profile">My Profile</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h6 className="footer-subtitle">Contact</h6>
            <ul className="footer-contact">
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>123 Library St, Book City</span>
              </li>
              <li>
                <i className="fas fa-phone-alt"></i>
                <span>+123 456 7890</span>
              </li>
              <li>
                <i className="fas fa-envelope"></i>
                <span>info@booklibrary.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="footer-divider" />
        
        <div className="row">
          <div className="col-md-6 text-center text-md-left">
            <p className="copyright">
              &copy; 2025 BookLibrary. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-right">
            <ul className="footer-bottom-menu">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Help</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
