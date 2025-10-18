import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/database';

export async function POST(request) {
  try {
    const { session_id } = await request.json();
    
    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    
    // Exchange session_id for session data
    const backendUrl = process.env.EMERGENT_BACKEND_URL || 'https://demobackend.emergentagent.com';
    const response = await fetch(`${backendUrl}/auth/v1/env/oauth/session-data`, {
      headers: {
        'X-Session-ID': session_id
      }
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to validate session' }, { status: 401 });
    }
    
    const userData = await response.json();
    
    // Store user in database if not exists
    if (prisma) {
      try {
        let user = await prisma.user.findUnique({
          where: { email: userData.email }
        });
        
        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: userData.email,
              name: userData.name,
              avatarUrl: userData.picture
            }
          });
          
          // Create default workspace
          await prisma.workspace.create({
            data: {
              name: `${userData.name}'s Workspace`,
              ownerId: user.id
            }
          });
        }
        
        // Store session in database
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
        
        await prisma.session.upsert({
          where: { sessionToken: userData.session_token },
          update: {
            userId: user.id,
            expires: expiresAt
          },
          create: {
            sessionToken: userData.session_token,
            userId: user.id,
            expires: expiresAt
          }
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }
    
    // Set session cookie
    cookies().set({
      name: 'session_token',
      value: userData.session_token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    // Return user data without session token
    const { session_token, ...userDataWithoutToken } = userData;
    return NextResponse.json(userDataWithoutToken);
  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}