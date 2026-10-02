import app from '../server';

export default function handler(req: any, res: any) {
  // If Vercel rewrote the URL to /api/index, restore the matched path
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  if (matchedPath && typeof matchedPath === 'string' && (req.url === '/api/index' || req.url === '/' || req.url === '/index')) {
    req.url = matchedPath;
  }
  return app(req, res);
}
