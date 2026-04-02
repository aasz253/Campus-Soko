import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../utils/api';
import {
  Menu, X, Home, PlusCircle, MessageSquare, LayoutDashboard,
  User, LogOut, LogIn, UserPlus
} from 'lucide-react';

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const res = await messageAPI.getUnreadCount();
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const navLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  };

  const mobileNavLinkStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    transition: 'background-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Navbar */}
      <nav style={{ 
        background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 50 
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 16px' 
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            height: '64px' 
          }}>
            {/* Logo */}
            <Link to="/" style={{ 
              color: 'white', 
              fontSize: '22px', 
              fontWeight: 'bold',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ color: '#22c55e' }}>Campus</span>
              <span>Soko</span>
            </Link>

            {/* Desktop Nav - Left */}
            <div className="desktop-nav" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              <Link to="/" style={navLinkStyle}>
                <Home size={18} />
                <span>Home</span>
              </Link>
              {isAuthenticated && (
                <Link to="/post" style={navLinkStyle}>
                  <PlusCircle size={18} />
                  <span>Post Item</span>
                </Link>
              )}
            </div>

            {/* Desktop Nav - Right */}
            <div className="desktop-nav" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px' 
            }}>
              {isAuthenticated ? (
                <>
                  <Link to="/messages" style={{ ...navLinkStyle, position: 'relative' }}>
                    <MessageSquare size={18} />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '600',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        minWidth: '18px',
                        textAlign: 'center'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/dashboard" style={navLinkStyle}>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>
                  <Link to="/profile" style={navLinkStyle}>
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    style={{ ...navLinkStyle, cursor: 'pointer', background: 'none', border: 'none' }}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" style={navLinkStyle}>
                    <LogIn size={18} />
                    <span>Login</span>
                  </Link>
                  <Link to="/register" style={{ ...navLinkStyle, background: '#22c55e' }}>
                    <UserPlus size={18} />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: 'white',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
              className="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div style={{
            background: '#0284c7',
            borderTop: '1px solid #38bdf8',
            padding: '12px 16px'
          }} className="mobile-menu">
            <Link
              to="/"
              onClick={closeMobileMenu}
              style={mobileNavLinkStyle}
            >
              <Home size={20} />
              <span>Home</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/post" onClick={closeMobileMenu} style={mobileNavLinkStyle}>
                  <PlusCircle size={20} />
                  <span>Post Item</span>
                </Link>

                <Link to="/messages" onClick={closeMobileMenu} style={mobileNavLinkStyle}>
                  <MessageSquare size={20} />
                  <span>Messages</span>
                  {unreadCount > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '600',
                      padding: '2px 8px',
                      borderRadius: '10px'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </Link>

                <Link to="/dashboard" onClick={closeMobileMenu} style={mobileNavLinkStyle}>
                  <LayoutDashboard size={20} />
                  <span>Dashboard</span>
                </Link>

                <Link to="/profile" onClick={closeMobileMenu} style={mobileNavLinkStyle}>
                  <User size={20} />
                  <span>Profile</span>
                </Link>

                <div style={{ height: '1px', background: '#38bdf8', margin: '8px 0' }} />

                <button onClick={handleLogout} style={{ ...mobileNavLinkStyle, width: '100%', border: 'none', cursor: 'pointer' }}>
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <div style={{ height: '1px', background: '#38bdf8', margin: '8px 0' }} />
                <Link to="/login" onClick={closeMobileMenu} style={mobileNavLinkStyle}>
                  <LogIn size={20} />
                  <span>Login</span>
                </Link>
                <Link to="/register" onClick={closeMobileMenu} style={{ ...mobileNavLinkStyle, background: '#22c55e' }}>
                  <UserPlus size={20} />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
