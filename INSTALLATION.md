# 🔧 Installation & First Run

## Prerequisites

You need **Node.js** installed (includes npm):
- Download: https://nodejs.org/ (LTS version recommended)
- Verify: `node --version` (should show v18+ or v20+)

## Installation Steps

### 1️⃣ Navigate to Project

```powershell
cd C:\Users\guill\project-estimator
```

### 2️⃣ Install Dependencies

```powershell
npm install
```

This installs:
- `date-fns` - Date calculations & holiday handling
- `typescript` - TypeScript compiler
- `ts-node` - Run TypeScript directly
- `@types/node` - Node.js type definitions

Expected output:
```
added 50 packages in 5s
```

### 3️⃣ Verify Installation

```powershell
npm run estimate -- --help
```

You should see the help menu with all options.

### 4️⃣ Generate Example Files

```powershell
npm run estimate -- --example
```

This creates:
- `backlog.json` - 10 sample backlog items
- `config.json` - estimation parameters

### 5️⃣ Run Your First Estimation

```powershell
npm run estimate
```

Expected output:
```
🚀 Project Estimation Tool

📂 Loaded 10 items from backlog.json
⚙️  Using default configuration

🔄 Running estimation...

============================================================
PROJECT ESTIMATION SUMMARY
============================================================

📊 Scope: 10 backlog items
⏱️  Total Base Hours: 612 hours
📅 Duration: 12 weeks (6 sprints)
💰 Total Cost: $65,340

[... detailed breakdown ...]

✅ Estimation exported to estimation.json
✨ Estimation complete!
```

## 🎯 What Gets Generated

After running the example:

```
project-estimator/
├── backlog.json          ← Sample backlog (you created this)
├── config.json           ← Parameters (you created this)
├── estimation.json       ← Results (auto-generated)
└── [all other files]
```

## 🔄 Typical Workflow

```powershell
# 1. Edit your backlog
notepad backlog.json

# 2. Run estimation
npm run estimate

# 3. View results
notepad estimation.json

# 4. Export to CSV for Excel
npm run estimate -- --csv
```

## 📊 Try Different Exports

### JSON Export (default)
```powershell
npm run estimate
# Creates: estimation.json
```

### CSV Export (for Excel)
```powershell
npm run estimate -- --csv
# Creates: estimation.csv, gantt.csv
```

### View AI Prompts
```powershell
npm run estimate -- --prompts
# Shows: 6 AI prompt templates
```

## 🛠️ Common Issues

### Issue: "npm is not recognized"
**Solution:** Install Node.js from https://nodejs.org/

### Issue: "Cannot find module 'date-fns'"
**Solution:** Run `npm install` in the project directory

### Issue: "backlog.json not found"
**Solution:** Run `npm run estimate -- --example` first

### Issue: Estimates seem too high/low
**Solution:** Edit `config.json` to adjust multipliers:
```json
{
  "contingencyPercentage": 10,
  "bugFixingPercentage": 15
}
```

## 🎨 Customize Before First Run

### 1. Update Hourly Rates

Edit `src/config.ts` (lines 11-18):
```typescript
export const ROLE_RATES: RoleRate[] = [
  { role: 'Fullstack', hourlyRate: 100 }, // Your rate
  { role: 'QA', hourlyRate: 70 },
  // ... etc
];
```

### 2. Adjust T-Shirt Sizes

Edit `src/config.ts` (lines 4-12):
```typescript
export const TSHIRT_HOURS: Record<TShirtSize, number> = {
  XS: 8,   // Adjust for your team
  S: 16,
  M: 32,
  // ... etc
};
```

After changes, rebuild:
```powershell
npm run build
```

## 🚀 Production Build

For production use:

```powershell
# Build TypeScript to JavaScript
npm run build

# Run compiled version
npm start
```

This creates `dist/` folder with compiled JavaScript.

## 📝 Next Steps

1. ✅ **Customize rates** in `src/config.ts`
2. ✅ **Add your backlog** to `backlog.json`
3. ✅ **Adjust parameters** in `config.json`
4. ✅ **Run estimation** and review results
5. ✅ **Export to CSV** for stakeholder presentations
6. ✅ **Use AI prompts** for better sizing

## 🎓 Learn More

- **Full Documentation:** `README.md`
- **Quick Start:** `QUICKSTART.md`
- **Project Summary:** `PROJECT_SUMMARY.md`
- **Help Command:** `npm run estimate -- --help`

## 💡 Pro Tips

1. **Keep multiple config files** for different scenarios:
   ```powershell
   npm run estimate -- --config optimistic.json
   npm run estimate -- --config pessimistic.json
   ```

2. **Use version control** for your backlog:
   ```powershell
   git add backlog.json config.json
   git commit -m "Q4 2025 estimation"
   ```

3. **Export both formats** for different audiences:
   ```powershell
   npm run estimate              # JSON for technical team
   npm run estimate -- --csv     # CSV for management
   ```

4. **Leverage AI** for initial sizing:
   ```powershell
   npm run estimate -- --prompts
   # Copy prompt → Send to ChatGPT/Claude → Get sizing
   ```

---

**Ready to Go!** 🎉

You now have a production-ready estimation tool that replaces your Excel spreadsheet.

**Questions?** Check `README.md` for complete documentation.

