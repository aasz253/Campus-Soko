import React, { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../utils/api';
import {
  Menu, X, Home, PlusCircle, MessageSquare, LayoutDashboard,
  User, LogOut, LogIn, UserPlus, Bell
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

  const NavItem = ({ to, icon: Icon, children, onClick }) => (
    to ? (
      <Link
        to={to}
        onClick={onClick || closeMobileMenu}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors text-white"
      >
        <Icon size={20} />
        <span className="hidden md:inline">{children}</span>
      </Link>
    ) : (
      <button
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors text-white"
      >
        <Icon size={20} />
        <span className="hidden md:inline">{children}</span>
      </button>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-sky-500 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-white text-xl font-bold flex items-center gap-2">
              <span className="hidden sm:inline">Campus Soko</span>
              <span className="sm:hidden">CS</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              <NavItem to="/" icon={Home}>Home</NavItem>
              {isAuthenticated && (
                <NavItem to="/post" icon={PlusCircle}>Post Item</NavItem>
              )}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <NavItem to="/messages" icon={MessageSquare}>
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </NavItem>
                  <NavItem to="/dashboard" icon={LayoutDashboard}>Dashboard</NavItem>
                  <NavItem to="/profile" icon={User}>Profile</NavItem>
                  <NavItem onClick={handleLogout} icon={LogOut}>Logout</NavItem>
                </>
              ) : (
                <>
                  <NavItem to="/login" icon={LogIn}>Login</NavItem>
                  <NavItem to="/register" icon={UserPlus}>Register</NavItem>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-sky-600 border-t border-sky-400">
            <div className="px-4 py-3 space-y-1">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sky-500 text-white"
              >
                <Home size={20} />
                <span>Home</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    to="/post"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sky-500 text-white"
                  >
                    <PlusCircle size={20} />
                    <span>Post Item</span>
                  </Link>

                  <Link
                    to="/messages"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sky-500 text-white"
                  >
                    <MessageSquare size={20} />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sky-500 text-white"
                  >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sky-500 text-white"
                  >
                    <User size={20} />
                    <span>Profile</span>
                  </Link>

                  <hr className="border-sky-400 my-2" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sky-500 text-white w-full"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <hr className="border-sky-400 my-2" />
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sky-500 text-white"
                  >
                    <LogIn size={20} />
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-sky-500 text-white"
                  >
                    <UserPlus size={20} />
                    <span>Register</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
