import { z } from 'zod';
import { BLOCKED_TERMS, REWRITE_SUGGESTIONS } from './seed-data.js';

// Validation schemas
export const segmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  workspaceId: z.string().uuid('Invalid workspace ID'),
  frame: z.string().optional(),
  product: z.string().optional(),
  primaryBenefit: z.string().max(200, 'Primary benefit too long').optional(),
  reason: z.string().optional(),
  context: z.string().max(1000, 'Context too long').optional(),
  cultureAxes: z.record(z.number().min(1).max(5)).optional(),
  values: z.array(z.string()).max(10, 'Too many values selected').optional(),
  emotions: z.array(z.string()).max(10, 'Too many emotions selected').optional(),
  fears: z.array(z.string()).max(10, 'Too many fears selected').optional(),
  evidence: z.string().optional(),
  notes: z.string().optional()
});

export const cultureProfileSchema = z.object({
  segmentId: z.string().uuid('Invalid segment ID'),
  locale: z.string().optional(),
  languages: z.array(z.object({
    code: z.string(),
    script: z.string().optional(),
    proficiency: z.string()
  })).optional(),
  region: z.object({
    country: z.string().optional(),
    state: z.string().optional(),
    city: z.string().optional(),
    cityTier: z.string().optional()
  }).optional(),
  urbanicity: z.enum(['urban', 'semi_urban', 'rural']).optional(),
  communicationStyle: z.enum(['high_context', 'low_context']).optional(),
  timeOrientation: z.enum(['monochronic', 'polychronic']).optional(),
  formalityNorm: z.enum(['formal', 'casual', 'mixed']).optional(),
  workweek: z.object({
    start: z.string(),
    end: z.string(),
    weekend: z.array(z.string())
  }).optional(),
  schedulingNorms: z.record(z.boolean()).optional(),
  festivals: z.array(z.string()).optional(),
  purchasingConstraints: z.record(z.boolean()).optional(),
  deviceChannelPrefs: z.record(z.boolean()).optional()
});

export const economicProfileSchema = z.object({
  segmentId: z.string().uuid('Invalid segment ID'),
  incomeBracket: z.string().optional(),
  currency: z.string().default('INR'),
  profession: z.string().optional(),
  industry: z.string().optional(),
  yearsOfService: z.number().min(0).max(100).optional(),
  employmentType: z.enum(['full_time', 'part_time', 'contract', 'gig', 'self_employed', 'unemployed', 'student']).optional(),
  financialBackground: z.string().optional(),
  familyFinancialBackground: z.string().optional(),
  socioeconomicStatus: z.enum(['LOW', 'LOWER_MID', 'MID', 'UPPER_MID', 'HIGH']).optional(),
  priceSensitivity: z.enum(['very_high', 'high', 'medium', 'low']).optional(),
  purchaseFrequency: z.enum(['rare', 'occasional', 'regular', 'habitual']).optional(),
  paymentBehaviour: z.record(z.boolean()).optional(),
  savingsInclination: z.enum(['saver', 'balanced', 'spender']).optional(),
  riskAppetite: z.enum(['low', 'moderate', 'high']).optional(),
  creditAccess: z.enum(['none', 'limited', 'moderate', 'strong']).optional(),
  financialGoals: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional()
});

export const workspaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long')
});

// Content validation for ethical compliance
export function validateContent(text) {
  if (!text || typeof text !== 'string') return { valid: true };
  
  const lowerText = text.toLowerCase();
  const issues = [];
  const suggestions = [];
  
  // Check for blocked terms
  for (const term of BLOCKED_TERMS) {
    if (lowerText.includes(term.toLowerCase())) {
      issues.push({
        term,
        type: 'blocked',
        message: `Contains prohibited term: "${term}"`
      });
      
      if (REWRITE_SUGGESTIONS[term]) {
        suggestions.push({
          original: term,
          suggested: REWRITE_SUGGESTIONS[term],
          message: `Consider using "${REWRITE_SUGGESTIONS[term]}" instead of "${term}"`
        });
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues,
    suggestions
  };
}

// Form validation helpers
export function validateSegmentForm(data) {
  try {
    const validated = segmentSchema.parse(data);
    
    // Additional content validation
    const contentChecks = [
      validateContent(validated.name),
      validateContent(validated.context),
      validateContent(validated.notes)
    ];
    
    const contentIssues = contentChecks.flatMap(check => check.issues || []);
    
    if (contentIssues.length > 0) {
      return {
        success: false,
        error: 'Content validation failed',
        issues: contentIssues
      };
    }
    
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error.errors?.[0]?.message || 'Validation failed'
    };
  }
}

export function validateCultureForm(data) {
  try {
    const validated = cultureProfileSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error.errors?.[0]?.message || 'Validation failed'
    };
  }
}

export function validateEconomicForm(data) {
  try {
    const validated = economicProfileSchema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error.errors?.[0]?.message || 'Validation failed'
    };
  }
}

export function validateWorkspaceForm(data) {
  try {
    const validated = workspaceSchema.parse(data);
    
    // Additional content validation
    const contentCheck = validateContent(validated.name);
    
    if (!contentCheck.valid) {
      return {
        success: false,
        error: 'Content validation failed',
        issues: contentCheck.issues
      };
    }
    
    return { success: true, data: validated };
  } catch (error) {
    return {
      success: false,
      error: error.errors?.[0]?.message || 'Validation failed'
    };
  }
}

// Real-time validation for form inputs
export function getFieldError(value, rules) {
  for (const rule of rules) {
    if (rule.required && (!value || value.trim() === '')) {
      return rule.message || 'This field is required';
    }
    
    if (value && rule.minLength && value.length < rule.minLength) {
      return rule.message || `Minimum length is ${rule.minLength}`;
    }
    
    if (value && rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `Maximum length is ${rule.maxLength}`;
    }
    
    if (value && rule.pattern && !rule.pattern.test(value)) {
      return rule.message || 'Invalid format';
    }
  }
  
  return null;
}