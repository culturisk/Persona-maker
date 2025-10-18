'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import {
  Zap,
  Sparkles,
  Target,
  Users,
  Globe,
  DollarSign,
  ArrowLeft,
  Download,
  RefreshCw
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Preset templates for quick generation
const PERSONA_TEMPLATES = [
  {
    id: 'budget_conscious',
    name: 'Budget-Conscious Consumer',
    icon: '💰',
    description: 'Price-sensitive, value-seeking, comparison shoppers',
    presets: {
      culture: { locale: 'any', communicationStyle: 'direct', formalityNorm: 'casual' },
      economics: { incomeBracket: 'low', priceSensitivity: 'high', paymentBehaviour: ['upi', 'emi'] }
    }
  },
  {
    id: 'premium_seeker',
    name: 'Premium Seeker',
    icon: '✨',
    description: 'Quality-focused, brand-conscious, willing to pay more',
    presets: {
      culture: { locale: 'any', communicationStyle: 'consultative', formalityNorm: 'professional' },
      economics: { incomeBracket: 'high', priceSensitivity: 'low', paymentBehaviour: ['credit_card', 'net_banking'] }
    }
  },
  {
    id: 'tech_early_adopter',
    name: 'Tech Early Adopter',
    icon: '🚀',
    description: 'Innovation-driven, digitally native, trend-conscious',
    presets: {
      culture: { locale: 'any', communicationStyle: 'low_context', formalityNorm: 'casual' },
      economics: { incomeBracket: 'medium', priceSensitivity: 'medium', paymentBehaviour: ['upi', 'digital_wallet'] }
    }
  },
  {
    id: 'family_oriented',
    name: 'Family-Oriented',
    icon: '👨‍👩‍👧‍👦',
    description: 'Safety-focused, long-term thinking, practical needs',
    presets: {
      culture: { locale: 'any', communicationStyle: 'high_context', formalityNorm: 'mixed' },
      economics: { incomeBracket: 'medium', priceSensitivity: 'medium', paymentBehaviour: ['bank_transfer', 'cash'] }
    }
  },
  {
    id: 'professional',
    name: 'Working Professional',
    icon: '💼',
    description: 'Time-poor, convenience-seeking, efficiency-focused',
    presets: {
      culture: { locale: 'any', communicationStyle: 'low_context', formalityNorm: 'professional' },
      economics: { incomeBracket: 'high', priceSensitivity: 'low', paymentBehaviour: ['credit_card', 'upi'] }
    }
  },
  {
    id: 'entrepreneur',
    name: 'Entrepreneur / SME Owner',
    icon: '🎯',
    description: 'Growth-minded, ROI-focused, decision-maker',
    presets: {
      culture: { locale: 'any', communicationStyle: 'direct', formalityNorm: 'mixed' },
      economics: { incomeBracket: 'medium', priceSensitivity: 'high', paymentBehaviour: ['upi', 'net_banking'] }
    }
  }
];

function QuickGenerateContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState('input'); // 'input' or 'generating' or 'results'
  const [loading, setLoading] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  
  // Form data
  const [segmentName, setSegmentName] = useState('');
  const [product, setProduct] = useState('');
  const [context, setContext] = useState('');
  const [selectedTemplates, setSelectedTemplates] = useState([]);
  const [generatedPersonas, setGeneratedPersonas] = useState([]);
  
  // Check for demo mode
  const isDemoMode = typeof window !== 'undefined' && window.location.search.includes('demo=true');
  
  // Load workspaces
  useEffect(() => {
    if (!authLoading) {
      loadWorkspaces();
    }
  }, [authLoading]);
  
  const loadWorkspaces = async () => {
    try {
      const url = isDemoMode ? '/api/workspaces?demo=true' : '/api/workspaces';
      const response = await fetch(url);
      const data = await response.json();
      setWorkspaces(data.workspaces || []);
      if (data.workspaces?.length > 0) {
        setCurrentWorkspace(data.workspaces[0]);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
    }
  };
  
  const toggleTemplate = (templateId) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };
  
  const handleQuickGenerate = async () => {
    if (!segmentName || !product || selectedTemplates.length === 0) {
      toast.error('Please fill required fields and select at least one template');
      return;
    }
    
    setLoading(true);
    setStep('generating');
    
    try {
      // Create segment
      const segmentResponse = await fetch('/api/segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: segmentName,
          product: product,
          context: context,
          workspaceId: currentWorkspace.id,
          values: [],
          emotions: [],
          fears: []
        })
      });
      
      const segmentData = await segmentResponse.json();
      const segment = segmentData.segment;
      
      // Generate personas for each selected template
      const personas = [];
      
      for (const templateId of selectedTemplates) {
        const template = PERSONA_TEMPLATES.find(t => t.id === templateId);
        if (!template) continue;
        
        // Create culture profile
        const cultureResponse = await fetch('/api/culture-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            segmentId: segment.id,
            locale: template.presets.culture.locale,
            communicationStyle: template.presets.culture.communicationStyle,
            formalityNorm: template.presets.culture.formalityNorm,
            languages: [],
            region: {},
            urbanicity: 'any',
            timeOrientation: 'any',
            workweek: { start: 'Mon', end: 'Fri', weekend: ['Sat', 'Sun'] },
            schedulingNorms: {},
            festivals: [],
            purchasingConstraints: {},
            deviceChannelPrefs: {}
          })
        });
        
        const cultureData = await cultureResponse.json();
        
        // Create economic profile  
        const economicResponse = await fetch('/api/economic-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            segmentId: segment.id,
            incomeBracket: template.presets.economics.incomeBracket,
            priceSensitivity: template.presets.economics.priceSensitivity,
            paymentBehaviour: template.presets.economics.paymentBehaviour.reduce((acc, val) => ({...acc, [val]: true}), {}),
            currency: 'INR',
            profession: 'any',
            industry: 'any',
            yearsOfService: '',
            employmentType: 'any',
            financialBackground: 'any',
            familyFinancialBackground: 'any',
            socioeconomicStatus: 'any',
            purchaseFrequency: 'any',
            savingsInclination: 'any',
            riskAppetite: 'any',
            creditAccess: 'any',
            financialGoals: [],
            constraints: []
          })
        });
        
        const economicData = await economicResponse.json();
        
        // Generate persona
        const personaResponse = await fetch('/api/personas/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            segmentId: segment.id,
            cultureProfileId: cultureData.cultureProfile.id,
            economicProfileId: economicData.economicProfile.id
          })
        });
        
        const personaData = await personaResponse.json();
        personas.push({
          ...personaData.persona,
          template: template.name,
          templateIcon: template.icon
        });
      }
      
      setGeneratedPersonas(personas);
      setStep('results');
      toast.success(`Generated ${personas.length} personas successfully!`);
    } catch (error) {
      console.error('Error generating personas:', error);
      toast.error('Failed to generate personas');
      setStep('input');
    } finally {
      setLoading(false);
    }
  };
  
  const handleReset = () => {
    setStep('input');
    setSegmentName('');
    setProduct('');
    setContext('');
    setSelectedTemplates([]);
    setGeneratedPersonas([]);
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
            {step === 'results' && (
              <Button onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate More
              </Button>
            )}
          </div>
          
          {step === 'input' && (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                  <Zap className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-primary">Quick Generate</span>
                </div>
                <h1 className="text-4xl font-bold mb-4">Generate Multiple Personas in One Click</h1>
                <p className="text-xl text-muted-foreground">
                  Select templates and let AI create comprehensive personas instantly
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Section */}
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Basic Info
                      </CardTitle>
                      <CardDescription>
                        Tell us about your segment
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="segment-name">Segment Name *</Label>
                        <Input
                          id="segment-name"
                          value={segmentName}
                          onChange={(e) => setSegmentName(e.target.value)}
                          placeholder="e.g., Tech-Savvy Shoppers"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="product">Product/Service *</Label>
                        <Input
                          id="product"
                          value={product}
                          onChange={(e) => setProduct(e.target.value)}
                          placeholder="e.g., E-commerce App"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="context">Context (Optional)</Label>
                        <Textarea
                          id="context"
                          value={context}
                          onChange={(e) => setContext(e.target.value)}
                          placeholder="Describe your target audience..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Templates Section */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Select Persona Templates
                      </CardTitle>
                      <CardDescription>
                        Choose one or more templates to generate - we'll create all variations instantly
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PERSONA_TEMPLATES.map((template) => (
                          <div
                            key={template.id}
                            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                              selectedTemplates.includes(template.id)
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border'
                            }`}
                            onClick={() => toggleTemplate(template.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-3xl">{template.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-semibold">{template.name}</h3>
                                  <Checkbox
                                    checked={selectedTemplates.includes(template.id)}
                                    onCheckedChange={() => toggleTemplate(template.id)}
                                  />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {template.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} selected
                            </p>
                            <p className="text-sm text-muted-foreground">
                              We'll generate {selectedTemplates.length} detailed persona{selectedTemplates.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <Button
                            size="lg"
                            onClick={handleQuickGenerate}
                            disabled={!segmentName || !product || selectedTemplates.length === 0 || loading}
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            {loading ? 'Generating...' : 'Generate Personas'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
          
          {step === 'generating' && (
            <div className="text-center py-16">
              <LoadingSpinner className="mx-auto mb-6 w-12 h-12" />
              <h2 className="text-2xl font-bold mb-2">Generating Your Personas...</h2>
              <p className="text-muted-foreground">
                AI is creating {selectedTemplates.length} comprehensive persona{selectedTemplates.length !== 1 ? 's' : ''} based on your selections
              </p>
            </div>
          )}
          
          {step === 'results' && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2">✨ Generated {generatedPersonas.length} Personas</h2>
                <p className="text-muted-foreground">
                  Review your AI-generated personas below
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedPersonas.map((persona, index) => (
                  <Card key={persona.id} className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{persona.templateIcon}</span>
                          <div>
                            <CardTitle>{persona.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                              {persona.template}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-1">Positioning</h4>
                          <p className="text-sm text-muted-foreground">
                            {persona.positioning}
                          </p>
                        </div>
                        
                        {persona.culturalCues && persona.culturalCues.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Cultural Insights
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {persona.culturalCues.slice(0, 3).map((cue, i) => (
                                <Badge key={i} variant="outline">
                                  {cue}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {persona.economicCues && persona.economicCues.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              Economic Insights
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {persona.economicCues.slice(0, 3).map((cue, i) => (
                                <Badge key={i} variant="outline">
                                  {cue}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => router.push(`/?persona=${persona.id}`)}
                        >
                          View Full Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuickGeneratePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <QuickGenerateContent />
    </Suspense>
  );
}
