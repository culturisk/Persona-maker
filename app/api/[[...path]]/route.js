import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma, getOrCreateUser } from '../../../lib/database.js';
import { personaAI } from '../../../lib/ai.js';
import { getCurrentUser, canAccessWorkspace, hasPermission, PERMISSIONS } from '../../../lib/auth-utils.js';
import { 
  validateSegmentForm, 
  validateCultureForm, 
  validateEconomicForm,
  validateWorkspaceForm,
  validateContent 
} from '../../../lib/validation.js';

// Mock user fallback for demo mode
const MOCK_USER = {
  id: 'user-1',
  email: 'demo@example.com',
  name: 'Demo User'
};

async function getCurrentUserOrMock(request) {
  try {
    // Check if demo mode
    const url = new URL(request.url);
    if (url.searchParams.get('demo') === 'true') {
      return await getOrCreateUser(MOCK_USER.email, MOCK_USER.name);
    }
    
    // Try to get authenticated user
    const user = await getCurrentUser(request);
    if (user) return user;
    
    // Fallback to mock user if no auth
    return await getOrCreateUser(MOCK_USER.email, MOCK_USER.name);
  } catch (error) {
    console.error('Error getting user:', error);
    return await getOrCreateUser(MOCK_USER.email, MOCK_USER.name);
  }
}

// GET /api/workspaces - Get all workspaces for user
async function getWorkspaces(request) {
  try {
    const user = await getCurrentUserOrMock(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { 
            user: { select: { id: true, name: true, email: true } }
          }
        },
        segments: {
          include: {
            cultureProfile: true,
            economicProfile: true,
            personas: { select: { id: true, name: true } }
          }
        }
      }
    });
    
    return NextResponse.json({ workspaces });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json({ error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}

// POST /api/workspaces - Create new workspace
async function createWorkspace(request) {
  try {
    const data = await request.json();
    const user = await getCurrentUserOrMock(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const validation = validateWorkspaceForm(data);
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error,
        issues: validation.issues 
      }, { status: 400 });
    }
    
    const workspace = await prisma.workspace.create({
      data: {
        name: validation.data.name,
        ownerId: user.id
      },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });
    
    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'admin'
      }
    });
    
    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('Error creating workspace:', error);
    return NextResponse.json({ error: 'Failed to create workspace' }, { status: 500 });
  }
}

// PUT /api/workspaces/:id - Update workspace
async function updateWorkspace(request, workspaceId) {
  try {
    const data = await request.json();
    const user = await getCurrentUserOrMock(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check permissions
    const canAccess = await canAccessWorkspace(user.id, workspaceId, 'admin');
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const validation = validateWorkspaceForm(data);
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error,
        issues: validation.issues 
      }, { status: 400 });
    }
    
    const workspace = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name: validation.data.name },
      include: {
        owner: { select: { id: true, name: true, email: true } }
      }
    });
    
    return NextResponse.json({ workspace });
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
  }
}

// DELETE /api/workspaces/:id - Delete workspace
async function deleteWorkspace(request, workspaceId) {
  try {
    const user = await getCurrentUserOrMock(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is owner
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, ownerId: user.id }
    });
    
    if (!workspace) {
      return NextResponse.json({ error: 'Forbidden or not found' }, { status: 403 });
    }
    
    await prisma.workspace.delete({
      where: { id: workspaceId }
    });
    
    return NextResponse.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json({ error: 'Failed to delete workspace' }, { status: 500 });
  }
}

// GET /api/workspaces/:id/segments - Get segments for workspace
async function getSegments(workspaceId, request) {
  try {
    const user = await getCurrentUserOrMock(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canAccess = await canAccessWorkspace(user.id, workspaceId, 'member');
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const segments = await prisma.segment.findMany({
      where: { workspaceId },
      include: {
        cultureProfile: true,
        economicProfile: true,
        personas: { select: { id: true, name: true } },
        creator: { select: { id: true, name: true, email: true } }
      }
    });
    
    return NextResponse.json({ segments });
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 });
  }
}

// GET /api/segments/:id - Get single segment
async function getSegmentById(segmentId, request) {
  try {
    const user = await getCurrentUserOrMock(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const segment = await prisma.segment.findUnique({
      where: { id: segmentId },
      include: {
        workspace: true,
        cultureProfile: true,
        economicProfile: true,
        personas: true,
        creator: { select: { id: true, name: true, email: true } }
      }
    });

    if (!segment) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
    }

    const canAccess = await canAccessWorkspace(user.id, segment.workspaceId, 'member');
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return NextResponse.json({ segment });
  } catch (error) {
    console.error('Error fetching segment:', error);
    return NextResponse.json({ error: 'Failed to fetch segment' }, { status: 500 });
  }
}

