import { NextRequest, NextResponse } from 'next/server';
import { ForgotPasswordData } from '@/types';
import { validateEmail, formatAuthError } from '@/lib/auth-utils';
import userDatabase from '@/lib/user-database';

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordData = await request.json();
    
    // Validate email
    const emailValidation = validateEmail(body.email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: emailValidation.message 
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await userDatabase.findUserByEmail(body.email);
    
    // Always return success to prevent email enumeration attacks
    // But only actually create a token if the user exists
    if (user) {
      // Create reset token
      const resetToken = userDatabase.createResetToken(body.email);
      
      // In production, send email with reset link
      console.log(`Password reset token for ${body.email}: ${resetToken.token}`);
      console.log(`Reset link: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken.token}`);
      
      // Store token in response for demo purposes (remove in production)
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset email.',
        // Only include token in development for testing
        ...(process.env.NODE_ENV === 'development' && { resetToken: resetToken.token })
      });
    }
    
    // Return same message even if user doesn't exist
    return NextResponse.json({
      success: true,
      message: 'If an account with this email exists, you will receive a password reset email.'
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while processing your request' 
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