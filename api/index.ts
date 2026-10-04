// ==========================================
// VERCEL SERVERLESS RUNTIME ENTRYPOINT
// Bridges Vercel serverless request lifecycle with Aurora Destiny Express App
// ==========================================

import type { IncomingMessage, ServerResponse } from 'http';
import { app, ensureAppInitialized } from '../server';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    await ensureAppInitialized();
    return (app as any)(req, res);
  } catch (err: any) {
    const isProd = process.env.NODE_ENV === 'production';
    const requestId = (req.headers['x-request-id'] as string) || `req_srv_${Date.now()}`;
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Retry-After', '5');
    return res.end(
      JSON.stringify({
        error: {
          category: 'INFRASTRUCTURE',
          code: 'DATABASE_UNAVAILABLE',
          message: 'Dịch vụ cơ sở dữ liệu production chưa sẵn sàng hoặc gặp sự cố khởi tạo. Vui lòng kiểm tra kết nối DATABASE_URL.',
          details: isProd ? undefined : err.message,
          requestId
        }
      })
    );
  }
}
