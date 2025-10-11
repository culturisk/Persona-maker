'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Calendar, MessageSquare, CreditCard, Target, TrendingUp, Users, Clock, Star } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export function PersonaExport({ persona, segment, cultureProfile, economicProfile }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateBehavioralInsights = () => {
    const insights = {
      communicationPreferences: getCommunicationPreferences(),
      purchasingBehavior: getPurchasingBehavior(),
      optimalTouchpoints: getOptimalTouchpoints(),
      contentStrategy: getContentStrategy(),
      timingRecommendations: getTimingRecommendations(),
      pricingStrategy: getPricingStrategy(),
      riskFactors: getRiskFactors(),
      opportunities: getOpportunities()
    };
    return insights;
  };

  const getCommunicationPreferences = () => {
    const style = cultureProfile?.communicationStyle || 'direct';
    const formality = cultureProfile?.formalityNorm || 'mixed';
    
    const preferences = {
      tone: getToneRecommendation(style, formality),
      channels: getPreferredChannels(),
      messageLength: getMessageLength(style),
      frequency: getCommunicationFrequency(),
      timing: getOptimalTiming()
    };
    
    return preferences;
  };

  const getPurchasingBehavior = () => {
    const sensitivity = economicProfile?.priceSensitivity || 'medium';
    const frequency = economicProfile?.purchaseFrequency || 'occasional';
    
    return {
      decisionSpeed: getDecisionSpeed(sensitivity),
      priceInfluence: getPriceInfluence(sensitivity),
      researchLevel: getResearchLevel(sensitivity),
      socialProof: getSocialProofNeed(),
      paymentPreference: getPaymentPreference(),
      budgetCycle: getBudgetCycle(frequency)
    };
  };

  const getOptimalTouchpoints = () => {
    const channels = [];
    
    if (cultureProfile?.deviceChannelPrefs?.whatsapp_preferred) channels.push('WhatsApp');
    if (cultureProfile?.deviceChannelPrefs?.android_share_high) channels.push('Mobile App');
    channels.push('Email', 'Website');
    
    return {
      primary: channels[0] || 'Email',
      secondary: channels.slice(1, 3),
      avoid: getChannelsToAvoid()
    };
  };

  const getContentStrategy = () => {
    const style = cultureProfile?.communicationStyle;
    
    return {
      contentType: style === 'high_context' ? 'Storytelling & Case Studies' : 'Direct Benefits & Features',
      visualStyle: getVisualStyle(),
      proofPoints: getProofPoints(),
      callToAction: getCTAStyle(),
      personalization: getPersonalizationLevel()
    };
  };

  const getTimingRecommendations = () => {
    const workweek = cultureProfile?.workweek || { start: 'Mon', end: 'Fri' };
    const scheduling = cultureProfile?.schedulingNorms || {};
    
    return {
      bestDays: [`${workweek.start} - ${workweek.end}`],
      bestTimes: scheduling.late_evening_ok ? '9 AM - 8 PM' : '9 AM - 5 PM',
      avoid: workweek.weekend || ['Sat', 'Sun'],
      timezone: cultureProfile?.region?.country === 'IN' ? 'IST' : 'Local Time'
    };
  };

  const getPricingStrategy = () => {
    const sensitivity = economicProfile?.priceSensitivity;
    const income = economicProfile?.incomeBracket;
    
    return {
      approach: getPricingApproach(sensitivity),
      presentation: getPricingPresentation(sensitivity),
      discounts: getDiscountStrategy(sensitivity),
      payment: getPaymentStrategy(),
      comparison: getComparisonStrategy(sensitivity)
    };
  };

  const getRiskFactors = () => {
    return [
      {
        risk: 'Price Sensitivity',
        level: getPriceRiskLevel(),
        mitigation: 'Emphasize ROI and long-term value'
      },
      {
        risk: 'Communication Mismatch',
        level: getCommunicationRisk(),
        mitigation: 'Adapt tone based on cultural context'
      },
      {
        risk: 'Channel Preference',
        level: 'Medium',
        mitigation: 'Multi-channel approach with preference priority'
      }
    ];
  };

  const getOpportunities = () => {
    return [
      {
        opportunity: 'Cross-selling Potential',
        description: 'Based on professional needs and budget capacity',
        actionable: 'Introduce complementary products after 30 days'
      },
      {
        opportunity: 'Referral Program',
        description: 'Professional network influence',
        actionable: 'Implement professional referral incentives'
      },
      {
        opportunity: 'Upselling Window',
        description: 'Career growth and income progression',
        actionable: 'Track usage patterns for upgrade timing'
      }
    ];
  };

  // Helper functions for generating insights
  const getToneRecommendation = (style, formality) => {
    if (style === 'high_context') return 'Warm, relationship-focused, consultative';
    if (style === 'low_context') return 'Direct, fact-based, results-oriented';
    if (formality === 'formal') return 'Professional, respectful, structured';
    if (formality === 'casual') return 'Friendly, approachable, conversational';
    return 'Professional yet approachable, adaptable';
  };

  const getPreferredChannels = () => {
    const channels = ['Email', 'Website'];
    if (cultureProfile?.deviceChannelPrefs?.whatsapp_preferred) channels.unshift('WhatsApp');
    if (cultureProfile?.deviceChannelPrefs?.android_share_high) channels.push('Mobile App');
    return channels;
  };

  const getMessageLength = (style) => {
    return style === 'high_context' ? 'Detailed (150-300 words)' : 'Concise (50-100 words)';
  };

  const getCommunicationFrequency = () => {
    const frequency = economicProfile?.purchaseFrequency;
    if (frequency === 'habitual') return '2-3x per week';
    if (frequency === 'regular') return 'Weekly';
    if (frequency === 'occasional') return 'Bi-weekly';
    return 'Monthly';
  };

  const getOptimalTiming = () => {
    const scheduling = cultureProfile?.schedulingNorms || {};
    return scheduling.late_evening_ok ? '9-11 AM or 6-8 PM' : '9-11 AM or 2-4 PM';
  };

  const getDecisionSpeed = (sensitivity) => {
    if (sensitivity === 'very_high') return 'Slow (2-4 weeks research)';
    if (sensitivity === 'high') return 'Moderate (1-2 weeks)';
    if (sensitivity === 'medium') return 'Average (3-7 days)';
    return 'Fast (1-3 days)';
  };

  const getPriceInfluence = (sensitivity) => {
    if (sensitivity === 'very_high') return 'Extremely High (Primary factor)';
    if (sensitivity === 'high') return 'High (Major consideration)';
    if (sensitivity === 'medium') return 'Moderate (Balanced with features)';
    return 'Low (Secondary to quality/features)';
  };

  const getResearchLevel = (sensitivity) => {
    return sensitivity === 'low' ? 'Light (Reviews only)' : 'Thorough (Multiple sources)';
  };

  const getSocialProofNeed = () => {
    const profession = economicProfile?.profession;
    if (profession === 'CXO' || profession === 'director') return 'High (Enterprise testimonials)';
    if (profession === 'manager') return 'Medium (Peer reviews)';
    return 'Standard (User reviews)';
  };

  const getPaymentPreference = () => {
    const payment = economicProfile?.paymentBehaviour || {};
    if (payment.prefers_cod) return 'Cash on Delivery preferred';
    if (payment.upi_preferred) return 'UPI/Digital payments';
    if (payment.credit_card) return 'Credit card comfortable';
    return 'Flexible payment options';
  };

  const getBudgetCycle = (frequency) => {
    if (frequency === 'habitual') return 'Weekly/Monthly budget';
    if (frequency === 'regular') return 'Monthly/Quarterly budget';
    return 'Annual/Project-based budget';
  };

  const getChannelsToAvoid = () => {
    const avoid = [];
    if (economicProfile?.constraints?.limited_data) avoid.push('Video content');
    if (economicProfile?.constraints?.shared_device) avoid.push('Personal notifications');
    return avoid;
  };

  const getVisualStyle = () => {
    const sensitivity = economicProfile?.priceSensitivity;
    if (sensitivity === 'very_high') return 'Simple, cost-focused graphics';
    if (sensitivity === 'low') return 'Premium, aspirational visuals';
    return 'Clean, professional design';
  };

  const getProofPoints = () => {
    const profession = economicProfile?.profession;
    if (profession === 'CXO') return 'Enterprise case studies, ROI metrics';
    if (profession === 'manager') return 'Team productivity gains, efficiency stats';
    return 'User testimonials, feature benefits';
  };

  const getCTAStyle = () => {
    const sensitivity = economicProfile?.priceSensitivity;
    if (sensitivity === 'high') return 'Risk-free trials, money-back guarantees';
    return 'Clear value proposition, immediate benefits';
  };

  const getPersonalizationLevel = () => {
    const style = cultureProfile?.communicationStyle;
    return style === 'high_context' ? 'High (Name, company, industry)' : 'Medium (Name, role)';
  };

  const getPricingApproach = (sensitivity) => {
    if (sensitivity === 'very_high') return 'Lead with total cost of ownership';
    if (sensitivity === 'high') return 'Value-based pricing with clear ROI';
    if (sensitivity === 'medium') return 'Feature-price balance presentation';
    return 'Premium positioning with quality emphasis';
  };

  const getPricingPresentation = (sensitivity) => {
    if (sensitivity === 'high') return 'Break down costs, show savings';
    return 'Package deals, tiered options';
  };

  const getDiscountStrategy = (sensitivity) => {
    if (sensitivity === 'very_high') return 'Volume discounts, early bird offers';
    if (sensitivity === 'high') return 'Time-limited promotions';
    return 'Loyalty rewards, upgrade incentives';
  };

  const getPaymentStrategy = () => {
    const payment = economicProfile?.paymentBehaviour || {};
    if (payment.subscription_aversion) return 'One-time or prepaid options';
    if (payment.emi_friendly) return 'EMI and installment plans';
    return 'Flexible subscription tiers';
  };

  const getComparisonStrategy = (sensitivity) => {
    if (sensitivity === 'high') return 'Feature-price comparison tables';
    return 'Value differentiation focus';
  };

  const getPriceRiskLevel = () => {
    const sensitivity = economicProfile?.priceSensitivity;
    if (sensitivity === 'very_high') return 'High';
    if (sensitivity === 'high') return 'Medium-High';
    return 'Low-Medium';
  };

  const getCommunicationRisk = () => {
    const style = cultureProfile?.communicationStyle;
    return style === 'any' || !style ? 'Medium' : 'Low';
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const insights = generateBehavioralInsights();
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      
      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(44, 62, 80);
      pdf.text('PERSONA PROFILE REPORT', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      pdf.setFontSize(16);
      pdf.setTextColor(100, 100, 100);
      pdf.text(persona.name, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Executive Summary
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text('EXECUTIVE SUMMARY', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      const summary = pdf.splitTextToSize(persona.positioning, pageWidth - 40);
      pdf.text(summary, 20, yPosition);
      yPosition += summary.length * 5 + 15;
      
      // Communication Preferences
      pdf.setFontSize(12);
      pdf.setTextColor(44, 62, 80);
      pdf.text('COMMUNICATION PREFERENCES', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Preferred Tone: ${insights.communicationPreferences.tone}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Primary Channels: ${insights.communicationPreferences.channels.join(', ')}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Message Length: ${insights.communicationPreferences.messageLength}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Contact Frequency: ${insights.communicationPreferences.frequency}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Optimal Timing: ${insights.communicationPreferences.timing}`, 25, yPosition);
      yPosition += 15;
      
      // Purchasing Behavior
      pdf.setFontSize(12);
      pdf.setTextColor(44, 62, 80);
      pdf.text('PURCHASING BEHAVIOR', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Decision Speed: ${insights.purchasingBehavior.decisionSpeed}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Price Influence: ${insights.purchasingBehavior.priceInfluence}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Research Level: ${insights.purchasingBehavior.researchLevel}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Payment Preference: ${insights.purchasingBehavior.paymentPreference}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Budget Cycle: ${insights.purchasingBehavior.budgetCycle}`, 25, yPosition);
      yPosition += 15;
      
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Pricing Strategy
      pdf.setFontSize(12);
      pdf.setTextColor(44, 62, 80);
      pdf.text('PRICING STRATEGY RECOMMENDATIONS', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text(`Approach: ${insights.pricingStrategy.approach}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Presentation: ${insights.pricingStrategy.presentation}`, 25, yPosition);
      yPosition += 6;
      pdf.text(`Payment Strategy: ${insights.pricingStrategy.payment}`, 25, yPosition);
      yPosition += 15;
      
      // Risk Factors
      pdf.setFontSize(12);
      pdf.setTextColor(44, 62, 80);
      pdf.text('RISK FACTORS & MITIGATION', 20, yPosition);
      yPosition += 10;
      
      insights.riskFactors.forEach(risk => {
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        pdf.text(`• ${risk.risk} (${risk.level}): ${risk.mitigation}`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
      
      // Opportunities
      pdf.setFontSize(12);
      pdf.setTextColor(44, 62, 80);
      pdf.text('GROWTH OPPORTUNITIES', 20, yPosition);
      yPosition += 10;
      
      insights.opportunities.forEach(opp => {
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        pdf.text(`• ${opp.opportunity}: ${opp.actionable}`, 25, yPosition);
        yPosition += 6;
      });
      
      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Generated by Human-Rooted Segmentation Studio on ${new Date().toLocaleDateString()}`, 20, pageHeight - 10);
      
      // Save PDF
      const fileName = `${persona.name.replace(/[^a-zA-Z0-9]/g, '_')}_Profile.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const insights = generateBehavioralInsights();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Professional Persona Report
          </CardTitle>
          <CardDescription>
            Comprehensive behavioral analysis and actionable marketing insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating}
            className="w-full mb-6"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating PDF Report...' : 'Download Professional PDF Report'}
          </Button>

          <div className="grid gap-6">
            {/* Communication Insights */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Communication Preferences
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Preferred Tone:</span>
                  <p className="text-muted-foreground">{insights.communicationPreferences.tone}</p>
                </div>
                <div>
                  <span className="font-medium">Primary Channels:</span>
                  <p className="text-muted-foreground">{insights.communicationPreferences.channels.join(', ')}</p>
                </div>
                <div>
                  <span className="font-medium">Optimal Timing:</span>
                  <p className="text-muted-foreground">{insights.communicationPreferences.timing}</p>
                </div>
                <div>
                  <span className="font-medium">Message Length:</span>
                  <p className="text-muted-foreground">{insights.communicationPreferences.messageLength}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Purchasing Behavior */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Purchasing Behavior
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Decision Speed:</span>
                  <p className="text-muted-foreground">{insights.purchasingBehavior.decisionSpeed}</p>
                </div>
                <div>
                  <span className="font-medium">Price Influence:</span>
                  <p className="text-muted-foreground">{insights.purchasingBehavior.priceInfluence}</p>
                </div>
                <div>
                  <span className="font-medium">Research Level:</span>
                  <p className="text-muted-foreground">{insights.purchasingBehavior.researchLevel}</p>
                </div>
                <div>
                  <span className="font-medium">Budget Cycle:</span>
                  <p className="text-muted-foreground">{insights.purchasingBehavior.budgetCycle}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Growth Opportunities */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Growth Opportunities
              </h4>
              <div className="space-y-2">
                {insights.opportunities.map((opp, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">{opp.opportunity}</div>
                    <div className="text-xs text-muted-foreground mt-1">{opp.actionable}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}