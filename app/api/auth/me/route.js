import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const sessionToken = cookies().get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Check session in database
    if (prisma) {
      try {
        const session = await prisma.session.findUnique({
          where: { sessionToken },
          include: { user: true }
        });
        
        if (!session || new Date() > session.expires) {
          // Clear invalid session
          cookies().delete('session_token');
          return NextResponse.json({ error: 'Session expired' }, { status: 401 });
        }
        
        return NextResponse.json({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          picture: session.user.avatarUrl
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
      }
    }
    
    // Fallback to Emergent API validation
    const response = await fetch('https://demobackend.emergentagent.com/auth/v1/env/user', {
      headers: {
        'Authorization': `Bearer ${sessionToken}`
      }
    });
    
    if (!response.ok) {
      cookies().delete('session_token');
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }
    
    const userData = await response.json();
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Authentication check failed' }, { status: 500 });
  }
}