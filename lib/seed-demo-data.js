import { prisma } from './database.js';

export async function seedDemoData() {
  try {
    // Check/create demo user
    let demoUser = await prisma.user.findUnique({
      where: { email: 'demo@pricer.com' }
    });
    
    if (!demoUser) {
      demoUser = await prisma.user.create({
        data: {
          email: 'demo@pricer.com',
          name: 'Demo User'
        }
      });
    }

    // Check/create demo workspace
    let workspace = await prisma.workspace.findFirst({
      where: { ownerId: demoUser.id }
    });
    
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          name: 'Demo Workspace',
          ownerId: demoUser.id
        }
      });
      
      // Add workspace member
      await prisma.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: demoUser.id,
          role: 'admin'
        }
      });
    }

    console.log('✅ Demo data seeded successfully');
    return { user: demoUser, workspace };
  } catch (error) {
    console.error('Error seeding demo data:', error);
    throw error;
  }
}
