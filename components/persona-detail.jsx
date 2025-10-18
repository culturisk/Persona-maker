'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Brain, 
  Target, 
  MessageSquare, 
  DollarSign,
  Download,
  Edit,
  Save,
  Copy,
  Wand2,
  FileText,
  CheckCircle,
  Clock,
  RefreshCw,
  Globe
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner.jsx';
import { PricingStrategyBuilder } from '@/components/pricing-strategy-builder';

export function PersonaDetail({ persona, onBack }) {
  const [strategies, setStrategies] = useState({
    positioning: null,
    messaging: null,
    pricing: null
  });
  
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [strategyVersions, setStrategyVersions] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStrategies();
  }, [persona.id]);

  const loadStrategies = async () => {
    try {
      // Load existing strategies for this persona
      const response = await fetch(`/api/personas/${persona.id}/strategies`);
      if (response.ok) {
        const data = await response.json();
        setStrategies(data.strategies || {});
        setStrategyVersions(data.versions || {});
      }
    } catch (error) {
      console.error('Error loading strategies:', error);
    }
  };

  const generateStrategy = async (type) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/personas/${persona.id}/strategies/${type}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaId: persona.id,
          type: type
        })
      });

      if (response.ok) {
        const data = await response.json();
        setStrategies(prev => ({
          ...prev,
          [type]: { ...data.strategy, status: 'draft', version: 1 }
        }));
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} strategy generated successfully`);
      } else {
        toast.error(`Failed to generate ${type} strategy`);
      }
    } catch (error) {
      toast.error(`Error generating ${type} strategy`);
    } finally {
      setLoading(false);
    }
  };

  const saveStrategy = async (type, strategyData) => {
    try {
      const response = await fetch(`/api/personas/${persona.id}/strategies/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(strategyData)
      });

      if (response.ok) {
        const data = await response.json();
        setStrategies(prev => ({
          ...prev,
          [type]: data.strategy
        }));
        setEditingStrategy(null);
        toast.success('Strategy saved successfully');
      } else {
        toast.error('Failed to save strategy');
      }
    } catch (error) {
      toast.error('Error saving strategy');
    }
  };

  const publishStrategy = async (type) => {
    try {
      const response = await fetch(`/api/personas/${persona.id}/strategies/${type}/publish`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setStrategies(prev => ({
          ...prev,
          [type]: { ...prev[type], status: 'published' }
        }));
        toast.success('Strategy published successfully');
      }
    } catch (error) {
      toast.error('Error publishing strategy');
    }
  };

  const duplicateStrategy = async (type) => {
    try {
      const response = await fetch(`/api/personas/${persona.id}/strategies/${type}/duplicate`, {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setStrategies(prev => ({
          ...prev,
          [type]: data.strategy
        }));
        toast.success('Strategy duplicated successfully');
      }
    } catch (error) {
      toast.error('Error duplicating strategy');
    }
  };

  const downloadStrategy = async (type) => {
    try {
      const response = await fetch(`/api/personas/${persona.id}/strategies/${type}/export`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${persona.name}_${type}_strategy.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Strategy downloaded successfully');
      }
    } catch (error) {
      toast.error('Error downloading strategy');
    }
  };

  const downloadAllStrategies = async () => {
    try {
      const response = await fetch(`/api/personas/${persona.id}/strategies/export-all`);
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${persona.name}_all_strategies.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('All strategies downloaded successfully');
      }
    } catch (error) {
      toast.error('Error downloading strategies');
    }
  };

  const renderStrategyActions = (type, strategy) => (
    <div className="flex gap-2">
      {!strategy ? (
        <Button onClick={() => generateStrategy(type)} disabled={loading}>
          <Wand2 className="w-4 h-4 mr-2" />
          {loading ? 'Generating...' : 'Generate Draft'}
        </Button>
      ) : (
        <>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setEditingStrategy(editingStrategy === type ? null : type)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          
          {strategy.status === 'draft' && (
            <Button 
              size="sm"
              onClick={() => publishStrategy(type)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Publish
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => duplicateStrategy(type)}
          >
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => downloadStrategy(type)}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </>
      )}
    </div>
  );

  const renderPositioningStrategy = () => {
    const strategy = strategies.positioning;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Positioning Strategy
            </h3>
            {strategy && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={strategy.status === 'published' ? 'default' : 'secondary'}>
                  {strategy.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Version {strategy.version || 1}
                </span>
              </div>
            )}
          </div>
          {renderStrategyActions('positioning', strategy)}
        </div>

        {strategy ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Positioning Statement</CardTitle>
              </CardHeader>
              <CardContent>
                {editingStrategy === 'positioning' ? (
                  <Textarea
                    value={strategy.positioning_statement || ''}
                    onChange={(e) => setStrategies(prev => ({
                      ...prev,
                      positioning: { ...prev.positioning, positioning_statement: e.target.value }
                    }))}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm">{strategy.positioning_statement}</p>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Competitive Frame</CardTitle>
                </CardHeader>
                <CardContent>
                  {strategy.competitive_frame && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Primary:</span> {strategy.competitive_frame.primary_competitor}
                      </div>
                      <div>
                        <span className="font-medium">Advantage:</span> {strategy.competitive_frame.competitive_advantage}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Elevator Pitches</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">1 Second</Label>
                    <p className="text-sm">{strategy.elevator_pitch_1s}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">10 Seconds</Label>
                    <p className="text-sm">{strategy.elevator_pitch_10s}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">30 Seconds</Label>
                    <p className="text-sm">{strategy.elevator_pitch_30s}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {strategy.reasons_to_believe && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Reasons to Believe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {strategy.reasons_to_believe.map((reason, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="font-medium text-sm">{reason.claim}</div>
                        <div className="text-xs text-muted-foreground mt-1">{reason.proof}</div>
                        <Badge variant="outline" className="mt-2 text-xs">{reason.proof_type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {editingStrategy === 'positioning' && (
              <div className="flex gap-2">
                <Button onClick={() => saveStrategy('positioning', strategies.positioning)}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingStrategy(null)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No positioning strategy yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate a positioning strategy to define how this persona should perceive your product
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderMessagingStrategy = () => {
    const strategy = strategies.messaging;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Messaging & Content Strategy
            </h3>
            {strategy && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={strategy.status === 'published' ? 'default' : 'secondary'}>
                  {strategy.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Version {strategy.version || 1}
                </span>
              </div>
            )}
          </div>
          {renderStrategyActions('messaging', strategy)}
        </div>

        {strategy ? (
          <div className="space-y-4">
            {strategy.messaging_pillars && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Messaging Pillars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {strategy.messaging_pillars.map((pillar, index) => (
                      <div key={index} className="border rounded p-4">
                        <h4 className="font-medium">{pillar.title}</h4>
                        <p className="text-sm mt-2">{pillar.message}</p>
                        {pillar.cultural_adaptation && (
                          <div className="text-xs text-blue-600 mt-2">
                            Cultural: {pillar.cultural_adaptation}
                          </div>
                        )}
                        {pillar.economic_adaptation && (
                          <div className="text-xs text-green-600 mt-1">
                            Economic: {pillar.economic_adaptation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tone of Voice</CardTitle>
                </CardHeader>
                <CardContent>
                  {strategy.tone_of_voice && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Primary:</span> {strategy.tone_of_voice.primary_tone}
                      </div>
                      <div>
                        <span className="font-medium">Secondary:</span> {strategy.tone_of_voice.secondary_tone}
                      </div>
                      <div>
                        <span className="font-medium">Avoid:</span> {strategy.tone_of_voice.avoid?.join(', ')}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Channel Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  {strategy.channel_plan && (
                    <div className="space-y-2">
                      {strategy.channel_plan.map((channel, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{channel.channel}</span>
                          <Badge variant="outline" className="text-xs">
                            {channel.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {strategy.objections && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Objection Handling</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {strategy.objections.map((objection, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="font-medium text-sm text-red-600">
                          "{objection.objection}"
                        </div>
                        <div className="text-sm mt-2">
                          <span className="font-medium">Response:</span> {objection.counter}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium">Proof:</span> {objection.proof_point}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No messaging strategy yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate messaging pillars, tone of voice, and content strategy for this persona
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderPricingStrategy = () => {
    const strategy = strategies.pricing;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing Strategy
            </h3>
            {strategy && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={strategy.status === 'published' ? 'default' : 'secondary'}>
                  {strategy.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Version {strategy.version || 1}
                </span>
              </div>
            )}
          </div>
          {renderStrategyActions('pricing', strategy)}
        </div>

        {strategy ? (
          <div className="space-y-4">
            {strategy.pricing_tiers && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Pricing Tiers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {strategy.pricing_tiers.map((tier, index) => (
                      <div key={index} className="border rounded p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{tier.name}</h4>
                          <div className="text-lg font-bold">{tier.price}</div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{tier.target}</p>
                        <div className="space-y-1">
                          {tier.features?.map((feature, fIndex) => (
                            <div key={fIndex} className="text-xs flex items-center">
                              <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                              {feature}
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {tier.payment_options?.map((option, oIndex) => (
                            <Badge key={oIndex} variant="outline" className="text-xs">
                              {option}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Payment Options</CardTitle>
                </CardHeader>
                <CardContent>
                  {strategy.payment_options && (
                    <div className="space-y-3">
                      {strategy.payment_options.map((option, index) => (
                        <div key={index} className="border rounded p-3">
                          <div className="font-medium text-sm">{option.method}</div>
                          <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {option.benefits?.map((benefit, bIndex) => (
                              <Badge key={bIndex} variant="secondary" className="text-xs">
                                {benefit}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Value Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  {strategy.value_metrics && (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Primary:</span> {strategy.value_metrics.primary_metric}
                      </div>
                      <div>
                        <span className="font-medium">Secondary:</span>
                        <ul className="mt-1 ml-4 list-disc">
                          {strategy.value_metrics.secondary_metrics?.map((metric, index) => (
                            <li key={index}>{metric}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {strategy.monetization_hypotheses && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monetization Hypotheses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {strategy.monetization_hypotheses.map((hypothesis, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="font-medium text-sm">{hypothesis.hypothesis}</div>
                        <div className="text-xs text-muted-foreground mt-2 grid grid-cols-2 gap-2">
                          <div><span className="font-medium">Test:</span> {hypothesis.test_method}</div>
                          <div><span className="font-medium">Metric:</span> {hypothesis.metric}</div>
                          <div><span className="font-medium">Timeline:</span> {hypothesis.timeline}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No pricing strategy yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate pricing tiers, payment options, and monetization strategy for this persona
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Segments
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{persona.name}</h1>
          <p className="text-muted-foreground">{persona.positioning}</p>
        </div>
        <Button onClick={downloadAllStrategies} disabled={!strategies.positioning && !strategies.messaging && !strategies.pricing}>
          <Download className="w-4 h-4 mr-2" />
          Download All
        </Button>
      </div>

      {/* Strategy Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <Brain className="w-4 h-4 mr-2" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cultural Cues</CardTitle>
                <Globe className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="mb-2">
                    <span className="font-medium">Tone:</span> {persona.culturalCues?.tone}
                  </div>
                  <div>
                    <span className="font-medium">Channels:</span> {persona.culturalCues?.channels?.join(', ')}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Economic Cues</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="mb-2">
                    <span className="font-medium">Value Framing:</span> {persona.economicCues?.value_framing}
                  </div>
                  <div>
                    <span className="font-medium">Pricing:</span> {persona.economicCues?.pricing_strategy}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Strategy Status</CardTitle>
                <CheckCircle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Positioning:</span>
                    <Badge variant={strategies.positioning?.status === 'published' ? 'default' : 'secondary'}>
                      {strategies.positioning?.status || 'Not Created'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Messaging:</span>
                    <Badge variant={strategies.messaging?.status === 'published' ? 'default' : 'secondary'}>
                      {strategies.messaging?.status || 'Not Created'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pricing:</span>
                    <Badge variant={strategies.pricing?.status === 'published' ? 'default' : 'secondary'}>
                      {strategies.pricing?.status || 'Not Created'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Generate and manage strategies for this persona
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => {
                    setActiveTab('positioning');
                    if (!strategies.positioning) generateStrategy('positioning');
                  }}
                  disabled={loading}
                >
                  <Target className="w-6 h-6 mb-2" />
                  {strategies.positioning ? 'View Positioning' : 'Create Positioning'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => {
                    setActiveTab('messaging');
                    if (!strategies.messaging) generateStrategy('messaging');
                  }}
                  disabled={loading}
                >
                  <MessageSquare className="w-6 h-6 mb-2" />
                  {strategies.messaging ? 'View Messaging' : 'Create Messaging'}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => {
                    setActiveTab('pricing');
                    if (!strategies.pricing) generateStrategy('pricing');
                  }}
                  disabled={loading}
                >
                  <DollarSign className="w-6 h-6 mb-2" />
                  {strategies.pricing ? 'View Pricing' : 'Create Pricing'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positioning">
          {renderPositioningStrategy()}
        </TabsContent>

        <TabsContent value="messaging">
          {renderMessagingStrategy()}
        </TabsContent>

        <TabsContent value="pricing">
          {renderPricingStrategy()}
        </TabsContent>
      </Tabs>

      {loading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <LoadingSpinner className="mx-auto mb-4" />
            <p className="text-muted-foreground">Generating strategy...</p>
          </div>
        </div>
      )}
    </div>
  );
}