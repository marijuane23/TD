import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import bisuLogo from '../assets/bisubilar2009.png';
import { triggerConfettiBurst } from './ConfettiCanvas.jsx';
import { createRipple } from '../utils/ripple.js';
import { Sun, Moon, Menu, X, Users, LogIn, LayoutDashboard, PartyPopper, MessageSquare } from 'lucide-react';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleCelebrateClick = (e) => {
    createRipple(e);
    const rect = e.currentTarget.getBoundingClientRect();
    triggerConfettiBurst({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 5,
      count: 75,
      spread: 90,
      velocity: 16,
      angle: -90,
    });
  };

  const handleThemeClick = (e) => {
    createRipple(e);
    toggleTheme();
  };

  return (
    <header className="sticky top-0 z-40 w-full frosted-header transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title (Preserving exact logo file, size, and position) */}
        <Link
          to="/"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-celebrate-gold rounded-xl p-1 -m-1"
          onClick={() => setMobileMenuOpen(false)}
        >
          <img
            src={bisuLogo}
            alt="BISU Bilar Official Logo"
            className="w-10 h-10 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-sans">
              BISU Bilar
            </span>
            {/* Hidden on narrow screens */}
            <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">
              Teacher's Day Celebration
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Celebrate Button (fires its own burst, excluded from page-wide click burst) */}
          <button
            type="button"
            data-celebrate-button="true"
            onClick={handleCelebrateClick}
            aria-label="Celebrate Teacher's Day!"
            className="btn-secondary-glass p-2.5 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-celebrate-gold group"
            title="Celebrate Teacher's Day!"
          >
            <PartyPopper className="w-5 h-5 text-celebrate-gold group-hover:rotate-12 group-hover:scale-110 transition-transform duration-200 pointer-events-none" />
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            type="button"
            onClick={handleThemeClick}
            aria-label="Toggle theme"
            className="btn-secondary-glass p-2.5 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-celebrate-gold"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-celebrate-gold hover:rotate-45 transition-transform duration-300 pointer-events-none" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 hover:-rotate-12 transition-transform duration-300 pointer-events-none" />
            )}
          </button>

          {/* Open Wall Navigation Button */}
          <Link
            to="/wall"
            onClick={createRipple}
            className={`btn-secondary-glass flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive('/wall') || isActive('/open-wall')
                ? '!border-celebrate-gold/50 !bg-celebrate-gold/10 text-celebrate-gold shadow-sm'
                : ''
            }`}
          >
            <MessageSquare className="w-4 h-4 pointer-events-none" />
            <span>Open Wall</span>
          </Link>

          {/* Browse Teachers Button */}
          <Link
            to="/teachers"
            onClick={createRipple}
            className={`btn-secondary-glass flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              isActive('/teachers')
                ? '!border-celebrate-blue/50 !bg-celebrate-blue/10 text-celebrate-blue shadow-sm'
                : ''
            }`}
          >
            <Users className="w-4 h-4 pointer-events-none" />
            <span>Browse Teachers</span>
          </Link>

          {/* Login or Admin Dashboard */}
          {isAuthenticated ? (
            <Link
              to="/admin"
              onClick={createRipple}
              className="btn-primary-celebrate flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-amber-500/20"
            >
              <LayoutDashboard className="w-4 h-4 pointer-events-none" />
              <span>Admin Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={createRipple}
              className="btn-secondary-glass flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold"
            >
              <LogIn className="w-4 h-4 text-slate-400 pointer-events-none" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Right Controls: Celebrate, Theme Toggle & Hamburger */}
        <div className="flex items-center gap-1.5 md:hidden">
          <button
            type="button"
            data-celebrate-button="true"
            onClick={handleCelebrateClick}
            aria-label="Celebrate Teacher's Day!"
            className="btn-secondary-glass p-2 rounded-xl text-slate-700 dark:text-slate-200"
            title="Celebrate!"
          >
            <PartyPopper className="w-5 h-5 text-celebrate-gold pointer-events-none" />
          </button>

          <button
            type="button"
            onClick={handleThemeClick}
            aria-label="Toggle theme"
            className="btn-secondary-glass p-2 rounded-xl text-slate-700 dark:text-slate-200"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-celebrate-gold pointer-events-none" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 pointer-events-none" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            className="btn-secondary-glass p-2 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5 pointer-events-none" />
            ) : (
              <Menu className="w-5 h-5 pointer-events-none" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/50 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2 shadow-2xl">
          <Link
            to="/wall"
            onClick={(e) => {
              createRipple(e);
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
              isActive('/wall')
                ? 'bg-celebrate-gold/15 text-celebrate-gold font-semibold'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-5 h-5 text-celebrate-gold" />
            <span>Open Wall</span>
          </Link>

          <Link
            to="/teachers"
            onClick={(e) => {
              createRipple(e);
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium transition-colors ${
              isActive('/teachers')
                ? 'bg-celebrate-blue/15 text-celebrate-blue font-semibold'
                : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <Users className="w-5 h-5 text-celebrate-blue" />
            <span>Browse Teachers</span>
          </Link>

          {isAuthenticated ? (
            <Link
              to="/admin"
              onClick={(e) => {
                createRipple(e);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-bold btn-primary-celebrate"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Admin Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={(e) => {
                createRipple(e);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              <LogIn className="w-5 h-5 text-slate-400" />
              <span>Login</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
