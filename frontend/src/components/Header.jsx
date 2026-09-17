import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import bisuLogo from '../assets/bisubilar2009.png';
import { Sun, Moon, Menu, X, Users, LogIn, LayoutDashboard, PartyPopper, MessageSquare } from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const triggerCelebrate = () => {
    confetti({
      particleCount: 110,
      spread: 85,
      origin: { y: 0.15 },
      colors: ['#0d234d', '#f59e0b', '#10b981', '#ef4444', '#3b82f6'],
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none" onClick={() => setMobileMenuOpen(false)}>
          <img
            src={bisuLogo}
            alt="BISU Bilar Official Logo"
            className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-bisu-blue-900 dark:text-white font-sans">
                BISU Bilar
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Teacher's Day Celebration
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Celebrate Icon Button (Left of Dark/Light mode switch) */}
          <button
            onClick={triggerCelebrate}
            aria-label="Celebrate Teacher's Day!"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-bisu-gold/50 group"
            title="Celebrate Teacher's Day! (Click for confetti)"
          >
            <PartyPopper className="w-5 h-5 text-bisu-gold group-hover:rotate-12 group-hover:scale-110 transition-transform duration-200" />
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all focus:outline-none focus:ring-2 focus:ring-bisu-gold/50"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-bisu-gold hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Open Wall Navigation Button */}
          <Link
            to="/wall"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive('/wall') || isActive('/open-wall')
                ? 'bg-bisu-blue-50 dark:bg-bisu-blue-950/60 text-bisu-blue-700 dark:text-bisu-gold border border-bisu-blue-200/50 dark:border-bisu-blue-800/50 shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-bisu-blue-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Wall</span>
          </Link>

          {/* Browse Faculty Button */}
          <Link
            to="/teachers"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive('/teachers')
                ? 'bg-bisu-blue-50 dark:bg-bisu-blue-950/60 text-bisu-blue-700 dark:text-bisu-blue-400 border border-bisu-blue-200/50 dark:border-bisu-blue-800/50'
                : 'text-slate-600 dark:text-slate-300 hover:text-bisu-blue-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Browse Teachers</span>
          </Link>

          {/* Login or Admin Dashboard */}
          {isAuthenticated ? (
            <Link
              to="/admin"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-bisu-blue-700 hover:bg-bisu-blue-800 text-white shadow-md shadow-bisu-blue/20 transition-all hover:shadow-lg"
            >
              <LayoutDashboard className="w-4 h-4 text-bisu-gold" />
              <span>Admin Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-bisu-blue-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all"
            >
              <LogIn className="w-4 h-4 text-slate-400" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Right Controls: Celebrate, Theme Toggle & Hamburger */}
        <div className="flex items-center gap-1.5 md:hidden">
          <button
            onClick={triggerCelebrate}
            aria-label="Celebrate Teacher's Day!"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title="Celebrate!"
          >
            <PartyPopper className="w-5 h-5 text-bisu-gold" />
          </button>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-bisu-gold" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-5 space-y-2 shadow-xl">
          <Link
            to="/wall"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
              isActive('/wall')
                ? 'bg-bisu-blue-50 dark:bg-bisu-blue-950 text-bisu-blue-700 dark:text-bisu-gold'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-5 h-5 text-bisu-blue-600 dark:text-bisu-gold" />
            <span>Open Wall</span>
          </Link>

          <Link
            to="/teachers"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
              isActive('/teachers')
                ? 'bg-bisu-blue-50 dark:bg-bisu-blue-950 text-bisu-blue-700 dark:text-bisu-gold'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Users className="w-5 h-5 text-bisu-blue-600 dark:text-bisu-blue-400" />
            <span>Browse Teachers</span>
          </Link>

          {isAuthenticated ? (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-semibold bg-bisu-blue-700 text-white"
            >
              <LayoutDashboard className="w-5 h-5 text-bisu-gold" />
              <span>Admin Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <LogIn className="w-5 h-5 text-slate-500" />
              <span>Admin Login</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
