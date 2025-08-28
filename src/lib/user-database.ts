import { User, RegisterData, PasswordResetToken, EmailVerificationToken } from '@/types';
import { hashPassword } from './auth-utils';

// Simple in-memory database for demo purposes
// In production, use a real database
class UserDatabase {
  private users: User[] = [];
  private resetTokens: PasswordResetToken[] = [];
  private verificationTokens: EmailVerificationToken[] = [];
  private initialized = false;

  constructor() {
    this.initializeDatabase();
  }

  private initializeDatabase() {
    if (this.initialized) return;
    
    // Load from localStorage if available (client-side only)
    if (typeof window !== 'undefined') {
      try {
        const storedUsers = localStorage.getItem('auth_users');
        const storedResetTokens = localStorage.getItem('auth_reset_tokens');
        const storedVerificationTokens = localStorage.getItem('auth_verification_tokens');
        
        if (storedUsers) {
          this.users = JSON.parse(storedUsers);
        }
        
        if (storedResetTokens) {
          this.resetTokens = JSON.parse(storedResetTokens);
        }
        
        if (storedVerificationTokens) {
          this.verificationTokens = JSON.parse(storedVerificationTokens);
        }
      } catch (error) {
        console.error('Error loading user data from localStorage:', error);
      }
    }
    
    this.initialized = true;
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('auth_users', JSON.stringify(this.users));
        localStorage.setItem('auth_reset_tokens', JSON.stringify(this.resetTokens));
        localStorage.setItem('auth_verification_tokens', JSON.stringify(this.verificationTokens));
      } catch (error) {
        console.error('Error saving user data to localStorage:', error);
      }
    }
  }

  // User management
  async createUser(userData: RegisterData): Promise<User> {
    const existingUser = this.users.find(
      user => user.email === userData.email || user.username === userData.username
    );
    
    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new Error('EMAIL_ALREADY_EXISTS');
      }
      if (existingUser.username === userData.username) {
        throw new Error('USERNAME_ALREADY_EXISTS');
      }
    }

    const hashedPassword = await hashPassword(userData.password);
    
    const user: User = {
      id: this.generateId(),
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      role: 'user'
    };

    // Store password separately (in production, use proper user model)
    (user as any).password = hashedPassword;
    
    this.users.push(user);
    this.saveToStorage();
    
    return user;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    return this.users.find(user => user.username === username) || null;
  }

  async findUserById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return null;
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage();
    return this.users[userIndex];
  }

  async updateUserPassword(id: string, newPassword: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return false;
    }

    const hashedPassword = await hashPassword(newPassword);
    (this.users[userIndex] as any).password = hashedPassword;
    this.users[userIndex].updatedAt = new Date().toISOString();
    
    this.saveToStorage();
    return true;
  }

  // Password reset tokens
  createResetToken(email: string): PasswordResetToken {
    // Remove existing tokens for this email
    this.resetTokens = this.resetTokens.filter(token => token.email !== email);
    
    const token: PasswordResetToken = {
      token: this.generateToken(),
      email,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      isUsed: false
    };
    
    this.resetTokens.push(token);
    this.saveToStorage();
    
    return token;
  }

  findResetToken(token: string): PasswordResetToken | null {
    return this.resetTokens.find(t => 
      t.token === token && 
      !t.isUsed && 
      new Date(t.expiresAt) > new Date()
    ) || null;
  }

  useResetToken(token: string): boolean {
    const resetToken = this.resetTokens.find(t => t.token === token);
    
    if (!resetToken) {
      return false;
    }
    
    resetToken.isUsed = true;
    this.saveToStorage();
    
    return true;
  }

  // Email verification tokens
  createVerificationToken(email: string): EmailVerificationToken {
    // Remove existing tokens for this email
    this.verificationTokens = this.verificationTokens.filter(token => token.email !== email);
    
    const token: EmailVerificationToken = {
      token: this.generateToken(),
      email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      isUsed: false
    };
    
    this.verificationTokens.push(token);
    this.saveToStorage();
    
    return token;
  }

  findVerificationToken(token: string): EmailVerificationToken | null {
    return this.verificationTokens.find(t => 
      t.token === token && 
      !t.isUsed && 
      new Date(t.expiresAt) > new Date()
    ) || null;
  }

  useVerificationToken(token: string): boolean {
    const verificationToken = this.verificationTokens.find(t => t.token === token);
    
    if (!verificationToken) {
      return false;
    }
    
    verificationToken.isUsed = true;
    this.saveToStorage();
    
    return true;
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Get all users (for admin purposes)
  getAllUsers(): User[] {
    return this.users.map(user => {
      const { password, ...userWithoutPassword } = user as any;
      return userWithoutPassword;
    });
  }

  // Clear all data (for testing)
  clearAllData() {
    this.users = [];
    this.resetTokens = [];
    this.verificationTokens = [];
    this.saveToStorage();
  }
}

// Create singleton instance
const userDatabase = new UserDatabase();

export default userDatabase;