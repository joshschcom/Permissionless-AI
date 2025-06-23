interface UserSession {
  userId: number;
  walletAddress?: string;
  lastActivity: Date;
  preferences: {
    defaultMarket?: string;
    riskTolerance?: "low" | "medium" | "high";
    notificationsEnabled?: boolean;
    preferredChain?: string;
  };
  activeAlerts: string[];
}

export class UserSessionService {
  private sessions: Map<number, UserSession> = new Map();

  getSession(userId: number): UserSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        userId,
        lastActivity: new Date(),
        preferences: {
          riskTolerance: "medium",
          notificationsEnabled: true,
          preferredChain: "arbitrum-sepolia",
        },
        activeAlerts: [],
      });
    }

    const session = this.sessions.get(userId)!;
    session.lastActivity = new Date();
    return session;
  }

  updateSession(userId: number, updates: Partial<UserSession>): void {
    const session = this.getSession(userId);
    Object.assign(session, updates, { lastActivity: new Date() });
    this.sessions.set(userId, session);
  }

  setWallet(userId: number, address: string): void {
    this.updateSession(userId, { walletAddress: address });
  }

  getWallet(userId: number): string | undefined {
    return this.getSession(userId).walletAddress;
  }

  setPreference(
    userId: number,
    key: keyof UserSession["preferences"],
    value: any
  ): void {
    const session = this.getSession(userId);
    session.preferences[key] = value;
    this.sessions.set(userId, session);
  }

  getPreference(userId: number, key: keyof UserSession["preferences"]): any {
    return this.getSession(userId).preferences[key];
  }

  addAlert(userId: number, alertId: string): void {
    const session = this.getSession(userId);
    if (!session.activeAlerts.includes(alertId)) {
      session.activeAlerts.push(alertId);
      this.sessions.set(userId, session);
    }
  }

  removeAlert(userId: number, alertId: string): void {
    const session = this.getSession(userId);
    session.activeAlerts = session.activeAlerts.filter((id) => id !== alertId);
    this.sessions.set(userId, session);
  }

  getActiveAlerts(userId: number): string[] {
    return this.getSession(userId).activeAlerts;
  }

  // Clean up old inactive sessions (older than 30 days)
  cleanupOldSessions(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const [userId, session] of this.sessions.entries()) {
      if (session.lastActivity < thirtyDaysAgo) {
        this.sessions.delete(userId);
      }
    }
  }

  // Get session statistics
  getStats(): {
    totalUsers: number;
    activeUsers: number;
    usersWithWallets: number;
  } {
    const total = this.sessions.size;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let activeUsers = 0;
    let usersWithWallets = 0;

    for (const session of this.sessions.values()) {
      if (session.lastActivity > sevenDaysAgo) {
        activeUsers++;
      }
      if (session.walletAddress) {
        usersWithWallets++;
      }
    }

    return {
      totalUsers: total,
      activeUsers,
      usersWithWallets,
    };
  }
}
