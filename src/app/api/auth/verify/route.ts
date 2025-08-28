import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, sanitizeUser } from '@/lib/auth-utils';
import userDatabase from '@/lib/user-database';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie or Authorization header
    const cookieToken = request.cookies.get('auth_token')?.value;
    const authHeader = request.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const token = cookieToken || headerToken;
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No authentication token provided' 
        },
        { status: 401 }
      );
    }

    // Verify token
    const tokenValidation = verifyToken(token);
    if (!tokenValidation.isValid || !tokenValidation.payload) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid or expired token' 
        },
        { status: 401 }
      );
    }

    // Find user by ID from token
    const user = await userDatabase.findUserById(tokenValidation.payload.id);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'User not found' 
        },
        { status: 404 }
      );
    }

    // Return user data (without password)
    const sanitizedUser = sanitizeUser(user);
    
    return NextResponse.json({
      success: true,
      user: sanitizedUser,
      isAuthenticated: true
    });

  } catch (error: any) {
    console.error('Verify token error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while verifying authentication' 
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}