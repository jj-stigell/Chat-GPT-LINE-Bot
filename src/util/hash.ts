import crypto from 'crypto';

/**
 * Computes the SHAKE-256 hash of the input value, converted to lowercase,
 * and returns it as a hexadecimal string.
 * https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options
 * @param {string} value - The input value to be hashed.
 * @returns {string} The SHAKE-256 hash of the input value as a hexadecimal string.
 */
export function hashValue(value: string): string {
  return crypto
    .createHash('shake256', { outputLength: 5 })
    .update(value.toLowerCase())
    .digest('hex');
}
