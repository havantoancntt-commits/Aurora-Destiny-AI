// ==========================================
// VERCEL SERVERLESS RUNTIME ENTRYPOINT
// Bridges Vercel serverless request lifecycle with Aurora Destiny Express App
// Robust error classification: CONFIG_ERROR, MIGRATION_ERROR, DATABASE_ERROR, STORAGE_ERROR
// ==========================================

import type { IncomingMessage, ServerResponse } from 'http';
import { app, ensureAppInitialized, InitializationError } from '../server';

export interface ClassifiedInitError {
  code: string;
  category: string;
  statusCode: number;
  publicMessage: string;
}

export function classifyInitializationError(err: any): ClassifiedInitError {
  if (err && typeof err === 'object') {
    if (err instanceof InitializationError || (err.code && err.category && err.publicMessage)) {
      return {
        code: err.code,
        category: err.category,
        statusCode: err.statusCode || 503,
        publicMessage: err.publicMessage
      };
    }

    const msg = String(err.message || '').toLowerCase();
    const code = String(err.code || '').toLowerCase();

    // 1. Migrations
    if (msg.includes('migration') || msg.includes('migrator') || code.includes('migration')) {
      return {
        code: 'MIGRATION_ERROR',
        category: 'MIGRATION',
        statusCode: 503,
        publicMessage: 'Quá trình cập nhật cấu trúc cơ sở dữ liệu (migration) gặp sự cố.'
      };
    }

    // 2. Storage provider (check before generic postgres/database because PostgresObjectStorageProvider mentions both)
    if (msg.includes('storage') || msg.includes('staged_objects') || code.includes('storage')) {
      return {
        code: 'STORAGE_ERROR',
        category: 'STORAGE',
        statusCode: 503,
        publicMessage: 'Dịch vụ lưu trữ đối tượng gặp sự cố.'
      };
    }

    // 3. Configuration & secrets
    if (
      msg.includes('config') ||
      msg.includes('environment variable') ||
      msg.includes('entropy') ||
      msg.includes('secret') ||
      msg.includes('database_url is strictly required') ||
      code.includes('config')
    ) {
      return {
        code: 'CONFIG_ERROR',
        category: 'CONFIGURATION',
        statusCode: 503,
        publicMessage: 'Cấu hình môi trường sản xuất chưa hợp lệ hoặc thiếu biến môi trường bắt buộc.'
      };
    }

    // 4. Rate limiting / Redis
    if (msg.includes('redis') || msg.includes('rate limit') || code.includes('rate_limit')) {
      return {
        code: 'RATE_LIMITER_ERROR',
        category: 'INFRASTRUCTURE',
        statusCode: 503,
        publicMessage: 'Dịch vụ kiểm soát tần suất phân tán gặp sự cố.'
      };
    }

    // 5. Database connection & pooling
    if (
      msg.includes('postgres') ||
      msg.includes('database') ||
      msg.includes('connection') ||
      msg.includes('connect') ||
      msg.includes('pool') ||
      msg.includes('neon.tech') ||
      msg.includes('supabase.co') ||
      msg.includes('enotfound') ||
      msg.includes('econnrefused') ||
      msg.includes('etimedout') ||
      code.includes('db_') ||
      code.includes('postgres')
    ) {
      return {
        code: 'DATABASE_ERROR',
        category: 'DATABASE',
        statusCode: 503,
        publicMessage: 'Dịch vụ cơ sở dữ liệu production chưa sẵn sàng hoặc gặp sự cố kết nối.'
      };
    }
  }

  return {
    code: 'INITIALIZATION_ERROR',
    category: 'INFRASTRUCTURE',
    statusCode: 503,
    publicMessage: 'Dịch vụ hệ thống gặp sự cố trong quá trình khởi tạo.'
  };
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    // 1. URL Path Normalization: In Vercel serverless environment, rewrites may alter or strip req.url
    if (req.url) {
      const forwardedPath = (req.headers['x-matched-path'] as string) || (req.headers['x-forwarded-uri'] as string);
      if (forwardedPath && forwardedPath.startsWith('/api')) {
        req.url = forwardedPath;
      } else if (!req.url.startsWith('/api')) {
        req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
      }
    }

    await ensureAppInitialized();
    return (app as any)(req, res);
  } catch (err: any) {
    const isProd = process.env.NODE_ENV === 'production';
    const requestId = (req.headers['x-request-id'] as string) || `req_srv_${Date.now()}`;
    const classified = classifyInitializationError(err);

    // Secure logging: log request ID and error code without exposing secrets
    console.error(`🚨 [Serverless Init Error] [${requestId}] [${classified.code}]:`, isProd ? classified.publicMessage : err.message);

    res.statusCode = classified.statusCode;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Retry-After', '5');
    return res.end(
      JSON.stringify({
        error: {
          category: classified.category,
          code: classified.code,
          message: classified.publicMessage,
          details: isProd ? undefined : err.message,
          requestId
        }
      })
    );
  }
}
