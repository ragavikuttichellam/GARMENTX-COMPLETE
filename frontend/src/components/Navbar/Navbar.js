import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingBag, FiSearch, FiUser, FiMenu, FiX, FiChevronDown, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Men', path: '/men' },
  { label: 'Women', path: '/women' },
  { label: 'Kids', path: '/kids' },
  { label: 'New Arrivals', path: '/new-arrivals' },
  { label: 'Offers', path: '/offers' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/shop?search=' + encodeURIComponent(searchQuery.trim()));
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className={'navbar' + (scrolled ? ' scrolled' : '')}>
      <div className="navbar-inner container">
        <Link to="/" className="nav-logo">
          <div className="logo-icon">G</div>
          <span>Garment<span className="logo-x">X</span></span>
        </Link>
        <nav className="nav-links">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} className={'nav-link' + (location.pathname === link.path ? ' active' : '')}>{link.label}</Link>
          ))}
          <Link to="/contact" className="nav-link">Contact</Link>
        </nav>
        <div className="nav-actions">
          <button className="nav-icon-btn" onClick={() => setSearchOpen(!searchOpen)}><FiSearch size={20} /></button>
          <Link to="/cart" className="nav-icon-btn cart-btn">
            <FiShoppingBag size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          {user ? (
            <div className="user-menu" ref={userMenuRef}>
              <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="user-avatar">{user.name[0].toUpperCase()}</div>
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <FiChevronDown size={14} style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'all 0.3s' }} />
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/my-orders" className="dropdown-item" onClick={() => setUserMenuOpen(false)}><FiPackage size={15} /> My Orders</Link>
                  {user.role === 'admin' && <Link to="/admin" className="dropdown-item" onClick={() => setUserMenuOpen(false)}><FiSettings size={15} /> Admin Panel</Link>}
                  <button className="dropdown-item logout" onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}><FiLogOut size={15} /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn"><FiUser size={16} /> Login</Link>
          )}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>
      <div className={'search-bar' + (searchOpen ? ' open' : '')}>
        <div className="container">
          <form onSubmit={handleSearch} className="search-form">
            <FiSearch size={18} className="search-icon" />
            <input type="text" placeholder="Search shirts, dresses, jeans..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus={searchOpen} />
            <button type="submit" className="search-submit">Search</button>
            <button type="button" className="search-close" onClick={() => setSearchOpen(false)}><FiX size={18} /></button>
          </form>
        </div>
      </div>
      <div className={'mobile-menu' + (menuOpen ? ' open' : '')}>
        {navLinks.map(link => <Link key={link.path} to={link.path} className="mobile-link">{link.label}</Link>)}
        <Link to="/contact" className="mobile-link">Contact</Link>
        {!user && <Link to="/register" className="mobile-link register-link">Create Account</Link>}
      </div>
    </header>
  );
}
