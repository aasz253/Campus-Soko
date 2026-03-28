import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../utils/api';

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

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
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <nav style={{ padding: '15px 20px', background: '#0ea5e9', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>Campus Soko</Link>
          <Link to="/" style={{ color: 'white' }}>Home</Link>
          {isAuthenticated && (
            <Link to="/post" style={{ color: 'white' }}>Post Item</Link>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {isAuthenticated ? (
            <>
              <Link to="/messages" style={{ color: 'white', position: 'relative' }}>
                Messages
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: 'red', borderRadius: '50%', padding: '2px 6px', fontSize: '12px' }}>{unreadCount}</span>
                )}
              </Link>
              <Link to="/dashboard" style={{ color: 'white' }}>Dashboard</Link>
              <Link to="/profile" style={{ color: 'white' }}>Profile</Link>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white' }}>Login</Link>
              <Link to="/register" style={{ color: 'white' }}>Register</Link>
            </>
          )}
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
