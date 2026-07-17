// ═══════════════════════════════════════════════════════════════════════════════
// AshityShop — Single entry point
// ───────────────────────────────────────────────────────────────────────────────
// This is the ONLY file Node.js loads directly.
// It registers the tsx TypeScript loader, then boots the real server.
//
// Usage:
//   node server.js          ← recommended  (works on any Node >= 18)
//   npm start               ← same as above
//   node --import tsx src/server.ts   ← alternative if you prefer direct ESM
// ═══════════════════════════════════════════════════════════════════════════════

console.log("SERVER JS LOADED");
require('tsx/cjs');
require('./src/server');
