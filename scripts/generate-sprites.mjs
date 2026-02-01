#!/usr/bin/env node
/**
 * PixelLab Sprite Generator for MemPal
 *
 * Generates isometric pixel art item sprites for all 490 items missing PNGs.
 * Uses the PixelLab MCP API (create_isometric_tile / get_isometric_tile).
 *
 * Setup:
 *   set PIXELLAB_API_KEY=<your-key>
 *
 * Usage:
 *   node scripts/generate-sprites.mjs                      # generate all missing
 *   node scripts/generate-sprites.mjs --dry-run             # preview prompts only
 *   node scripts/generate-sprites.mjs --category fantasy    # one category
 *   node scripts/generate-sprites.mjs --limit 5             # first N only
 *   node scripts/generate-sprites.mjs --batch-size 3        # concurrency (default 3)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ITEMS_DIR = path.join(ROOT, 'src', 'assets', 'generated', 'items');
const SPRITES_DIR = path.join(ROOT, 'src', 'config', 'sprites');

const API_URL = 'https://api.pixellab.ai/mcp';
const API_KEY = process.env.PIXELLAB_API_KEY;
if (!API_KEY && !process.argv.includes('--dry-run')) {
  console.error('Error: set PIXELLAB_API_KEY environment variable');
  console.error('  e.g.  set PIXELLAB_API_KEY=6d4a1610-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
  process.exit(1);
}

const POLL_INTERVAL_MS = 10_000;   // 10 s between status checks
const MAX_POLL_ATTEMPTS = 60;      // 10 min max wait per sprite

// ─── Parse sprite metadata from TypeScript source files ────────────────────

function parseSpritesFromFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf-8');
  const entries = [];
  // Match each object literal — handles both 'name' and "Name's" quote styles
  const re = /\{\s*id:\s*'([^']+)',\s*name:\s*(?:'([^']+)'|"([^"]+)"),\s*category:\s*'([^']+)',\s*tags:\s*\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const name = m[2] || m[3]; // single-quoted or double-quoted name
    const category = m[4];
    const tags = m[5].split(',').map(t => t.trim().replace(/'/g, '')).filter(Boolean);
    entries.push({ id: m[1], name, category, tags });
  }
  return entries;
}

function loadAllSprites() {
  const files = [
    'commonSprites.ts',
    'natureSprites.ts',
    'fantasySprites.ts',
    'knowledgeSprites.ts',
    'treasureSprites.ts',
    'miscSprites.ts',
    'imaginarySprites.ts',
  ];
  const all = [];
  for (const f of files) {
    const p = path.join(SPRITES_DIR, f);
    if (fs.existsSync(p)) all.push(...parseSpritesFromFile(p));
  }
  return all;
}

// ─── Prompt generation ─────────────────────────────────────────────────────

/** Craft an optimized PixelLab prompt from sprite metadata */
function buildPrompt(sprite) {
  const { name, category, tags } = sprite;
  const lname = name.toLowerCase();

  // Detect material from tags
  const matMap = [
    [['gold', 'golden'], 'golden metal'],
    [['silver'], 'polished silver'],
    [['brass', 'copper', 'bronze'], 'aged bronze metal'],
    [['iron', 'steel', 'metal'], 'dark iron metal'],
    [['wooden', 'wood'], 'carved wood'],
    [['glass', 'crystal'], 'translucent glass'],
    [['stone', 'rock', 'marble'], 'carved stone'],
    [['ceramic', 'clay', 'porcelain'], 'painted ceramic'],
    [['fabric', 'cloth', 'silk', 'velvet'], 'rich fabric'],
    [['leather'], 'weathered leather'],
  ];
  let material = '';
  for (const [keys, label] of matMap) {
    if (tags.some(t => keys.includes(t))) { material = label; break; }
  }

  // Category-specific flavour
  const flavour = {
    common:    'rustic medieval household object',
    nature:    'natural element, fantasy RPG collectible',
    fantasy:   'glowing magical enchanted item',
    knowledge: 'scholarly detailed instrument',
    treasures: 'gleaming ornate precious treasure',
    misc:      'detailed game collectible',
    imaginary: 'surreal nonsensical impossible object, Codex Seraphinianus style',
  }[category] || 'pixel art item';

  // Sub-category hints for nature (animals → figurines)
  const animalTags = ['wolf','fox','deer','bear','rabbit','cat','horse','elephant',
    'lion','tiger','whale','dolphin','shark','octopus','turtle','frog','snake',
    'lizard','bat','monkey','eagle','hawk','raven','dove','parrot','peacock',
    'swan','penguin','phoenix','hummingbird','butterfly','bee','spider','beetle',
    'dragonfly','firefly','crab','jellyfish','starfish','seahorse'];
  const isAnimal = tags.some(t => animalTags.includes(t));

  // Imaginary items need explicit visual descriptions since names are made-up
  const imaginaryDescriptions = {
    // Original 10
    blorpascope: 'A wobbly jelly telescope with a living eyeball on one end, translucent green goo dripping',
    snorkelwhisk: 'A kitchen whisk fused with a snorkel tube, bubbles floating out of the top, chrome metal',
    flumberry: 'A marble-textured raspberry with six tiny wooden legs walking uphill, pink and grey',
    glintwurm: 'A segmented worm made of broken spectacle lenses threaded on copper wire, glinting',
    quibblejack: 'A jack-in-the-box toy with two small arguing puppet heads on one spring, colorful box',
    frothspangle: 'A cube of sparkling iridescent foam that glows purple, tiny sparkles floating off it',
    wumblechog: 'A furry wooden cogwheel with two sleepy drooping eyes, brown fur on brass gear teeth',
    skrinklepot: 'A ceramic pot containing a tiny version of itself inside, recursive nested pots, terracotta',
    nubblefork: 'A dinner fork with round knobby ball-shaped tines tangled in a small fluffy cloud',
    plindoscrew: 'A metal screw that impossibly spirals in two opposite directions at once, chrome',
    // 11-20
    glimperoo: 'A handheld mirror reflecting things that are not there, ghostly images in the glass, ornate frame',
    twazzlebin: 'A small metal trash bin with a swirling portal vortex inside instead of a bottom, purple glow',
    sproingfiddle: 'A violin made entirely of coiled springs and metal coils, bouncy and springy looking',
    clunkmelon: 'A cantaloupe melon made of brass clockwork gears, ticking with a tiny clock face on front',
    wobblethorn: 'A thorny bush branch made of translucent wobbling jelly, spikes bending and flexing',
    snazzlecap: 'A red spotted mushroom wearing a tiny formal top hat on its cap, dapper and fancy',
    bumbleglass: 'A magnifying glass that makes everything seen through it appear blurry and fuzzy, cracked lens',
    grinklesaw: 'A handsaw with teeth shaped like tiny grinning mouths, each tooth has a little smile',
    flibberknob: 'A brass doorknob floating in space with swirling portal energy around it, no door attached',
    spudwhistle: 'A brown potato with a tiny brass piccolo sticking out of one end, musical notes floating',
    // 21-30
    quorklamp: 'An oil lamp that emits a cone of darkness instead of light, dark purple anti-glow',
    fizzletongs: 'Kitchen tongs made of frozen lightning bolts, crackling with ice crystals and static',
    drozzlepipe: 'A smoking pipe blowing perfectly square-shaped smoke rings, wooden with brass fittings',
    winklebrace: 'A bracelet chain made of tiny blinking eyeballs linked together, creepy jewelry',
    splotchvane: 'A weather vane with arrows pointing to emotions like JOY SAD FEAR instead of compass directions',
    crumblechime: 'Wind chimes made of dangling toast slices and bread crumbs, golden brown',
    gloopspoon: 'A silver spoon with liquid dripping upward from it defying gravity, blue droplets rising',
    tizzlewheel: 'A wagon wheel with triangular spokes instead of round ones, rolls perfectly anyway, wooden',
    munkledrum: 'A drum with a padded silent surface, muffled and quiet, with a void-black drumhead',
    skwibpencil: 'A pencil with a wavy tip that leaves trails of colorful scent clouds instead of graphite marks',
    // 31-40
    bozzlecrown: 'A golden crown made of tangled question marks and punctuation, royal and puzzling',
    flumpsaddle: 'A riding saddle shaped like a deflating cloud, puffy white leather slowly sinking',
    grizzlethimble: 'A sewing thimble covered in tiny brown bear fur with a little nose on top',
    plonkanchor: 'A ship anchor made of bright red rubber that bounces when dropped, flexible and wobbly',
    twerpbottle: 'A glass bottle that is clearly bigger on the inside, miniature room visible through glass',
    snugglerack: 'A wooden coat rack with arms that curve inward like hugging arms, warm and welcoming',
    wibblestamp: 'A rubber stamp that shows a different random image on its face each time, shifting ink pattern',
    crogglebell: 'A brass bell with a clock face on it, ringing before being touched, prophetic glow',
    dimplechurn: 'A wooden butter churn that produces tiny glowing stars instead of butter, sparkles inside',
    fizzanvil: 'An anvil made entirely of iridescent soap bubbles, floating slightly above the ground',
    // 41-50
    glorpfunnel: 'A metal funnel turned upside down with liquid flowing upward through it, reverse pour',
    humblevise: 'A workshop vise with jaws made of soft pink marshmallow, gentle and squishy grip',
    jitterscale: 'A brass weighing scale that dances and jitters when balanced, tiny legs on the base',
    knottpliers: 'A pair of pliers whose handles are permanently tied in a pretty ribbon bow, metal with bow',
    lumpcandle: 'A candle with a flame made of blue ice, dripping frozen drops upward, cold fire',
    mizzleclock: 'A clock where all hands point to a question mark in the center, vague and uncertain, brass',
    noodlehook: 'A fish hook made of a single cooked spaghetti noodle, somehow rigid and strong, pasta hook',
    pluffcompass: 'A compass where the needle points to a tiny pillow icon, fluffy and cozy looking, brass',
    quazzlebroom: 'A broom that leaves a trail of dirt and dust behind it as it sweeps, messy reverse broom',
    rumblethreads: 'A spool of thread that vibrates and hums with musical notes, glowing fiber on wooden spool',
    // 51-60
    sizzlecork: 'A wine cork perpetually on fire with orange flames but never burning up, eternal flame cork',
    tumblecrayon: 'A fat crayon that draws outside its own lines, colorful scribbles escaping the tip, waxy',
    vexdial: 'A rotary telephone dial floating alone, dialing objects into existence, brass and bakelite',
    wugglebox: 'A wooden box that morphs and shifts shape to never fit its contents, warping wood',
    yawnchisel: 'A stone chisel that sculpts hard rock into soft fluffy pillows, sleepy tool with droopy handle',
    zibberchain: 'A chain whose links are tiny spinning galaxies and nebulae, cosmic glowing chain',
    blotterfly: 'A butterfly with wings made of ink blots that leave written words where it flies, black ink wings',
    chortlewrench: 'A chrome wrench with a grinning laughing face on the head, giggling tool',
    dribbleclamp: 'A metal clamp that weeps joyful tears while holding things together, dripping happy drops',
    fwipmagnet: 'A horseshoe magnet that attracts ghostly forgotten objects floating around it, misty pull',
    // 61-70
    guffawpeg: 'A wooden clothespin that clips onto visible sound waves, pinching cartoon sound effects',
    hiccupnail: 'A small nail that hops and bounces away each time a hammer approaches, shy jumping nail',
    inklestrop: 'A leather sharpening strop that makes colors brighter when rubbed, rainbow edge glow',
    jumblesieve: 'A metal sieve that sorts items by how absurd they are, nonsense filter with strange mesh',
    kerfuzzle: 'A round ball of colorful lint and fuzz with a tiny calculator embedded in it, genius fluff',
    lurkpinion: 'A brass gear that only turns when nobody is looking, with tiny shy eyes peeking out',
    mufflecaliper: 'Brass calipers with cotton-padded tips that measure the weight of whispers, soft and precise',
    nibblechisel: 'A chisel with tiny teeth marks on its blade, taking bites out of whatever it carves, hungry tool',
    oozecasket: 'A tiny treasure chest leaking rainbow-colored ooze from its hinges and keyhole, dripping color',
    puckerbolt: 'A metal bolt with lip-shaped threads that pucker when tightened, kissing hardware',
    // 71-80
    quiverladle: 'A silver soup ladle that trembles with excitement, shaking and quivering near hot liquid',
    razzlesextant: 'A brass sextant with a mood ring instead of a lens, navigating by emotion, colorful dial',
    smirkvalve: 'A pipe valve with a smirking face that grins wider as pressure builds, brass with expression',
    tumblereed: 'A hollow reed that rolls uphill like a tumbleweed, dried grass tube tumbling upward',
    umbrawhisk: 'A kitchen whisk made of solid shadow wisps, beating light into cream, dark ethereal tool',
    vexbellows: 'Forge bellows that inhale fire and exhale snowflakes, ice crystals puffing out, leather and wood',
    wibblescope: 'A periscope that shows scenes from yesterday instead of around corners, clock-faced lens',
    xerxesloom: 'A tiny ornate loom that weaves fabric from crackling static electricity, sparking threads',
    yelpgauge: 'A pressure gauge with a tiny mouth that yelps at exact measurements, speaking dial, brass',
    zestgrater: 'A cheese grater that adds sparkly enthusiasm energy instead of removing material, glowing',
    // 81-90
    blunderbung: 'A wine cork that launches itself back into empty bottles like a projectile, bouncing cork',
    chuffleprism: 'A glass prism that splits sounds into visible color beams instead of light, musical rainbow',
    dwibblecleat: 'A boat cleat made of dried pink bubblegum, stretchy and sticky, nautical candy',
    fnurrlepiston: 'A piston that moves in circular motions instead of up and down, impossible round engine part',
    gribbleawl: 'A pointed awl that pokes holes in floating thought bubbles and concepts, abstract sharp tool',
    hubblerivet: 'A polite rivet with a tiny handshake symbol, holding things together with mutual respect',
    ickletrowel: 'A garden trowel that plants tiny confused question-mark sprouts in the soil, chaos gardening',
    joltpipette: 'A glass pipette that dispenses tiny crackling lightning drops, electric lab tool',
    knobbleratchet: 'A ratchet wrench whose clicks play a tiny melody, musical notes on each turn, chrome',
    lumoxledger: 'A leather book whose pages visibly rearrange and shuffle when you blink, shifting text',
    // 91-100
    mudgetap: 'A brass faucet dispensing different flavors of colorful fog and mist, swirling vapor',
    nifflerule: 'A wooden ruler with absurd units like squiggles and bloops instead of inches, nonsense marks',
    oinkmortar: 'A stone mortar and pestle with a pig snout on the mortar, grinds silence into visible noise waves',
    plinkcrucible: 'A ceramic crucible melting glowing lightbulb ideas into shimmering liquid thought, hot glow',
    quazzlevice: 'A metal vice that squeezes objects into earlier versions of themselves, time-reversal tool',
    rumblewasher: 'A metal washer (hardware ring) that hums and vibrates with tiny sea shanty music notes',
    snigglevalve: 'A brass valve shaped like a coiled serpent eating its own tail, ouroboros pipe fitting',
    twerpcalipers: 'Brass calipers with a sassy smirking face, measuring sarcasm levels on tiny dial',
    umbleshears: 'Ornate scissors that cut through visible awkward silence waves, social rescue tool',
    vortexthimble: 'A sewing thimble containing a tiny swirling whirlpool vortex inside, water spinning',
  };

  const parts = [];
  if (category === 'imaginary' && imaginaryDescriptions[sprite.id]) {
    parts.push(imaginaryDescriptions[sprite.id]);
  } else if (isAnimal) {
    parts.push(`A small ${lname} figurine`);
  } else {
    parts.push(`A ${lname}`);
  }
  if (category !== 'imaginary' && material) parts.push(material);
  parts.push(flavour);
  parts.push('pixel art, single object, transparent background');

  return parts.join(', ');
}

