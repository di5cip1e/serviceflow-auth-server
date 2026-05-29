/**
 * Quote Skill Generator
 * 
 * Generates industry-specific quoting skill snippets that get injected
 * into an agent's SOUL.md and AGENTS.md at build time.
 * 
 * Each agent only gets the quoting skills relevant to its industry.
 */

const INDUSTRY_QUOTE_SKILLS = {
  lawn_care: {
    skillName: 'Lawn Care Quoting',
    description: 'Generate accurate quotes for lawn mowing, maintenance, and treatment services.',
    pricingRules: [
      'Base rate: $0.025 per square foot for standard mowing',
      'Grass height multiplier: >2" = 10%, >4" = 25%, >6" = 50% surcharge',
      'Obstacles: $2 each (trees, garden beds, playsets)',
      'Edge trimming: $15 flat add-on',
      'Debris/leaf cleanup: $20 flat add-on',
      'Fertilizer treatment: $0.005 per sq ft',
    ],
    questions: [
      'What is the total lawn area in square feet?',
      'How tall is the grass right now (in inches)?',
      'How many obstacles (trees, garden beds, playsets)?',
      'Do you need edge trimming?',
      'Do you need debris or leaf cleanup?',
      'Do you want fertilizer treatment?',
    ],
    exampleQuote: '5,000 sq ft lawn, 6" grass, 3 obstacles, trimming + fertilizer = ~$202',
  },
  roofing: {
    skillName: 'Roofing Quoting',
    description: 'Generate accurate quotes for roof installation, repair, and replacement.',
    pricingRules: [
      'Base rate: $4.50 per square foot (asphalt shingle, single story, low pitch)',
      'Material multiplier: asphalt=1x, metal=1.8x, tile=2.5x, slate=3.5x, cedar=2.2x',
      'Pitch multiplier: low=1x, medium=1.15x, steep=1.4x',
      'Stories: +10% per additional story',
      'Tear-off old roof: +$1.50/sq ft',
      'Skylight flashing: $300 each',
      'Chimney flashing: $200 each',
    ],
    questions: [
      'What is the roof square footage?',
      'How many stories is the home?',
      'What is the roof pitch (low/medium/steep)?',
      'What material type (asphalt/metal/tile/slate/cedar)?',
      'Does the old roof need tear-off?',
      'How many skylights and chimneys?',
    ],
    exampleQuote: '2,000 sq ft, 2-story, medium pitch, asphalt, tear-off = ~$12,650',
  },
  cleaning: {
    skillName: 'Cleaning Service Quoting',
    description: 'Generate accurate quotes for residential and commercial cleaning services.',
    pricingRules: [
      'Base rate: $0.12 per square foot for standard cleaning',
      'Cleaning type: standard=1x, deep=1.5x, move-out=1.75x, post-construction=2.5x',
      'Bathrooms: +$15 each',
      'Pets: +$25 surcharge',
      'Frequency discount: weekly=10% off, biweekly=5% off',
    ],
    questions: [
      'What is the square footage?',
      'How many rooms and bathrooms?',
      'What type of cleaning (standard/deep/move-out/post-construction)?',
      'Are there pets on the property?',
      'Is this one-time or recurring (weekly/biweekly/monthly)?',
    ],
    exampleQuote: '2,000 sq ft, 5 rooms, 2 baths, deep cleaning, pets = ~$415',
  },
  hvac: {
    skillName: 'HVAC Quoting',
    description: 'Generate accurate quotes for HVAC installation, replacement, and repair.',
    pricingRules: [
      'Base system cost: AC-only=$3,500, furnace=$3,000, full-split=$5,500, heat-pump=$6,500, mini-split=$4,500',
      'Tonnage adjustment: +$800 per ton above 2 tons',
      'SEER upgrade: +$200 per SEER rating above 14',
      'Ductwork: +$2,500 if needed',
      'Zones: +$800 per additional zone',
    ],
    questions: [
      'What type of system (AC-only/furnace/full-split/heat-pump/mini-split)?',
      'What tonnage is needed (1.5/2/2.5/3/3.5/4/5)?',
      'What SEER rating (13/14/15/16/18/20/22+)?',
      'Is this a replacement, new install, or retrofit?',
      'Is new ductwork needed?',
      'How many zones?',
    ],
    exampleQuote: 'Full-split, 3-ton, SEER 16, replacement, 2 zones = ~$7,900',
  },
  electrical: {
    skillName: 'Electrical Quoting',
    description: 'Generate accurate quotes for electrical work including whole-house rewiring, panel upgrades, and specialty circuits.',
    pricingRules: [
      'Base rate: $3.50/sq ft for full rewire (standard copper/Romex)',
      'Scope: full=100%, half=55%, kitchen+bath only=30%, single room=15%',
      'Stories: +15% per additional story (vertical cable runs)',
      'Panel: 100A=$1,500, 150A=$2,000, 200A=$2,500, 400A=$4,000',
      'Wiring type: Romex=+5%, armored cable=+25%, conduit=+50%',
      'Basement: unfinished=$400, finished=$800',
      'Garage: $600',
      'EV charger circuit (240V): $1,200',
      'Ceiling fan wiring: $350 each',
      'Extra outlets: $150 each',
      'Switches/dimmers: $120 each',
      'Hardwired smoke/CO detectors: $175 each',
      'Generator transfer switch: $1,500',
      'Hot tub/spa circuit: $1,800',
      'Solar panel integration: $2,000',
      'Old wiring removal: knob-and-tube=+20%, aluminum=+10%, old copper=+5%',
    ],
    questions: [
      'What is the home\'s total square footage?',
      'How many rooms and stories?',
      'What panel size is needed (100A/150A/200A/400A)?',
      'What wiring type (standard copper/Romex/armored cable/conduit)?',
      'Is there a basement? Is it finished?',
      'Is there a garage to wire?',
      'Do you need an EV charger circuit?',
      'How many ceiling fans?',
      'How many extra outlets and switches?',
      'Hardwired smoke/CO detectors? How many?',
      'Generator transfer switch?',
      'Hot tub/spa wiring?',
      'Solar panel integration?',
      'What is the existing wiring type (knob-and-tube/aluminum/old copper/Romex/unknown)?',
      'What percentage of the home needs rewiring (full/half/kitchen+bath/single room)?',
    ],
    exampleQuote: '2,000 sq ft, 2-story, 200A panel, full rewire, basement, garage, 3 fans, 5 outlets = ~$14,200',
  },
  general: {
    skillName: 'General Service Quoting',
    description: 'Generate quotes for general service work based on labor hours and materials.',
    pricingRules: [
      'Base labor rate: $75/hour',
      'Materials: cost + 15% markup',
      'Urgency: standard=1x, rush=+25%, emergency=+100%',
    ],
    questions: [
      'Describe the work needed',
      'Estimated hours of labor',
      'Estimated materials cost',
      'Is this standard, rush, or emergency?',
    ],
    exampleQuote: '8 hours labor + $200 materials, standard = $800',
  },
};

