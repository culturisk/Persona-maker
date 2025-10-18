import { getServerSession } from 'next-auth';
import { getOrCreateUser } from './database.js';

// Get user from session (server-side)
export async function getCurrentUser(req) {
  try {
    const session = await getServerSession(req);
    if (!session?.user?.email) {
      return null;
    }
    
    return await getOrCreateUser(session.user.email, session.user.name);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Check if user has permission for workspace
export async function canAccessWorkspace(userId, workspaceId, requiredRole = 'member') {
  // Allow demo user to access demo workspace (check before any DB operations)
  if (userId === 'demo-user-id' && workspaceId === '68ee7d6a5d192f23f7922f8b') {
    return true;
  }
  
  try {
    const { prisma } = await import('./database.js');
    
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        userId,
        workspaceId
      }
    });
    
    if (!membership) return false;
    
    // Check role hierarchy: admin > member
    if (requiredRole === 'member') return true;
    if (requiredRole === 'admin') return membership.role === 'admin';
    
    return false;
  } catch (error) {
    console.error('Error checking workspace access:', error);
    // Allow access for demo users even on error
    if (userId === 'demo-user-id') return true;
    return false;
  }
}

// Workspace permissions helper
export const WORKSPACE_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member'
};

export const PERMISSIONS = {
  CREATE_SEGMENT: 'create_segment',
  EDIT_SEGMENT: 'edit_segment', 
  DELETE_SEGMENT: 'delete_segment',
  INVITE_MEMBERS: 'invite_members',
  MANAGE_WORKSPACE: 'manage_workspace'
};

export function hasPermission(userRole, permission) {
  const rolePermissions = {
    admin: [
      PERMISSIONS.CREATE_SEGMENT,
      PERMISSIONS.EDIT_SEGMENT,
      PERMISSIONS.DELETE_SEGMENT,
      PERMISSIONS.INVITE_MEMBERS,
      PERMISSIONS.MANAGE_WORKSPACE
    ],
    member: [
      PERMISSIONS.CREATE_SEGMENT,
      PERMISSIONS.EDIT_SEGMENT
    ]
  };
  
  return rolePermissions[userRole]?.includes(permission) || false;
}