// Feature: vytals-product-verification-changes, Property 1: Batch ref encoding round-trip
// Feature: vytals-product-verification-changes, Property 2: Batch_Flow detection
// Validates: Requirements 1.2, 1.3

import { describe, test } from 'vitest';
import fc from 'fast-check';

// ---------------------------------------------------------------------------
// Pure encoding/decoding helpers (mirrors ProductHome.jsx and Verification.jsx)
// In Node.js (vitest) we use Buffer instead of btoa/atob.
// ---------------------------------------------------------------------------

/**
 * Encodes a batch_code the same way ProductHome.jsx does:
 *   btoa(JSON.stringify({ b: batch_code }))
 */
function encodeBatchRef(batchCode) {
  return Buffer.from(JSON.stringify({ b: batchCode })).toString('base64');
}

/**
 * Decodes a ref the same way Verification.jsx does:
 *   JSON.parse(atob(ref))
 */
function decodeRef(ref) {
  return JSON.parse(Buffer.from(ref, 'base64').toString('utf8'));
}

/**
 * Detects Batch_Flow: decoded payload has `b` but no `s`.
 * Mirrors the detection logic in Verification.jsx.
 */
function isBatchFlow(decoded) {
  return Boolean(decoded.b) && !decoded.s;
}

// ---------------------------------------------------------------------------
// Property 1: Batch ref encoding round-trip
// Validates: Requirements 1.2
// ---------------------------------------------------------------------------

describe('Property 1: Batch ref encoding round-trip', () => {
  test('encode then decode returns the original batch_code', () => {
    fc.assert(
      fc.property(
        // Generate printable ASCII strings (safe for JSON + base64)
        fc.string({ minLength: 1, maxLength: 100 }),
        (batchCode) => {
          const encoded = encodeBatchRef(batchCode);
          const decoded = decodeRef(encoded);
          return decoded.b === batchCode;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('encoded value is a valid base64 string', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (batchCode) => {
          const encoded = encodeBatchRef(batchCode);
          // base64 characters only
          return /^[A-Za-z0-9+/]*={0,2}$/.test(encoded);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 2: Batch_Flow detection
// Validates: Requirements 1.3
// ---------------------------------------------------------------------------

describe('Property 2: Batch_Flow detection', () => {
  test('payload with only b field is detected as Batch_Flow', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (batchCode) => {
          const encoded = encodeBatchRef(batchCode);
          const decoded = decodeRef(encoded);
          return isBatchFlow(decoded) === true;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('payload with both b and s fields is NOT detected as Batch_Flow (QR_Flow)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (batchCode, serialNumber) => {
          // QR_Flow encodes both b and s
          const qrPayload = { b: batchCode, s: serialNumber };
          const encoded = Buffer.from(JSON.stringify(qrPayload)).toString('base64');
          const decoded = decodeRef(encoded);
          return isBatchFlow(decoded) === false;
        }
      ),
      { numRuns: 100 }
    );
  });

  test('payload with only s field is NOT detected as Batch_Flow', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        (serialNumber) => {
          const payload = { s: serialNumber };
          const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
          const decoded = decodeRef(encoded);
          return isBatchFlow(decoded) === false;
        }
      ),
      { numRuns: 100 }
    );
  });
});
