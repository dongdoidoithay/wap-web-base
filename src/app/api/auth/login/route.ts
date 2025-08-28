import { NextRequest, NextResponse } from 'next/server';
import { AuthCredentials } from '@/types';
import { validateLoginData, verifyPassword, generateToken, sanitizeUser, formatAuthError } from '@/lib/auth-utils';
import userDatabase from '@/lib/user-database';

export async function POST(request: NextRequest) {
  try {
    const body: AuthCredentials = await request.json();
    
    // Validate input data
    const validation = validateLoginData(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation failed',
          errors: validation.errors 
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await userDatabase.findUserByEmail(body.email);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: formatAuthError('USER_NOT_FOUND') 
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(body.password, (user as any).password);
    if (!isValidPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: formatAuthError('INVALID_PASSWORD') 
        },
        { status: 401 }
      );
    }

    // Update last login time
    await userDatabase.updateUser(user.id, {
      lastLoginAt: new Date().toISOString()
    });

    // Generate token
    const token = generateToken(user);
    
    // Return success response (without password)
    const sanitizedUser = sanitizeUser(user);
    
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: sanitizedUser,
      token
    });

    // Set HTTP-only cookie for token (more secure)
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during login' 
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}