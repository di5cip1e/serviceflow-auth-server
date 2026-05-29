/**
 * Meta Lead Ads Fetcher
 * 
 * Processes speed_to_lead_events flagged with needs_fetch=1
 * by calling the Meta Graph API to retrieve actual lead data.
 * 
 * Run via cron every 5 minutes.
 */

const db = require('../database');
const { v4: uuidv4 } = require('uuid');

const GRAPH_API_BASE = 'https://graph.facebook.com/v18.0';

/**
 * Fetch a single lead's data from Meta Graph API
 */
async function fetchMetaLead(leadgenId, accessToken) {
  const url = `${GRAPH_API_BASE}/${leadgenId}?access_token=${accessToken}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Meta API error ${res.status}: ${errText}`);
  }
  return await res.json();
}

/**
 * Process all pending Meta leads (needs_fetch=1)
 */
async function processPendingMetaLeads() {
  const pendingLeads = await new Promise((resolve, reject) => {
    db.all(
      `SELECT e.id as event_id, e.agent_id, e.external_id, e.form_data, c.meta_access_token
       FROM speed_to_lead_events e
       JOIN speed_to_lead_configs c ON e.agent_id = c.agent_id
       WHERE e.needs_fetch = 1 AND c.meta_access_token IS NOT NULL
       LIMIT 50`,
      [],
      (err, rows) => err ? reject(err) : resolve(rows || [])
    );
  });

  if (pendingLeads.length === 0) return { processed: 0 };

  const results = [];
  for (const lead of pendingLeads) {
    try {
      const leadData = await fetchMetaLead(lead.external_id, lead.meta_access_token);

      // Extract field data from Meta response
      const fields = {};
      if (leadData.field_data) {
        for (const field of leadData.field_data) {
          if (field.values && field.values.length > 0) {
            fields[field.name] = field.values[0];
          }
        }
      }

      // Parse existing form_data and merge
      const existingData = JSON.parse(lead.form_data || '{}');
      const mergedData = { ...existingData, ...fields, _meta_fetched: true };

      // Update the event with fetched data
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE speed_to_lead_events 
           SET form_data = ?, needs_fetch = 0, status = 'new',
               lead_name = COALESCE(?, lead_name),
               lead_email = COALESCE(?, lead_email),
               lead_phone = COALESCE(?, lead_phone)
           WHERE id = ?`,
          [
            JSON.stringify(mergedData),
            fields.full_name || fields.name || null,
            fields.email || null,
            fields.phone_number || fields.phone || null,
            lead.event_id
          ],
          (err) => err ? reject(err) : resolve()
        );
      });

      console.log(`✅ Meta lead fetched: ${lead.external_id} → ${fields.email || fields.full_name || 'unknown'}`);
      results.push({ eventId: lead.event_id, status: 'fetched' });
    } catch (err) {
      console.error(`❌ Meta lead fetch failed for ${lead.external_id}:`, err.message);
      results.push({ eventId: lead.event_id, status: 'error', error: err.message });
    }
  }

  return { processed: pendingLeads.length, results };
}

/**
 * Run the fetcher (called by cron)
 */
async function run() {
  console.log('🔄 Meta Lead Fetcher: checking for pending leads...');
  try {
    const result = await processPendingMetaLeads();
    if (result.processed > 0) {
      console.log(`✅ Meta Lead Fetcher: processed ${result.processed} leads`);
    }
    return result;
  } catch (err) {
    console.error('❌ Meta Lead Fetcher error:', err.message);
    return { processed: 0, error: err.message };
  }
}

module.exports = { run, processPendingMetaLeads };

// Allow direct execution
if (require.main === module) {
  run().then(r => {
    console.log('Meta Lead Fetcher result:', JSON.stringify(r));
    process.exit(0);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
}
