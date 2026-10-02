import app from '../server';

export default function handler(req: any, res: any) {
  // If invoked via dynamic catch-all route, rebuild original requested URL
  if (req.query && req.query.all) {
    const segments = Array.isArray(req.query.all) ? req.query.all.join('/') : req.query.all;
    req.url = '/api/' + segments;
  } else {
    const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
    if (matchedPath && typeof matchedPath === 'string') {
      req.url = matchedPath;
    }
  }
  return app(req, res);
}
