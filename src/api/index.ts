/**
 * API Module Exports
 */

import app, { startServer } from './server';

export { default as app } from './server';
export { startServer };

export { default as jiraRoutes } from './routes/jira';
export { default as dependenciesRoutes } from './routes/dependencies';
