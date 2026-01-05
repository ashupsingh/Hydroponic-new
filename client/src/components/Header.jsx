import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLeaf } from 'react-icons/fa';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon"><FaLeaf /></span>
          <span className="logo-text">Greeva<span className="logo-highlight">Tech</span></span>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            <li><a href="/" className="nav-link">Home</a></li>
            <li><a href="#solutions" onClick={(e) => { e.preventDefault(); scrollToSection('solutions'); }} className="nav-link">Solutions</a></li>
            <li><a href="#technologies" onClick={(e) => { e.preventDefault(); scrollToSection('technologies'); }} className="nav-link">Technology</a></li>
            <li><a href="#products" onClick={(e) => { e.preventDefault(); scrollToSection('products'); }} className="nav-link">Products</a></li>
          </ul>
        </nav>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => navigate('/login')}>Log In</button>
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
