import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import * as path from 'path';
import { AppDataSource } from '../database/data-source';
import { createProjectRoutes } from './routes/projects';
import { createEstimationRoutes } from './routes/estimations';
import { createSnapshotRoutes } from './routes/snapshots';
import { createAnalyticsRoutes } from './routes/analytics';
import { createAuthRoutes } from './routes/auth';
import { createJiraRoutes } from './routes/jira-integration';
import dependenciesRouter from './routes/dependencies';
import { verifyTokenMiddleware } from '../middleware/authMiddleware';

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Auth routes (public)
    app.use('/api/auth', createAuthRoutes(AppDataSource));

    // Protected routes
    app.use('/api/projects', verifyTokenMiddleware, createProjectRoutes(AppDataSource));
    app.use('/api/estimations', verifyTokenMiddleware, createEstimationRoutes(AppDataSource));
    app.use('/api/snapshots', verifyTokenMiddleware, createSnapshotRoutes(AppDataSource));
    app.use('/api/analytics', verifyTokenMiddleware, createAnalyticsRoutes(AppDataSource));
    app.use('/api/integrations/jira', verifyTokenMiddleware, createJiraRoutes(AppDataSource));

    // Public dependencies routes (useful for analysis without auth)
    app.use('/api/features/dependencies', dependenciesRouter);

    app.get('/api/info', (req: Request, res: Response) => {
      res.json({
        name: 'Project Estimator API',
        version: '1.0.0',
        authentication: {
          description: 'All endpoints except /api/auth/* and /api/features/dependencies/* require JWT token in Authorization header',
          header: 'Authorization: Bearer <token>',
          login: 'POST /api/auth/login',
          register: 'POST /api/auth/register',
          refresh: 'POST /api/auth/refresh',
          logout: 'POST /api/auth/logout',
          me: 'GET /api/auth/me',
        },
        endpoints: {
          projects: 'POST/GET/PUT/DELETE /api/projects/:id',
          estimations: 'POST/GET/PUT/DELETE /api/estimations/:id',
          snapshots: 'POST/GET/DELETE /api/snapshots/:id',
          analytics: 'GET /api/analytics/:estimationId',
          dependencies: {
            analyze: 'POST /api/features/dependencies/analyze',
            schedule: 'POST /api/features/dependencies/schedule',
            precedenceDiagram: 'POST /api/features/dependencies/precedence-diagram',
            ganttChart: 'POST /api/features/dependencies/gantt-chart',
            validate: 'POST /api/features/dependencies/validate',
            slackAnalysis: 'POST /api/features/dependencies/slack-analysis',
            estimationWithDeps: 'POST /api/features/dependencies/estimation-with-dependencies',
            bottlenecks: 'POST /api/features/dependencies/bottlenecks',
            whatIf: 'POST /api/features/dependencies/what-if',
            detect: 'POST /api/features/dependencies/detect',
          },
        },
      });
    });

    app.use((req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} does not exist`,
      });
    });

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      res.status(500).json({
        error: 'Internal Server Error',
        message: err.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    });

    app.listen(PORT, () => {
      console.log(`\nProject Estimator API running on http://localhost:${PORT}`);
      console.log(`API Docs: http://localhost:${PORT}/api/info\n`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export default app;
export { startServer };
