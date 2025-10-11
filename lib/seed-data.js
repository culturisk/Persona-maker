// Seed data for controlled vocabularies and validation

export const INCOME_BRACKETS = {
  INR: [
    { value: '<₹25k', label: 'Below ₹25,000' },
    { value: '₹25k-₹50k', label: '₹25,000 - ₹50,000' },
    { value: '₹50k-₹1L', label: '₹50,000 - ₹1,00,000' },
    { value: '₹1L-₹2L', label: '₹1,00,000 - ₹2,00,000' },
    { value: '₹2L-₹5L', label: '₹2,00,000 - ₹5,00,000' },
    { value: '₹5L+', label: 'Above ₹5,00,000' }
  ],
  USD: [
    { value: '<$30k', label: 'Below $30,000' },
    { value: '$30k-$60k', label: '$30,000 - $60,000' },
    { value: '$60k-$100k', label: '$60,000 - $100,000' },
    { value: '$100k-$200k', label: '$100,000 - $200,000' },
    { value: '$200k+', label: 'Above $200,000' }
  ]
};

export const PROFESSIONS = [
  { value: 'any', label: 'Any Profession' },
  { value: 'student', label: 'Student' },
  { value: 'junior_staff', label: 'Junior Staff/Associate' },
  { value: 'senior_staff', label: 'Senior Staff' },
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'manager', label: 'Manager' },
  { value: 'senior_manager', label: 'Senior Manager' },
  { value: 'director', label: 'Director' },
  { value: 'CXO', label: 'CXO/Executive' },
  { value: 'gig_worker', label: 'Gig Worker/Freelancer' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'SME_owner', label: 'SME Owner' },
  { value: 'entrepreneur', label: 'Entrepreneur' },
  { value: 'retired', label: 'Retired' },
  { value: 'homemaker', label: 'Homemaker' }
];

export const INDUSTRIES = [
  { value: 'any', label: 'Any Industry' },
  { value: 'technology', label: 'Technology/IT/ITeS' },
  { value: 'finance', label: 'Banking & Financial Services' },
  { value: 'healthcare', label: 'Healthcare & Pharmaceuticals' },
  { value: 'education', label: 'Education & Training' },
  { value: 'retail', label: 'Retail & E-commerce' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'logistics', label: 'Logistics & Supply Chain' },
  { value: 'media', label: 'Media & Entertainment' },
  { value: 'consulting', label: 'Consulting' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'food_beverage', label: 'Food & Beverage' },
  { value: 'travel', label: 'Travel & Tourism' },
  { value: 'government', label: 'Government/Public Sector' },
  { value: 'nonprofit', label: 'Non-Profit' },
  { value: 'other', label: 'Other' }
];

export const EMPLOYMENT_TYPES = [
  { value: 'any', label: 'Any Employment Type' },
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'gig', label: 'Gig/Freelance' },
  { value: 'self_employed', label: 'Self-Employed' },
  { value: 'unemployed', label: 'Unemployed' },
  { value: 'student', label: 'Student' }
];

export const FINANCIAL_BACKGROUNDS = [
  { value: 'any', label: 'Any Financial Background' },
  { value: 'first_gen_earner', label: 'First-generation earner' },
  { value: 'middle_class_stable', label: 'Middle-class stable background' },
  { value: 'entrepreneurial_volatile', label: 'Entrepreneurial/volatile income background' },
  { value: 'upper_class', label: 'Upper-class background' },
  { value: 'inherited_wealth', label: 'Inherited wealth' },
  { value: 'self_made', label: 'Self-made wealth' }
];

export const FAMILY_FINANCIAL_BACKGROUNDS = [
  { value: 'any', label: 'Any Family Background' },
  { value: 'dependent_parents', label: 'Support dependent parents' },
  { value: 'dual_income', label: 'Dual-income household' },
  { value: 'single_income', label: 'Single-income household' },
  { value: 'caretaker_responsibilities', label: 'Primary caretaker responsibilities' },
  { value: 'financial_independence', label: 'Financially independent' },
  { value: 'family_support', label: 'Receives family financial support' }
];

export const SES_LEVELS = [
  { value: 'any', label: 'Any Socioeconomic Status' },
  { value: 'LOW', label: 'Lower socioeconomic status' },
  { value: 'LOWER_MID', label: 'Lower-middle class' },
  { value: 'MID', label: 'Middle class' },
  { value: 'UPPER_MID', label: 'Upper-middle class' },
  { value: 'HIGH', label: 'High socioeconomic status' }
];

export const PRICE_SENSITIVITY = [
  { value: 'any', label: 'Any Price Sensitivity' },
  { value: 'very_high', label: 'Very High - Extremely price conscious' },
  { value: 'high', label: 'High - Price is a major factor' },
  { value: 'medium', label: 'Medium - Balances price with value' },
  { value: 'low', label: 'Low - Price is less important than quality' }
];

