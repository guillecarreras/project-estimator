# 📦 Complete Migration Guide

This guide covers both versions of the Project Estimation Tool:
1. **Standalone Python Version** - No Node.js required
2. **Node.js/TypeScript Version** - Full-featured with AI templates

---

## 🐍 Option 1: Standalone Python Version

### ✅ Best For:
- Computers without Node.js
- Quick, simple estimations
- Single-file deployment
- Minimal dependencies

### 📦 What to Copy:
Copy the entire `standalone-python` folder:
```
standalone-python/
├── estimator.py         # Main application (single file!)
├── README.md            # Python-specific docs
├── requirements.txt     # No dependencies needed
├── RUN_EXAMPLE.bat      # Windows quick start
└── RUN_CSV_EXPORT.bat   # Windows CSV export
```

### 🚀 Setup on New Computer:

#### Windows:
1. **Check Python:**
   ```cmd
   python --version
   ```
   Need Python 3.7+? Download: https://www.python.org/

2. **Copy folder** to new computer

3. **Run example:**
   - Double-click `RUN_EXAMPLE.bat`
   - Or: `python estimator.py --example`

4. **Run estimation:**
   - `python estimator.py`

#### Mac/Linux:
1. **Check Python:**
   ```bash
   python3 --version
   ```

2. **Copy folder** to new computer

3. **Run:**
   ```bash
   python3 estimator.py --example
   python3 estimator.py
   ```

### 📊 Usage:
```bash
# Generate examples
python estimator.py --example

# Run estimation
python estimator.py

# Custom input
python estimator.py --input my-backlog.json

# CSV export
python estimator.py --csv

# With config
python estimator.py --input backlog.json --config config.json
```

---

## 🟢 Option 2: Node.js/TypeScript Version

### ✅ Best For:
- Development teams
- AI integration
- Extensibility
- Professional workflows

### 📦 What to Copy:
Copy the entire `migration-package` folder:
```
migration-package/
├── src/                 # TypeScript source files (8 files)
├── package.json         # Dependencies
├── tsconfig.json        # TypeScript config
├── README.md            # Full documentation
├── QUICKSTART.md        # Quick guide
├── PROJECT_SUMMARY.md   # Technical details
├── MIGRATE_NODEJS.md    # Migration instructions
├── SETUP.bat            # Windows setup script
├── SETUP.sh             # Linux/Mac setup script
└── .gitignore           # Git ignore rules
```

### 🚀 Setup on New Computer:

#### Windows:
1. **Check Node.js:**
   ```cmd
   node --version
   ```
   Need Node.js 18+? Download: https://nodejs.org/

2. **Copy folder** to new computer

3. **Run setup:**
   - Double-click `SETUP.bat`
   - Or manually:
     ```cmd
     npm install
     npm run estimate -- --example
     ```

4. **Verify:**
   ```cmd
   npm run estimate
   ```

#### Mac/Linux:
1. **Check Node.js:**
   ```bash
   node --version
   ```

2. **Copy folder** to new computer

3. **Run setup:**
   ```bash
   chmod +x SETUP.sh
   ./SETUP.sh
   ```
   Or manually:
   ```bash
   npm install
   npm run estimate -- --example
   ```

4. **Verify:**
   ```bash
   npm run estimate
   ```

### 📊 Usage:
```bash
# Generate examples
npm run estimate -- --example

# Run estimation
npm run estimate

# Custom input
npm run estimate -- --input my-backlog.json

# CSV export
npm run estimate -- --csv

# View AI prompts
npm run estimate -- --prompts

# Help
npm run estimate -- --help
```

---

## 🔄 Migration Methods

### Method 1: USB Drive
1. Copy `standalone-python` or `migration-package` to USB
2. Transfer to new computer
3. Run setup script

### Method 2: Network Share
1. Copy folder to shared network drive
2. Access from new computer
3. Run setup script

### Method 3: Zip File
1. Compress `standalone-python` or `migration-package`
2. Email or transfer zip
3. Extract on new computer
4. Run setup script

### Method 4: Git (for Node.js version)
1. Initialize git in project folder
2. Push to private repository
3. Clone on new computer
4. Run `npm install`

---

## 📊 Feature Comparison

| Feature | Python | Node.js |
|---------|--------|---------|
| **Setup** | ✅ Instant | ⏱️ ~1 min (npm install) |
| **Dependencies** | ✅ None | ❌ ~50 packages |
| **File Count** | ✅ 1 main file | ❌ 8+ files |
| **T-Shirt Mapping** | ✅ | ✅ |
| **Role Estimation** | ✅ | ✅ |
| **Multipliers** | ✅ | ✅ |
| **Holiday Handling** | ✅ | ✅ |
| **Team Allocation** | ✅ | ✅ |
| **Cost Calculation** | ✅ | ✅ |
| **Timeline** | ✅ | ✅ |
| **JSON Export** | ✅ | ✅ |
| **CSV Export** | ✅ | ✅ |
| **Console Output** | ✅ | ✅ |
| **AI Prompts** | ❌ | ✅ |
| **Modular Code** | ❌ | ✅ |
| **Type Safety** | ❌ | ✅ |
| **Extensibility** | ⚠️ Limited | ✅ Easy |

