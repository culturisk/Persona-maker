// AI Service for Persona Generation using Emergent LLM Key
import { config } from 'dotenv';
config();

// Mock AI service that simulates persona generation
// This would normally use the emergentintegrations package
export class PersonaAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async generatePersona(segmentData, cultureProfile, economicProfile) {
    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate persona based on inputs
      const persona = this.generatePersonaFromData(segmentData, cultureProfile, economicProfile);
      return persona;
    } catch (error) {
      console.error('Error generating persona:', error);
      throw new Error('Failed to generate persona');
    }
  }

  generatePersonaFromData(segment, culture, economic) {
    // Handle "any" values by providing generalized alternatives
    const processedCulture = this.processAnyValues(culture);
    const processedEconomic = this.processAnyValues(economic);
    
    const name = this.generatePersonaName(processedCulture, processedEconomic);
    const positioning = this.generatePositioning(segment, processedCulture, processedEconomic);
    const culturalCues = this.generateCulturalCues(processedCulture);
    const economicCues = this.generateEconomicCues(processedEconomic);
    const generalizations = this.generateTestableHypotheses(processedCulture, processedEconomic);
    const pillars = this.generateMessagingPillars(segment, processedCulture, processedEconomic);

    return {
      name,
      positioning,
      cultural_cues: culturalCues,
      economic_cues: economicCues,
      generalizations,
      pillars,
      export_snapshot: {
        generated_at: new Date().toISOString(),
        segment: segment,
        culture_profile: culture,
        economic_profile: economic,
        assumptions_vs_facts: this.generateAssumptionsVsFacts(processedCulture, processedEconomic)
      }
    };
  }

  // Process "any" values to provide generalized messaging
  processAnyValues(profile) {
    if (!profile) return profile;
    
    const processed = { ...profile };
    
    // Handle "any" values by creating generalized versions
    Object.keys(processed).forEach(key => {
      if (processed[key] === 'any') {
        switch (key) {
          case 'locale':
            processed[key] = 'multicultural';
            break;
          case 'urbanicity':
            processed[key] = 'location_flexible';
            break;
          case 'communicationStyle':
            processed[key] = 'adaptive_communication';
            break;
          case 'formalityNorm':
            processed[key] = 'context_appropriate';
            break;
          case 'profession':
            processed[key] = 'cross_professional';
            break;
          case 'industry':
            processed[key] = 'industry_agnostic';
            break;
          case 'employmentType':
            processed[key] = 'employment_flexible';
            break;
          case 'priceSensitivity':
            processed[key] = 'value_conscious';
            break;
          case 'purchaseFrequency':
            processed[key] = 'variable_purchase';
            break;
          case 'savingsInclination':
            processed[key] = 'financially_balanced';
            break;
          case 'riskAppetite':
            processed[key] = 'risk_aware';
            break;
          case 'creditAccess':
            processed[key] = 'varied_credit';
            break;
          default:
            processed[key] = 'flexible';
        }
      }
    });
    
    return processed;
  }

  generatePersonaName(culture, economic) {
    const namePatterns = {
      formal: ['Professional', 'Executive', 'Specialist', 'Manager'],
      casual: ['Explorer', 'Builder', 'Connector', 'Creator'],
      mixed: ['The Pragmatist', 'The Optimizer', 'The Collaborator', 'The Innovator'],
      context_appropriate: ['The Adaptable', 'The Versatile', 'The Dynamic', 'The Flexible'],
      adaptive_communication: ['The Connector', 'The Communicator', 'The Bridge-Builder', 'The Facilitator']
    };
    
    const formalityLevel = culture?.formalityNorm || 'mixed';
    const profession = economic?.profession || 'professional';
    
    // Handle generalized professions
    const professionDisplay = this.getProfessionDisplay(profession);
    
    const patterns = namePatterns[formalityLevel] || namePatterns.mixed;
    const baseName = patterns[Math.floor(Math.random() * patterns.length)];
    
    return `${baseName} (${professionDisplay})`;
  }

  getProfessionDisplay(profession) {
    const professionMap = {
      'cross_professional': 'Multi-Industry',
      'industry_agnostic': 'Universal Professional',
      'employment_flexible': 'Adaptive Worker',
      'any': 'Any Profession'
    };
    
    return professionMap[profession] || this.capitalizeFirst(profession.replace(/_/g, ' '));
  }

  generatePositioning(segment, culture, economic) {
    const benefit = segment?.primaryBenefit || 'improved efficiency';
    const context = segment?.context || 'professional context';
    const pricePoint = this.getPricePositioning(economic?.priceSensitivity);
    
    return `A ${economic?.profession || 'professional'} who values ${benefit} in ${context}. ${pricePoint} Prefers ${culture?.communicationStyle || 'direct'} communication and ${economic?.paymentBehaviour?.prefers_cod ? 'cash-on-delivery' : 'digital'} payment options.`;
  }

  generateCulturalCues(culture) {
    return {
      tone: this.getToneFromCulture(culture),
      timing: this.getTimingPreferences(culture),
      channels: this.getPreferredChannels(culture),
      language_style: culture?.communicationStyle || 'direct',
      formality: culture?.formalityNorm || 'mixed'
    };
  }

  generateEconomicCues(economic) {
    return {
      value_framing: this.getValueFraming(economic?.priceSensitivity),
      pricing_strategy: this.getPricingStrategy(economic),
      payment_preferences: economic?.paymentBehaviour || {},
      proof_types: this.getProofTypes(economic?.profession, economic?.industry),
      constraints: economic?.constraints || {},
      financial_messaging: this.getFinancialMessaging(economic)
    };
  }

  generateTestableHypotheses(culture, economic) {
    const hypotheses = [];
    
    if (economic?.priceSensitivity === 'high') {
      hypotheses.push({
        hypothesis: "Showing 'total cost of ownership' increases conversion by 25%",
        test_method: "A/B test pricing presentation",
        metric: "conversion_rate"
      });
    }
    
    if (culture?.communicationStyle === 'high-context') {
      hypotheses.push({
        hypothesis: "Storytelling approach outperforms feature lists by 40%",
        test_method: "Landing page variant testing",
        metric: "engagement_time"
      });
    }
    
    if (economic?.employmentType === 'gig') {
      hypotheses.push({
        hypothesis: "Flexible billing reduces churn by 30%",
        test_method: "Payment option testing",
        metric: "retention_rate"
      });
    }
    
    return hypotheses;
  }

  generateMessagingPillars(segment, culture, economic) {
    return {
      need_pillar: {
        title: segment?.emotions?.[0] || "Clarity",
        message: "Clear, actionable insights when you need them most",
        cultural_adaptation: this.adaptMessageToCulture(culture)
      },
      fear_pillar: {
        title: segment?.fears?.[0] || "Complexity",
        message: "Simple, transparent solutions without hidden costs",
        economic_adaptation: this.adaptMessageToEconomics(economic)
      },
      value_pillar: {
        title: segment?.values?.[0] || "Efficiency",
        message: "Maximum impact with minimum effort and cost",
        proof_type: this.getProofTypes(economic?.profession, economic?.industry)?.[0] || "case_study"
      }
    };
  }

  generateAssumptionsVsFacts(culture, economic) {
    return {
      cultural_assumptions: [
        "Communication style preference based on reported cultural context",
        "Language formality inferred from business context"
      ],
      economic_assumptions: [
        "Price sensitivity based on self-reported income bracket",
        "Payment preferences inferred from demographic indicators"
      ],
      facts: [
        "Profession and industry data as provided",
        "Stated financial goals and constraints",
        "Reported payment behavior preferences"
      ],
      validation_needed: [
        "Test communication style preferences through A/B testing",
        "Validate price sensitivity with actual purchase behavior",
        "Confirm payment preferences through usage analytics"
      ]
    };
  }

  // Helper methods
  getToneFromCulture(culture) {
    const styles = {
      'high_context': 'warm, relationship-focused, storytelling',
      'low_context': 'direct, fact-based, efficient',
      'formal': 'professional, respectful, structured',
      'casual': 'friendly, approachable, conversational',
      'adaptive_communication': 'versatile, context-aware, flexible tone matching',
      'context_appropriate': 'situationally adaptive, professional yet approachable',
      'multicultural': 'inclusive, culturally sensitive, universally accessible',
      'any': 'adaptable, inclusive, broadly appealing'
    };
    return styles[culture?.communicationStyle] || styles[culture?.formalityNorm] || styles[culture?.locale] || 'professional, clear, helpful';
  }

  getTimingPreferences(culture) {
    const workweek = culture?.workweek || { start: 'Mon', end: 'Fri' };
    return {
      business_hours: `${workweek.start} - ${workweek.end}`,
      best_contact_time: culture?.schedulingNorms?.late_evening_ok ? 'flexible' : 'business hours',
      timezone_consideration: culture?.region?.country === 'IN' ? 'IST' : 'local'
    };
  }

  getPreferredChannels(culture) {
    const channels = ['email', 'web'];
    if (culture?.deviceChannelPrefs?.whatsapp_preferred) channels.push('whatsapp');
    if (culture?.deviceChannelPrefs?.android_share_high) channels.push('mobile_app');
    return channels;
  }

  getValueFraming(priceSensitivity) {
    const framings = {
      'very_high': 'Total cost of ownership, long-term savings, no hidden fees',
      'high': 'Value for money, transparent pricing, cost-effective solutions',
      'medium': 'Quality-price balance, fair pricing, good investment',
      'low': 'Premium quality, exclusive features, best-in-class service',
      'value_conscious': 'Flexible value options, transparent pricing tiers, adaptable solutions',
      'any': 'Universal value proposition, multiple pricing options, inclusive accessibility'
    };
    return framings[priceSensitivity] || framings.medium;
  }

  getPricingStrategy(economic) {
    const income = economic?.incomeBracket || 'medium';
    const frequency = economic?.purchaseFrequency || 'occasional';
    
    if (income.includes('<') || frequency === 'rare') {
      return 'freemium_with_gradual_upgrade';
    } else if (economic?.paymentBehaviour?.subscription_aversion) {
      return 'one_time_or_prepaid_bundles';
    } else {
      return 'subscription_with_trial';
    }
  }

  getProofTypes(profession, industry) {
    const proofMap = {
      'student': ['peer_testimonials', 'educational_discounts'],
      'manager': ['roi_case_studies', 'efficiency_metrics'],
      'CXO': ['enterprise_case_studies', 'strategic_outcomes'],
      'gig': ['flexibility_stories', 'income_improvement'],
      'self-employed': ['business_growth_cases', 'time_savings']
    };
    return proofMap[profession] || ['case_studies', 'testimonials'];
  }

  getFinancialMessaging(economic) {
    const goals = economic?.financialGoals || [];
    if (goals.includes('education')) return 'investment_in_future';
    if (goals.includes('home')) return 'stability_and_security';
    if (goals.includes('emergency_fund')) return 'peace_of_mind';
    return 'growth_and_opportunity';
  }

  getPricePositioning(priceSensitivity) {
    const positions = {
      'very-high': 'Cost-conscious and value-focused.',
      'high': 'Seeks good value for money.',
      'medium': 'Balances price with quality.',
      'low': 'Prioritizes quality over price.'
    };
    return positions[priceSensitivity] || positions.medium;
  }

  adaptMessageToCulture(culture) {
    if (culture?.communicationStyle === 'high-context') {
      return 'Use storytelling and relationship-building language';
    }
    return 'Use direct, clear, and concise language';
  }

  adaptMessageToEconomics(economic) {
    if (economic?.priceSensitivity === 'high') {
      return 'Emphasize transparency and cost-effectiveness';
    }
    return 'Focus on value and outcomes';
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export const personaAI = new PersonaAI(process.env.EMERGENT_LLM_KEY);