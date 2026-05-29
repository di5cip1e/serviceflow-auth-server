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
    pricingDescription: 'Base rate: $75/hr + materials. Urgency multipliers apply.',
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

module.exports = router;