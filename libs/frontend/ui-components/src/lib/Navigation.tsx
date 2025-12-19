/**
 * Navigation Bar
 * Simple top navigation with user info and logout
 */

import React from 'react';
import { Link } from 'react-router-dom';

interface NavigationProps {
  userEmail?: string;
  onLogout?: () => void;
  isAdmin?: boolean;
  className?: string;
}

export const Navigation: React.FC<NavigationProps> = ({
  userEmail,
  onLogout,
  isAdmin = false,
  className = '',
}) => {
  return (
    <nav
      style={{ zIndex: 9999 }}
      className={`fixed top-0 bg-white left-0 right-0 w-full bg-[var(--bg-primary)] border-b border-[var(--border-default)] ${className}`}
    >
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* <div className="text-lg font-semibold text-[var(--text-primary)] mr-8 pr-8 border-r border-[var(--border-default)]">
              AI Chatbot
            </div> */}

            <div className="flex items-center gap-6">
              <Link
                to="/dashboard"
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/chat"
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors"
              >
                Chatbot
              </Link>
              <Link
                to="/profile"
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors"
              >
                Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-[var(--text-secondary)]">
                {userEmail}
              </span>
            )}
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--interactive-primary)] transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
