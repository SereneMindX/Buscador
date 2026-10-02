import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createApiApp } from './server/createApp';
import { startSchedulerDaemon } from './server/schedulerManager';

dotenv.config();

const app = createApiApp();
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  startSchedulerDaemon();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[JobRadar Server] Corriendo en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[JobRadar Server] Error starting server:', err);
});

export default app;
