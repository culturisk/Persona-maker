'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Users, 
  Building, 
  Globe, 
  DollarSign, 
  Brain, 
  FileText, 
  Plus, 
  Download,
  Lightbulb,
  Target,
  Heart,
  AlertTriangle,
  Edit,
  Trash2,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';
import { WorkspaceHeader } from '@/components/workspace-header.jsx';
import { FormField } from '@/components/ui/form-field.jsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner.jsx';
import { PersonaExport } from '@/components/persona-export.jsx';
import { PersonaDetail } from '@/components/persona-detail.jsx';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { 
  INCOME_BRACKETS,
  PROFESSIONS,
  INDUSTRIES,
  EMPLOYMENT_TYPES,
  FINANCIAL_BACKGROUNDS,
  FAMILY_FINANCIAL_BACKGROUNDS,
  SES_LEVELS,
  PRICE_SENSITIVITY,
  PURCHASE_FREQUENCY,
  SAVINGS_INCLINATION,
  RISK_APPETITE,
  CREDIT_ACCESS,
  FINANCIAL_GOALS,
  CONSTRAINTS,
  PAYMENT_BEHAVIOURS,
  LOCALES,
  URBANICITY,
  COMMUNICATION_STYLES,
  TIME_ORIENTATIONS,
  FORMALITY_NORMS,
  VALUES_LIBRARY,
  EMOTIONS_LIBRARY,
  FEARS_LIBRARY,
  CULTURE_AXES
} from '../lib/seed-data.js';

function AppContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemoMode = searchParams?.get('demo') === 'true';
  
  const [activeStep, setActiveStep] = useState('workspace');
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [editingSegment, setEditingSegment] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  
  // Form states
  const [segmentForm, setSegmentForm] = useState({
    name: '',
    frame: '',
    product: '',
    primaryBenefit: '',
    reason: '',
    context: '',
    cultureAxes: {},
    values: [],
    emotions: [],
    fears: [],
    evidence: '',
    notes: ''
  });
  
  const [cultureForm, setCultureForm] = useState({
    locale: '',
    languages: [],
    region: {},
    urbanicity: '',
    communicationStyle: '',
    timeOrientation: '',
    formalityNorm: '',
    workweek: { start: 'Mon', end: 'Fri', weekend: ['Sat', 'Sun'] },
    schedulingNorms: {},
    festivals: [],
    purchasingConstraints: {},
    deviceChannelPrefs: {}
  });
  
  const [economicForm, setEconomicForm] = useState({
    incomeBracket: '',
    currency: 'INR',
    profession: '',
    industry: '',
    yearsOfService: '',
    employmentType: '',
    financialBackground: '',
    familyFinancialBackground: '',
    socioeconomicStatus: '',
    priceSensitivity: '',
    purchaseFrequency: '',
    paymentBehaviour: {},
    savingsInclination: '',
    riskAppetite: '',
    creditAccess: '',
    financialGoals: [],
    constraints: []
  });
  
  const [generatedPersona, setGeneratedPersona] = useState(null);
  const [viewingPersona, setViewingPersona] = useState(null);

  // Authentication check
  useEffect(() => {
    if (status === 'loading') return; // Still loading
    
    if (!session && !isDemoMode) {
      router.push('/auth/signin');
      return;
    }
    
    loadWorkspaces();
  }, [session, status, isDemoMode, router]);

  const loadWorkspaces = async () => {
    try {
      const url = isDemoMode ? '/api/workspaces?demo=true' : '/api/workspaces';
      const response = await fetch(url);
      const data = await response.json();
      setWorkspaces(data.workspaces || []);
      
      if (data.workspaces?.length > 0) {
        setCurrentWorkspace(data.workspaces[0]);
        loadSegments(data.workspaces[0].id);
      }
    } catch (error) {
      toast.error('Failed to load workspaces');
    }
  };

  const loadSegments = async (workspaceId) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/segments`);
      const data = await response.json();
      setSegments(data.segments || []);
    } catch (error) {
      toast.error('Failed to load segments');
    }
  };

  // Enhanced segment management
  const deleteSegment = async (segmentId) => {
    try {
      const response = await fetch(`/api/segments/${segmentId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast.success('Segment deleted successfully');
        setSegments(segments.filter(s => s.id !== segmentId));
        setDeletingItem(null);
      } else {
        toast.error('Failed to delete segment');
      }
    } catch (error) {
      toast.error('Error deleting segment');
    }
  };

  const duplicateSegment = async (segment) => {
    try {
      const duplicateData = {
        ...segment,
        name: `${segment.name} (Copy)`,
        workspaceId: currentWorkspace.id
      };
      delete duplicateData.id;
      delete duplicateData.createdBy;
      delete duplicateData.creator;
      delete duplicateData.cultureProfile;
      delete duplicateData.economicProfile;
      delete duplicateData.personas;
      
      const response = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateData)
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Segment duplicated successfully');
        setSegments([...segments, data.segment]);
      } else {
        toast.error('Failed to duplicate segment');
      }
    } catch (error) {
      toast.error('Error duplicating segment');
    }
  };

  // Search and filter functionality
  const filteredSegments = segments.filter(segment => {
    const matchesSearch = segment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         segment?.context?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterBy === 'all') return matchesSearch;
    if (filterBy === 'with_personas') return matchesSearch && segment.personas?.length > 0;
    if (filterBy === 'without_personas') return matchesSearch && (!segment.personas || segment.personas.length === 0);
    if (filterBy === 'complete') return matchesSearch && segment.cultureProfile && segment.economicProfile;
    
    return matchesSearch;
  });

  const createSegment = async () => {
    if (!currentWorkspace) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...segmentForm,
          workspaceId: currentWorkspace.id
        })
      });
      
      const data = await response.json();
      setCurrentSegment(data.segment);
      setSegments([...segments, data.segment]);
      setActiveStep('culture');
      toast.success('Segment created successfully');
    } catch (error) {
      toast.error('Failed to create segment');
    } finally {
      setLoading(false);
    }
  };

  const saveCultureProfile = async () => {
    if (!currentSegment) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/culture-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cultureForm,
          segmentId: currentSegment.id
        })
      });
      
      await response.json();
      setActiveStep('economics');
      toast.success('Culture profile saved');
    } catch (error) {
      toast.error('Failed to save culture profile');
    } finally {
      setLoading(false);
    }
  };

  const saveEconomicProfile = async () => {
    if (!currentSegment) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/economic-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...economicForm,
          segmentId: currentSegment.id
        })
      });
      
      await response.json();
      setActiveStep('persona');
      toast.success('Economic profile saved');
    } catch (error) {
      toast.error('Failed to save economic profile');
    } finally {
      setLoading(false);
    }
  };

  const generatePersona = async () => {
    if (!currentSegment) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          segmentId: currentSegment.id,
          cultureProfileId: currentSegment.cultureProfile?.id,
          economicProfileId: currentSegment.economicProfile?.id
        })
      });
      
      const data = await response.json();
      setGeneratedPersona(data.persona);
      toast.success('Persona generated successfully');
    } catch (error) {
      toast.error('Failed to generate persona');
    } finally {
      setLoading(false);
    }
  };

  const renderWorkspaceStep = () => (
    <div className="space-y-6">
      {currentWorkspace ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Segments
                </div>
                <Button onClick={() => setActiveStep('segment')}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Segment
                </Button>
              </CardTitle>
              <CardDescription>
                Manage your segmentation projects and personas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search segments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Segments</SelectItem>
                    <SelectItem value="with_personas">With Personas</SelectItem>
                    <SelectItem value="without_personas">No Personas</SelectItem>
                    <SelectItem value="complete">Complete Profiles</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Segments List */}
              {filteredSegments.length > 0 ? (
                <div className="space-y-3">
                  {filteredSegments.map(segment => (
                    <div key={segment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{segment.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {segment.context || 'No context provided'}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant={segment.cultureProfile ? "default" : "secondary"}>
                              Culture {segment.cultureProfile ? "✓" : "○"}
                            </Badge>
                            <Badge variant={segment.economicProfile ? "default" : "secondary"}>
                              Economics {segment.economicProfile ? "✓" : "○"}
                            </Badge>
                            <Badge 
                              variant={segment.personas?.length > 0 ? "default" : "secondary"}
                              className="cursor-pointer"
                              onClick={() => {
                                if (segment.personas?.length > 0) {
                                  setViewingPersona(segment.personas[0]);
                                }
                              }}
                            >
                              Personas ({segment.personas?.length || 0})
                            </Badge>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setCurrentSegment(segment);
                              setActiveStep('segment');
                              setEditingSegment(segment);
                            }}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => duplicateSegment(segment)}>
                              <Plus className="w-4 h-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => setDeletingItem({ type: 'segment', id: segment.id, name: segment.name })}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">No segments found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filterBy !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Create your first segment to get started with persona generation'
                    }
                  </p>
                  {!searchTerm && filterBy === 'all' && (
                    <Button onClick={() => setActiveStep('segment')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Segment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Loading workspace...</h3>
            <LoadingSpinner className="mx-auto" />
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deletingItem?.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingItem?.type === 'segment') {
                  deleteSegment(deletingItem.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );

  const renderSegmentStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Create Segment
          </CardTitle>
          <CardDescription>
            Define the core framework for your target segment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Segment Name *</Label>
              <Input
                id="name"
                value={segmentForm.name}
                onChange={(e) => setSegmentForm({...segmentForm, name: e.target.value})}
                placeholder="e.g., Tech-Savvy Small Business Owners"
              />
            </div>
            
            <div>
              <Label htmlFor="product">Product/Service</Label>
              <Input
                id="product"
                value={segmentForm.product}
                onChange={(e) => setSegmentForm({...segmentForm, product: e.target.value})}
                placeholder="e.g., CRM Software"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="primaryBenefit">Primary Benefit</Label>
            <Input
              id="primaryBenefit"
              value={segmentForm.primaryBenefit}
              onChange={(e) => setSegmentForm({...segmentForm, primaryBenefit: e.target.value})}
              placeholder="e.g., Streamlined customer management"
            />
          </div>
          
          <div>
            <Label htmlFor="context">Context/Use Case</Label>
            <Textarea
              id="context"
              value={segmentForm.context}
              onChange={(e) => setSegmentForm({...segmentForm, context: e.target.value})}
              placeholder="Describe when and how this segment uses your product..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Values</Label>
              <Select onValueChange={(value) => {
                if (!segmentForm.values.includes(value)) {
                  setSegmentForm({
                    ...segmentForm, 
                    values: [...segmentForm.values, value]
                  });
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Add values" />
                </SelectTrigger>
                <SelectContent>
                  {VALUES_LIBRARY.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {segmentForm.values.map(value => (
                  <Badge key={value} variant="secondary" className="text-xs">
                    {VALUES_LIBRARY.find(v => v.value === value)?.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Emotions</Label>
              <Select onValueChange={(value) => {
                if (!segmentForm.emotions.includes(value)) {
                  setSegmentForm({
                    ...segmentForm, 
                    emotions: [...segmentForm.emotions, value]
                  });
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Add emotions" />
                </SelectTrigger>
                <SelectContent>
                  {EMOTIONS_LIBRARY.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {segmentForm.emotions.map(emotion => (
                  <Badge key={emotion} variant="secondary" className="text-xs">
                    {EMOTIONS_LIBRARY.find(e => e.value === emotion)?.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Fears</Label>
              <Select onValueChange={(value) => {
                if (!segmentForm.fears.includes(value)) {
                  setSegmentForm({
                    ...segmentForm, 
                    fears: [...segmentForm.fears, value]
                  });
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Add fears" />
                </SelectTrigger>
                <SelectContent>
                  {FEARS_LIBRARY.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1 mt-2">
                {segmentForm.fears.map(fear => (
                  <Badge key={fear} variant="secondary" className="text-xs">
                    {FEARS_LIBRARY.find(f => f.value === fear)?.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveStep('workspace')}>
              Back
            </Button>
            <Button onClick={createSegment} disabled={loading || !segmentForm.name}>
              {loading ? 'Creating...' : 'Continue to Culture'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCultureStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Culture Layer
          </CardTitle>
          <CardDescription>
            Define cultural context, communication preferences, and regional considerations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Locale</Label>
              <Select onValueChange={(value) => setCultureForm({...cultureForm, locale: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent>
                  {LOCALES.map(locale => (
                    <SelectItem key={locale.value} value={locale.value}>
                      {locale.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Urbanicity</Label>
              <Select onValueChange={(value) => setCultureForm({...cultureForm, urbanicity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select area type" />
                </SelectTrigger>
                <SelectContent>
                  {URBANICITY.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Communication Style</Label>
              <Select onValueChange={(value) => setCultureForm({...cultureForm, communicationStyle: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {COMMUNICATION_STYLES.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Formality Norm</Label>
              <Select onValueChange={(value) => setCultureForm({...cultureForm, formalityNorm: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select formality" />
                </SelectTrigger>
                <SelectContent>
                  {FORMALITY_NORMS.map(norm => (
                    <SelectItem key={norm.value} value={norm.value}>
                      {norm.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Cultural Axes</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Position this segment on key cultural dimensions
            </p>
            
            {CULTURE_AXES.map(axis => (
              <div key={axis.name} className="mb-4 last:mb-0">
                <Label className="text-sm font-medium">{axis.name}</Label>
                <p className="text-xs text-muted-foreground mb-2">{axis.description}</p>
                <div className="flex items-center gap-4">
                  <span className="text-xs">{axis.scale.left.label}</span>
                  <div className="flex-1 grid grid-cols-5 gap-1">
                    {[1,2,3,4,5].map(value => (
                      <Button
                        key={value}
                        variant={cultureForm.cultureAxes?.[axis.name] === value ? "default" : "outline"}
                        size="sm"
                        className="h-8"
                        onClick={() => setCultureForm({
                          ...cultureForm,
                          cultureAxes: {
                            ...cultureForm.cultureAxes,
                            [axis.name]: value
                          }
                        })}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                  <span className="text-xs">{axis.scale.right.label}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveStep('segment')}>
              Back
            </Button>
            <Button onClick={saveCultureProfile} disabled={loading}>
              {loading ? 'Saving...' : 'Continue to Economics'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEconomicsStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Economic Layer
          </CardTitle>
          <CardDescription>
            Define economic context, financial behavior, and socioeconomic factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Income Bracket</Label>
              <Select onValueChange={(value) => setEconomicForm({...economicForm, incomeBracket: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select income range" />
                </SelectTrigger>
                <SelectContent>
                  {INCOME_BRACKETS[economicForm.currency].map(bracket => (
                    <SelectItem key={bracket.value} value={bracket.value}>
                      {bracket.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Profession</Label>
              <Select onValueChange={(value) => setEconomicForm({...economicForm, profession: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select profession" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONS.map(prof => (
                    <SelectItem key={prof.value} value={prof.value}>
                      {prof.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Industry</Label>
              <Select onValueChange={(value) => setEconomicForm({...economicForm, industry: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Employment Type</Label>
              <Select onValueChange={(value) => setEconomicForm({...economicForm, employmentType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Price Sensitivity</Label>
              <Select onValueChange={(value) => setEconomicForm({...economicForm, priceSensitivity: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sensitivity" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_SENSITIVITY.map(item => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Purchase Frequency</Label>
              <Select onValueChange={(value) => setEconomicForm({...economicForm, purchaseFrequency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {PURCHASE_FREQUENCY.map(freq => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>Payment Behaviors</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {PAYMENT_BEHAVIOURS.map(behavior => (
                <div key={behavior.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={behavior.value}
                    checked={economicForm.paymentBehaviour[behavior.value] || false}
                    onCheckedChange={(checked) => setEconomicForm({
                      ...economicForm,
                      paymentBehaviour: {
                        ...economicForm.paymentBehaviour,
                        [behavior.value]: checked
                      }
                    })}
                  />
                  <Label htmlFor={behavior.value} className="text-sm">
                    {behavior.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label>Financial Goals</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {FINANCIAL_GOALS.map(goal => (
                <div key={goal.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={goal.value}
                    checked={economicForm.financialGoals.includes(goal.value)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setEconomicForm({
                          ...economicForm,
                          financialGoals: [...economicForm.financialGoals, goal.value]
                        });
                      } else {
                        setEconomicForm({
                          ...economicForm,
                          financialGoals: economicForm.financialGoals.filter(g => g !== goal.value)
                        });
                      }
                    }}
                  />
                  <Label htmlFor={goal.value} className="text-sm">
                    {goal.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveStep('culture')}>
              Back
            </Button>
            <Button onClick={saveEconomicProfile} disabled={loading}>
              {loading ? 'Saving...' : 'Continue to Persona'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPersonaStep = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Generate Persona
          </CardTitle>
          <CardDescription>
            AI-powered persona generation combining cultural and economic insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedPersona ? (
            <div className="text-center py-8">
              <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="mb-4">Ready to generate your persona using AI</p>
              <Button onClick={generatePersona} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Persona'}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-xl font-bold mb-2">{generatedPersona.name}</h3>
                <p className="text-muted-foreground">{generatedPersona.positioning}</p>
              </div>
              
              <Tabs defaultValue="cultural" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cultural">Cultural Cues</TabsTrigger>
                  <TabsTrigger value="economic">Economic Cues</TabsTrigger>
                  <TabsTrigger value="hypotheses">Hypotheses</TabsTrigger>
                  <TabsTrigger value="pillars">Pillars</TabsTrigger>
                </TabsList>
                
                <TabsContent value="cultural" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Cultural Cues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generatedPersona.culturalCues && (
                        <div className="grid gap-4">
                          <div>
                            <Label className="font-medium">Tone</Label>
                            <p className="text-sm">{generatedPersona.culturalCues.tone}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Language Style</Label>
                            <p className="text-sm">{generatedPersona.culturalCues.language_style}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Preferred Channels</Label>
                            <div className="flex gap-2 mt-1">
                              {generatedPersona.culturalCues.channels?.map(channel => (
                                <Badge key={channel} variant="secondary">{channel}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="economic" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Economic Cues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generatedPersona.economicCues && (
                        <div className="grid gap-4">
                          <div>
                            <Label className="font-medium">Value Framing</Label>
                            <p className="text-sm">{generatedPersona.economicCues.value_framing}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Pricing Strategy</Label>
                            <p className="text-sm">{generatedPersona.economicCues.pricing_strategy}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Financial Messaging</Label>
                            <p className="text-sm">{generatedPersona.economicCues.financial_messaging}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="hypotheses" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Testable Hypotheses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generatedPersona.generalizations?.map((hyp, index) => (
                        <div key={index} className="border rounded p-3 mb-3">
                          <p className="font-medium text-sm">{hyp.hypothesis}</p>
                          <div className="text-xs text-muted-foreground mt-2">
                            <span className="font-medium">Test:</span> {hyp.test_method}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Metric:</span> {hyp.metric}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="pillars" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Messaging Pillars</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {generatedPersona.pillars && (
                        <div className="grid gap-4">
                          {Object.entries(generatedPersona.pillars).map(([key, pillar]) => (
                            <div key={key} className="border rounded p-3">
                              <h4 className="font-medium capitalize">{pillar.title}</h4>
                              <p className="text-sm mt-1">{pillar.message}</p>
                              {pillar.cultural_adaptation && (
                                <p className="text-xs text-blue-600 mt-2">{pillar.cultural_adaptation}</p>
                              )}
                              {pillar.economic_adaptation && (
                                <p className="text-xs text-green-600 mt-2">{pillar.economic_adaptation}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <PersonaExport 
                persona={generatedPersona}
                segment={currentSegment}
                cultureProfile={cultureForm}
                economicProfile={economicForm}
              />
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveStep('economics')}>
                  Back
                </Button>
                <Button onClick={() => setViewingPersona(generatedPersona)}>
                  <Target className="w-4 h-4 mr-2" />
                  View Strategies
                </Button>
                <Button variant="outline" onClick={() => {
                  setGeneratedPersona(null);
                  setActiveStep('workspace');
                }}>
                  Create New Segment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show persona detail if viewing persona
  if (viewingPersona) {
    return (
      <div className="min-h-screen bg-background">
        <WorkspaceHeader 
          workspace={currentWorkspace} 
          onWorkspaceChange={(workspace) => {
            setCurrentWorkspace(workspace);
            loadSegments(workspace.id);
          }}
        />
        
        <div className="container mx-auto py-8">
          <PersonaDetail 
            persona={viewingPersona} 
            onBack={() => setViewingPersona(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WorkspaceHeader 
        workspace={currentWorkspace} 
        onWorkspaceChange={(workspace) => {
          setCurrentWorkspace(workspace);
          loadSegments(workspace.id);
        }}
      />
      
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
          {activeStep !== 'workspace' && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {['workspace', 'segment', 'culture', 'economics', 'persona'].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activeStep === step ? 'bg-primary text-primary-foreground' : 
                      ['workspace', 'segment', 'culture', 'economics'].indexOf(activeStep) > index ? 'bg-green-500 text-white' : 
                      'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    {index < 4 && (
                      <div className={`w-16 h-0.5 ${
                        ['workspace', 'segment', 'culture', 'economics'].indexOf(activeStep) > index ? 'bg-green-500' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step content */}
          {activeStep === 'workspace' && renderWorkspaceStep()}
          {activeStep === 'segment' && renderSegmentStep()}
          {activeStep === 'culture' && renderCultureStep()}
          {activeStep === 'economics' && renderEconomicsStep()}
          {activeStep === 'persona' && renderPersonaStep()}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading application...</p>
        </div>
      </div>
    }>
      <AppContent />
    </Suspense>
  );
}