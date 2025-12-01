# Setup Guide - Google Docs Content Generator

This guide will walk you through setting up the Google Docs Content Generator from scratch.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Python 3.8 or higher installed
- [ ] pip (Python package manager)
- [ ] A Google account
- [ ] Internet connection
- [ ] Administrative access to install Python packages

## Installation Steps

### Step 1: Verify Python Installation

Open a terminal/command prompt and run:

```bash
python --version
```

You should see Python 3.8 or higher. If not, download from [python.org](https://www.python.org/).

### Step 2: Navigate to Project Directory

```bash
cd google-docs-generator
```

### Step 3: Install Python Dependencies

```bash
pip install -r requirements.txt
```

**Expected output**: List of packages being installed

**If you encounter errors**:
- Try `pip3` instead of `pip`
- Use `python -m pip install -r requirements.txt`
- On Linux/Mac, you may need `sudo pip install -r requirements.txt`

### Step 4: Verify Installation

```bash
python -c "import google.auth; import PyPDF2; import docx; import rich; print('All packages installed successfully!')"
```

You should see: `All packages installed successfully!`

## Google Docs API Configuration

This is the most important part of the setup.

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click the project dropdown (top left)
   - Click "NEW PROJECT"
   - Project name: `ContentMerger` (or your choice)
   - Click "CREATE"
   - Wait for project creation (15-30 seconds)

3. **Select Your Project**
   - Click the project dropdown again
   - Select your newly created project

### Step 2: Enable Google Docs API

1. **Navigate to APIs & Services**
   - In the left sidebar, click "APIs & Services"
   - Click "Library"

2. **Find Google Docs API**
   - In the search box, type: `Google Docs API`
   - Click on "Google Docs API" from results

3. **Enable the API**
   - Click the blue "ENABLE" button
   - Wait 5-10 seconds for activation

### Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**
   - Left sidebar → "OAuth consent screen"

2. **Choose User Type**
   - Select "External"
   - Click "CREATE"

3. **Fill App Information**
   - App name: `Content Merger`
   - User support email: Your email
   - Developer contact: Your email
   - Click "SAVE AND CONTINUE"

4. **Add Scopes**
   - Click "ADD OR REMOVE SCOPES"
   - Search for: `Google Docs API`
   - Check: `https://www.googleapis.com/auth/documents`
   - Click "UPDATE"
   - Click "SAVE AND CONTINUE"

5. **Add Test Users**
   - Click "+ ADD USERS"
   - Enter your Google email
   - Click "ADD"
   - Click "SAVE AND CONTINUE"

6. **Review and Complete**
   - Click "BACK TO DASHBOARD"

### Step 4: Create OAuth Credentials

1. **Go to Credentials**
   - Left sidebar → "Credentials"
   - Click "+ CREATE CREDENTIALS"
   - Select "OAuth client ID"

2. **Configure OAuth Client**
   - Application type: "Desktop app"
   - Name: `ContentMergerDesktop`
   - Click "CREATE"

3. **Download Credentials**
   - A dialog appears with your client ID and secret
   - Click "DOWNLOAD JSON"
   - Save the file

4. **Rename and Move File**
   - Rename the downloaded file to `credentials.json`
   - Move it to your `google-docs-generator` directory

   ```bash
   # Example (adjust path to your download location)
   mv ~/Downloads/client_secret_*.json google-docs-generator/credentials.json
   ```

### Step 5: First Authentication

1. **Run the tool**
   ```bash
   cd google-docs-generator
   python src/main.py
   ```

2. **Browser Opens Automatically**
   - Your default browser will open
   - You'll see "Google hasn't verified this app"
   - Click "Advanced"
   - Click "Go to Content Merger (unsafe)"
   - This is safe - it's your own app!

3. **Grant Permissions**
   - Click "Allow" to grant document access
   - The browser shows "The authentication flow has completed"
   - Close the browser tab

4. **Token Saved**
   - A `token.pickle` file is created
   - Future runs won't require browser authentication
   - Token expires after some time, then re-auth is automatic

## Verify Complete Setup

Run this verification script:

```bash
python src/main.py
```

You should see:
1. Banner with "Google Docs Content Generator"
2. Prompt asking for keyword
3. No error messages about missing credentials

## Directory Structure Check

Your directory should look like:

```
google-docs-generator/
├── src/
│   ├── main.py
│   ├── cli/
│   ├── parsers/
│   ├── merger/
│   ├── google_docs/
│   ├── qa/
│   └── utils/
├── requirements.txt
├── credentials.json          ← You created this
├── token.pickle             ← Auto-generated on first run
└── README.md
```

## Common Setup Issues

### Issue 1: "ModuleNotFoundError: No module named 'google'"

**Cause**: Dependencies not installed

**Fix**:
```bash
pip install -r requirements.txt
```

### Issue 2: "credentials.json not found"

**Cause**: Credentials file missing or in wrong location

**Fix**:
1. Check file exists: `ls credentials.json`
2. Verify it's in `google-docs-generator` directory
3. Re-download from Google Cloud Console if needed

### Issue 3: "Access denied" or "403 Forbidden"

**Cause**: API not enabled or wrong scopes

**Fix**:
1. Return to Google Cloud Console
2. Verify Google Docs API is enabled
3. Check OAuth consent screen has correct scope
4. Delete `token.pickle` and re-authenticate

### Issue 4: "Invalid client secrets"

**Cause**: Wrong credentials file or corrupted

**Fix**:
1. Delete `credentials.json`
2. Re-create OAuth credentials in Google Cloud Console
3. Download fresh `credentials.json`

### Issue 5: Browser doesn't open automatically

**Cause**: System may not support auto-browser launch

**Fix**:
1. Look for URL in terminal output
2. Manually copy and paste URL into browser
3. Complete authentication there

## Testing Your Setup

Create a simple test:

1. **Create test directory**
   ```bash
   mkdir test-files
   cd test-files
   ```

2. **Create test file**
   ```bash
   echo "Test Content Document 1" > test_content_1.txt
   echo "This is sample content." >> test_content_1.txt
   echo "" >> test_content_1.txt
   echo "Test Content Document 2" > test_content_2.txt
   echo "More sample content here." >> test_content_2.txt
   ```

3. **Run the tool**
   ```bash
   cd ..
   python src/main.py
   ```

4. **Enter test parameters**
   - Keyword: `test_content`
   - Path: `./test-files`
   - File Type: TXT
   - Title: `Test Merge`

5. **Verify results**
   - Files should be found
   - Processing should complete
   - QA should pass
   - Google Doc URL should be provided

6. **Check Google Doc**
   - Open the provided URL
   - Verify content from both files is present
   - Check formatting looks professional

## Next Steps

Once setup is complete:

1. **Read the main README.md** for usage instructions
2. **Try with your real documents** starting with a small batch
3. **Review QA output** to understand verification process
4. **Bookmark the Google Cloud Console** for managing API access

## Security Recommendations

- [ ] Keep `credentials.json` secure (don't share publicly)
- [ ] Add `credentials.json` to `.gitignore` if using version control
- [ ] Add `token.pickle` to `.gitignore`
- [ ] Periodically review OAuth access in Google Account settings
- [ ] Delete `token.pickle` if you suspect compromise (re-auth required)

## Need Help?

If you're stuck:

1. Re-read this guide carefully
2. Check error messages for specific issues
3. Verify each step was completed
4. Try the test procedure above
5. Review Google Cloud Console for API/credential status

## Appendix: Quick Command Reference

```bash
# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import google.auth; print('OK')"

# Run the tool
python src/main.py

# Check current directory
pwd

# List files
ls -la

# Remove token to force re-authentication
rm token.pickle
```

---

**Setup complete!** You're ready to merge content into Google Docs.
