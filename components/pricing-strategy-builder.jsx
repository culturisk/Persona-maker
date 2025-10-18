'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Users, 
  Download,
  Plus,
  Trash2,
  Sparkles,
  Package,
  Tag,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';

export function PricingStrategyBuilder({ persona, onSave }) {
  const [strategy, setStrategy] = useState({
    anchorPrice: '',
    valueMetric: '',
    pricingModel: 'subscription',
    tiers: [],
    discounts: [],
    psychologicalTactics: [],
    competitivePositioning: '',
    valueProposition: '',
    priceJustification: '',
    upsellCrossSell: [],
    paymentOptions: [],
    testimonials: ''
  });

  const [loading, setLoading] = useState(false);

  const pricingModels = [
    { value: 'subscription', label: 'Subscription (Recurring)' },
    { value: 'one-time', label: 'One-time Purchase' },
    { value: 'freemium', label: 'Freemium' },
    { value: 'usage-based', label: 'Usage-based' },
    { value: 'tiered', label: 'Tiered Pricing' },
    { value: 'dynamic', label: 'Dynamic Pricing' }
  ];

  const psychologicalTactics = [
    'Charm Pricing ($9.99 vs $10)',
    'Anchor Pricing (Show higher price first)',
    'Bundle Pricing',
    'Decoy Effect (3 tiers with middle highlighted)',
    'Scarcity (Limited time offer)',
    'Social Proof (Most Popular badge)',
    'Free Trial',
    'Money-back Guarantee'
  ];

  const addTier = () => {
    setStrategy(prev => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        {
          id: Date.now(),
          name: '',
          price: '',
          features: [],
          recommended: false
        }
      ]
    }));
  };

  const updateTier = (id, field, value) => {
    setStrategy(prev => ({
      ...prev,
      tiers: prev.tiers.map(tier => 
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    }));
  };

  const removeTier = (id) => {
    setStrategy(prev => ({
      ...prev,
      tiers: prev.tiers.filter(tier => tier.id !== id)
    }));
  };

  const toggleTactic = (tactic) => {
    setStrategy(prev => ({
      ...prev,
      psychologicalTactics: prev.psychologicalTactics.includes(tactic)
        ? prev.psychologicalTactics.filter(t => t !== tactic)
        : [...prev.psychologicalTactics, tactic]
    }));
  };

  const generateWithAI = async () => {
    setLoading(true);
    try {
      // Simulate AI generation based on persona
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate strategy based on persona's economic profile
      const priceMultiplier = persona.economicCues?.some(cue => cue.toLowerCase().includes('high income')) ? 1.5 : 
                             persona.economicCues?.some(cue => cue.toLowerCase().includes('low income')) ? 0.7 : 1;
      
      setStrategy({
        anchorPrice: `$${Math.round(99 * priceMultiplier)}`,
        valueMetric: 'Per user, per month',
        pricingModel: 'tiered',
        tiers: [
          {
            id: Date.now() + 1,
            name: 'Starter',
            price: `$${Math.round(29 * priceMultiplier)}`,
            features: ['Basic features', 'Up to 10 users', 'Email support'],
            recommended: false
          },
          {
            id: Date.now() + 2,
            name: 'Professional',
            price: `$${Math.round(79 * priceMultiplier)}`,
            features: ['All Starter features', 'Unlimited users', 'Priority support', 'Advanced analytics'],
            recommended: true
          },
          {
            id: Date.now() + 3,
            name: 'Enterprise',
            price: 'Custom',
            features: ['All Professional features', 'Custom integration', 'Dedicated account manager', 'SLA guarantee'],
            recommended: false
          }
        ],
        psychologicalTactics: ['Charm Pricing ($9.99 vs $10)', 'Decoy Effect (3 tiers with middle highlighted)', 'Social Proof (Most Popular badge)'],
        competitivePositioning: `Positioned as ${priceMultiplier > 1 ? 'premium quality' : 'value for money'} compared to competitors`,
        valueProposition: `Tailored for ${persona.name}'s needs with focus on ${persona.economicCues?.[0] || 'value'}`,
        priceJustification: `Pricing reflects the target audience's ${persona.economicCues?.[0] || 'economic profile'} and willingness to pay`,
        upsellCrossSell: ['Annual plan (2 months free)', 'Add-on modules', 'Professional services'],
        paymentOptions: persona.economicCues?.some(cue => cue.toLowerCase().includes('upi')) 
          ? ['Credit Card', 'UPI', 'Net Banking', 'EMI'] 
          : ['Credit Card', 'PayPal', 'Wire Transfer'],
        testimonials: 'Placeholder for customer testimonials that build trust'
      });
      
      toast.success('AI-generated pricing strategy created!');
    } catch (error) {
      console.error('Error generating strategy:', error);
      toast.error('Failed to generate strategy');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch('/api/pricing-strategy/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona,
          strategy
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pricing-strategy-${persona.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Pricing strategy exported as PDF!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Pricing Strategy</h2>
              <p className="text-muted-foreground">
                Optimize pricing for {persona.name}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={generateWithAI}
              disabled={loading}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading ? 'Generating...' : 'Auto-Generate'}
            </Button>
            <Button
              onClick={downloadPDF}
              variant="outline"
              size="lg"
              disabled={strategy.tiers.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="model" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="model">
            <Package className="w-4 h-4 mr-2" />
            Model
          </TabsTrigger>
          <TabsTrigger value="tiers">
            <Tag className="w-4 h-4 mr-2" />
            Tiers
          </TabsTrigger>
          <TabsTrigger value="psychology">
            <Target className="w-4 h-4 mr-2" />
            Psychology
          </TabsTrigger>
          <TabsTrigger value="positioning">
            <TrendingUp className="w-4 h-4 mr-2" />
            Positioning
          </TabsTrigger>
          <TabsTrigger value="options">
            <Calculator className="w-4 h-4 mr-2" />
            Payment
          </TabsTrigger>
        </TabsList>

        {/* Pricing Model Tab */}
        <TabsContent value="model" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Model & Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pricing Model</Label>
                  <Select
                    value={strategy.pricingModel}
                    onValueChange={(value) => setStrategy(prev => ({ ...prev, pricingModel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingModels.map(model => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Value Metric</Label>
                  <Input
                    value={strategy.valueMetric}
                    onChange={(e) => setStrategy(prev => ({ ...prev, valueMetric: e.target.value }))}
                    placeholder="e.g., Per user, per month"
                  />
                </div>
              </div>

              <div>
                <Label>Anchor Price</Label>
                <Input
                  value={strategy.anchorPrice}
                  onChange={(e) => setStrategy(prev => ({ ...prev, anchorPrice: e.target.value }))}
                  placeholder="e.g., $99"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  The reference price that sets customer expectations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Tiers Tab */}
        <TabsContent value="tiers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pricing Tiers</CardTitle>
                <Button onClick={addTier} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {strategy.tiers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No tiers yet. Click "Add Tier" or "Generate with AI"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {strategy.tiers.map(tier => (
                    <Card key={tier.id} className={tier.recommended ? 'border-green-500 border-2' : ''}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <Input
                            value={tier.name}
                            onChange={(e) => updateTier(tier.id, 'name', e.target.value)}
                            placeholder="Tier name"
                            className="font-bold"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTier(tier.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {tier.recommended && (
                          <Badge className="w-fit bg-green-600">Most Popular</Badge>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <Input
                          value={tier.price}
                          onChange={(e) => updateTier(tier.id, 'price', e.target.value)}
                          placeholder="Price"
                          className="text-2xl font-bold"
                        />
                        <div className="text-sm text-muted-foreground">
                          Features: {tier.features?.length || 0}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Psychological Tactics Tab */}
        <TabsContent value="psychology" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Psychological Pricing Tactics</CardTitle>
              <CardDescription>
                Select tactics that resonate with {persona.name}'s economic profile
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {psychologicalTactics.map(tactic => (
                  <div
                    key={tactic}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      strategy.psychologicalTactics.includes(tactic)
                        ? 'border-green-500 bg-green-50'
                        : 'border-border hover:border-green-300'
                    }`}
                    onClick={() => toggleTactic(tactic)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        strategy.psychologicalTactics.includes(tactic)
                          ? 'bg-green-600 border-green-600'
                          : 'border-gray-300'
                      }`}>
                        {strategy.psychologicalTactics.includes(tactic) && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{tactic}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitive Positioning Tab */}
        <TabsContent value="positioning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Positioning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Value Proposition</Label>
                <Textarea
                  value={strategy.valueProposition}
                  onChange={(e) => setStrategy(prev => ({ ...prev, valueProposition: e.target.value }))}
                  placeholder="What unique value do you provide?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Competitive Positioning</Label>
                <Textarea
                  value={strategy.competitivePositioning}
                  onChange={(e) => setStrategy(prev => ({ ...prev, competitivePositioning: e.target.value }))}
                  placeholder="How do you compare to competitors?"
                  rows={3}
                />
              </div>

              <div>
                <Label>Price Justification</Label>
                <Textarea
                  value={strategy.priceJustification}
                  onChange={(e) => setStrategy(prev => ({ ...prev, priceJustification: e.target.value }))}
                  placeholder="Why is this price point right for your target audience?"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Options Tab */}
        <TabsContent value="options" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Options & Incentives</CardTitle>
              <CardDescription>
                Based on {persona.name}'s payment preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Accepted Payment Methods</Label>
                <div className="text-sm text-muted-foreground mb-2">
                  {strategy.paymentOptions.length > 0 
                    ? strategy.paymentOptions.join(', ')
                    : 'Generate with AI to get recommendations'}
                </div>
              </div>

              <div>
                <Label>Upsell & Cross-sell Opportunities</Label>
                <div className="space-y-2">
                  {strategy.upsellCrossSell.length > 0 ? (
                    strategy.upsellCrossSell.map((item, index) => (
                      <Badge key={index} variant="outline" className="mr-2">
                        {item}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Generate with AI to get recommendations
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
