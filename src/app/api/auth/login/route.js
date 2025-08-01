import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';

/**
 * POST /api/auth/login
 * Authenticates a user and returns a JWT token
 * 
 * Features:
 * - Multi-user support with proper user isolation
 * - Comprehensive error handling and validation
 * - Secure password comparison using bcrypt
 * - JWT token generation with expiration
 * - HTTP-only cookie for secure token storage
 * 
 * @param {Request} request - The incoming login request
 * @returns {Response} User data and authentication token or error
 */
export async function POST(request) {
  try {
    // Connect to database with error handling
    try {
      await dbConnect();
    } catch (dbError) {
      console.error('Database connection failed during login:', dbError);
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    // Parse request body with error handling
    let email, password;
    try {
      const body = await request.json();
      email = body.email;
      password = body.password;
    } catch (parseError) {
      console.error('Failed to parse login request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format. Please check your data.' },
        { status: 400 }
      );
    }

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email with enhanced error handling
    let user;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch (dbError) {
      console.error('Database query failed during user lookup:', dbError);
      return NextResponse.json(
        { error: 'Authentication service error. Please try again.' },
        { status: 500 }
      );
    }

    // User not found - use generic message to prevent user enumeration
    if (!user) {
      console.log(`Login attempt with non-existent email: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password with error handling
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (bcryptError) {
      console.error('Password comparison failed:', bcryptError);
      return NextResponse.json(
        { error: 'Authentication error. Please try again.' },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      console.log(`Invalid password attempt for user: ${email}`);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token with error handling
    let token;
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here-development-only';
      
      // Log warning if using default secret in production
      if (!process.env.JWT_SECRET) {
        console.warn('Warning: Using default JWT secret. Set JWT_SECRET environment variable in production.');
      }
      
      token = jwt.sign(
        { 
          userId: user._id,
          email: user.email,
          // Add timestamp for additional security
          iat: Math.floor(Date.now() / 1000)
        },
        jwtSecret,
        { expiresIn: '7d' }
      );
    } catch (jwtError) {
      console.error('JWT token creation failed:', jwtError);
      return NextResponse.json(
        { error: 'Authentication token generation failed. Please try again.' },
        { status: 500 }
      );
    }

    // Return user data and token
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      currency: user.currency,
      preferences: user.preferences
    };

    const response = NextResponse.json(
      { 
        message: 'Login successful',
        user: userResponse,
        userId: user._id.toString(),
        token
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 