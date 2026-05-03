import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery,setSearchQuery]= useState('');
  const [scrolled,   setScrolled]   = useState(false);
  const [userMenuOpen,setUserMenuOpen] = useState(false);
  const { cartCount }  = useCart();
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { to: '/',                label: 'Home' },
    { to: '/shop',            label: 'Shop' },
    { to: '/shop/men',        label: 'Men' },
    { to: '/shop/women',      label: 'Women' },
    { to: '/shop/kids',       label: 'Kids' },
    { to: '/shop?isNewArrival=true', label: 'New Arrivals' },
    { to: '/shop?isOnOffer=true',    label: 'Offers', className: 'nav-offer' },
    { to: '/#contact',        label: 'Contact' },
  ];

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">

        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <span className="logo-icon">GX</span>
          <span className="logo-text">GarmentX</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="navbar-links">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''} ${link.className || ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          {/* Search */}
          <div className={`search-wrap ${searchOpen ? 'open' : ''}`}>
            {searchOpen && (
              <form onSubmit={handleSearch} className="search-form">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="search-btn">🔍</button>
              </form>
            )}
            <button
              className="icon-btn"
              onClick={() => setSearchOpen(o => !o)}
              aria-label="Search"
            >
              {searchOpen ? '✕' : '🔍'}
            </button>
          </div>

          {/* Cart */}
          <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
            <span className="cart-icon">🛍️</span>
            {cartCount > 0 && (
              <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
            )}
          </Link>

          {/* User */}
          {user ? (
            <div className="user-menu-wrap" ref={userMenuRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setUserMenuOpen(o => !o)}
                aria-label="User menu"
              >
                <span className="avatar-initials">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  <Link to="/profile"    onClick={() => setUserMenuOpen(false)}>👤 My Profile</Link>
                  <Link to="/my-orders"  onClick={() => setUserMenuOpen(false)}>📦 My Orders</Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)}>⚙️ Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
          )}

          {/* Hamburger */}
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </NavLink>
        ))}
        <form onSubmit={handleSearch} className="mobile-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div className="nav-overlay" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
};

export default Navbar;
