import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Logs out the user by clearing the authentication cookie
 * 
 * @param {Request} request - The incoming logout request
 * @returns {Response} Success message with cleared cookie
 */
export async function POST(request) {
  try {
    // Create response with success message
    const response = NextResponse.json({
      message: 'Logged out successfully'
    });

    // Clear the auth-token cookie by setting it to expire in the past
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0), // Expire immediately
      path: '/'
    });

    console.log('User logged out successfully');
    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}