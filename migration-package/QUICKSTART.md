# 🚀 Quick Start Guide

Get your project estimation tool running in 3 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Generate Example Files

```bash
npm run estimate -- --example
```

This creates:
- `backlog.json` - Sample project with 10 features
- `config.json` - Estimation parameters

## Step 3: Run Your First Estimation

```bash
npm run estimate
```

You'll see:
- ✅ Detailed console output with costs, timeline, team composition
- ✅ `estimation.json` file with complete results

## Alternative: Export to CSV

```bash
npm run estimate -- --csv
```

Generates:
- `estimation.csv` - Full estimation report
- `gantt.csv` - Timeline breakdown

## View AI Prompt Templates

```bash
npm run estimate -- --prompts
```

Shows AI prompts for:
- Effort estimation
- Feature breakdown
- Risk analysis
- Stakeholder summaries

## Customize Your Estimation

### Option 1: Edit the Example Files

After running `--example`, edit:
- `backlog.json` - Add your features
- `config.json` - Adjust parameters

### Option 2: Create Your Own Files

Create `my-backlog.json`:
```json
[
  {
    "epic": "Your Epic",
    "feature": "Your Feature",
    "tshirt_size": "M",
    "roles": ["Fullstack", "QA"]
  }
]
```

Run with custom file:
```bash
npm run estimate -- --input my-backlog.json
```

## T-Shirt Size Reference

| Size | Hours | When to Use |
|------|-------|-------------|
| XS   | 9h    | Trivial (config change, text update) |
| S    | 18h   | Simple (basic CRUD, simple form) |
| M    | 36h   | Moderate (user profile, search) |
| L    | 72h   | Complex (auth system, reporting) |
| XL   | 108h  | Very complex (payment integration) |
| XXL  | 144h  | Major feature (admin dashboard) |
| XXXL | 189h  | Epic-level (full checkout flow) |

## Available Roles

- **Fullstack** - Frontend + Backend development
- **QA** - Quality Assurance (auto-calculated at 1:3 ratio)
- **DevOps** - Infrastructure, CI/CD, deployment
- **BA** - Business Analyst (auto-added at 50%)
- **SM** - Scrum Master (auto-added at 50%)
- **UX** - UX Designer (auto-added at 50%)

## Customization

### Change Hourly Rates

Edit `src/config.ts`:
```typescript
export const ROLE_RATES: RoleRate[] = [
  { role: 'Fullstack', hourlyRate: 100 }, // Changed from 85
  { role: 'QA', hourlyRate: 70 },
  // ...
];
```

### Adjust Multipliers

Edit `config.json`:
```json
{
  "contingencyPercentage": 20,
  "bugFixingPercentage": 25,
  "hoursPerDay": 7
}
```

## Common Commands

```bash
# Help
npm run estimate -- --help

# Generate examples
npm run estimate -- --example

# Run with custom config
npm run estimate -- --input backlog.json --config my-config.json

# Export to CSV
npm run estimate -- --csv

# View AI prompts
npm run estimate -- --prompts

# Build for production
npm run build
npm start
```

## Troubleshooting

**Q: `npm run estimate` fails**
- Run `npm install` first
- Make sure `backlog.json` exists (run `--example`)

**Q: Estimates seem off**
- Adjust T-shirt sizes in your backlog
- Modify multipliers in `config.json`
- Check `src/config.ts` for rates

**Q: Need more roles**
- Edit `src/types.ts` to add role types
- Update `src/config.ts` with rates and patterns

## Next Steps

1. ✅ Customize T-shirt sizes for your team velocity
2. ✅ Update hourly rates to match your region
3. ✅ Add your actual backlog items
4. ✅ Experiment with AI prompts for better sizing
5. ✅ Export results for stakeholder presentations

---

**Need Help?** Check `README.md` for complete documentation!

