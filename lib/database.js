// Database connection and utilities
import { PrismaClient } from './generated/prisma/index.js';

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

export { prisma };

// Helper function to create default workspace for user
export async function createDefaultWorkspace(userId, userEmail) {
  try {
    const workspace = await prisma.workspace.create({
      data: {
        name: `${userEmail.split('@')[0]}'s Workspace`,
        ownerId: userId
      }
    });
    
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: userId,
        role: 'admin'
      }
    });
    
    return workspace;
  } catch (error) {
    console.error('Error creating default workspace:', error);
    throw error;
  }
}

// Helper to get or create user
export async function getOrCreateUser(email, name) {
  try {
    let user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: { email, name }
      });
      
      // Create default workspace
      await createDefaultWorkspace(user.id, email);
    }
    
    return user;
  } catch (error) {
    console.error('Error getting or creating user:', error);
    throw error;
  }
}