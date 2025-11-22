/**
 * Session Recovery Service
 * Handles user session restoration after authentication failures or app crashes
 */

export interface SessionData {
  userId?: string;
  sessionId?: string;
  token?: string;
  refreshToken?: string;
  expiresAt?: number;
  user?: {
    id: string;
    email: string;
    username?: string;
    role?: string;
  };
}

export interface SessionRecoveryOptions {
  storageKey?: string;
  autoRefresh?: boolean;
  refreshThreshold?: number; // Refresh token when this close to expiry (ms)
}

class SessionRecoveryServiceImpl {
  private storageKey = '__app_session_data__';
  private autoRefresh = true;
  private refreshThreshold = 5 * 60 * 1000; // 5 minutes
  private refreshInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize session recovery service
   */
  initialize(options?: SessionRecoveryOptions) {
    if (options?.storageKey) this.storageKey = options.storageKey;
    if (options?.autoRefresh !== undefined)
      this.autoRefresh = options.autoRefresh;
    if (options?.refreshThreshold)
      this.refreshThreshold = options.refreshThreshold;

    if (this.autoRefresh) {
      this.startAutoRefresh();
    }
  }

  /**
   * Save session data to storage
   */
  saveSession(data: SessionData): void {
    try {
      const encrypted = btoa(JSON.stringify(data)); // Basic encoding (use proper encryption in production)
      localStorage.setItem(this.storageKey, encrypted);

      if (import.meta.env.MODE === 'development') {
        console.log('[SessionRecovery] Session saved');
      }
    } catch (error) {
      console.error('[SessionRecovery] Failed to save session:', error);
    }
  }

  /**
   * Restore session data from storage
   */
  restoreSession(): SessionData | null {
    try {
      const encrypted = localStorage.getItem(this.storageKey);
      if (!encrypted) return null;

      const data = JSON.parse(atob(encrypted)) as SessionData;

      // Check if session is expired
      if (data.expiresAt && data.expiresAt < Date.now()) {
        this.clearSession();
        return null;
      }

      if (import.meta.env.MODE === 'development') {
        console.log('[SessionRecovery] Session restored');
      }

      return data;
    } catch (error) {
      console.error('[SessionRecovery] Failed to restore session:', error);
      return null;
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(): Promise<boolean> {
    try {
      const session = this.restoreSession();
      if (!session || !session.refreshToken) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.refreshToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearSession();
        }
        return false;
      }

      const newSession = await response.json();
      this.saveSession(newSession);

      if (import.meta.env.MODE === 'development') {
        console.log('[SessionRecovery] Session refreshed');
      }

      return true;
    } catch (error) {
      console.error('[SessionRecovery] Failed to refresh session:', error);
      return false;
    }
  }

  /**
   * Clear session data
   */
  clearSession(): void {
    try {
      localStorage.removeItem(this.storageKey);

      if (import.meta.env.MODE === 'development') {
        console.log('[SessionRecovery] Session cleared');
      }
    } catch (error) {
      console.error('[SessionRecovery] Failed to clear session:', error);
    }
  }

  /**
   * Check if session exists and is valid
   */
  isSessionValid(): boolean {
    const session = this.restoreSession();
    return session !== null && session.userId !== undefined;
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionData | null {
    return this.restoreSession();
  }

  /**
   * Start automatic token refresh
   */
  private startAutoRefresh(): void {
    if (this.refreshInterval) return;

    this.refreshInterval = setInterval(async () => {
      const session = this.restoreSession();
      if (!session || !session.expiresAt) return;

      const timeUntilExpiry = session.expiresAt - Date.now();

      if (timeUntilExpiry < this.refreshThreshold) {
        const success = await this.refreshSession();

        if (!success && import.meta.env.MODE === 'development') {
          console.warn('[SessionRecovery] Automatic refresh failed');
        }
      }
    }, 60000); // Check every minute
  }

  /**
   * Stop automatic token refresh
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Handle auth error by attempting recovery
   */
  async handleAuthError(): Promise<boolean> {
    // Try to refresh token
    const refreshed = await this.refreshSession();

    if (!refreshed) {
      // Redirect to login
      window.location.href = '/auth/login';
      return false;
    }

    return true;
  }

  /**
   * Handle critical error by preserving session
   */
  preserveSessionForCrash(): SessionData | null {
    const session = this.restoreSession();

    if (session) {
      // Store in sessionStorage as well for quick recovery
      try {
        sessionStorage.setItem(
          `${this.storageKey}_crash_backup`,
          JSON.stringify(session)
        );
      } catch (error) {
        console.error('[SessionRecovery] Failed to backup session:', error);
      }
    }

    return session;
  }

  /**
   * Recover from crash
   */
  recoverFromCrash(): SessionData | null {
    try {
      const backup = sessionStorage.getItem(`${this.storageKey}_crash_backup`);

      if (backup) {
        const session = JSON.parse(backup) as SessionData;
        this.saveSession(session);
        sessionStorage.removeItem(`${this.storageKey}_crash_backup`);

        if (import.meta.env.MODE === 'development') {
          console.log('[SessionRecovery] Recovered from crash');
        }

        return session;
      }
    } catch (error) {
      console.error('[SessionRecovery] Failed to recover from crash:', error);
    }

    return null;
  }
}

export const sessionRecoveryService = new SessionRecoveryServiceImpl();
