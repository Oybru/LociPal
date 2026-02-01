#!/usr/bin/env node
/**
 * Download casting animation frames from PixelLab character.
 *
 * Downloads the character ZIP and extracts the south-facing
 * "Casting a mighty spell, magic sparkling" animation frames.
 *
 * Usage:
 *   set PIXELLAB_API_KEY=<your-key>
 *   node scripts/download-casting-frames.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const API_URL = 'https://api.pixellab.ai/mcp';
const API_KEY = process.env.PIXELLAB_API_KEY;
if (!API_KEY) { console.error('Set PIXELLAB_API_KEY'); process.exit(1); }

const CHARACTER_ID = '105f9717-2196-41aa-a1d9-007d4cbefab8';
const ANIM_NAME = 'custom-Casting a mighty spell, magic sparkling';
const DIRECTION = 'south';
const OUTPUT_DIR = path.join(ROOT, 'src', 'assets', 'generated', 'familiars', 'animations', ANIM_NAME, DIRECTION);

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

async function main() {
  console.log('Connecting to PixelLab MCP...');

  // Initialize
  await post({ jsonrpc: '2.0', method: 'initialize', params: { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'mempal-cli', version: '1.0' } }, id: ++reqId });
  await post({ jsonrpc: '2.0', method: 'notifications/initialized' });
  console.log('  Connected.');

  // Get character details to confirm the animation exists
  console.log(`\nFetching character ${CHARACTER_ID}...`);
  const charResp = await post({
    jsonrpc: '2.0', method: 'tools/call',
    params: { name: 'get_character', arguments: { character_id: CHARACTER_ID, include_preview: false } },
    id: ++reqId,
  });
  const charText = charResp?.result?.content?.[0]?.text || '';
  console.log('  Character info received.');

  // Check if casting animation is mentioned
  if (!charText.includes('Casting')) {
    console.error('  WARNING: Casting animation not found in character details.');
    console.error('  Available animations:', charText.substring(0, 500));
  }

  // Download character ZIP
  console.log('\nDownloading character ZIP...');
  const downloadUrl = `${API_URL}/characters/${CHARACTER_ID}/download`;
  const zipResp = await fetch(downloadUrl, {
    headers: { 'Authorization': `Bearer ${API_KEY}` },
  });

  if (!zipResp.ok) {
    console.error(`  Download failed: ${zipResp.status} ${zipResp.statusText}`);
    const body = await zipResp.text();
    console.error('  Response:', body.substring(0, 500));
    process.exit(1);
  }

  // Save ZIP to temp file
  const tmpZip = path.join(ROOT, 'tmp-character-download.zip');
  const tmpExtract = path.join(ROOT, 'tmp-character-extract');
  const zipBuffer = Buffer.from(await zipResp.arrayBuffer());
  fs.writeFileSync(tmpZip, zipBuffer);
  console.log(`  ZIP saved (${(zipBuffer.length / 1024).toFixed(1)} KB)`);

  // Extract ZIP using PowerShell
  console.log('\nExtracting ZIP...');
  if (fs.existsSync(tmpExtract)) {
    fs.rmSync(tmpExtract, { recursive: true });
  }
  try {
    execSync(
      `powershell -Command "Expand-Archive -Path '${tmpZip}' -DestinationPath '${tmpExtract}' -Force"`,
      { stdio: 'pipe' }
    );
  } catch (err) {
    console.error('  Failed to extract ZIP:', err.message);
    process.exit(1);
  }
  console.log('  Extracted.');

  // Find the casting animation frames in the extracted directory
  console.log('\nSearching for casting animation frames...');
  const castingFrames = findFrames(tmpExtract, ANIM_NAME, DIRECTION);

  if (castingFrames.length === 0) {
    // List what we did find for debugging
    console.error('  No casting frames found! Listing extracted contents:');
    listDir(tmpExtract, '    ');
    cleanup(tmpZip, tmpExtract);
    process.exit(1);
  }

  console.log(`  Found ${castingFrames.length} frames.`);

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Copy frames
  console.log(`\nCopying frames to ${OUTPUT_DIR}`);
  for (let i = 0; i < castingFrames.length; i++) {
    const dest = path.join(OUTPUT_DIR, `frame_${String(i).padStart(3, '0')}.png`);
    fs.copyFileSync(castingFrames[i], dest);
    console.log(`  ${path.basename(castingFrames[i])} → ${path.basename(dest)}`);
  }

  // Update metadata.json
  const metadataPath = path.join(ROOT, 'src', 'assets', 'generated', 'familiars', 'metadata.json');
  if (fs.existsSync(metadataPath)) {
    console.log('\nUpdating metadata.json...');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
    if (!metadata.frames.animations[ANIM_NAME]) {
      metadata.frames.animations[ANIM_NAME] = {};
    }
    metadata.frames.animations[ANIM_NAME][DIRECTION] = castingFrames.map((_, i) =>
      `animations/${ANIM_NAME}/${DIRECTION}/frame_${String(i).padStart(3, '0')}.png`
    );
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
    console.log('  Done.');
  }

  // Cleanup temp files
  cleanup(tmpZip, tmpExtract);

  console.log(`\n✓ ${castingFrames.length} casting frames saved to:`);
  console.log(`  ${OUTPUT_DIR}`);
}

function findFrames(dir, animName, direction) {
  // PixelLab ZIPs typically have structure like:
  //   character-name/animations/anim-name/direction/frame_000.png
  // or just:
  //   animations/anim-name/direction/frame_000.png
  // Search recursively for directories matching the animation name + direction
  const results = [];
  searchDir(dir, animName, direction, results);

  // Sort by filename to ensure correct order
  results.sort((a, b) => path.basename(a).localeCompare(path.basename(b)));
  return results;
}

function searchDir(dir, animName, direction, results) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Check if this directory path contains the animation name and direction
      const relativePath = fullPath.toLowerCase();
      if (relativePath.includes('casting') && relativePath.includes(direction)) {
        // This might be the frames directory - check for PNGs
        const pngs = fs.readdirSync(fullPath)
          .filter(f => f.endsWith('.png'))
          .sort()
          .map(f => path.join(fullPath, f));
        if (pngs.length > 0) {
          results.push(...pngs);
          return; // Found them
        }
      }
      searchDir(fullPath, animName, direction, results);
    }
  }
}

function listDir(dir, prefix = '') {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      console.error(`${prefix}${entry.name}/`);
      listDir(fullPath, prefix + '  ');
    } else {
      console.error(`${prefix}${entry.name}`);
    }
  }
}

function cleanup(zipPath, extractDir) {
  try { fs.unlinkSync(zipPath); } catch { /* ignore */ }
  try { fs.rmSync(extractDir, { recursive: true }); } catch { /* ignore */ }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