// DELETE /api/personas/:id - Delete persona
async function deletePersona(request, personaId) {
  try {
    const user = await getCurrentUserOrMock(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get persona to check permissions
    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
      include: { segment: { select: { workspaceId: true } } }
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    const canAccess = await canAccessWorkspace(user.id, persona.segment.workspaceId, 'member');
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.persona.delete({
      where: { id: personaId }
    });

    return NextResponse.json({ message: 'Persona deleted successfully' });
  } catch (error) {
    console.error('Error deleting persona:', error);
    return NextResponse.json({ error: 'Failed to delete persona' }, { status: 500 });
  }
}

// Update functions for profiles
async function updateCultureProfile(request, profileId) {
  try {
    const data = await request.json();
    const user = await getCurrentUserOrMock(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const validation = validateCultureForm(data);
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error,
        issues: validation.issues 
      }, { status: 400 });
    }
    
    const profile = await prisma.cultureProfile.update({
      where: { id: profileId },
      data: validation.data
    });
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating culture profile:', error);
    return NextResponse.json({ error: 'Failed to update culture profile' }, { status: 500 });
  }
}

async function updateEconomicProfile(request, profileId) {
  try {
    const data = await request.json();
    const user = await getCurrentUserOrMock(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const validation = validateEconomicForm(data);
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error,
        issues: validation.issues 
      }, { status: 400 });
    }
    
    const profile = await prisma.economicProfile.update({
      where: { id: profileId },
      data: validation.data
    });
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating economic profile:', error);
    return NextResponse.json({ error: 'Failed to update economic profile' }, { status: 500 });
  }
}

// POST /api/segments - Create new segment
async function createSegment(request) {
  try {
    const data = await request.json();
    const user = await getCurrentUserOrMock(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const validation = validateSegmentForm(data);
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error,
        issues: validation.issues 
      }, { status: 400 });
    }
    
    // Check workspace access
    const canAccess = await canAccessWorkspace(user.id, validation.data.workspaceId, 'member');
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const segment = await prisma.segment.create({
      data: {
        ...validation.data,
        createdBy: user.id
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        cultureProfile: true,
        economicProfile: true,
        personas: { select: { id: true, name: true } }
      }
    });
    
    return NextResponse.json({ segment });
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 });
  }
}

// PUT /api/segments/:id - Update segment
async function updateSegment(request, segmentId) {
  try {
    const data = await request.json();
    const user = await getCurrentUserOrMock(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get segment to check workspace access
    const existingSegment = await prisma.segment.findUnique({
      where: { id: segmentId },
      select: { workspaceId: true }
    });
    
    if (!existingSegment) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
    }
    
    const canAccess = await canAccessWorkspace(user.id, existingSegment.workspaceId, 'member');
    if (!canAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const validation = validateSegmentForm({ ...data, workspaceId: existingSegment.workspaceId });
    if (!validation.success) {
      return NextResponse.json({ 
        error: validation.error,
        issues: validation.issues 
      }, { status: 400 });
    }
    
    const segment = await prisma.segment.update({
      where: { id: segmentId },
      data: validation.data,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        cultureProfile: true,
        economicProfile: true,
        personas: { select: { id: true, name: true } }
      }
    });
    
    return NextResponse.json({ segment });
  } catch (error) {
    console.error('Error updating segment:', error);
    return NextResponse.json({ error: 'Failed to update segment' }, { status: 500 });
  }
}

