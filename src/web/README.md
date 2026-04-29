# Project Estimator Web Dashboard

A modern React-based web dashboard for the Project Estimator application, providing a user-friendly interface for creating projects, managing estimations, and visualizing results.

## Features

- **Project Management**: Create and manage multiple projects
- **Estimation Form**: Add backlog items with effort sizing and role requirements
- **Configurable Parameters**: Set hours per day, sprint length, testing percentages, etc.
- **Results Dashboard**: Comprehensive visualization of estimation results
- **Team Composition**: Pie chart showing team allocation by role
- **Cost Breakdown**: Bar charts for effort and cost by role
- **Timeline View**: Visual project timeline with sprint markers
- **Export Results**: Download estimation data as JSON
- **Responsive Design**: Works seamlessly on mobile and desktop

## Project Structure

```
src/web/
├── public/
│   ├── index.html          # HTML entry point
│   ├── index.jsx           # React entry point
│   ├── App.jsx             # Main App component
│   ├── components/
│   │   ├── ProjectListPage.jsx      # Project listing component
│   │   ├── ProjectCreateForm.jsx    # Create project form
│   │   ├── EstimationForm.jsx       # Estimation input form
│   │   ├── ResultsDashboard.jsx     # Results visualization
│   │   └── charts/
│   │       ├── PieChart.jsx         # Team composition pie chart
│   │       ├── BarChart.jsx         # Effort/cost bar charts
│   │       └── TimelineChart.jsx    # Project timeline visualization
│   └── styles/
│       ├── index.css       # Global styles
│       ├── App.css         # App component styles
│       └── components.css  # Component styles
└── package.json            # Dependencies and scripts
```

## Installation & Setup

### Prerequisites
- Node.js 14+ and npm
- Backend API running on http://localhost:3000

### Installation

```bash
cd src/web
npm install
```

### Development

```bash
# Start the development server
npm start
```

The app will open at `http://localhost:3000` (or next available port).

### Building for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` directory.

## API Integration

The dashboard communicates with the backend API at `/api`:

### Endpoints Used

- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/estimations?projectId={id}` - Get estimations for a project
- `POST /api/estimations` - Create new estimation

### Environment Variables

Set `REACT_APP_API_URL` to change the API endpoint:

```bash
REACT_APP_API_URL=http://your-api:3000/api npm start
```

## Components

### ProjectListPage
Displays all projects with search functionality. Users can select a project to create estimations.

**Props:**
- `projects`: Array of project objects
- `onSelectProject`: Callback when a project is selected
- `onRefresh`: Callback to refresh the project list

### ProjectCreateForm
Form to create a new project with name input and validation.

**Props:**
- `onCreateProject`: Callback with project name

### EstimationForm
Two-tab form for adding backlog items and configuring estimation parameters.

**Tabs:**
1. **Backlog Items**: Add features with T-shirt sizing and role requirements
2. **Configuration**: Set hours/day, sprint length, testing percentages, start date

**Props:**
- `project`: Current project object
- `onCreateEstimation`: Callback with backlog and config
- `existingEstimations`: Array of existing estimations

### ResultsDashboard
Comprehensive results display with multiple tabs:

**Tabs:**
1. **Overview**: Summary stats and assumptions
2. **Team Composition**: Pie chart and allocation breakdown
3. **Effort & Cost**: Bar charts and role-level details
4. **Timeline**: Visual project timeline with sprints

**Props:**
- `estimation`: Estimation result object
- `project`: Current project object
- `onBack`: Callback to go back to estimation form

### Charts

#### PieChart
SVG-based pie chart for team composition visualization.

#### BarChart
SVG-based bar chart for effort and cost breakdown.

#### TimelineChart
Visual timeline with week markers, sprint indicators, and duration summary.

## Styling

The dashboard uses a custom CSS design system with:

- **Color Scheme**:
  - Primary: #2196F3 (Blue)
  - Success: #4CAF50 (Green)
  - Error: #f44336 (Red)
  - Warning: #ff9800 (Orange)

- **Responsive**: Mobile-first design with breakpoints at 768px and 600px
- **No Dependencies**: Uses plain CSS for styling, SVG for charts

## State Management

Uses React hooks for state management:
- `useState`: Local component state
- `useEffect`: Side effects and API calls
- `useCallback`: Memoized callbacks for performance

The App component maintains global state for:
- Current page/route
- Selected project
- Projects and estimations lists
- Loading and error states

## Features in Detail

### T-Shirt Sizing
Backlog items are sized using familiar T-shirt sizes:
- XS: 1 day
- S: 2 days
- M: 3 days
- L: 5 days
- XL: 8 days
- XXL: 13 days
- XXXL: 21 days

### Role Types
Supports 6 different roles:
- Fullstack
- QA
- DevOps
- BA (Business Analyst)
- SM (Scrum Master)
- UX (Design/UX)

### Configurable Parameters
- Hours per working day
- Sprint length
- Unit testing percentage
- Bug fixing percentage
- Documentation percentage
- Contingency percentage

### Result Metrics
- Total backlog items
- Base effort (hours)
- Project duration (days, weeks, sprints)
- Total cost
- Timeline (start to end date)
- Team composition allocation
- Role-level effort and costs
- Project assumptions

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- Lightweight bundle (React + custom code only)
- SVG-based charts (no heavy charting library)
- Optimized rendering with React hooks
- No external UI library dependency

## Development Guidelines

### Adding New Components

1. Create component file in `components/`
2. Create corresponding CSS in `styles/`
3. Import in parent component
4. Follow existing naming conventions

### Styling Best Practices

- Use CSS custom properties for colors
- Mobile-first media queries
- BEM naming convention where applicable
- Consistent padding/margin spacing

### State Management

- Keep state as close to usage as possible
- Use useCallback for callback memoization
- Avoid prop drilling with context if needed

## Troubleshooting

### API Connection Issues
- Verify backend API is running on the configured URL
- Check browser console for CORS errors
- Ensure `REACT_APP_API_URL` is set correctly

### Charts Not Rendering
- Check browser console for SVG errors
- Verify data is properly formatted
- Ensure chart containers have proper dimensions

### Form Validation
- All required fields have inline validation
- Error messages appear as alerts
- Form prevents submission with invalid data

## Future Enhancements

- Add project editing/deletion
- Estimation history and versioning
- Team availability calendar
- Integration with project management tools
- Advanced filtering and search
- Custom role definitions
- Bulk import of backlog items

## License

MIT