/**
 * Map an industry string to a quote skill key
 */
function resolveIndustry(industry) {
  if (!industry) return 'general';
  const ind = industry.toLowerCase().replace(/[^a-z0-9_]/g, '_');
  // Direct match
  if (INDUSTRY_QUOTE_SKILLS[ind]) return ind;
  // Fuzzy match
  const aliases = {
    lawn: 'lawn_care', mowing: 'lawn_care', landscaping: 'lawn_care', 'lawn_care': 'lawn_care',
    roof: 'roofing', roofing: 'roofing',
    cleaning: 'cleaning', maid: 'cleaning', janitorial: 'cleaning',
    hvac: 'hvac', heating: 'hvac', cooling: 'hvac', air_conditioning: 'hvac',
    electrical: 'electrical', electrician: 'electrical', wiring: 'electrical',
  };
  for (const [alias, key] of Object.entries(aliases)) {
    if (ind.includes(alias)) return key;
  }
  return 'general';
}

/**
 * Generate the quoting skill section for SOUL.md
 */
function generateSoulSnippet(industry) {
  const key = resolveIndustry(industry);
  const skill = INDUSTRY_QUOTE_SKILLS[key];
  if (!skill) return '';

  const questionsList = skill.questions.map(q => `  - ${q}`).join('\n');
  const rulesList = skill.pricingRules.map(r => `  - ${r}`).join('\n');

  return `

## 💰 Quoting Skill: ${skill.skillName}
_${skill.description}_

### Pricing Rules
${rulesList}

### Questions to Ask Customers
${questionsList}

### Example
> ${skill.exampleQuote}

### Quoting Process
1. Gather the required information from the customer by asking the questions above
2. If the customer doesn't know exact numbers, provide estimates based on averages
3. Calculate the quote using the pricing rules
4. Present a clear line-item breakdown with the total
5. Always note: "This is an estimate. Final price confirmed by the business owner before work begins."
6. Save the quote to the quote history for the business owner to review
`;
}

/**
 * Generate the quoting tool section for AGENTS.md
 */
function generateAgentsSnippet(industry) {
  const key = resolveIndustry(industry);
  const skill = INDUSTRY_QUOTE_SKILLS[key];
  if (!skill) return '';

  return `

## Quoting Tool
You have access to a built-in quote calculator for ${skill.skillName.toLowerCase()}.
When a customer asks for a price estimate:
1. Ask the required questions (see SOUL.md Quoting Skill section)
2. Use POST /api/quotes/public/calculate with the customer's answers
3. Display the breakdown and total to the customer
4. Offer to save the quote for the business owner to review
`;
}

/**
 * Get the full quote config for seeding the quote_configs table
 */
function getQuoteConfig(industry) {
  const key = resolveIndustry(industry);
  const skill = INDUSTRY_QUOTE_SKILLS[key];
  if (!skill) return null;
  return {
    industry: key,
    variables: skill.questions.map((q, i) => ({
      id: `var_${i}`,
      label: q.replace('?', ''),
      type: 'text',
    })),
    pricingRules: skill.pricingRules,
  };
}

module.exports = {
  generateSoulSnippet,
  generateAgentsSnippet,
  getQuoteConfig,
  resolveIndustry,
  INDUSTRY_QUOTE_SKILLS,
};