// DELETE /api/segments/:id - Delete segment
async function deleteSegment(request, segmentId) {
  try {
    const user = await getCurrentUserOrMock(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get segment to check permissions
    const segment = await prisma.segment.findUnique({
      where: { id: segmentId },
      select: { workspaceId: true, createdBy: true }
    });
    
    if (!segment) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
    }
    
    // Check if user can delete (creator or workspace admin)
    const canAccess = await canAccessWorkspace(user.id, segment.workspaceId, 'admin');
    const isCreator = segment.createdBy === user.id;
    
    if (!canAccess && !isCreator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    await prisma.segment.delete({
      where: { id: segmentId }
    });
    
    return NextResponse.json({ message: 'Segment deleted successfully' });
  } catch (error) {
    console.error('Error deleting segment:', error);
    return NextResponse.json({ error: 'Failed to delete segment' }, { status: 500 });
  }
}

// POST /api/culture-profiles - Create/update culture profile
async function createCultureProfile(request) {
  try {
    const data = await request.json();
    
    const profile = await prisma.cultureProfile.upsert({
      where: { segmentId: data.segmentId },
      update: data,
      create: data
    });
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error creating culture profile:', error);
    return NextResponse.json({ error: 'Failed to create culture profile' }, { status: 500 });
  }
}

// POST /api/economic-profiles - Create/update economic profile
async function createEconomicProfile(request) {
  try {
    const data = await request.json();
    
    const profile = await prisma.economicProfile.upsert({
      where: { segmentId: data.segmentId },
      update: data,
      create: data
    });
    
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error creating economic profile:', error);
    return NextResponse.json({ error: 'Failed to create economic profile' }, { status: 500 });
  }
}

// POST /api/personas/generate - Generate persona using AI
async function generatePersona(request) {
  try {
    const { segmentId, cultureProfileId, economicProfileId } = await request.json();
    const user = await ensureMockUser();
    
    // Fetch required data
    const segment = await prisma.segment.findUnique({
      where: { id: segmentId }
    });
    
    const cultureProfile = cultureProfileId ? await prisma.cultureProfile.findUnique({
      where: { id: cultureProfileId }
    }) : null;
    
    const economicProfile = economicProfileId ? await prisma.economicProfile.findUnique({
      where: { id: economicProfileId }
    }) : null;
    
    if (!segment) {
      return NextResponse.json({ error: 'Segment not found' }, { status: 404 });
    }
    
    // Generate persona using AI
    const personaData = await personaAI.generatePersona(segment, cultureProfile, economicProfile);
    
    // Save persona to database
    const persona = await prisma.persona.create({
      data: {
        segmentId,
        cultureProfileId,
        economicProfileId,
        name: personaData.name,
        positioning: personaData.positioning,
        culturalCues: personaData.cultural_cues,
        economicCues: personaData.economic_cues,
        generalizations: personaData.generalizations,
        pillars: personaData.pillars,
        exportSnapshot: personaData.export_snapshot,
        createdBy: user.id
      }
    });
    
    return NextResponse.json({ persona: { ...persona, ...personaData } });
  } catch (error) {
    console.error('Error generating persona:', error);
    return NextResponse.json({ error: 'Failed to generate persona' }, { status: 500 });
  }
}

// GET /api/personas/:id/export - Export persona as JSON
async function exportPersona(personaId) {
  try {
    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
      include: {
        segment: true,
        cultureProfile: true,
        economicProfile: true
      }
    });
    
    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }
    
    const exportData = {
      persona: {
        name: persona.name,
        positioning: persona.positioning,
        cultural_cues: persona.culturalCues,
        economic_cues: persona.economicCues,
        generalizations: persona.generalizations,
        pillars: persona.pillars
      },
      segment: persona.segment,
      culture_profile: persona.cultureProfile,
      economic_profile: persona.economicProfile,
      export_metadata: {
        exported_at: new Date().toISOString(),
        version: '1.0.0'
      },
      assumptions_vs_facts: persona.exportSnapshot?.assumptions_vs_facts || {}
    };
    
    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting persona:', error);
    return NextResponse.json({ error: 'Failed to export persona' }, { status: 500 });
  }
}

// Route handler
export async function GET(request) {
  const { pathname } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  
  try {
    if (segments[1] === 'workspaces') {
      if (segments.length === 2) {
        return await getWorkspaces(request);
      } else if (segments[3] === 'segments') {
        return await getSegments(segments[2], request);
      }
    } else if (segments[1] === 'segments' && segments.length === 3) {
      return await getSegmentById(segments[2], request);
    } else if (segments[1] === 'personas' && segments[3] === 'export') {
      return await exportPersona(segments[2], request);
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('GET request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  const { pathname } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  
  try {
    if (segments[1] === 'workspaces' && segments.length === 3) {
      return await updateWorkspace(request, segments[2]);
    } else if (segments[1] === 'segments' && segments.length === 3) {
      return await updateSegment(request, segments[2]);
    } else if (segments[1] === 'culture-profiles' && segments.length === 3) {
      return await updateCultureProfile(request, segments[2]);
    } else if (segments[1] === 'economic-profiles' && segments.length === 3) {
      return await updateEconomicProfile(request, segments[2]);
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('PUT request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const { pathname } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  
  try {
    if (segments[1] === 'workspaces' && segments.length === 3) {
      return await deleteWorkspace(request, segments[2]);
    } else if (segments[1] === 'segments' && segments.length === 3) {
      return await deleteSegment(request, segments[2]);
    } else if (segments[1] === 'personas' && segments.length === 3) {
      return await deletePersona(request, segments[2]);
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('DELETE request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url);
  const segments = pathname.split('/').filter(Boolean);
  
  try {
    if (segments[1] === 'workspaces' && segments.length === 2) {
      return await createWorkspace(request);
    } else if (segments[1] === 'segments') {
      return await createSegment(request);
    } else if (segments[1] === 'culture-profiles') {
      return await createCultureProfile(request);
    } else if (segments[1] === 'economic-profiles') {
      return await createEconomicProfile(request);
    } else if (segments[1] === 'personas' && segments[2] === 'generate') {
      return await generatePersona(request);
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('POST request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Duplicate handlers removed - using the ones above