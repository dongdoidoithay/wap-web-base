import { NextRequest, NextResponse } from 'next/server';
import { RegisterData, User } from '@/types';
import { validateRegistrationData, sanitizeUser, formatAuthError } from '@/lib/auth-utils';
import userDatabase from '@/lib/user-database';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterData = await request.json();
    
    // Validate input data
    const validation = validateRegistrationData(body);
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

    // Create user
    const user = await userDatabase.createUser(body);
    
    // Create email verification token (for future use)
    const verificationToken = userDatabase.createVerificationToken(user.email);
    
    // Return success response (without password)
    const sanitizedUser = sanitizeUser(user);
    
    return NextResponse.json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      user: sanitizedUser,
      verificationToken: verificationToken.token // In production, send this via email
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle specific errors
    if (error.message === 'EMAIL_ALREADY_EXISTS' || error.message === 'USERNAME_ALREADY_EXISTS') {
      return NextResponse.json(
        { 
          success: false, 
          message: formatAuthError(error.message) 
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during registration' 
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