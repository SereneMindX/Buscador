import express from 'express';
import {
  initializeScheduler,
  getLimaTime,
  getConfig,
  updateConfig,
  getReports,
  getHourlyScans,
  getAccumulatedJobs,
  runHourlyJobInvestigation,
  compileDaily8pmReport,
  isScanning,
} from './schedulerManager';
import { bumeranScraperService } from './bumeranScraperService';
import { computrabajoScraperService } from './computrabajoScraperService';

export function createApiApp(): express.Express {
  const app = express();

  app.use(express.json());

  // Helper to register routes both with and without /api prefix
  const regGet = (path: string, handler: express.RequestHandler) => {
    app.get(path, handler);
    if (path.startsWith('/api/')) {
      app.get(path.replace('/api/', '/'), handler);
    }
  };

  const regPost = (path: string, handler: express.RequestHandler) => {
    app.post(path, handler);
    if (path.startsWith('/api/')) {
      app.post(path.replace('/api/', '/'), handler);
    }
  };

  // Status endpoint
  const handleStatus: express.RequestHandler = async (req, res) => {
    try {
      await initializeScheduler();
      const lima = getLimaTime();
      const config = getConfig();
      const reports = getReports();
      const hourlyScans = getHourlyScans();
      const accumulatedJobs = getAccumulatedJobs();

      const minutesUntilNextHour = 60 - lima.minute;
      const nextHourlyScanFormatted = `en ${minutesUntilNextHour} min (:00 de cada hora)`;

      const targetHour = config.scheduledHour;
      const targetMinute = config.scheduledMinute;

      let hoursRemaining = targetHour - lima.hour;
      let minutesRemaining = targetMinute - lima.minute;

      if (minutesRemaining < 0) {
        hoursRemaining -= 1;
        minutesRemaining += 60;
      }
      if (hoursRemaining < 0) {
        hoursRemaining += 24;
      }

      const next8pmFormatted = `${String(targetHour).padStart(2, '0')}:${String(targetMinute).padStart(2, '0')} (en ${hoursRemaining}h ${minutesRemaining}m)`;

      res.json({
        config,
        limaTime: lima,
        nextHourlyScanFormatted,
        next8pmFormatted,
        isScanning: isScanning(),
        reportsCount: reports.length,
        hourlyScansCount: hourlyScans.length,
        totalDayJobsCount: accumulatedJobs.length,
        latestReport: reports[0] || null,
      });
    } catch (err: any) {
      console.error('Error in /api/status:', err);
      res.status(500).json({ error: err.message || 'Error al obtener estado' });
    }
  };
  regGet('/api/status', handleStatus);

  const handleConfig: express.RequestHandler = (req, res) => {
    try {
      const updated = updateConfig(req.body);
      res.json({ success: true, config: updated });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
  regPost('/api/config', handleConfig);

  const handleHourlyScans: express.RequestHandler = (req, res) => {
    try {
      const scans = getHourlyScans();
      res.json(scans);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al obtener escaneos' });
    }
  };
  regGet('/api/jobs/hourly-scans', handleHourlyScans);
  regGet('/api/hourly-scans', handleHourlyScans);

  const handleReports: express.RequestHandler = async (req, res) => {
    try {
      await initializeScheduler();
      const reports = getReports();
      res.json(reports);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error al obtener reportes' });
    }
  };
  regGet('/api/jobs/reports', handleReports);
  regGet('/api/reports', handleReports);

  const handleLatest: express.RequestHandler = async (req, res) => {
    try {
      await initializeScheduler();
      const reports = getReports();
      if (reports.length > 0) {
        return res.json(reports[0]);
      }

      const newReport = await compileDaily8pmReport('manual');
      res.json(newReport);
    } catch (err: any) {
      console.error('Error in /api/jobs/latest:', err);
      res.status(500).json({ error: err.message || 'Error al obtener último reporte' });
    }
  };
  regGet('/api/jobs/latest', handleLatest);
  regGet('/api/latest', handleLatest);

  // Hourly scan trigger
  const handleHourlyScanExecution: express.RequestHandler = async (req, res) => {
    try {
      const result = await runHourlyJobInvestigation();
      const updatedReport = await compileDaily8pmReport('manual');
      res.json({ success: true, ...result, report: updatedReport });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  regPost('/api/jobs/hourly-scan', handleHourlyScanExecution);
  regPost('/api/hourly-scan', handleHourlyScanExecution);

  // Bumeran Scraper
  const handleScraperBumeran: express.RequestHandler = async (req, res) => {
    try {
      const { role, query } = req.body || {};
      let jobs;
      if (role && query) {
        jobs = await bumeranScraperService.scrapeJobsByRole({ query, roleCategory: role });
      } else {
        jobs = await bumeranScraperService.scrapeAllTargetRoles(false);
      }
      res.json({ success: true, count: jobs.length, jobs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  regPost('/api/scraper/bumeran', handleScraperBumeran);

  // Computrabajo Scraper
  const handleScraperComputrabajo: express.RequestHandler = async (req, res) => {
    try {
      const { role, query, slugPath, teletrabajoOnly } = req.body || {};
      let jobs;
      if (role && query) {
        jobs = await computrabajoScraperService.scrapeJobsByRole({
          query,
          roleCategory: role,
          slugPath,
          teletrabajoOnly: !!teletrabajoOnly,
        });
      } else {
        jobs = await computrabajoScraperService.scrapeAllTargetRoles(!!teletrabajoOnly);
      }
      res.json({ success: true, count: jobs.length, jobs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  regPost('/api/scraper/computrabajo', handleScraperComputrabajo);

  // 8:00 PM simulation
  const handleSimulate8pm: express.RequestHandler = async (req, res) => {
    try {
      const report = await compileDaily8pmReport('automatic_8pm');
      res.json({
        success: true,
        report,
        message: 'Consolidado diario de las 8:00 PM compilado con éxito tras los escaneos horarios.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  };
  regPost('/api/jobs/simulate-8pm', handleSimulate8pm);
  regPost('/api/simulate-8pm', handleSimulate8pm);

  // 404 Guard for API routes
  app.all(['/api/*', '/jobs/*', '/status', '/config', '/scraper/*', '/hourly-scan*'], (req, res) => {
    res.status(404).json({ error: `Ruta API no encontrada: ${req.method} ${req.path}` });
  });

  // Error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[API Error handler]', err);
    res.status(500).json({ error: err?.message || 'Error interno del servidor' });
  });

  return app;
}
