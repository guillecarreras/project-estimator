# Quick Start Guide - Web Dashboard

Get the Project Estimator web dashboard up and running in 5 minutes.

## Prerequisites

- Node.js 14+ installed
- Backend API running on `http://localhost:3000`

## 1. Install Dependencies

```bash
cd src/web
npm install
```

## 2. Start Development Server

```bash
npm start
```

The dashboard opens automatically at `http://localhost:3000`.

## 3. Test the Flow

### Create a Project
1. Go to "Create New Project" on the right
2. Enter project name (e.g., "My First Project")
3. Click "Create Project"
4. Project appears in the list on the left

### Create an Estimation
1. Click "Estimate" on your project
2. **Backlog Items tab:**
   - Epic: "Authentication"
   - Feature: "Email login"
   - Size: "M"
   - Select roles: Fullstack, QA
   - Click "Add Item"
   - Add 2-3 more items
3. **Configuration tab:**
   - Keep default settings or adjust as needed
   - Click "Run Estimation"

### View Results
Results dashboard shows:
- **Overview**: Key metrics and timeline
- **Team Composition**: Pie chart of team allocation
- **Effort & Cost**: Bar charts by role
- **Timeline**: Visual project schedule

## 4. Build for Production

```bash
npm run build
```

Creates optimized `build/` folder for deployment.

## Common Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests (if configured)
npm test
```

## Configuration

### Change API Endpoint

```bash
REACT_APP_API_URL=http://your-api:3000/api npm start
```

## Troubleshooting

### Port Already in Use
```bash
# Specify different port
PORT=3001 npm start
```

### API Connection Error
1. Check backend is running: `curl http://localhost:3000/health`
2. Verify CORS is enabled in backend
3. Check browser console for errors

### Clear Cache
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Project Structure

```
src/web/
├── public/
│   ├── App.jsx                 # Main app component
│   ├── components/             # Page and chart components
│   └── styles/                 # CSS files
├── package.json                # Dependencies
└── README.md                   # Full documentation
```

## Key Components

- **App.jsx**: Main container, state management, routing
- **ProjectListPage**: View and search projects
- **ProjectCreateForm**: Create new projects
- **EstimationForm**: Add backlog items and config
- **ResultsDashboard**: View results with charts

## Features

✓ Project management
✓ Backlog estimation with T-shirt sizing
✓ Interactive results dashboard
✓ Team composition visualization
✓ Cost breakdown analysis
✓ Project timeline view
✓ JSON export
✓ Mobile responsive
✓ No external UI dependencies

## What's Next?

- **Explore Results**: Try different backlog sizes to see how estimates change
- **Export Data**: Download estimation results for reports
- **Customize Config**: Adjust testing/documentation percentages
- **Create Multiple Estimations**: Test different scenarios per project

## API Integration

The dashboard automatically connects to these backend endpoints:

```
GET    /api/projects
POST   /api/projects
GET    /api/estimations?projectId={id}
POST   /api/estimations
```

No additional configuration needed - it works with the existing backend.

## Deployment

Deploy the `build/` folder to any static host:
- Vercel
- Netlify
- AWS S3
- GitHub Pages
- Any web server

## Getting Help

Refer to:
- `README.md` - Full component documentation
- `../WEB_DASHBOARD_GUIDE.md` - Integration guide
- Browser console - Error messages and debugging info

---

**Happy estimating!** Start by creating a project and adding some backlog items to see the dashboard in action.
