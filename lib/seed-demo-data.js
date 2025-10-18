import { prisma } from './database.js';

export async function seedDemoData() {
  try {
    // Create demo user
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@pricer.com' },
      update: {},
      create: {
        email: 'demo@pricer.com',
        name: 'Demo User'
      }
    });

    // Create demo workspace
    const workspace = await prisma.workspace.upsert({
      where: { id: '68ee7d6a5d192f23f7922f8b' },
      update: {},
      create: {
        id: '68ee7d6a5d192f23f7922f8b',
        name: 'Demo Workspace',
        ownerId: demoUser.id
      }
    });

    // Add workspace member
    await prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId: demoUser.id
        }
      },
      update: {},
      create: {
        workspaceId: workspace.id,
        userId: demoUser.id,
        role: 'admin'
      }
    });

    console.log('✅ Demo data seeded successfully');
    return { user: demoUser, workspace };
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}
