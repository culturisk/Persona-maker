'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Target,
  Users,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Heart,
  AlertTriangle,
  Lightbulb,
  Globe,
  Calendar,
  ShoppingCart,
  Smartphone,
  Mail,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

export function PersonaAnalysisTable({ persona, product, onProceedToPricing }) {
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch('/api/personas/export-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, product })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `persona-analysis-${persona.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Persona analysis downloaded!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Extract targeting information from persona
  const targetingData = {
    demographics: {
      'Target Audience': persona.name || 'N/A',
      'Psychographic Profile': persona.positioning || 'N/A',
      'Cultural Background': persona.culturalCues?.[0] || 'General audience',
      'Economic Status': persona.economicCues?.[0] || 'Middle income'
    },
    behavior: {
      'Purchase Behavior': persona.economicCues?.find(c => c.includes('purchase')) || 'Value-conscious buyer',
      'Decision Making': persona.culturalCues?.find(c => c.includes('decision')) || 'Research-driven',
      'Brand Loyalty': 'Moderate to high',
      'Shopping Frequency': 'Regular buyer'
    },
    communication: {
      'Preferred Channels': ['Digital', 'Social Media', 'Email', 'Mobile App'],
      'Messaging Tone': persona.culturalCues?.find(c => c.includes('communication')) || 'Professional and clear',
      'Content Preferences': ['Educational', 'Value-driven', 'Problem-solving'],
      'Engagement Style': 'Interactive and responsive'
    },
    motivation: {
      'Primary Motivators': persona.culturalCues?.slice(0, 3) || ['Quality', 'Value', 'Reliability'],
      'Pain Points': persona.generalizations?.slice(0, 3) || ['Budget constraints', 'Time limitations', 'Choice paralysis'],
      'Goals': ['Achieve value for money', 'Make informed decisions', 'Solve problems efficiently'],
      'Barriers': ['High prices', 'Complex processes', 'Lack of trust']
    },
    targeting: {
      'Digital Channels': ['Google Ads', 'Facebook', 'Instagram', 'LinkedIn'],
      'Content Marketing': ['Blog posts', 'Video content', 'Case studies', 'Testimonials'],
      'Email Strategy': 'Personalized offers with educational content',
      'Social Proof': 'Customer reviews and ratings'
    },
    messaging: {
      'Value Proposition': persona.messagingPillars?.[0] || 'Quality meets affordability',
      'Key Messages': persona.messagingPillars || ['Best value', 'Trusted quality', 'Customer-focused'],
      'Call to Action': 'Try now with confidence',
      'Unique Selling Points': ['Competitive pricing', 'Quality assurance', 'Excellent support']
    }
  };

  const renderTable = (data, title) => (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        {title}
      </h3>
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <tbody>
            {Object.entries(data).map(([key, value], index) => (
              <tr key={key} className={index % 2 === 0 ? 'bg-muted/30' : 'bg-background'}>
                <td className="px-4 py-3 font-medium text-sm w-1/3 border-r">
                  {key}
                </td>
                <td className="px-4 py-3 text-sm">
                  {Array.isArray(value) ? (
                    <div className="flex flex-wrap gap-2">
                      {value.map((item, i) => (
                        <Badge key={i} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span>{value}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{persona.name}</CardTitle>
              <p className="text-muted-foreground">{persona.positioning}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={downloadPDF}
                disabled={downloading}
                variant="outline"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading ? 'Downloading...' : 'Download PDF'}
              </Button>
              <Button
                onClick={onProceedToPricing}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Pricing Strategy
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs for organized view */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">
            <Users className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="targeting">
            <Target className="w-4 h-4 mr-2" />
            Targeting
          </TabsTrigger>
          <TabsTrigger value="messaging">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messaging
          </TabsTrigger>
          <TabsTrigger value="channels">
            <Smartphone className="w-4 h-4 mr-2" />
            Channels
          </TabsTrigger>
          <TabsTrigger value="motivation">
            <Heart className="w-4 h-4 mr-2" />
            Motivation
          </TabsTrigger>
          <TabsTrigger value="strategy">
            <TrendingUp className="w-4 h-4 mr-2" />
            Strategy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Demographic & Behavioral Profile</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(targetingData.demographics, 'Demographics')}
              {renderTable(targetingData.behavior, 'Behavioral Patterns')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targeting" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Targeting Strategy for {product}</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(targetingData.targeting, 'Digital Targeting Channels')}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Recommended Approach
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Start with Facebook/Instagram for broad reach and visual storytelling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Use Google Ads for high-intent search traffic</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Implement retargeting campaigns for engaged users</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span>Build email nurture sequences for lead conversion</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Messaging Framework</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(targetingData.messaging, 'Core Messages')}
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    Emotional Appeals
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Security and trust</li>
                    <li>• Belonging and community</li>
                    <li>• Achievement and success</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-600" />
                    Rational Appeals
                  </h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Cost-effectiveness</li>
                    <li>• Feature benefits</li>
                    <li>• Performance metrics</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Communication Channels</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(targetingData.communication, 'Channel Preferences')}
              
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Mail className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">Email</h4>
                  <p className="text-sm text-muted-foreground">Primary channel</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">Mobile</h4>
                  <p className="text-sm text-muted-foreground">High engagement</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <h4 className="font-semibold">Social</h4>
                  <p className="text-sm text-muted-foreground">Discovery & share</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="motivation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Motivations & Barriers</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(targetingData.motivation, 'Motivational Factors')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Complete Marketing Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Campaign Timeline
                  </h4>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge>Week 1-2</Badge>
                      <span className="text-sm">Awareness building through social media and content</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>Week 3-4</Badge>
                      <span className="text-sm">Engagement campaigns with offers and testimonials</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>Week 5-6</Badge>
                      <span className="text-sm">Conversion focus with retargeting and email nurture</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>Week 7+</Badge>
                      <span className="text-sm">Retention and loyalty programs</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    Conversion Optimization
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Landing Page Elements</h5>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Clear value proposition</li>
                        <li>• Trust indicators (reviews, badges)</li>
                        <li>• Simple CTA buttons</li>
                        <li>• Mobile-optimized design</li>
                      </ul>
                    </div>
                    <div className="border rounded-lg p-4">
                      <h5 className="font-medium mb-2">Offer Strategy</h5>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Limited-time discounts</li>
                        <li>• Free trial or demo</li>
                        <li>• Money-back guarantee</li>
                        <li>• Bundle offers</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-green-800">
                    <ArrowRight className="w-5 h-5" />
                    Next Step: Define Pricing Strategy
                  </h4>
                  <p className="text-sm text-green-700 mb-3">
                    Based on this persona analysis, create an optimized pricing strategy that resonates with {persona.name}'s economic profile and value expectations.
                  </p>
                  <Button
                    onClick={onProceedToPricing}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Create Pricing Strategy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
