# 🚀 Project Estimation Tool

A fully automated AI-assisted project estimation tool that replaces fragile Excel spreadsheets with a modern, scalable solution. Built for presales teams, project managers, and technical leads who need accurate, consistent project estimates.

## 🎯 Features

- **T-Shirt Size Mapping**: Converts XS–XXXL sizes to hours (9h–189h)
- **Role-Based Estimation**: Supports Fullstack, QA, DevOps, BA, SM, UX roles
- **Smart Multipliers**: Applies contingency, bug fixing, documentation, unit testing overhead
- **Holiday Handling**: Excludes Brazilian holidays and weekends from working days
- **Team Allocation**: Calculates optimal headcount and FTE based on effort
- **Cost Calculation**: Automatic cost estimation with configurable hourly rates
- **Timeline Generation**: Gantt-like timeline with sprint breakdown
- **AI Integration**: Includes prompt templates for OpenAI/Claude to enhance estimates
- **Export Options**: JSON and CSV export for reports and integration

## 📦 Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## ☁️ Deploy to Render (Cloud)

One-click deploy:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/guillecarreras/project-estimator)

Or see [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for detailed instructions.

**After deploy:**
- App URL: `https://project-estimator.onrender.com`
- Username: `admin`
- Password: `demo123`

---

## 🚀 Quick Start (Local)

### 1. Install & Build

```bash
npm install
npm run build
```

### 2. Start Server

```bash
npm start
# App runs on http://localhost:3000
```

### 3. Access API

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"demo123"}'

# Create estimation
curl -X POST http://localhost:3000/api/estimations \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"1","backlog":[...]}'
```

### 4. CLI Tool (Legacy)

```bash
npm run estimate -- --example
npm run estimate
npm run estimate -- --input my-backlog.json --csv
```

### 3. View Results

The tool outputs:
- Console summary with all key metrics
- `estimation.json` or `estimation.csv` - Full estimation details
- `gantt.csv` - Timeline breakdown (when using --csv)

## 📋 Input Format

### Backlog JSON

```json
[
  {
    "epic": "Authentication",
    "feature": "User Login",
    "tshirt_size": "M",
    "roles": ["Fullstack", "QA"]
  },
  {
    "epic": "Authentication",
    "feature": "OAuth Integration",
    "tshirt_size": "L",
    "roles": ["Fullstack", "DevOps", "QA"]
  }
]
```

### Configuration JSON (Optional)

```json
{
  "hoursPerDay": 6,
  "sprintLengthWeeks": 2,
  "unitTestingPercentage": 15,
  "bugFixingPercentage": 20,
  "documentationPercentage": 10,
  "contingencyPercentage": 15,
  "startDate": "2025-11-03"
}
```

## 📊 T-Shirt Size Reference

| Size  | Hours | Typical Scope                    |
|-------|-------|----------------------------------|
| XS    | 9h    | Trivial task, single file change |
| S     | 18h   | Simple feature, 1-2 days         |
| M     | 36h   | Moderate feature, 1 week         |
| L     | 72h   | Complex feature, 2 weeks         |
| XL    | 108h  | Very complex, 3 weeks            |
| XXL   | 144h  | Major feature, 4 weeks           |
| XXXL  | 189h  | Epic-level work, 5+ weeks        |

## 🔧 Configuration Parameters

- **hoursPerDay**: Productive hours per day (default: 6)
- **sprintLengthWeeks**: Sprint duration (default: 2 weeks)
- **unitTestingPercentage**: Testing overhead (default: 15%)
- **bugFixingPercentage**: Bug fix overhead (default: 20%)
- **documentationPercentage**: Documentation overhead (default: 10%)
- **contingencyPercentage**: Risk buffer (default: 15%)
- **startDate**: Project start date (YYYY-MM-DD)

## 🎭 Role Allocation Patterns

### Task-Based Roles
- **Fullstack**: Allocated per task based on backlog
- **DevOps**: Allocated per task when specified

### Ratio-Based Roles
- **QA**: 1 QA per 3 Developers (automatic)

### Full-Project Roles
- **BA**: 50% allocation throughout project
- **SM**: 50% allocation throughout project
- **UX**: 50% allocation throughout project

## 💰 Role Rates (Default)

| Role      | Hourly Rate |
|-----------|-------------|
| Fullstack | $85         |
| QA        | $60         |
| DevOps    | $90         |
| BA        | $70         |
| SM        | $75         |
| UX        | $80         |

*Rates can be customized in `src/config.ts`*

## 🤖 AI Integration

The tool includes prompt templates for AI-assisted estimation:

```bash
# View AI prompt examples
npm run estimate -- --prompts
```

### Available Prompt Templates

1. **Effort Estimation**: Get AI suggestions for T-shirt sizing
2. **Feature Breakdown**: Break epics into implementable stories
3. **Estimation Review**: Validate and refine estimates
4. **Risk Analysis**: Identify project risks
5. **Stakeholder Summary**: Generate executive summaries
6. **Team Optimization**: Optimize team composition

### Example Usage

```typescript
import { PromptTemplates } from './src/promptTemplates';

