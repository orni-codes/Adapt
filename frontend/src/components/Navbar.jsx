import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, Dna, History, User as UserIcon } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userName, userEmail, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Learning DNA', path: '/learning-dna' },
    { name: 'Sessions', path: '/sessions' },
  ];

  const isActive = (path) => {
    if (path === '/how-it-works') {
      return location.pathname === '/' || location.pathname === '/how-it-works';
    }
    return location.pathname === path;
  };

  const handleLinkClick = (path) => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    if (path === '/home' && location.pathname === '/') {
      const el = document.getElementById('how-it-works');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    navigate(path);
  };

  const handleLogout = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  // Close user dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  return (
    <nav className="sticky top-0 z-50 h-16 bg-[#050709]/95 backdrop-blur-md border-b border-[#141C24] transition-colors duration-200">
      <div className="max-w-7xl mx-auto h-full px-6 md:px-12 flex items-center justify-between">
        {/* Left: Brand / Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          {/* Cyan DNA Brand Glyph */}
          <div className="w-5 h-5 flex items-center justify-center text-[#00C7D4] transition-transform duration-300 group-hover:scale-110">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.4" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="w-full h-full"
            >
              <path d="M2 15c6.667-6 13.333 0 20-6" />
              <path d="M9 22c1.8-2 2.5-4 2.8-6" />
              <path d="M15 2c-1.8 2-2.5 4-2.8 6" />
              <path d="M17 6l-2.5-2.5" />
              <path d="M14 8l-1-1" />
              <path d="M7 18l2.5 2.5" />
              <path d="M3.5 14.5l.5.5" />
              <path d="M20 9.5l.5.5" />
            </svg>
          </div>
          <span className="font-bold tracking-[0.15em] text-sm text-white font-sans uppercase">
            ADAPT
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <button
                key={link.name}
                onClick={() => handleLinkClick(link.path)}
                className={`text-sm transition-colors duration-150 py-1 focus:outline-none ${
                  active
                    ? 'text-white font-medium'
                    : 'text-[#7E8B9B] hover:text-white'
                }`}
              >
                {link.name}
              </button>
            );
          })}
        </div>

        {/* Right: Auth State & Action Button */}
        <div className="hidden md:flex items-center gap-5">
          {isAuthenticated ? (
            /* Authenticated User Menu */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-8 h-8 rounded-full bg-[#0D141C] border border-[#1E2D3D] flex items-center justify-center text-xs font-semibold text-[#00C7D4] hover:border-[#00C7D4]/60 transition-colors focus:outline-none"
                title={userName}
              >
                {initial}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#090D12] border border-[#141C24] rounded-lg shadow-2xl py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 border-b border-[#141C24] flex flex-col">
                    <span className="text-xs font-semibold text-white truncate">{userName}</span>
                    <span className="text-[10px] text-[#7E8B9B] truncate">{userEmail}</span>
                  </div>

                  <Link
                    to="/learning-dna"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#7E8B9B] hover:text-white hover:bg-[#0D141C] transition-colors"
                  >
                    <Dna className="w-3.5 h-3.5 text-[#00C7D4]" />
                    <span>Learning DNA</span>
                  </Link>

                  <Link
                    to="/sessions"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#7E8B9B] hover:text-white hover:bg-[#0D141C] transition-colors"
                  >
                    <History className="w-3.5 h-3.5 text-[#00C7D4]" />
                    <span>Learning History</span>
                  </Link>

                  <div className="my-1 border-t border-[#141C24]" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unauthenticated: Log in link */
            <Link
              to="/login"
              className="text-xs text-[#7E8B9B] hover:text-white transition-colors"
            >
              Log in
            </Link>
          )}

          {/* Start Learning Button */}
          <Link
            to="/learn"
            className="inline-flex items-center justify-center gap-2 bg-[#00C7D4] hover:bg-[#18DCE8] text-[#050709] text-xs font-semibold px-4 py-2 rounded-md transition-all duration-150 active:scale-[0.98] shadow-[0_0_12px_rgba(0,199,212,0.2)]"
          >
            <span>Start learning</span>
            <span className="text-sm font-bold">→</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-3">
          {isAuthenticated ? (
            <button
              onClick={() => handleLinkClick('/learning-dna')}
              className="w-7 h-7 rounded-full bg-[#0D141C] border border-[#1E2D3D] flex items-center justify-center text-[10px] font-semibold text-[#00C7D4]"
            >
              {initial}
            </button>
          ) : (
            <Link
              to="/login"
              className="text-xs text-[#00C7D4]"
            >
              Log in
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-[#7E8B9B] hover:text-white p-1 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#050709] border-b border-[#141C24] px-6 py-4 flex flex-col gap-4 animate-fade-in">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleLinkClick(link.path)}
              className={`text-left text-sm py-1.5 ${
                isActive(link.path)
                  ? 'text-white font-medium'
                  : 'text-[#7E8B9B] hover:text-white'
              }`}
            >
              {link.name}
            </button>
          ))}

          <div className="pt-2 border-t border-[#141C24] flex flex-col gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-left text-xs text-red-400 py-1"
              >
                Log out ({userName})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left text-xs text-[#7E8B9B] hover:text-white py-1"
              >
                Log in to your account
              </Link>
            )}

            <Link
              to="/learn"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#00C7D4] text-[#050709] text-xs font-semibold px-4 py-2.5 rounded-md w-full"
            >
              <span>Start learning</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
