/**
 * Smart Quote Engine Routes
 * 
 * Business owners configure pricing variables → AI agent computes quotes.
 * 
 * GET    /api/quotes/config/:agentId         — Get quote configuration
 * POST   /api/quotes/config/:agentId         — Save quote configuration  
 * POST   /api/quotes/calculate               — Calculate a quote (AI-powered)
 * GET    /api/quotes/:agentId                — Get quote history
 * GET    /api/quotes/:agentId/:quoteId       — Get single quote
 * POST   /api/quotes/save                    — Save a draft quote
 * DELETE /api/quotes/:agentId/:quoteId       — Delete a quote
 */

const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// Auth middleware
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

// Verify agent ownership
async function getAgent(agentId, userId) {
  return new Promise((resolve) => {
    db.get(
      `SELECT a.*, c.user_id FROM agents a
       JOIN customers c ON a.customer_id = c.id
       WHERE a.id = ? AND c.user_id = ?`,
      [agentId, userId], (err, row) => resolve(row || null)
    );
  });
}

// ── Industry Presets ────────────────────────────────────────────────────────

const INDUSTRY_PRESETS = {
  lawn_care: {
    name: 'Lawn Care',
    variables: [
      { id: 'sq_ft', label: 'Square Footage', type: 'number', required: true, hint: 'Total lawn area in sq ft' },
      { id: 'grass_height', label: 'Current Grass Height (inches)', type: 'number', required: true, hint: 'How tall is the grass right now?' },
      { id: 'obstacles', label: 'Number of Obstacles', type: 'number', default: 0, hint: 'Trees, garden beds, playsets, etc.' },
      { id: 'has_fence', label: 'Has Fence/Gate?', type: 'boolean', default: false },
      { id: 'has_dogs', label: 'Dogs on Property?', type: 'boolean', default: false },
      { id: 'slope', label: 'Terrain Slope', type: 'select', options: ['flat', 'gentle', 'moderate', 'steep'], default: 'flat' },
      { id: 'trimming', label: 'Edge Trimming Needed?', type: 'boolean', default: false },
      { id: 'debris', label: 'Debris/Leaf Cleanup?', type: 'boolean', default: false },
      { id: 'fertilize', label: 'Fertilizer Treatment?', type: 'boolean', default: false },
    ],
    baseRate: 0.025, // per sq ft
    pricingRules: [
      'Base rate: $0.025/sq ft for standard mowing',
      'Grass height multiplier: >2\" = 10%, >4\" = 25%, >6\" = 50%',
      'Obstacles: $2 each (trees, garden beds, playsets)',
      'Edge trimming: $15 flat add-on',
      'Debris/leaf cleanup: $20 flat add-on',
      'Fertilizer treatment: $0.005 per sq ft',
    ],
    pricingDescription: 'Base rate: $0.025/sq ft. Grass height multiplier, obstacle surcharges, and add-ons applied.',
  },
  roofing: {
    name: 'Roofing',
    variables: [
      { id: 'sq_ft', label: 'Square Footage', type: 'number', required: true },
      { id: 'stories', label: 'Number of Stories', type: 'select', options: ['1', '2', '3+'], default: '1' },
      { id: 'roof_pitch', label: 'Roof Pitch', type: 'select', options: ['low', 'medium', 'steep'], default: 'medium' },
      { id: 'material', label: 'Material Type', type: 'select', options: ['asphalt', 'metal', 'tile', 'slate', 'cedar'], default: 'asphalt' },
      { id: 'tear_off', label: 'Tear-off Old Roof?', type: 'boolean', default: true },
      { id: 'has_skylights', label: 'Has Skylights?', type: 'boolean', default: false },
      { id: 'chimneys', label: 'Number of Chimneys', type: 'number', default: 0 },
    ],
    baseRate: 4.50,
    pricingRules: [
      'Base rate: $4.50/sq ft (asphalt shingle, single story, low pitch)',
      'Material multiplier: asphalt=1x, metal=1.8x, tile=2.5x, slate=3.5x, cedar=2.2x',
      'Pitch multiplier: low=1x, medium=1.15x, steep=1.4x',
      'Stories: +10% per additional story',
      'Tear-off old roof: +$1.50/sq ft',
      'Skylight flashing: $300 each',
      'Chimney flashing: $200 each',
    ],
    pricingDescription: 'Base rate: $4.50/sq ft. Material, pitch, and complexity multipliers applied.',
  },
  cleaning: {
    name: 'Cleaning Service',
    variables: [
      { id: 'sq_ft', label: 'Square Footage', type: 'number', required: true },
      { id: 'rooms', label: 'Number of Rooms', type: 'number', required: true },
      { id: 'bathrooms', label: 'Number of Bathrooms', type: 'number', default: 1 },
      { id: 'cleaning_type', label: 'Cleaning Type', type: 'select', options: ['standard', 'deep', 'move_out', 'post_construction'], default: 'standard' },
      { id: 'has_pets', label: 'Has Pets?', type: 'boolean', default: false },
      { id: 'frequency', label: 'Frequency', type: 'select', options: ['one_time', 'weekly', 'biweekly', 'monthly'], default: 'one_time' },
    ],
    baseRate: 0.12,
    pricingRules: [
      'Base rate: $0.12 per sq ft for standard cleaning',
      'Cleaning type: standard=1x, deep=1.5x, move-out=1.75x, post-construction=2.5x',
      'Bathrooms: +$15 each',
      'Pets: +$25 surcharge',
      'Frequency discount: weekly=10% off, biweekly=5% off',
    ],
    pricingDescription: 'Base rate: $0.12/sq ft. Room/bathroom counts, cleaning type, and frequency adjust pricing.',
  },
  hvac: {
    name: 'HVAC',
    variables: [
      { id: 'system_type', label: 'System Type', type: 'select', options: ['ac_only', 'furnace_only', 'full_split', 'heat_pump', 'mini_split'], default: 'full_split' },
      { id: 'tonnage', label: 'Tonnage', type: 'select', options: ['1.5', '2', '2.5', '3', '3.5', '4', '5'], default: '3' },
      { id: 'seer', label: 'SEER Rating', type: 'select', options: ['13', '14', '15', '16', '18', '20', '22+'], default: '14' },
      { id: 'install_type', label: 'Install Type', type: 'select', options: ['replace', 'new_install', 'retrofit'], default: 'replace' },
      { id: 'ductwork', label: 'Ductwork Needed?', type: 'boolean', default: false },
      { id: 'zones', label: 'Number of Zones', type: 'number', default: 1 },
    ],
    baseRate: 0,
    pricingRules: [
      'Base system cost: AC-only=$3,500, furnace=$3,000, full-split=$5,500, heat-pump=$6,500, mini-split=$4,500',
      'Tonnage adjustment: +$800 per ton above 2 tons',
      'SEER upgrade: +$200 per SEER rating above 14',
      'Ductwork: +$2,500 if needed',
      'Zones: +$800 per additional zone',
    ],
    pricingDescription: 'Pricing based on system type + tonnage + SEER. Complex formula with multipliers.',
  },
  general: {
    name: 'General Service',
    variables: [
      { id: 'description', label: 'Service Description', type: 'text', required: true },
      { id: 'hours_estimated', label: 'Estimated Hours', type: 'number', required: true },
      { id: 'materials_cost', label: 'Materials Cost ($)', type: 'number', default: 0 },
      { id: 'urgency', label: 'Urgency', type: 'select', options: ['standard', 'rush', 'emergency'], default: 'standard' },
      { id: 'has_special_requirements', label: 'Special Requirements?', type: 'boolean', default: false },
    ],
    baseRate: 75,
    pricingRules: [
      'Base labor rate: $75/hour',
      'Materials: cost + 15% markup',
      'Urgency: standard=1x, rush=+25%, emergency=+100%',
    ],
    pricingDescription: 'Base rate: $75/hr + materials. Urgency multipliers apply.',
  },
  electrical: {
    name: 'Electrical',
    variables: [
      { id: 'sq_ft', label: 'Home Square Footage', type: 'number', required: true, hint: 'Total finished + unfinished sq ft' },
      { id: 'rooms', label: 'Number of Rooms', type: 'number', required: true, hint: 'Bedrooms, living rooms, kitchen, etc.' },
      { id: 'stories', label: 'Number of Stories', type: 'select', options: ['1', '2', '3+'], default: '1', required: true },
      { id: 'panel_size', label: 'Electrical Panel Size (amps)', type: 'select', options: ['100', '150', '200', '400'], default: '200', required: true },
      { id: 'wiring_type', label: 'Wiring Type Needed', type: 'select', options: ['standard_copper', 'romex_nm', 'armored_cable', 'conduit'], default: 'standard_copper' },
      { id: 'has_basement', label: 'Has Basement?', type: 'boolean', default: false },
      { id: 'basement_finished', label: 'Basement Finished?', type: 'boolean', default: false },
      { id: 'has_garage', label: 'Has Garage?', type: 'boolean', default: false },
      { id: 'has_ev_charger', label: 'EV Charger Installation?', type: 'boolean', default: false },
      { id: 'has_ceiling_fans', label: 'Ceiling Fan(s)?', type: 'boolean', default: false },
      { id: 'num_fans', label: 'Number of Ceiling Fans', type: 'number', default: 0 },
      { id: 'num_outlets', label: 'Extra Outlets Needed', type: 'number', default: 0, hint: 'Additional outlets beyond standard' },
      { id: 'num_switches', label: 'Extra Switches/Dimmers', type: 'number', default: 0 },
      { id: 'has_smoke_detectors', label: 'Hardwired Smoke/CO Detectors?', type: 'boolean', default: false },
      { id: 'num_smoke', label: 'Number of Smoke/CO Detectors', type: 'number', default: 0 },
      { id: 'has_generator', label: 'Generator Transfer Switch?', type: 'boolean', default: false },
      { id: 'has_hot_tub', label: 'Hot Tub / Spa Wiring?', type: 'boolean', default: false },
      { id: 'has_solar', label: 'Solar Panel Integration?', type: 'boolean', default: false },
      { id: 'old_wiring_type', label: 'Existing Wiring Type', type: 'select', options: ['knob_and_tube', 'aluminum', 'old_copper', 'new_romex', 'unknown'], default: 'unknown' },
      { id: 'rewire_percentage', label: '% of Home to Rewire', type: 'select', options: ['full', 'half', 'partial_kitchen_bath', 'just_one_room'], default: 'full' },
    ],
    baseRate: 3.50,
    pricingRules: [
      'Base rate: $3.50/sq ft for full rewire (standard copper/Romex)',
      'Scope: full=100%, half=55%, kitchen+bath only=30%, single room=15%',
      'Stories: +15% per additional story',
      'Panel: 100A=$1,500, 150A=$2,000, 200A=$2,500, 400A=$4,000',
      'Wiring type: Romex=+5%, armored cable=+25%, conduit=+50%',
      'Basement: unfinished=$400, finished=$800',
      'Garage: $600',
      'EV charger circuit: $1,200',
      'Ceiling fan wiring: $350 each',
      'Extra outlets: $150 each',
      'Switches/dimmers: $120 each',
      'Hardwired smoke/CO: $175 each',
      'Generator transfer switch: $1,500',
      'Hot tub circuit: $1,800',
      'Solar panel integration: $2,000',
      'Old wiring removal: knob-and-tube=+20%, aluminum=+10%, old copper=+5%',
    ],
    pricingDescription: 'Base: $3.50/sq ft for full rewire. Panel, wiring type, and specialty add-ons applied. Knob-and-tube removal carries premium.',
  },
};


