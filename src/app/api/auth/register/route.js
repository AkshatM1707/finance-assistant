import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '../../../../lib/db';
import User from '../../../../models/User';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { firstName, lastName, email, password } = await request.json();

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    await user.save();

    // Return user data without password
    const userResponse = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      createdAt: user.createdAt
    };

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: userResponse
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 