---

## 🎯 Which Version to Use?

### Choose Python If:
- ❌ No Node.js on target computer
- ✅ Need quick setup
- ✅ Want single file
- ✅ Simple estimation needs
- ✅ No development/extension planned

### Choose Node.js If:
- ✅ Node.js available
- ✅ Need AI integration
- ✅ Want to customize/extend
- ✅ Professional development
- ✅ Team collaboration

---

## 🔧 Customization After Migration

### Python Version:
Edit `estimator.py` directly:
- Line 21-29: `TSHIRT_HOURS` - T-shirt sizes
- Line 31-38: `ROLE_RATES` - Hourly rates
- Line 40-48: `DEFAULT_CONFIG` - Defaults
- Line 50: `QA_RATIO` - QA to dev ratio

### Node.js Version:
Edit `src/config.ts`:
- T-shirt hours mapping
- Role rates
- Default parameters
- QA ratio
- Allocation patterns

---

## 🆘 Troubleshooting

### Python Version:

**"python is not recognized"**
- Install Python: https://www.python.org/
- Or try `python3` instead of `python`

**Estimates seem wrong**
- Check T-shirt sizes in backlog.json
- Adjust multipliers in config.json
- Modify TSHIRT_HOURS in estimator.py

### Node.js Version:

**"npm is not recognized"**
- Install Node.js: https://nodejs.org/
- Restart terminal after installation

**"npm install fails"**
- Check internet connection
- Try: `npm install --legacy-peer-deps`
- Delete `node_modules` folder and retry

**TypeScript errors**
- Run: `npm run build`
- Check TypeScript version: `npx tsc --version`

---

## 📋 Pre-Migration Checklist

### Before You Copy:
- [ ] Decide which version (Python or Node.js)
- [ ] Check if target computer has Python/Node.js
- [ ] Backup any custom configurations
- [ ] Document your customizations

### Files to Copy:
#### Python:
- [ ] standalone-python/ entire folder
- [ ] Any custom backlog.json files

#### Node.js:
- [ ] migration-package/ entire folder
- [ ] Any custom backlog/config files
- [ ] Custom modifications to src/

### After Migration:
- [ ] Run setup script
- [ ] Generate example files
- [ ] Run test estimation
- [ ] Verify output format
- [ ] Test CSV export
- [ ] Re-apply customizations

---

## 💡 Pro Tips

1. **Keep both versions** - Python for quick checks, Node.js for full features

2. **Version control** - For Node.js version, use Git for tracking changes

3. **Backup configs** - Save your custom backlog.json and config.json

4. **Test before migration** - Verify on source computer first

5. **Document changes** - Note any rate/multiplier customizations

6. **Share configurations** - Export config.json for team consistency

---

## 📦 Quick Migration Commands

### Copy Python Version:
```bash
# Windows
xcopy /E /I standalone-python Z:\destination\

# Linux/Mac
cp -r standalone-python /destination/
```

### Copy Node.js Version:
```bash
# Windows
xcopy /E /I migration-package Z:\destination\

# Linux/Mac
cp -r migration-package /destination/
```

### Create Zip for Transfer:
```bash
# Windows PowerShell
Compress-Archive -Path standalone-python -DestinationPath estimator-python.zip
Compress-Archive -Path migration-package -DestinationPath estimator-nodejs.zip

# Linux/Mac
zip -r estimator-python.zip standalone-python/
zip -r estimator-nodejs.zip migration-package/
```

---

## 🎉 Migration Complete Checklist

- [ ] Files copied successfully
- [ ] Dependencies installed (if Node.js)
- [ ] Example files generated
- [ ] Test estimation runs
- [ ] Output files created
- [ ] Custom configs applied
- [ ] Documentation accessible
- [ ] Team members trained

---

## 📚 Additional Resources

### Python Version:
- `standalone-python/README.md` - Python docs
- `standalone-python/estimator.py` - View source for customization

### Node.js Version:
- `migration-package/README.md` - Complete documentation
- `migration-package/QUICKSTART.md` - Quick reference
- `migration-package/PROJECT_SUMMARY.md` - Technical details
- `migration-package/MIGRATE_NODEJS.md` - Migration guide

---

**You're ready to migrate!** Choose your version and follow the steps above.