// ── Quote Calculation Engine ────────────────────────────────────────────────

function calculateQuote(variables, config) {
  const vars = variables || {};
  const industry = config?.industry || 'general';
  const baseRate = config?.base_rate || INDUSTRY_PRESETS[industry]?.baseRate || 75;
  const configuredVars = config?.variables ? JSON.parse(config.variables) : INDUSTRY_PRESETS[industry]?.variables || [];

  let total = 0;
  const breakdown = [];

  switch (industry) {
    case 'lawn_care': {
      const sqFt = parseFloat(vars.sq_ft) || 0;
      const grassH = parseFloat(vars.grass_height) || 0;
      const obstacles = parseInt(vars.obstacles) || 0;
      const trimming = vars.trimming === 'true' || vars.trimming === true;
      const debris = vars.debris === 'true' || vars.debris === true;
      const fertilize = vars.fertilize === 'true' || vars.fertilize === true;

      // Base: sq ft * rate
      const base = sqFt * (baseRate || 0.025);
      breakdown.push({ label: 'Base Cut', amount: round(base) });

      // Grass height multiplier
      let heightMult = 1;
      if (grassH > 6) heightMult = 1.5;
      else if (grassH > 4) heightMult = 1.25;
      else if (grassH > 2) heightMult = 1.1;
      if (heightMult > 1) {
        breakdown.push({ label: `Tall Grass (${grassH}"${heightMult > 1 ? ' +' + Math.round((heightMult-1)*100) + '%' : ''})`, amount: round(base * (heightMult - 1)), multiplier: heightMult });
      }

      // Obstacles ($2 per obstacle upcharge)
      if (obstacles > 0) {
        breakdown.push({ label: `Obstacles (${obstacles})`, amount: obstacles * 2 });
      }

      // Add-ons
      if (trimming) breakdown.push({ label: 'Edge Trimming', amount: 15 });
      if (debris) breakdown.push({ label: 'Debris Cleanup', amount: 20 });
      if (fertilize) breakdown.push({ label: 'Fertilizer Treatment', amount: sqFt * 0.005 });

      total = base * heightMult + (obstacles * 2) + (trimming ? 15 : 0) + (debris ? 20 : 0) + (fertilize ? sqFt * 0.005 : 0);
      break;
    }

    case 'roofing': {
      const sqFt = parseFloat(vars.sq_ft) || 0;
      const stories = parseInt(vars.stories) || 1;
      const pitch = vars.roof_pitch || 'medium';
      const material = vars.material || 'asphalt';
      const tearOff = vars.tear_off === 'true' || vars.tear_off === true;
      const skylights = vars.has_skylights === 'true' || vars.has_skylights === true;
      const chimneys = parseInt(vars.chimneys) || 0;

      // Material multipliers
      const matMult = { asphalt: 1, metal: 1.8, tile: 2.5, slate: 3.5, cedar: 2.2 }[material] || 1;
      // Pitch multipliers
      const pitchMult = { low: 1, medium: 1.15, steep: 1.4 }[pitch] || 1;
      // Stories multiplier
      const storyMult = stories > 1 ? 1 + (stories - 1) * 0.1 : 1;

      const base = sqFt * (baseRate || 4.50);
      breakdown.push({ label: `Base (${sqFt} sq ft)`, amount: round(base) });

      total = base * matMult * pitchMult * storyMult + (tearOff ? sqFt * 1.5 : 0) + (skylights ? 300 : 0) + (chimneys * 200);
      breakdown.push({ label: `Material (${material}, ${Math.round((matMult-1)*100)}% premium)`, amount: round(base * (matMult - 1)) });
      breakdown.push({ label: `Roof Pitch (${pitch})`, amount: round(base * (pitchMult - 1)) });
      if (stories > 1) breakdown.push({ label: `${stories} Stories`, amount: round(base * (storyMult - 1)) });
      if (tearOff) breakdown.push({ label: 'Tear-off Old Roof', amount: round(sqFt * 1.5) });
      if (skylights) breakdown.push({ label: 'Skylight Flashing', amount: 300 });
      if (chimneys > 0) breakdown.push({ label: `Chimney Flashing (${chimneys})`, amount: chimneys * 200 });
      break;
    }

    case 'cleaning': {
      const sqFt = parseInt(vars.sq_ft) || 0;
      const rooms = parseInt(vars.rooms) || 0;
      const bathrooms = parseInt(vars.bathrooms) || 1;
      const type = vars.cleaning_type || 'standard';
      const pets = vars.has_pets === 'true' || vars.has_pets === true;

      const typeMults = { standard: 1, deep: 1.5, move_out: 1.75, post_construction: 2.5 };
      const typeMult = typeMults[type] || 1;

      const base = sqFt * (baseRate || 0.12);
      breakdown.push({ label: `Base (${sqFt} sq ft)`, amount: round(base) });

      total = (base * typeMult) + (bathrooms * 15) + (pets ? 25 : 0);
      breakdown.push({ label: `Cleaning Type (${type})`, amount: round(base * (typeMult - 1)) });
      breakdown.push({ label: `Bathrooms (${bathrooms})`, amount: bathrooms * 15 });
      if (pets) breakdown.push({ label: 'Pet Surcharge', amount: 25 });
      break;
    }

    case 'hvac': {
      const tonnage = parseFloat(vars.tonnage) || 3;
      const seer = parseInt(vars.seer) || 14;
      const systemType = vars.system_type || 'full_split';
      const ducts = vars.ductwork === 'true' || vars.ductwork === true;
      const zones = parseInt(vars.zones) || 1;

      // Base costs by system type + tonnage
      const typeBase = {
        ac_only: 3500, furnace_only: 3000, full_split: 5500, heat_pump: 6500, mini_split: 4500
      }[systemType] || 5500;

      // SEER adjustment: $200 per SEER above 14
      const seerAdjust = seer > 14 ? (seer - 14) * 200 : 0;
      // Tonnage: $800 per ton above 2
      const tonAdjust = tonnage > 2 ? (tonnage - 2) * 800 : 0;

      total = typeBase + tonAdjust + seerAdjust + (ducts ? 2500 : 0) + ((zones - 1) * 800);
      breakdown.push({ label: `System (${systemType}, ${tonnage} ton)`, amount: typeBase });
      if (tonAdjust > 0) breakdown.push({ label: `Tonnage Adjustment`, amount: round(tonAdjust) });
      if (seerAdjust > 0) breakdown.push({ label: `SEER ${seer} Upgrade`, amount: seerAdjust });
      if (ducts) breakdown.push({ label: 'Ductwork Installation', amount: 2500 });
      if (zones > 1) breakdown.push({ label: `Zones (${zones})`, amount: (zones - 1) * 800 });
      break;
    }

    case 'electrical': {
      const sqFt = parseFloat(vars.sq_ft) || 0;
      const rooms = parseInt(vars.rooms) || 0;
      const stories = parseInt(vars.stories) || 1;
      const panelSize = parseInt(vars.panel_size) || 200;
      const wiringType = vars.wiring_type || 'standard_copper';
      const hasBasement = vars.has_basement === 'true' || vars.has_basement === true;
      const basementFinished = vars.basement_finished === 'true' || vars.basement_finished === true;
      const hasGarage = vars.has_garage === 'true' || vars.has_garage === true;
      const hasEV = vars.has_ev_charger === 'true' || vars.has_ev_charger === true;
      const hasFans = vars.has_ceiling_fans === 'true' || vars.has_ceiling_fans === true;
      const numFans = parseInt(vars.num_fans) || 0;
      const numOutlets = parseInt(vars.num_outlets) || 0;
      const numSwitches = parseInt(vars.num_switches) || 0;
      const hasSmoke = vars.has_smoke_detectors === 'true' || vars.has_smoke_detectors === true;
      const numSmoke = parseInt(vars.num_smoke) || 0;
      const hasGenerator = vars.has_generator === 'true' || vars.has_generator === true;
      const hasHotTub = vars.has_hot_tub === 'true' || vars.has_hot_tub === true;
      const hasSolar = vars.has_solar === 'true' || vars.has_solar === true;
      const oldWiring = vars.old_wiring_type || 'unknown';
      const rewirePct = vars.rewire_percentage || 'full';

      // Base rate per sq ft by rewire scope
      const scopeMult = { full: 1, half: 0.55, partial_kitchen_bath: 0.3, just_one_room: 0.15 };
      const scope = scopeMult[rewirePct] || 1;
      const base = sqFt * (baseRate || 3.50) * scope;
      breakdown.push({ label: `Rewire (${rewirePct === 'full' ? 'Full Home' : rewirePct.replace(/_/g, ' ')})`, amount: round(base) });

      // Stories multiplier (more stories = more vertical cable runs = more labor)
      const storyMult = stories > 1 ? 1 + (stories - 1) * 0.15 : 1;
      if (storyMult > 1) {
        breakdown.push({ label: `${stories}-Story Premium`, amount: round(base * (storyMult - 1)) });
      }

      // Panel upgrade
      const panelBase = { 100: 1500, 150: 2000, 200: 2500, 400: 4000 };
      const panelCost = panelBase[panelSize] || 2500;
      breakdown.push({ label: `${panelSize}A Panel`, amount: panelCost });

      // Wiring type premium
      const wireMult = { standard_copper: 1, romex_nm: 1.05, armored_cable: 1.25, conduit: 1.5 };
      const wm = wireMult[wiringType] || 1;
      if (wm > 1) {
        breakdown.push({ label: `Wiring (${wiringType.replace(/_/g, ' ')})`, amount: round(base * (wm - 1)) });
      }

      // Basement (access difficulty)
      if (hasBasement) {
        const basementCost = basementFinished ? 800 : 400;
        breakdown.push({ label: `Basement (${basementFinished ? 'finished' : 'unfinished'})`, amount: basementCost });
      }

      // Garage
      if (hasGarage) {
        breakdown.push({ label: 'Garage Wiring', amount: 600 });
      }

      // EV charger
      if (hasEV) {
        breakdown.push({ label: 'EV Charger Circuit (240V)', amount: 1200 });
      }

      // Ceiling fans
      if (hasFans && numFans > 0) {
        breakdown.push({ label: `Ceiling Fan Wiring (${numFans})`, amount: numFans * 350 });
      }

      // Extra outlets
      if (numOutlets > 0) {
        breakdown.push({ label: `Extra Outlets (${numOutlets})`, amount: numOutlets * 150 });
      }

      // Extra switches/dimmers
      if (numSwitches > 0) {
        breakdown.push({ label: `Switches/Dimmers (${numSwitches})`, amount: numSwitches * 120 });
      }

      // Smoke/CO detectors
      if (hasSmoke && numSmoke > 0) {
        breakdown.push({ label: `Hardwired Smoke/CO (${numSmoke})`, amount: numSmoke * 175 });
      }

      // Generator transfer switch
      if (hasGenerator) {
        breakdown.push({ label: 'Generator Transfer Switch', amount: 1500 });
      }

      // Hot tub
      if (hasHotTub) {
        breakdown.push({ label: 'Hot Tub / Spa Circuit', amount: 1800 });
      }

      // Solar integration
      if (hasSolar) {
        breakdown.push({ label: 'Solar Panel Integration', amount: 2000 });
      }

      // Old wiring removal premium
      const oldWirePremium = {
        knob_and_tube: 0.2,
        aluminum: 0.1,
        old_copper: 0.05,
        new_romex: 0,
        unknown: 0.08
      };
      const owp = oldWirePremium[oldWiring] || 0;
      if (owp > 0) {
        breakdown.push({ label: `Old Wiring Removal (${oldWiring.replace(/_/g, ' ')})`, amount: round(base * owp) });
      }

      total = (base * storyMult * wm) + panelCost
        + (hasBasement ? (basementFinished ? 800 : 400) : 0)
        + (hasGarage ? 600 : 0)
        + (hasEV ? 1200 : 0)
        + (hasFans ? numFans * 350 : 0)
        + (numOutlets * 150)
        + (numSwitches * 120)
        + (hasSmoke ? numSmoke * 175 : 0)
        + (hasGenerator ? 1500 : 0)
        + (hasHotTub ? 1800 : 0)
        + (hasSolar ? 2000 : 0)
        + (base * owp);
      break;
    }

    default: { // general
      const hours = parseFloat(vars.hours_estimated) || 0;
      const materials = parseFloat(vars.materials_cost) || 0;
      const urgency = vars.urgency || 'standard';
      const urgencyMults = { standard: 1, rush: 1.25, emergency: 2 };
      const urgencyMult = urgencyMults[urgency] || 1;

      total = (hours * (baseRate || 75) * urgencyMult) + materials;
      breakdown.push({ label: `Labor (${hours}h @ $${baseRate || 75}/hr)`, amount: round(hours * (baseRate || 75)) });
      if (urgencyMult > 1) breakdown.push({ label: `${urgency.charAt(0).toUpperCase() + urgency.slice(1)} Fee`, amount: round(hours * (baseRate || 75) * (urgencyMult - 1)) });
      if (materials > 0) breakdown.push({ label: 'Materials', amount: materials });
      break;
    }
  }

  return {
    total: round(total),
    breakdown: breakdown.filter(b => b.amount > 0).map(b => ({ ...b, amount: round(b.amount) })),
    industry,
    calculatedAt: new Date().toISOString(),
  };
}

