/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║                    VERBALYTICS AI — AUTHOR SEAL                          ║
 * ║                                                                          ║
 * ║   Author  :  vansh                                                       ║
 * ║   Project :  Verbalytics AI                                              ║
 * ║   Tag     :  VANSH_VERBALYTICS_2026                                      ║
 * ║                                                                          ║
 * ║   ⚠️  WARNING: This file is integrity-protected.                        ║
 * ║      Altering the author identity will DESTROY the application.          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * @author vansh
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// ── Immutable identity constants ──────────────────────────────────────────────
const _AUTHOR = 'vansh';
const _TAG = 'VANSH_JAAT_VERBALYTICS_2025';

// ── Pre-computed seals (DO NOT MODIFY) ───────────────────────────────────────
// These are SHA-256 hashes of the author identity.
// If ANY of these strings are changed, the seal breaks.
const _KNOWN_AUTHOR_HASH = 'cdaada7c4e52a734dceddc1da7a809045c424bf979ddde8ce4e749496883b856';
const _KNOWN_TAG_HASH = '7205bf006b1dfabf3d4c25ca12a75931a78dd090a34aeacaae944d910afcd9da';
const _KNOWN_SEAL = 'c30f1580ec001803b5828b461326d747a2d1c5d016423fbdccbd04b83a8b015b';

// ── Compute runtime hashes ────────────────────────────────────────────────────
const _rtAuthorHash = crypto.createHash('sha256').update(_AUTHOR).digest('hex');
const _rtTagHash = crypto.createHash('sha256').update(_TAG).digest('hex');
const _rtSeal = crypto.createHash('sha256').update(_AUTHOR + _TAG).digest('hex');

// ── Signature check in other source files ────────────────────────────────────
const SERVER_FILES = [
  '../server.js',
  '../controllers/chatController.js',
  '../controllers/authController.js',
  '../services/openai.js',
  '../services/promptBuilder.js',
  '../services/fallbackAI.js',
  '../models/User.js',
  '../models/Session.js',
  '../routes/chat.js',
  '../routes/auth.js',
  '../routes/evaluation.js',
  '../middleware/auth.js',
];
const REQUIRED_MARKER = '@author vansh';

// ── DESTROY function ──────────────────────────────────────────────────────────
function _destroy(reason) {
  // Clear terminal and print the violation
  const RED = '\x1b[31m';
  const RESET = '\x1b[0m';
  const BOLD = '\x1b[1m';

  console.error('\n');
  console.error(RED + '╔══════════════════════════════════════════════════════════╗' + RESET);
  console.error(RED + '║         ⛔  INTEGRITY VIOLATION DETECTED  ⛔            ║' + RESET);
  console.error(RED + '╠══════════════════════════════════════════════════════════╣' + RESET);
  console.error(RED + `║  ${BOLD}Reason : ${reason.padEnd(48)}${RESET}${RED}      ║` + RESET);
  console.error(RED + '║                                                          ║' + RESET);
  console.error(RED + '║  The author signature "vansh" has been tampered with.    ║' + RESET);
  console.error(RED + '║  This codebase is protected by an integrity seal.        ║' + RESET);
  console.error(RED + '║                                                          ║' + RESET);
  console.error(RED + '║  Restoring the original signature will fix this.         ║' + RESET);
  console.error(RED + '╚══════════════════════════════════════════════════════════╝' + RESET);
  console.error('\n');

  // Freeze the process completely — no graceful exit
  process.stdout.write('');
  process.emit('uncaughtException', new Error('AUTHOR_SEAL_BROKEN'));

  // Force crash — blocks all further execution
  process.exit(999);
}

// ── Main verification ────────────────────────────────────────────────────────
function verify() {
  // 1. Verify author name hash
  if (_rtAuthorHash !== _KNOWN_AUTHOR_HASH) {
    _destroy('Author name seal mismatch');
  }

  // 2. Verify tag hash
  if (_rtTagHash !== _KNOWN_TAG_HASH) {
    _destroy('Author tag seal mismatch');
  }

  // 3. Verify combined seal
  if (_rtSeal !== _KNOWN_SEAL) {
    _destroy('Combined seal mismatch');
  }

  // 4. Scan server files for @author vansh marker (flexible whitespace)
  const MARKER_REGEX = /@author\s+vansh/;
  const missing = [];
  for (const relPath of SERVER_FILES) {
    const fullPath = path.resolve(__dirname, relPath);
    try {
      const src = fs.readFileSync(fullPath, 'utf8');
      if (!MARKER_REGEX.test(src)) {
        missing.push(path.basename(fullPath));
      }
    } catch {
      // File doesn't exist — tolerate (only fail on found but tampered)
    }
  }

  if (missing.length > 0) {
    _destroy(`Signature removed from: ${missing.join(', ')}`);
  }

  return true;
}

// ── Runtime periodic re-check (every 30 seconds) ─────────────────────────────
function startWatchdog() {
  setInterval(() => {
    try {
      verify();
    } catch {
      _destroy('Watchdog detected runtime tampering');
    }
  }, 30_000);
}

// ── Banner printed at startup ─────────────────────────────────────────────────
function printBanner() {
  const CYAN = '\x1b[36m';
  const BOLD = '\x1b[1m';
  const RESET = '\x1b[0m';
  console.log(CYAN + `🔏 Author seal verified — ${BOLD}vansh${RESET}${CYAN} (Verbalytics AI)` + RESET);
}

// ── Export ────────────────────────────────────────────────────────────────────
module.exports = {
  verify,
  startWatchdog,
  printBanner,
  author: _AUTHOR,
  project: 'Verbalytics AI',
  tag: _TAG,
};
