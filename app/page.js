'use client';

import React, { useState, useEffect } from 'react';
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

export default function App() {
  const [activeStep, setActiveStep] = useState('workspace');
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(false);
  
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

  // Load workspaces on mount
  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces');
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

  const exportPersona = async () => {
    if (!generatedPersona) return;
    
    try {
      const response = await fetch(`/api/personas/${generatedPersona.id}/export`);
      const data = await response.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `persona-${generatedPersona.name.replace(/\s+/g, '-')}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Persona exported successfully');
    } catch (error) {
      toast.error('Failed to export persona');
    }
  };

  const renderWorkspaceStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Human-Rooted Segmentation Studio</h1>
        <p className="text-lg text-muted-foreground">Build personas from human needs, culture, and economics</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Workspace
          </CardTitle>
          <CardDescription>
            Manage your segmentation projects in organized workspaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentWorkspace ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold">{currentWorkspace.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {segments.length} segments created
                </p>
              </div>
              
              <Button onClick={() => setActiveStep('segment')} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Segment
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No workspace found</p>
              <Button onClick={loadWorkspaces}>Refresh</Button>
            </div>
          )}
        </CardContent>
      </Card>
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
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveStep('economics')}>
                  Back
                </Button>
                <Button onClick={exportPersona}>
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
                <Button onClick={() => {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress indicator */}
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