import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/database';

export async function POST() {
  try {
    const sessionToken = cookies().get('session_token')?.value;
    
    // Delete session from database
    if (prisma && sessionToken) {
      try {
        await prisma.session.delete({
          where: { sessionToken }
        });
      } catch (dbError) {
        console.error('Error deleting session:', dbError);
      }
    }
    
    // Clear the session cookie
    cookies().delete('session_token');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}