import { randomBytes, createHash } from 'node:crypto';

/** URL-safe random token for confirm / unsubscribe links. */
export const newToken = (): string => randomBytes(24).toString('base64url');

/** Short stable hash of an agenda item's subject — part of its idempotency key. */
export const hashSubject = (subject: string): string =>
  createHash('sha1').update(subject).digest('hex').slice(0, 16);