/** Pick tile_shape based on item type */
function pickTileShape(sprite) {
  const flat = ['coin','card','leaf','paper','parchment','scroll','map','rug',
    'carpet','plate','feather','scale','page','blueprint','diploma'];
  if (sprite.tags.some(t => flat.includes(t))) return 'thin tile';
  const thick = ['book','tome','box','crate','chest','slab','board','tablet'];
  if (sprite.tags.some(t => thick.includes(t))) return 'thick tile';
  return 'block';
}

// ─── Minimal MCP client over Streamable HTTP ───────────────────────────────

class PixelLabMCP {
  constructor(url, apiKey) {
    this.url = url;
    this.apiKey = apiKey;
    this.sessionId = null;
    this.reqId = 0;
  }

  async #post(body) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${this.apiKey}`,
    };
    if (this.sessionId) headers['Mcp-Session-Id'] = this.sessionId;

    const res = await fetch(this.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`MCP HTTP ${res.status}: ${text}`);
    }

    // Capture session
    const sid = res.headers.get('mcp-session-id');
    if (sid) this.sessionId = sid;

    // Parse response — handle empty, SSE, or JSON
    const ct = res.headers.get('content-type') || '';
    const text = await res.text();
    if (!text || text.trim() === '') return null; // notifications return empty

    if (ct.includes('text/event-stream')) {
      // SSE may contain multiple data events (notifications + result).
      // Return the JSON-RPC response (has `id` and `result` or `error`).
      let fallback = null;
      for (const line of text.split('\n')) {
        if (line.startsWith('data: ')) {
          try {
            const obj = JSON.parse(line.slice(6));
            if (obj.id !== undefined && (obj.result !== undefined || obj.error !== undefined)) {
              return obj; // This is the actual RPC response
            }
            fallback = obj;
          } catch { /* continue */ }
        }
      }
      return fallback; // return last parsed if no RPC response found
    }
    try { return JSON.parse(text); } catch { return null; }
  }

  async connect() {
    const resp = await this.#post({
      jsonrpc: '2.0',
      method: 'initialize',
      params: {
        protocolVersion: '2025-03-26',
        capabilities: {},
        clientInfo: { name: 'mempal-sprite-gen', version: '1.0.0' },
      },
      id: ++this.reqId,
    });
    console.log(`  MCP connected: ${resp.result?.serverInfo?.name || 'PixelLab'}`);

    // Send initialized notification (no id = notification)
    await this.#post({ jsonrpc: '2.0', method: 'notifications/initialized' });
    return this;
  }

  async callTool(name, args) {
    const resp = await this.#post({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: { name, arguments: args },
      id: ++this.reqId,
    });
    if (!resp) throw new Error('MCP returned empty response for tool call');
    if (resp.error) throw new Error(`MCP tool error: ${JSON.stringify(resp.error)}`);
    return resp.result;
  }

  /** Raw post with full response text for debugging */
  async callToolRaw(name, args) {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${this.apiKey}`,
    };
    if (this.sessionId) headers['Mcp-Session-Id'] = this.sessionId;

    const res = await fetch(this.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name, arguments: args },
        id: ++this.reqId,
      }),
    });
    const sid = res.headers.get('mcp-session-id');
    if (sid) this.sessionId = sid;
    const text = await res.text();
    return { status: res.status, contentType: res.headers.get('content-type'), text };
  }
}

// ─── Generation pipeline ───────────────────────────────────────────────────

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function generateOne(mcp, sprite) {
  const prompt = buildPrompt(sprite);

  // 1. Create a map object (standalone sprite, transparent background)
  const createResult = await mcp.callTool('create_map_object', {
    description: prompt,
    width: 64,
    height: 64,
    view: 'low top-down',
    outline: 'single color outline',
  });

  // The result contains the tile ID — extract it
  // MCP tool results are { content: [{ type: 'text', text: '...' }] }
  const resultText = createResult?.content?.[0]?.text || JSON.stringify(createResult);
  // Try to extract an ID from the result
  const idMatch = resultText.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
    || resultText.match(/"id"\s*:\s*"([^"]+)"/);
  const tileId = idMatch ? (idMatch[1] || idMatch[0]) : null;

  if (!tileId) {
    console.warn(`    Could not extract tile ID from result: ${resultText.slice(0, 200)}`);
    return { sprite, tileId: null, prompt };
  }

  // 2. Poll for completion
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);
    const status = await mcp.callTool('get_map_object', { object_id: tileId });
    const statusText = status?.content?.[0]?.text || JSON.stringify(status);

    // Still generating — keep polling
    if (statusText.includes('still being generated')) {
      const pctMatch = statusText.match(/(\d+)%/);
      if (pctMatch && attempt % 3 === 0) {
        console.log(`    [${sprite.id}] ${pctMatch[1]}% ...`);
      }
      continue;
    }

    // Completed — extract download URL
    if (statusText.includes('completed') || statusText.includes('✅')) {
      const urlMatch = statusText.match(/https?:\/\/[^\s")\]]+/i);
      if (urlMatch) {
        return { sprite, tileId, downloadUrl: urlMatch[0], prompt };
      }
      // Fallback: standard download path
      return {
        sprite,
        tileId,
        downloadUrl: `${API_URL}/map-objects/${tileId}/download`,
        prompt,
      };
    }

    // Actual generation failure
    if (statusText.includes('generation failed') || statusText.includes('Generation failed')) {
      console.warn(`    Tile ${tileId} failed: ${statusText.slice(0, 200)}`);
      return { sprite, tileId, error: statusText, prompt };
    }
  }

  console.warn(`    Tile ${tileId} timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`);
  return { sprite, tileId, error: 'timeout', prompt };
}

async function downloadPng(url, destPath, apiKey) {
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const listOnly = args.includes('--list');
  const catIdx = args.indexOf('--category');
  const filterCategory = catIdx >= 0 ? args[catIdx + 1] : null;
  const limIdx = args.indexOf('--limit');
  const limit = limIdx >= 0 ? parseInt(args[limIdx + 1], 10) : Infinity;
  const bsIdx = args.indexOf('--batch-size');
  const batchSize = bsIdx >= 0 ? parseInt(args[bsIdx + 1], 10) : 1;

  // Load all sprites
  const allSprites = loadAllSprites();
  console.log(`Loaded ${allSprites.length} sprite definitions`);

  // Determine which already have PNGs
  const existingPngs = new Set();
  if (fs.existsSync(ITEMS_DIR)) {
    for (const f of fs.readdirSync(ITEMS_DIR)) {
      if (f.endsWith('.png')) existingPngs.add(f.replace('.png', ''));
    }
  }
  console.log(`Found ${existingPngs.size} existing PNGs`);

  // Filter to missing only
  let queue = allSprites.filter(s => !existingPngs.has(s.id));
  if (filterCategory) queue = queue.filter(s => s.category === filterCategory);
  queue = queue.slice(0, limit);

  console.log(`Queue: ${queue.length} sprites to generate\n`);

  // ── Dry run: just print prompts ──
  if (dryRun || listOnly) {
    for (const s of queue) {
      const prompt = buildPrompt(s);
      const shape = pickTileShape(s);
      console.log(`[${s.category}] ${s.id}`);
      console.log(`  name:       ${s.name}`);
      console.log(`  tile_shape: ${shape}`);
      console.log(`  prompt:     ${prompt}`);
      console.log();
    }
    console.log(`\nTotal: ${queue.length} sprites`);
    return;
  }

  // ── Live generation ──
  console.log('Connecting to PixelLab MCP...');
  const mcp = new PixelLabMCP(API_URL, API_KEY);
  await mcp.connect();

  fs.mkdirSync(ITEMS_DIR, { recursive: true });

  let completed = 0, failed = 0;
  const results = [];

  // Process in batches
  for (let i = 0; i < queue.length; i += batchSize) {
    const batch = queue.slice(i, i + batchSize);
    console.log(`\n── Batch ${Math.floor(i / batchSize) + 1} (${i + 1}–${Math.min(i + batchSize, queue.length)} of ${queue.length}) ──`);

    const promises = batch.map(async (sprite) => {
      console.log(`  Creating: ${sprite.id} (${sprite.name})`);
      try {
        const result = await generateOne(mcp, sprite);
        if (result.downloadUrl) {
          const dest = path.join(ITEMS_DIR, `${sprite.id}.png`);
          console.log(`  Downloading: ${sprite.id} → ${dest}`);
          await downloadPng(result.downloadUrl, dest, API_KEY);
          completed++;
          console.log(`  Done: ${sprite.id}`);
        } else {
          failed++;
          console.warn(`  Failed: ${sprite.id} — ${result.error || 'no download URL'}`);
        }
        results.push(result);
      } catch (err) {
        failed++;
        console.error(`  Error: ${sprite.id} — ${err.message}`);
        results.push({ sprite, error: err.message });
      }
    });

    await Promise.all(promises);
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < queue.length) await sleep(3000);
  }

  console.log(`\n══ Summary ══`);
  console.log(`  Completed: ${completed}`);
  console.log(`  Failed:    ${failed}`);
  console.log(`  Total:     ${queue.length}`);

  if (completed > 0) {
    console.log(`\nRun this to update require() map:`);
    console.log(`  node scripts/update-sprite-requires.js`);
  }

  // Write results log
  const logPath = path.join(__dirname, 'generation-log.json');
  fs.writeFileSync(logPath, JSON.stringify(results, null, 2));
  console.log(`\nLog written to: ${logPath}`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
