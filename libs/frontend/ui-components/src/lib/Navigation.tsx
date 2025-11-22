/**
 * Shared Navigation Component
 * Responsive navigation with mobile menu support
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { cn } from './design-tokens';

// Menu icons (inline SVG for no external dependencies)
const MenuIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ChatIcon = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);

export interface NavLink {
  label: string;
  to: string;
  icon?: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

interface NavigationProps {
  links: NavLink[];
  currentPath?: string;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  userEmail?: string;
  onLogout?: () => void;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  links,
  currentPath = '',
  isAuthenticated = false,
  isAdmin = false,
  userEmail,
  onLogout,
  className = '',
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredLinks = links.filter((link) => {
    if (link.requiresAdmin && !isAdmin) return false;
    if (link.requiresAuth && !isAuthenticated) return false;
    return true;
  });

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        'bg-bg-elevated border-b border-border-default',
        'shadow-sm',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 text-xl font-bold text-text-primary hover:text-interactive-primary transition-colors"
              onClick={closeMobileMenu}
            >
              <ChatIcon className="h-8 w-8 text-interactive-primary" />
              <span className="hidden sm:inline">AI Chatbot</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-4">
            <div className="flex items-center gap-1">
              {filteredLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPath === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-2 rounded-lg',
                      'text-sm font-medium transition-colors duration-200',
                      isActive
                        ? 'bg-interactive-secondary text-interactive-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                    )}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* User Menu & Theme Toggle */}
            <div className="flex items-start gap-2 ml-4 pl-4 border-l border-border-default pt-1">
              <ThemeToggle />
              {isAuthenticated && userEmail && (
                <>
                  <span className="text-sm text-text-secondary hidden lg:inline">
                    {userEmail}
                  </span>
                  {onLogout && (
                    <button
                      onClick={onLogout}
                      className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
                    >
                      Logout
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-text-primary hover:bg-bg-secondary focus:outline-none focus:ring-2 focus:ring-border-focus"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <CloseIcon className="h-6 w-6" />
              ) : (
                <MenuIcon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border-default bg-bg-elevated">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {filteredLinks.map((link) => {
              const Icon = link.icon;
              const isActive = currentPath === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-lg',
                    'text-base font-medium transition-colors',
                    'min-h-11', // Touch-friendly
                    isActive
                      ? 'bg-interactive-secondary text-interactive-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                  )}
                >
                  {Icon && <Icon className="h-6 w-6" />}
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile User Section */}
            {isAuthenticated && (
              <div className="pt-4 border-t border-border-default mt-4">
                {userEmail && (
                  <div className="px-3 py-2 text-sm text-text-secondary">
                    {userEmail}
                  </div>
                )}
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      closeMobileMenu();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors min-h-11"
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
