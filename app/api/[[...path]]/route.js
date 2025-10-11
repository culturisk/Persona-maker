import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma, getOrCreateUser } from '../../../lib/database.js';
import { personaAI } from '../../../lib/ai.js';
import { getCurrentUser, canAccessWorkspace, hasPermission, PERMISSIONS } from '../../../lib/auth-utils.js';
import { 
  validateSegmentForm, 
  validateCultureForm, 
  validateEconomicForm,
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
async function getWorkspaces() {
  try {
    const user = await ensureMockUser();
    const workspaces = await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      include: {
        owner: true,
        members: {
          include: { user: true }
        },
        segments: true
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
    const { name } = await request.json();
    const user = await ensureMockUser();
    
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    const workspace = await prisma.workspace.create({
      data: {
        name,
        ownerId: user.id
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

// GET /api/workspaces/:id/segments - Get segments for workspace
async function getSegments(workspaceId) {
  try {
    const segments = await prisma.segment.findMany({
      where: { workspaceId },
      include: {
        cultureProfile: true,
        economicProfile: true,
        personas: true,
        creator: true
      }
    });
    
    return NextResponse.json({ segments });
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json({ error: 'Failed to fetch segments' }, { status: 500 });
  }
}

// POST /api/segments - Create new segment
async function createSegment(request) {
  try {
    const data = await request.json();
    const user = await ensureMockUser();
    
    const segment = await prisma.segment.create({
      data: {
        ...data,
        createdBy: user.id
      }
    });
    
    return NextResponse.json({ segment });
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json({ error: 'Failed to create segment' }, { status: 500 });
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
        return await getWorkspaces();
      } else if (segments[3] === 'segments') {
        return await getSegments(segments[2]);
      }
    } else if (segments[1] === 'personas' && segments[3] === 'export') {
      return await exportPersona(segments[2]);
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch (error) {
    console.error('GET request error:', error);
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

export async function PUT(request) {
  // Handle PUT requests for updates
  return NextResponse.json({ error: 'Method not implemented' }, { status: 501 });
}

export async function DELETE(request) {
  // Handle DELETE requests
  return NextResponse.json({ error: 'Method not implemented' }, { status: 501 });
}