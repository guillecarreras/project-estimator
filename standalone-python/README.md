# 🐍 Standalone Python Estimator

**No Node.js Required!** - This is a self-contained Python version of the Project Estimation Tool.

## ✅ Requirements

- **Python 3.7 or higher** (that's it!)
- No external dependencies needed
- Works on Windows, Mac, Linux

## 🚀 Quick Start

### 1. Check Python

```bash
python --version
```

If not installed: https://www.python.org/downloads/

### 2. Generate Example Files

```bash
python estimator.py --example
```

### 3. Run Estimation

```bash
python estimator.py
```

## 📋 Usage

```bash
# Basic estimation (uses backlog.json)
python estimator.py

# With custom input file
python estimator.py --input my-backlog.json

# With custom config
python estimator.py --input backlog.json --config custom-config.json

# Export to CSV
python estimator.py --csv

# Generate examples
python estimator.py --example

# Help
python estimator.py --help
```

## 📊 Input Format

**backlog.json:**
```json
[
  {
    "epic": "Authentication",
    "feature": "User Login",
    "tshirt_size": "M",
    "roles": ["Fullstack", "QA"]
  }
]
```

**config.json (optional):**
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

## 🎯 Features

✅ T-shirt size mapping (XS-XXXL)
✅ Role-based estimation
✅ Smart multipliers
✅ Brazilian holiday handling
✅ Team allocation (QA ratio)
✅ Cost calculation
✅ Timeline generation
✅ JSON export
✅ CSV export
✅ Gantt data
✅ Console output

## ⚙️ Customization

Edit the configuration constants in `estimator.py`:

- **TSHIRT_HOURS** - T-shirt size to hours
- **ROLE_RATES** - Hourly rates per role
- **DEFAULT_CONFIG** - Default parameters
- **QA_RATIO** - QA to developer ratio

## 📈 Output

Creates:
- `estimation.json` - Full results (default)
- `estimation.csv` - CSV export (with --csv)
- `gantt.csv` - Timeline data (with --csv)

## 🆚 vs Node.js Version

| Feature | Python | Node.js |
|---------|--------|---------|
| No dependencies | ✅ | ❌ (needs npm) |
| Single file | ✅ | ❌ (multiple) |
| Fast startup | ✅ | ❌ (slower) |
| AI prompts | ❌ | ✅ |
| Modular | ❌ | ✅ |

Use Python version for:
- Quick estimations
- No Node.js available
- Simpler deployment

Use Node.js version for:
- AI integration
- Development/extension
- Full feature set

## 🔧 Troubleshooting

**Q: "python is not recognized"**
- Install Python from https://www.python.org/
- Or use `python3` instead of `python`

**Q: Estimates differ from Excel**
- Adjust multipliers in config.json
- Modify TSHIRT_HOURS in estimator.py

## 📝 License

MIT - Free to use and modify