export const PURCHASE_FREQUENCY = [
  { value: 'any', label: 'Any Purchase Frequency' },
  { value: 'rare', label: 'Rare - Less than once per year' },
  { value: 'occasional', label: 'Occasional - Few times per year' },
  { value: 'regular', label: 'Regular - Monthly purchases' },
  { value: 'habitual', label: 'Habitual - Weekly or more frequent' }
];

export const SAVINGS_INCLINATION = [
  { value: 'any', label: 'Any Savings Inclination' },
  { value: 'saver', label: 'Saver - Prioritizes saving money' },
  { value: 'balanced', label: 'Balanced - Saves and spends reasonably' },
  { value: 'spender', label: 'Spender - Prefers to spend on experiences/items' }
];

export const RISK_APPETITE = [
  { value: 'any', label: 'Any Risk Appetite' },
  { value: 'low', label: 'Low - Prefers safe, guaranteed options' },
  { value: 'moderate', label: 'Moderate - Comfortable with some risk' },
  { value: 'high', label: 'High - Willing to take significant risks for returns' }
];

export const CREDIT_ACCESS = [
  { value: 'any', label: 'Any Credit Access Level' },
  { value: 'none', label: 'No access to credit' },
  { value: 'limited', label: 'Limited credit access' },
  { value: 'moderate', label: 'Moderate credit access' },
  { value: 'strong', label: 'Strong credit access' }
];

export const FINANCIAL_GOALS = [
  { value: 'education', label: 'Education funding' },
  { value: 'home', label: 'Home purchase/improvement' },
  { value: 'vehicle', label: 'Vehicle purchase' },
  { value: 'travel', label: 'Travel experiences' },
  { value: 'emergency_fund', label: 'Emergency fund' },
  { value: 'retirement', label: 'Retirement planning' },
  { value: 'business', label: 'Business investment' },
  { value: 'healthcare', label: 'Healthcare coverage' },
  { value: 'family_support', label: 'Family support' },
  { value: 'luxury_items', label: 'Luxury purchases' }
];

export const CONSTRAINTS = [
  { value: 'shared_device', label: 'Shares device with family' },
  { value: 'limited_data', label: 'Limited data/bandwidth' },
  { value: 'time_poor', label: 'Time-constrained' },
  { value: 'location_restricted', label: 'Geographic restrictions' },
  { value: 'language_barrier', label: 'Language preferences/barriers' },
  { value: 'digital_literacy', label: 'Limited digital literacy' }
];

export const PAYMENT_BEHAVIOURS = [
  { value: 'prefers_cod', label: 'Prefers Cash on Delivery' },
  { value: 'upi_preferred', label: 'UPI is preferred method' },
  { value: 'credit_card', label: 'Regular credit card user' },
  { value: 'debit_card', label: 'Prefers debit card' },
  { value: 'bank_transfer', label: 'Bank transfer preferred' },
  { value: 'emi_friendly', label: 'Comfortable with EMI options' },
  { value: 'subscription_aversion', label: 'Avoids subscriptions' },
  { value: 'prepaid_preferred', label: 'Prefers prepaid options' }
];

// Culture-related vocabularies
export const LOCALES = [
  { value: 'any', label: 'Any Locale' },
  { value: 'en-IN', label: 'English (India)' },
  { value: 'hi-IN', label: 'Hindi (India)' },
  { value: 'mr-IN', label: 'Marathi (India)' },
  { value: 'ta-IN', label: 'Tamil (India)' },
  { value: 'te-IN', label: 'Telugu (India)' },
  { value: 'kn-IN', label: 'Kannada (India)' },
  { value: 'gu-IN', label: 'Gujarati (India)' },
  { value: 'bn-IN', label: 'Bengali (India)' },
  { value: 'en-US', label: 'English (United States)' },
  { value: 'en-GB', label: 'English (United Kingdom)' }
];

export const URBANICITY = [
  { value: 'any', label: 'Any Location Type' },
  { value: 'urban', label: 'Urban (Metro cities)' },
  { value: 'semi_urban', label: 'Semi-urban (Tier 2 cities)' },
  { value: 'rural', label: 'Rural areas' }
];

export const COMMUNICATION_STYLES = [
  { value: 'any', label: 'Any Communication Style' },
  { value: 'high_context', label: 'High-context (Relationship-focused, indirect)' },
  { value: 'low_context', label: 'Low-context (Direct, explicit)' }
];

export const TIME_ORIENTATIONS = [
  { value: 'any', label: 'Any Time Orientation' },
  { value: 'monochronic', label: 'Monochronic (Linear, punctual)' },
  { value: 'polychronic', label: 'Polychronic (Flexible, relationship-time)' }
];

