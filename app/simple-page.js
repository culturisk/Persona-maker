'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Users, 
  Zap, 
  Target, 
  MessageSquare, 
  DollarSign,
  Download,
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner.jsx';

export default function SimplifiedApp() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Simplified form data
  const [formData, setFormData] = useState({
    // Step 1: Essential Inputs Only
    segmentName: '',
    targetMarket: 'small-business', // Default
    primaryNeed: '',
    priceRange: 'budget-friendly', // Default
    region: 'india', // Default
    
    // Optional context
    productType: '',
    keyChallenge: ''
  });

  const targetMarkets = [
    { value: 'small-business', label: 'Small Business Owners' },
    { value: 'managers', label: 'Team Managers' },
    { value: 'executives', label: 'Senior Executives' },
    { value: 'entrepreneurs', label: 'Entrepreneurs' },
    { value: 'professionals', label: 'Working Professionals' },
    { value: 'students', label: 'Students/Learners' }
  ];

  const priceRanges = [
    { value: 'budget-friendly', label: 'Budget-Friendly (High price sensitivity)' },
    { value: 'value-conscious', label: 'Value-Conscious (Moderate sensitivity)' },
    { value: 'premium', label: 'Premium (Low price sensitivity)' }
  ];

  const regions = [
    { value: 'india', label: 'India' },
    { value: 'us', label: 'United States' },
    { value: 'global', label: 'Global/Multi-region' }
  ];

  const generateComplete = async () => {
    if (!formData.segmentName || !formData.primaryNeed) {
      toast.error('Please fill in the segment name and primary need');
      return;
    }

    setLoading(true);
    try {
      // Call simplified API that generates everything at once
      const response = await fetch('/api/generate-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        setStep(2);
        toast.success('Complete persona and strategies generated!');
      } else {
        toast.error('Failed to generate persona and strategies');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Error generating content');
    } finally {
      setLoading(false);
    }
  };

  const downloadAll = () => {
    if (!result) return;
    
    const exportData = {
      segment_name: formData.segmentName,
      target_market: formData.targetMarket,
      generated_at: new Date().toISOString(),
      persona: result.persona,
      positioning_strategy: result.positioning,
      messaging_strategy: result.messaging,
      pricing_strategy: result.pricing,
      quick_start_guide: result.quickStart
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.segmentName.replace(/\s+/g, '_')}_complete_strategy.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Complete strategy package downloaded!');
  };

  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">AI Persona & Strategy Generator</h1>
        <p className="text-lg text-muted-foreground">
          Get complete personas with positioning, messaging, and pricing strategies in 2 minutes
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Quick Setup
          </CardTitle>
          <CardDescription>
            Tell us about your target segment and we'll generate everything you need
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="segmentName">Segment Name *</Label>
              <Input
                id="segmentName"
                value={formData.segmentName}
                onChange={(e) => setFormData({...formData, segmentName: e.target.value})}
                placeholder="e.g., Small Business Owners in Mumbai"
                className="text-lg"
              />
            </div>
            
            <div>
              <Label>Target Market</Label>
              <Select value={formData.targetMarket} onValueChange={(value) => setFormData({...formData, targetMarket: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {targetMarkets.map(market => (
                    <SelectItem key={market.value} value={market.value}>
                      {market.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Price Sensitivity</Label>
              <Select value={formData.priceRange} onValueChange={(value) => setFormData({...formData, priceRange: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Primary Region</Label>
              <Select value={formData.region} onValueChange={(value) => setFormData({...formData, region: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regions.map(region => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="productType">Product/Service (Optional)</Label>
              <Input
                id="productType"
                value={formData.productType}
                onChange={(e) => setFormData({...formData, productType: e.target.value})}
                placeholder="e.g., CRM Software, Accounting Tool"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="primaryNeed">What's their primary need or challenge? *</Label>
            <Textarea
              id="primaryNeed"
              value={formData.primaryNeed}
              onChange={(e) => setFormData({...formData, primaryNeed: e.target.value})}
              placeholder="e.g., Need to manage customer relationships better while keeping costs low"
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="keyChallenge">Biggest challenge they face (Optional)</Label>
            <Textarea
              id="keyChallenge"
              value={formData.keyChallenge}
              onChange={(e) => setFormData({...formData, keyChallenge: e.target.value})}
              placeholder="e.g., Limited budget, too many manual processes, lack of technical expertise"
              rows={2}
            />
          </div>
          
          <Button 
            onClick={generateComplete} 
            disabled={loading || !formData.segmentName || !formData.primaryNeed}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Generating Complete Strategy...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Persona + Strategies
              </>
            )}
          </Button>
          
          {loading && (
            <div className="text-center text-sm text-muted-foreground">
              Creating persona, positioning, messaging, and pricing strategies...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{result?.persona?.name}</h1>
          <p className="text-muted-foreground">{formData.segmentName}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setStep(1)} variant="outline">
            Create Another
          </Button>
          <Button onClick={downloadAll}>
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      {result && (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <CheckCircle className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="positioning">
              <Target className="w-4 h-4 mr-2" />
              Positioning
            </TabsTrigger>
            <TabsTrigger value="messaging">
              <MessageSquare className="w-4 h-4 mr-2" />
              Messaging
            </TabsTrigger>
            <TabsTrigger value="pricing">
              <DollarSign className="w-4 h-4 mr-2" />
              Pricing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Persona Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Name:</span>
                      <p className="text-sm">{result.persona?.name}</p>
                    </div>
                    <div>
                      <span className="font-medium">Profile:</span>
                      <p className="text-sm">{result.persona?.description}</p>
                    </div>
                    <div>
                      <span className="font-medium">Key Traits:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {result.persona?.traits?.map((trait, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Communication:</span>
                      <p className="text-sm">{result.quickStart?.communication}</p>
                    </div>
                    <div>
                      <span className="font-medium">Best Channels:</span>
                      <p className="text-sm">{result.quickStart?.channels}</p>
                    </div>
                    <div>
                      <span className="font-medium">Key Message:</span>
                      <p className="text-sm">{result.quickStart?.keyMessage}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Action Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.quickStart?.actions?.map((action, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-green-500" />
                        {action}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="positioning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Positioning Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Positioning Statement</h4>
                  <p className="text-sm bg-muted p-3 rounded">{result.positioning?.statement}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Differentiator</h4>
                    <p className="text-sm">{result.positioning?.differentiator}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Target Outcome</h4>
                    <p className="text-sm">{result.positioning?.outcome}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Elevator Pitch (30 seconds)</h4>
                  <p className="text-sm bg-muted p-3 rounded">{result.positioning?.elevator_pitch}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messaging" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Messaging Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Key Messages</h4>
                  <div className="grid gap-3">
                    {result.messaging?.pillars?.map((pillar, index) => (
                      <div key={index} className="border rounded p-3">
                        <h5 className="font-medium text-sm">{pillar.title}</h5>
                        <p className="text-sm text-muted-foreground mt-1">{pillar.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Tone of Voice</h4>
                    <p className="text-sm">{result.messaging?.tone}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Avoid</h4>
                    <p className="text-sm">{result.messaging?.avoid}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">Recommended Pricing Approach</h4>
                  <p className="text-sm mb-4">{result.pricing?.approach}</p>
                  
                  <div className="grid gap-3">
                    {result.pricing?.tiers?.map((tier, index) => (
                      <div key={index} className="border rounded p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{tier.name}</h5>
                          <span className="font-bold">{tier.price}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{tier.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {tier.features?.map((feature, fIndex) => (
                            <Badge key={fIndex} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Payment Recommendations</h4>
                  <p className="text-sm">{result.pricing?.payment_advice}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        {step === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
}