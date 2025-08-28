import { User, AuthCredentials, RegisterData } from '@/types';

// Simple password validation
export function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
}

// Email validation
export function validateEmail(email: string): { isValid: boolean; message?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
}

// Username validation
export function validateUsername(username: string): { isValid: boolean; message?: string } {
  if (username.length < 3) {
    return { isValid: false, message: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 20) {
    return { isValid: false, message: 'Username must be no more than 20 characters' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
  }
  
  return { isValid: true };
}

// Simple hash function (for demo purposes - in production use bcrypt)
export async function hashPassword(password: string): Promise<string> {
  // This is a simple demo hash - replace with bcrypt in production
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Verify password against hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password);
  return inputHash === hash;
}

// Generate simple JWT-like token (demo purposes)
export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  };
  
  // Simple base64 encoding (in production use proper JWT library)
  return btoa(JSON.stringify(payload));
}

// Verify token
export function verifyToken(token: string): { isValid: boolean; payload?: any } {
  try {
    const payload = JSON.parse(atob(token));
    
    if (payload.exp < Date.now()) {
      return { isValid: false };
    }
    
    return { isValid: true, payload };
  } catch (error) {
    return { isValid: false };
  }
}

// Generate reset token
export function generateResetToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Validate registration data
export function validateRegistrationData(data: RegisterData): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message!;
  }
  
  // Validate username
  const usernameValidation = validateUsername(data.username);
  if (!usernameValidation.isValid) {
    errors.username = usernameValidation.message!;
  }
  
  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message!;
  }
  
  // Check password confirmation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Validate first name if provided
  if (data.firstName && data.firstName.trim().length < 1) {
    errors.firstName = 'First name cannot be empty';
  }
  
  // Validate last name if provided
  if (data.lastName && data.lastName.trim().length < 1) {
    errors.lastName = 'Last name cannot be empty';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Validate login data
export function validateLoginData(data: AuthCredentials): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  if (!data.email || data.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else {
    const emailValidation = validateEmail(data.email);
    if (!emailValidation.isValid) {
      errors.email = emailValidation.message!;
    }
  }
  
  if (!data.password || data.password.length === 0) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Sanitize user data for client
export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { ...sanitizedUser } = user;
  return sanitizedUser;
}

// Format error messages
export function formatAuthError(error: string): string {
  switch (error) {
    case 'USER_NOT_FOUND':
      return 'No account found with this email address';
    case 'INVALID_PASSWORD':
      return 'Invalid email or password';
    case 'EMAIL_ALREADY_EXISTS':
      return 'An account with this email already exists';
    case 'USERNAME_ALREADY_EXISTS':
      return 'This username is already taken';
    case 'INVALID_TOKEN':
      return 'Invalid or expired token';
    case 'TOKEN_EXPIRED':
      return 'Reset token has expired';
    default:
      return 'An unexpected error occurred';
  }
}