export const FORMALITY_NORMS = [
  { value: 'any', label: 'Any Formality Level' },
  { value: 'formal', label: 'Formal communication preferred' },
  { value: 'casual', label: 'Casual communication preferred' },
  { value: 'mixed', label: 'Context-dependent formality' }
];

// Values, Emotions, and Fears libraries
export const VALUES_LIBRARY = [
  { value: 'efficiency', label: 'Efficiency' },
  { value: 'quality', label: 'Quality' },
  { value: 'reliability', label: 'Reliability' },
  { value: 'innovation', label: 'Innovation' },
  { value: 'tradition', label: 'Tradition' },
  { value: 'community', label: 'Community' },
  { value: 'independence', label: 'Independence' },
  { value: 'security', label: 'Security' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'growth', label: 'Growth' },
  { value: 'balance', label: 'Work-life balance' },
  { value: 'transparency', label: 'Transparency' },
  { value: 'sustainability', label: 'Sustainability' },
  { value: 'frugality', label: 'Frugality' },
  { value: 'status', label: 'Social status' }
];

export const EMOTIONS_LIBRARY = [
  { value: 'confidence', label: 'Confidence' },
  { value: 'clarity', label: 'Clarity' },
  { value: 'excitement', label: 'Excitement' },
  { value: 'calm', label: 'Calmness' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'satisfaction', label: 'Satisfaction' },
  { value: 'curiosity', label: 'Curiosity' },
  { value: 'pride', label: 'Pride' },
  { value: 'relief', label: 'Relief' },
  { value: 'hope', label: 'Hope' },
  { value: 'trust', label: 'Trust' },
  { value: 'empowerment', label: 'Empowerment' }
];

export const FEARS_LIBRARY = [
  { value: 'complexity', label: 'Complexity' },
  { value: 'hidden_costs', label: 'Hidden costs' },
  { value: 'data_privacy', label: 'Data privacy concerns' },
  { value: 'lock_in', label: 'Vendor lock-in' },
  { value: 'learning_curve', label: 'Steep learning curve' },
  { value: 'unreliability', label: 'Unreliability' },
  { value: 'poor_support', label: 'Poor customer support' },
  { value: 'obsolescence', label: 'Technology obsolescence' },
  { value: 'integration_issues', label: 'Integration difficulties' },
  { value: 'scalability_limits', label: 'Scalability limitations' },
  { value: 'security_breaches', label: 'Security breaches' },
  { value: 'time_waste', label: 'Wasting time' }
];

// Culture Axes (for sophisticated cultural profiling)
export const CULTURE_AXES = [
  {
    name: 'Individual vs Communal',
    description: 'Decision-making style and social orientation',
    scale: {
      left: { value: 'individual', label: 'Individual-focused' },
      right: { value: 'communal', label: 'Community-focused' }
    }
  },
  {
    name: 'Certainty vs Exploration',
    description: 'Risk tolerance and change acceptance',
    scale: {
      left: { value: 'certainty', label: 'Prefers certainty' },
      right: { value: 'exploration', label: 'Values exploration' }
    }
  },
  {
    name: 'Hierarchy vs Equality',
    description: 'Authority and power structure preferences',
    scale: {
      left: { value: 'hierarchy', label: 'Respects hierarchy' },
      right: { value: 'equality', label: 'Values equality' }
    }
  },
  {
    name: 'Long-term vs Short-term',
    description: 'Time horizon for planning and rewards',
    scale: {
      left: { value: 'long_term', label: 'Long-term oriented' },
      right: { value: 'short_term', label: 'Short-term focused' }
    }
  }
];

// Blocked terms for ethical validation
export const BLOCKED_TERMS = [
  // Protected attributes (hard-blocked)
  'caste', 'religion', 'race', 'ethnicity', 'skin color', 'colour', 'tribe', 
  'immigration', 'refugee', 'sexual orientation', 'disability', 'health condition',
  'political affiliation', 'political party', 'voting', 'political belief',
  
  // Discriminatory language
  'inferior', 'superior', 'primitive', 'backward', 'advanced race', 'pure',
  'mixed race', 'blood', 'genetic', 'born', 'natural', 'innate ability',
  
  // Exclusionary targeting terms
  'exclude', 'avoid', 'reject', 'discriminate', 'filter out', 'not suitable for'
];

export const REWRITE_SUGGESTIONS = {
  'exclude': 'focus on',
  'avoid': 'prioritize',
  'reject': 'select',
  'not suitable for': 'designed for',
  'inferior': 'different approach',
  'superior': 'alternative approach',
  'primitive': 'traditional',
  'backward': 'traditional',
  'advanced': 'modern'
};