// Get AI prompt for effort estimation
const prompt = PromptTemplates.getEffortEstimationPrompt(
  "Build a user authentication system with OAuth",
  "Using Node.js, React, PostgreSQL"
);

// Send to OpenAI/Claude for estimation
// Parse response and add to backlog
```

## 📈 Output Example

```
============================================================
PROJECT ESTIMATION SUMMARY
============================================================

📊 Scope: 10 backlog items
⏱️  Total Base Hours: 612 hours
📅 Duration: 12 weeks (6 sprints)
🗓️  Timeline: 2025-11-03 → 2026-01-12
💼 Working Days: 50 days
💰 Total Cost: $65,340

------------------------------------------------------------
ROLE EFFORTS
------------------------------------------------------------
Role            Hours      FTE           Cost
------------------------------------------------------------
Fullstack         450     3.75      $38,250
QA                150     1.25       $9,000
DevOps            120     1.00      $10,800
BA                 90     0.75       $6,300
SM                 60     0.50       $4,500
UX                 90     0.75       $7,200

------------------------------------------------------------
TEAM COMPOSITION
------------------------------------------------------------
Role            Count      Allocation
------------------------------------------------------------
Fullstack           4            100%
QA                  2            100%
DevOps              1            100%
BA                  1             50%
SM                  1             50%
UX                  1             50%
```

## 🛠️ CLI Options

```bash
Usage: npm run estimate [options]

Options:
  -i, --input <file>     Input backlog JSON file (default: backlog.json)
  -c, --config <file>    Configuration JSON file (optional)
  --csv                  Export results as CSV instead of JSON
  --example              Generate example backlog and config files
  --prompts              Show AI prompt template examples
  -h, --help             Show this help message
```

## 🏗️ Project Structure

```
project-estimator/
├── src/
│   ├── index.ts              # CLI entry point
│   ├── types.ts              # TypeScript interfaces
│   ├── config.ts             # Configuration & constants
│   ├── estimator.ts          # Core estimation logic
│   ├── holidayUtils.ts       # Holiday & working day calculations
│   ├── teamAllocator.ts      # Team composition & headcount
│   ├── promptTemplates.ts    # AI prompt templates
│   └── exportUtils.ts        # JSON/CSV export utilities
├── package.json
├── tsconfig.json
└── README.md
```

## 🔍 Key Assumptions

1. Working 6 productive hours per day
2. Sprint length: 2 weeks
3. Contingency: 15% buffer for unknowns
4. Bug fixing overhead: 20%
5. Documentation overhead: 10%
6. Unit testing overhead: 15%
7. QA ratio: 1 QA per 3 Developers
8. BA, SM, UX allocated at 50% throughout project
9. Brazilian holidays excluded from working days
10. Weekends excluded from working days

## 🚀 Advanced Usage

### Custom Rate Card

Edit `src/config.ts`:

```typescript
export const ROLE_RATES: RoleRate[] = [
  { role: 'Fullstack', hourlyRate: 100 },
  { role: 'QA', hourlyRate: 70 },
  // ... customize rates
];
```

### Custom T-Shirt Sizes

Edit `src/config.ts`:

```typescript
export const TSHIRT_HOURS: Record<TShirtSize, number> = {
  XS: 8,
  S: 16,
  M: 40,
  // ... customize hours
};
```

### Integration with Other Tools

The tool exports standard JSON/CSV that can be imported into:
- Microsoft Project
- Jira
- Monday.com
- Asana
- Excel/Google Sheets

## 🤝 Contributing

This is a self-contained estimation tool. To extend:

1. Modify `src/config.ts` for business rules
2. Extend `src/estimator.ts` for calculation logic
3. Add new prompt templates in `src/promptTemplates.ts`
4. Update export formats in `src/exportUtils.ts`

## 📝 License

MIT License - feel free to use and modify for your organization.

## 🎓 Best Practices

1. **Start with Examples**: Use `--example` to understand the format
2. **Refine T-Shirt Sizes**: Adjust sizes based on team velocity
3. **Use AI Prompts**: Leverage AI for initial sizing, then refine
4. **Review Assumptions**: Customize multipliers for your team
5. **Export & Share**: Use CSV for stakeholder reports
6. **Iterate**: Run multiple scenarios with different configs

## 🆘 Troubleshooting

**Q: My estimates seem too high/low**
- A: Adjust contingency and overhead percentages in config.json
- Check if T-shirt sizes match your team's velocity

**Q: Wrong holiday dates**
- A: Update Brazilian holidays in `src/holidayUtils.ts`
- Add organization-specific holidays

**Q: Team composition doesn't match reality**
- A: Customize `ROLE_ALLOCATION_PATTERN` in `src/config.ts`

**Q: Need more roles**
- A: Add new roles to `src/types.ts` and `src/config.ts`

## 🌟 Why This Tool?

✅ Replaces fragile Excel spreadsheets
✅ Consistent, repeatable estimates
✅ AI-assisted for faster estimation
✅ Accounts for holidays and multipliers
✅ Scalable to any project size
✅ Exportable for reporting
✅ Team composition automation
✅ Cost calculation built-in

---

**Built with TypeScript, Node.js, and date-fns**

For questions or support, check the source code in `src/` - it's well-documented and easy to customize!

