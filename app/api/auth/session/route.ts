import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-that-is-long-and-secure";
const COOKIE_NAME = "user_session";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token.value, JWT_SECRET);
    // The decoded payload should match the Pick<User, ...> structure
    return NextResponse.json({ user: decoded as Pick<User, 'id' | 'name' | 'email' | 'role'> });
  } catch (error) {
    console.error("Session API Error:", error);
    // If token is invalid or expired
    return NextResponse.json({ user: null }, { status: 401 });
  }
}