function round(num) {
  return Math.round(num * 100) / 100;
}


// ── Routes ──────────────────────────────────────────────────────────────────

// GET /api/quotes/config/:agentId
router.get('/config/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await getAgent(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    const config = await new Promise((resolve) => {
      db.get('SELECT * FROM quote_configs WHERE agent_id = ?', [agentId], (err, row) => resolve(row));
    });

    if (!config) {
      return res.json({
        success: true,
        config: null,
        presets: Object.keys(INDUSTRY_PRESETS).map(k => ({
          key: k,
          name: INDUSTRY_PRESETS[k].name,
          variableCount: INDUSTRY_PRESETS[k].variables.length,
        })),
      });
    }

    res.json({ success: true, config, presets: INDUSTRY_PRESETS[config.industry] || null });
  } catch (err) {
    console.error('GET quote config error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotes/config/:agentId
router.post('/config/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await getAgent(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    const { industry, variables, base_rate, pricing_model, ai_personality, business_name } = req.body;

    if (!industry) return res.status(400).json({ error: 'Industry is required' });

    const configId = uuidv4();
    const varsJson = JSON.stringify(variables || []);

    await new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO quote_configs (id, agent_id, business_name, industry, variables, base_price, pricing_model, ai_personality, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(agent_id) DO UPDATE SET
          industry = excluded.industry,
          business_name = COALESCE(excluded.business_name, quote_configs.business_name),
          variables = excluded.variables,
          base_price = excluded.base_price,
          pricing_model = excluded.pricing_model,
          ai_personality = excluded.ai_personality,
          updated_at = CURRENT_TIMESTAMP
      `, [configId, agentId, business_name, industry, varsJson, base_rate || 0, pricing_model || 'variable', ai_personality || ''], (err) => err ? reject(err) : resolve());
    });

    res.json({ success: true, message: 'Quote configuration saved' });
  } catch (err) {
    console.error('POST quote config error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotes/calculate
router.post('/calculate', requireAuth, async (req, res) => {
  try {
    const { agentId, variables, customerName, customerEmail, customerPhone } = req.body;

    const config = await new Promise((resolve) => {
      db.get('SELECT * FROM quote_configs WHERE agent_id = ?', [agentId], (err, row) => resolve(row));
    });

    if (!config) {
      // Use industry preset if no config saved
      const industry = req.body.industry || 'general';
      const result = calculateQuote(variables || {}, { industry, base_rate: null, variables: null });
      return res.json({ success: true, quote: result });
    }

    const result = calculateQuote(variables || {}, config);

    // Save the quote
    const quoteId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO quotes (id, agent_id, customer_name, customer_email, customer_phone, variables, computed_price, price_breakdown, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
        [quoteId, agentId, customerName || null, customerEmail || null, customerPhone || null,
         JSON.stringify(variables || {}), result.total, JSON.stringify(result.breakdown)],
        (err) => err ? reject(err) : resolve()
      );
    });

    res.json({ success: true, quoteId, quote: result });
  } catch (err) {
    console.error('Quote calculation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quotes/:agentId
router.get('/:agentId', requireAuth, async (req, res) => {
  try {
    const { agentId } = req.params;
    const agent = await getAgent(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    const quotes = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM quotes WHERE agent_id = ? ORDER BY created_at DESC LIMIT 100',
        [agentId], (err, rows) => err ? reject(err) : resolve(rows || [])
      );
    });

    res.json({ success: true, quotes });
  } catch (err) {
    console.error('GET quotes error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quotes/:agentId/:quoteId
router.get('/:agentId/:quoteId', requireAuth, async (req, res) => {
  try {
    const { agentId, quoteId } = req.params;
    const agent = await getAgent(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    const quote = await new Promise((resolve) => {
      db.get('SELECT * FROM quotes WHERE id = ? AND agent_id = ?', [quoteId, agentId], (err, row) => resolve(row));
    });

    if (!quote) return res.status(404).json({ error: 'Quote not found' });
    res.json({ success: true, quote });
  } catch (err) {
    console.error('GET quote error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/quotes/:agentId/:quoteId
router.delete('/:agentId/:quoteId', requireAuth, async (req, res) => {
  try {
    const { agentId, quoteId } = req.params;
    const agent = await getAgent(agentId, req.session.userId);
    if (!agent) return res.status(403).json({ error: 'Access denied' });

    await new Promise((resolve, reject) => {
      db.run('DELETE FROM quotes WHERE id = ? AND agent_id = ?', [quoteId, agentId], (err) => err ? reject(err) : resolve());
    });

    res.json({ success: true });
  } catch (err) {
    console.error('DELETE quote error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/quotes/chat — AI-powered quote conversation (for embedded agent)
// Uses OpenRouter to have a natural conversation with the customer,
// extracts variables, and computes quotes on-the-fly.
const axios = require('axios');

router.post('/chat', async (req, res) => {
  try {
    const { agentId, message, conversationHistory } = req.body;

    // Load agent config
    const config = await new Promise((resolve) => {
      if (!agentId || agentId === '00000000-0000-0000-0000-000000000000') {
        return resolve({ industry: 'general', variables: [], business_name: 'the business', ai_personality: '' });
      }
      db.get('SELECT * FROM quote_configs WHERE agent_id = ?', [agentId], (err, row) => resolve(row || { industry: 'general', variables: [], business_name: 'the business', ai_personality: '' }));
    });

    const industry = config.industry || 'general';
    const vars = config.variables ? (typeof config.variables === 'string' ? JSON.parse(config.variables) : config.variables) : [];
    const personality = config.ai_personality || 'Be friendly, professional, and helpful. Ask one question at a time.';
    const bizName = config.business_name || 'the business';
    const preset = INDUSTRY_PRESETS[industry] || INDUSTRY_PRESETS.general;

    // Build system prompt
    let systemPrompt = `You are a quoting agent for ${bizName}. ${personality}\n\n`;
    systemPrompt += `Industry: ${industry}\n`;
    if (preset) {
      systemPrompt += `Pricing info: ${preset.pricingDescription}\n`;
      if (preset.pricingRules) {
        systemPrompt += `Pricing rules:\n${preset.pricingRules.map(r => '- ' + r).join('\n')}\n`;
      }
    }
    if (vars.length) {
      systemPrompt += `\nVariables to collect:\n${vars.map(v => `- ${v.label} (${v.type}${v.required ? ', required' : ''})${v.hint ? ': ' + v.hint : ''}`).join('\n')}\n`;
    }
    systemPrompt += `\nYour job: Have a natural conversation to understand the customer's needs. `;
    systemPrompt += `Ask clarifying questions. When you have enough information, end your message with [QUOTE:variables_json] `;
    systemPrompt += `where variables_json is a JSON object of the variables collected (e.g. [QUOTE:{"sq_ft": 5000, "grass_height": 6}]). `;
    systemPrompt += `Always be helpful and transparent about pricing.`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(conversationHistory || []).slice(-10).map(m => (
        { role: (m.role === 'quote' || m.role === 'agent') ? 'assistant' : 'user', content: m.text }
      )),
      { role: 'user', content: message }
    ];

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-5-mini',
      messages,
      max_tokens: 800,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': 'Bearer ' + (process.env.OPENROUTER_API_KEY || ''),
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    let reply = response?.data?.choices?.[0]?.message?.content || 'I apologize, I had trouble processing that. Could you tell me more about what you need?';

    // Check for [QUOTE:...] embedded in response
    let quoteResult = null;
    const quoteMatch = reply.match(/\[QUOTE:(\{[\s\S]*?\})/);
    if (quoteMatch) {
      try {
        const extractedVars = JSON.parse(quoteMatch[1]);
        const configForCalc = {
          industry,
          base_rate: config.base_price || preset?.baseRate || 75,
          variables: JSON.stringify(vars),
        };
        quoteResult = calculateQuote(extractedVars, configForCalc);
        // Remove the [QUOTE:...] tag from display
        reply = reply.replace(/\[QUOTE:\{[\s\S]*?\}/, '').trim();
        // Append breakdown
        if (quoteResult.breakdown && quoteResult.breakdown.length) {
          const lines = quoteResult.breakdown.map(b => `• ${b.label}: $${Number(b.amount).toFixed(2)}`).join('\n');
          reply += `\n\n📋 **Quote Estimate: $${quoteResult.total.toFixed(2)}**\n${lines}\n\n_This is an estimate. The business owner will confirm the final price._`;
        } else {
          reply += `\n\n📋 **Estimated Total: $${quoteResult.total.toFixed(2)}**\n_Estimate based on provided information._`;
        }
      } catch (e) {
        console.error('[Quote Chat] Parse error:', e.message);
      }
    }

    res.json({ success: true, reply, quote: quoteResult });
  } catch (err) {
    console.error('[Quote Chat] Error:', err.message);
    res.json({ success: true, reply: 'I apologize, I\'m having trouble right now. Please try again in a moment.', quote: null });
  }
});

// POST /api/quotes/public/calculate — Public quote calculation (no auth required for customers)
router.post('/public/calculate', async (req, res) => {
  try {
    const { agentId, variables, customerName, customerEmail, customerPhone } = req.body;

    const config = agentId ? await new Promise((resolve) => {
      db.get('SELECT * FROM quote_configs WHERE agent_id = ?', [agentId], (err, row) => resolve(row));
    }) : null;

    const industry = config?.industry || req.body.industry || 'general';
    const result = calculateQuote(variables || {}, config || { industry });

    // Save quote (agent_id optional for public/demo quotes)
    const quoteId = uuidv4();
    const defaultAgentId = agentId || '00000000-0000-0000-0000-000000000000';

    // Ensure a placeholder agent exists for unauthenticated quotes
    await new Promise((resolve) => {
      db.get('SELECT id FROM agents WHERE id = ?', [defaultAgentId], (err, row) => {
        if (!row) {
          // Use first available agent as fallback
          db.get('SELECT id FROM agents LIMIT 1', [], (e2, first) => {
            resolve(first ? first.id : null);
          });
        } else {
          resolve(defaultAgentId);
        }
      });
    }).then(async (fallbackAgentId) => {
      if (fallbackAgentId) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT OR IGNORE INTO quotes (id, agent_id, customer_name, customer_email, customer_phone, variables, computed_price, price_breakdown, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
            [quoteId, fallbackAgentId, customerName || null, customerEmail || null, customerPhone || null,
             JSON.stringify(variables || {}), result.total, JSON.stringify(result.breakdown)],
            (err) => err ? reject(err) : resolve()
          );
        });
      }
    });

    // Send email notification if we have the agent's config
    if (config && customerEmail) {
      const emailService = require('../services/emailService');
      const businessName = config.business_name || 'the business';
      const breakdownText = result.breakdown.map(b => `  ${b.label}: $${Number(b.amount).toFixed(2)}`).join('\n');
      const emailBody = `New quote request from ${customerName || 'a customer'} (${customerEmail}):\n\n` +
        `Industry: ${industry}\n` +
        `Quote Total: $${result.total.toFixed(2)}\n\n` +
        `Breakdown:\n${breakdownText}\n\n` +
        `Details: ${JSON.stringify(variables, null, 2)}\n` +
        `— Sent by M.ai.K.R Quotes`;
      try {
        // Fire and forget — don't block response
        const agentOwner = await new Promise((resolve) => {
          db.get('SELECT c.email FROM customers c JOIN agents a ON a.customer_id = c.id WHERE a.id = ?',
            [agentId], (err, row) => resolve(row));
        });
        if (agentOwner?.email) {
          emailService.sendEmail(agentOwner.email, `[M.ai.K.R] New Quote Request — $${result.total.toFixed(2)}`, emailBody)
            .catch(err => console.error('[Quote] Email notify error:', err.message));
        }
      } catch (e) { /* email is best-effort */ }
    }

    res.json({ success: true, quoteId, quote: result });
  } catch (err) {
    console.error('Public quote calculation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/quotes/public/config/:agentId — Public config (for customer-facing quote forms)
router.get('/public/config/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params;
    const config = await new Promise((resolve) => {
      db.get('SELECT id, agent_id, business_name, industry, variables, base_price, pricing_model, ai_personality FROM quote_configs WHERE agent_id = ?', [agentId], (err, row) => resolve(row));
    });
    res.json({ success: true, config });
  } catch (err) {
    console.error('Public config error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;