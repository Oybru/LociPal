import { readFileSync } from 'fs';

const API_URL = 'https://api.pixellab.ai/mcp';
const API_KEY = process.env.PIXELLAB_API_KEY;
if (!API_KEY) { console.error('Set PIXELLAB_API_KEY'); process.exit(1); }

let sessionId = null;
let reqId = 0;

async function post(body) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/event-stream',
    'Authorization': `Bearer ${API_KEY}`,
  };
  if (sessionId) headers['Mcp-Session-Id'] = sessionId;
  const res = await fetch(API_URL, { method: 'POST', headers, body: JSON.stringify(body) });
  const sid = res.headers.get('mcp-session-id');
  if (sid) sessionId = sid;
  const text = await res.text();
  if (!text || text.trim() === '') return null;
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('text/event-stream')) {
    for (const line of text.split('\n')) {
      if (line.startsWith('data: ')) {
        try {
          const obj = JSON.parse(line.slice(6));
          if (obj.id !== undefined && (obj.result !== undefined || obj.error !== undefined)) return obj;
        } catch { /* skip */ }
      }
    }
  }
  try { return JSON.parse(text); } catch { return null; }
}

// Initialize
await post({ jsonrpc: '2.0', method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'mempal-cli', version: '1.0' } }, id: ++reqId });
await post({ jsonrpc: '2.0', method: 'notifications/initialized' });

// List characters
const resp = await post({ jsonrpc: '2.0', method: 'tools/call', params: { name: 'list_characters', arguments: { limit: 20 } }, id: ++reqId });
console.log(resp?.result?.content?.[0]?.text || JSON.stringify(resp, null, 2));

// If there's a character ID from args, get its details
const charId = process.argv[2];
if (charId) {
  const detail = await post({ jsonrpc: '2.0', method: 'tools/call', params: { name: 'get_character', arguments: { character_id: charId, include_preview: true } }, id: ++reqId });
  console.log('\n--- Character Details ---');
  console.log(detail?.result?.content?.[0]?.text || JSON.stringify(detail, null, 2));
}
