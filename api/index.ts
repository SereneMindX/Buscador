import { createApiApp } from '../server/createApp';

const app = createApiApp();

export default function handler(req: any, res: any) {
  // If Vercel rewrote the URL to /api/index or /api/index.js, restore the matched path
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  if (
    matchedPath &&
    typeof matchedPath === 'string' &&
    (req.url === '/api/index' || req.url === '/api/index.js' || req.url === '/' || req.url === '/index')
  ) {
    req.url = matchedPath;
  }
  return app(req, res);
}
