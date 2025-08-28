import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Clear the authentication cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

    // Remove the auth token cookie
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0 // Expire immediately
    });

    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred during logout' 
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