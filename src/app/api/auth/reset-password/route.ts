import { NextRequest, NextResponse } from 'next/server';
import { ResetPasswordData } from '@/types';
import { validatePassword, formatAuthError } from '@/lib/auth-utils';
import userDatabase from '@/lib/user-database';

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordData = await request.json();
    
    // Validate password
    const passwordValidation = validatePassword(body.password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: passwordValidation.message 
        },
        { status: 400 }
      );
    }

    // Check password confirmation
    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Passwords do not match' 
        },
        { status: 400 }
      );
    }

    // Find and validate reset token
    const resetToken = userDatabase.findResetToken(body.token);
    if (!resetToken) {
      return NextResponse.json(
        { 
          success: false, 
          message: formatAuthError('INVALID_TOKEN') 
        },
        { status: 400 }
      );
    }

    // Find user by email from token
    const user = await userDatabase.findUserByEmail(resetToken.email);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: formatAuthError('USER_NOT_FOUND') 
        },
        { status: 404 }
      );
    }

    // Update user password
    const passwordUpdated = await userDatabase.updateUserPassword(user.id, body.password);
    if (!passwordUpdated) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Failed to update password' 
        },
        { status: 500 }
      );
    }

    // Mark token as used
    userDatabase.useResetToken(body.token);
    
    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });

  } catch (error: any) {
    console.error('Reset password error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while resetting your password' 
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