// ==========================================
// VERCEL SERVERLESS RUNTIME ENTRYPOINT
// Bridges Vercel serverless request lifecycle with Aurora Destiny Express App
// ==========================================

import type { IncomingMessage, ServerResponse } from 'http';
import { app } from '../server';
import { repository } from '../src/db/repository';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function ensureAppReady(): Promise<void> {
  if (isInitialized) return;
  if (!initPromise) {
    initPromise = (async () => {
      try {
        if (repository.ensureInitialized) {
          await repository.ensureInitialized();
        }
        isInitialized = true;
      } catch (err: any) {
        initPromise = null;
        console.error('❌ [Vercel Serverless] Failed to initialize database repository:', err.message);
        throw err;
      }
    })();
  }
  await initPromise;
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await ensureAppReady();
  return (app as any)(req, res);
}
