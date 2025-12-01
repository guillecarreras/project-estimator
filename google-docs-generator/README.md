# Google Docs Content Generator

A powerful, professional tool to merge content from multiple source files into Google Docs with character-by-character verification and quality assurance.

## Features

- 🔍 **Smart File Discovery**: Find files by keyword matching in filenames
- 📄 **Multi-Format Support**: PDF, Markdown (.md), Plain Text (.txt), Word Documents (.doc/.docx)
- 🔄 **Real-Time Progress**: Live table display showing processing status for each file
- ✅ **Comprehensive QA Verification**: Character-by-character content validation to ensure no summarization or rephrasing
- 📊 **Google Docs Integration**: Automated professional document creation with formatting
- 🎯 **No Content Loss**: Exact copy preserving original content integrity
- 📈 **Progress Tracking**: Visual feedback with Processed/Merged/QA Passed status for each file
- 🎨 **Professional Formatting**: Automatic heading detection and styling in Google Docs

## Table of Contents

- [Installation](#installation)
- [Google Docs API Setup](#google-docs-api-setup)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [QA Process](#qa-process)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)
- [Project Structure](#project-structure)

## Installation

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Google account
- Internet connection for Google Docs API

### Step 1: Install Dependencies

```bash
cd google-docs-generator
pip install -r requirements.txt
```

This will install all required packages:
- `google-api-python-client` - Google Docs API client
- `PyPDF2` - PDF parsing
- `python-docx` - Word document parsing
- `markdown` - Markdown parsing
- `rich` - Beautiful terminal output
- And more (see requirements.txt)

## Google Docs API Setup

To use this tool, you need to set up Google Docs API credentials:

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Name your project (e.g., "Content Merger")

### Step 2: Enable Google Docs API

1. In your project, go to "APIs & Services" > "Library"
2. Search for "Google Docs API"
3. Click "Enable"

### Step 3: Create Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "+ CREATE CREDENTIALS" > "OAuth client ID"
3. If prompted, configure the OAuth consent screen:
   - Choose "External" user type
   - Fill in app name, user support email, and developer contact
   - Add scope: `https://www.googleapis.com/auth/documents`
   - Add your email as a test user
4. For application type, select "Desktop app"
5. Name it (e.g., "Content Merger Desktop")
6. Click "Create"

### Step 4: Download Credentials

1. Download the credentials file (JSON)
2. Rename it to `credentials.json`
3. Place it in the `google-docs-generator` directory

### Step 5: First-Time Authentication

The first time you run the tool, it will:
1. Open your browser for Google authentication
2. Ask you to grant permissions
3. Save a `token.pickle` file for future use

## Usage

### Run the Tool

```bash
cd google-docs-generator
python src/main.py
```

### Interactive Workflow

The tool will guide you through an interactive process:

#### Step 1: Configuration

You'll be asked to provide:

1. **Keyword to match files**: Enter a keyword that appears in your source filenames
   - Example: `Contenido Consolidado`
   - The tool searches for files containing this keyword (case-insensitive)

2. **Path to search**: Enter the directory path to search for files
   - Example: `/home/user/documents`
   - Can use relative or absolute paths
   - The tool will recursively search subdirectories

3. **File type**: Select from:
   - PDF (`.pdf`)
   - Markdown (`.md`)
   - Plain Text (`.txt`)
   - Word Document (`.doc` or `.docx`)

4. **Document title**: Enter a title for the generated Google Doc
   - Default: "Merged Content Document"

#### Step 2: Sample Analysis (Optional)

Upload a sample document for the tool to analyze its structure. This helps optimize the merge strategy.

#### Step 3: File Discovery

The tool will search for matching files and display them for review.

#### Step 4: Processing

Watch real-time progress as files are processed:

```
| File Name                 | Processed | Merged | QA Passed |
|---------------------------|-----------|--------|-----------|
| Document_1.pdf            | Y         | Y      | Y         |
| Document_2.pdf            | Y         | Y      | Y         |
| Document_3.pdf            | Y         | Y      | Y         |
```

#### Step 5: QA Verification

The tool performs comprehensive quality checks:
- ✓ Character count verification
- ✓ Word count verification
- ✓ Content presence verification
- ✓ Summarization detection
- ✓ Sentence-level verification

#### Step 6: Google Doc Creation

If QA passes, a professional Google Doc is created and the URL is displayed.

## How It Works

### File Discovery

The `FileFinder` utility:
1. Recursively walks through the specified directory
2. Matches files by keyword (case-insensitive)
3. Filters by file extension
4. Returns sorted list of matching files

### Content Parsing

Different parsers handle different file types:

- **PDFParser**: Extracts text page by page, preserves metadata
- **MarkdownParser**: Parses markdown syntax, detects heading hierarchy
- **TxtParser**: Detects section headers using common patterns
- **DocParser**: Extracts paragraphs with styling, handles tables

### Content Merging

The `ContentMerger`:
1. Groups content by sections with matching titles
2. Preserves subsections from each source file
3. Maintains character-by-character accuracy
4. Builds hierarchical structure

### QA Verification

The `QAVerifier` performs 5 independent checks:

1. **Character Count**: Ensures total characters match (±5% tolerance for formatting)
2. **Word Count**: Verifies word counts match (±5% tolerance)
3. **Content Presence**: Checks that 90%+ of source sentences appear in merged content
4. **Summarization Detection**: Flags if merged content is <85% of original length
5. **Sentence Verification**: Samples sentences to verify verbatim copying (80%+ match rate)

### Google Docs Creation

The `GoogleDocsCreator`:
1. Authenticates with Google Docs API
2. Creates a new document
3. Inserts merged content
4. Applies formatting:
   - Detects markdown-style headings (# ## ###)
   - Applies heading styles (Heading 1, 2, 3)
   - Sets professional margins (1 inch)
   - Uses Arial 11pt font

## QA Process

The QA verification is the heart of this tool, ensuring no content is lost, summarized, or rephrased.

### What It Checks

| Check | Description | Tolerance |
|-------|-------------|-----------|
| Character Count | Total characters match | ±5% |
| Word Count | Total words match | ±5% |
| Content Presence | Source sentences found | 90%+ |
| Summarization | Content not shortened | 85%+ retention |
| Sentence Verification | Verbatim copying | 80%+ exact match |

### Interpreting Results

**QA Passed ✓**
- All checks passed
- Safe to use merged content
- Google Doc created automatically

**QA Failed ✗**
- Issues detected and listed
- Option to proceed anyway or abort
- Can save content locally for review

### Example QA Output

```
Running QA Verification...
  Check 1: Character count verification...
  Check 2: Word count verification...
  Check 3: Content presence verification...
  Check 4: Summarization detection...
  Check 5: Sentence-level verification...

✓ All QA checks passed!

Final Processing Summary
─────────────────────────
Total Files:     5
Processed:       5/5 (100.0%)
Merged:          5/5 (100.0%)
QA Passed:       5/5 (100.0%)
```

## Examples

### Example 1: Merging Sprint Health Documents

```
Keyword: Contenido Consolidado
Path: D:\Gen AI\Claude - SprintHealth Artifacts
File Type: DOCX
Document Title: SprintHealth Consolidated Content

Found 3 files:
  ✓ Contenido_Consolidado_Sprint1.docx
  ✓ Contenido_Consolidado_Sprint2.docx
  ✓ Contenido_Consolidado_Sprint3.docx

Processing...
  Document 1: Processed ✓ Merged ✓ QA Passed ✓
  Document 2: Processed ✓ Merged ✓ QA Passed ✓
  Document 3: Processed ✓ Merged ✓ QA Passed ✓

Google Doc created: https://docs.google.com/document/d/...
```

### Example 2: Merging Markdown Documentation

```
Keyword: README
Path: ./docs
File Type: MD
Document Title: Complete Documentation

Found 5 files...
Processing complete!
QA Status: PASSED
```

## Troubleshooting

### Issue: "credentials.json not found"

**Solution**: Download credentials from Google Cloud Console and place in project directory

### Issue: "Authentication failed"

**Solution**:
1. Delete `token.pickle` if it exists
2. Run the tool again
3. Re-authenticate when prompted

### Issue: "QA Verification failed"

**Possible causes**:
- Source files contain duplicate content
- Files are very different in structure
- Encoding issues in source files

**Solution**:
- Review QA issues in output
- Check source files manually
- Proceed anyway if differences are acceptable

### Issue: "No files found matching criteria"

**Solution**:
- Check keyword spelling
- Verify path exists and is correct
- Ensure file extension matches
- Try broader keyword

### Issue: "Google API quota exceeded"

**Solution**:
- Wait 24 hours for quota reset
- Request quota increase in Google Cloud Console

## Project Structure

```
google-docs-generator/
├── src/
│   ├── main.py                    # Main entry point
│   ├── cli/
│   │   ├── __init__.py
│   │   └── interactive.py         # Interactive CLI
│   ├── parsers/
│   │   ├── __init__.py
│   │   ├── pdf_parser.py          # PDF parsing
│   │   ├── markdown_parser.py     # Markdown parsing
│   │   ├── txt_parser.py          # Text parsing
│   │   └── doc_parser.py          # Word document parsing
│   ├── merger/
│   │   ├── __init__.py
│   │   └── content_merger.py      # Content merging logic
│   ├── google_docs/
│   │   ├── __init__.py
│   │   └── docs_creator.py        # Google Docs API integration
│   ├── qa/
│   │   ├── __init__.py
│   │   └── verifier.py            # QA verification
│   └── utils/
│       ├── __init__.py
│       ├── file_finder.py         # File discovery
│       └── progress_tracker.py    # Progress tracking
├── samples/                        # Sample input files
├── output/                         # Local output (fallback)
├── requirements.txt                # Python dependencies
├── credentials.json               # Google API credentials (you provide)
├── token.pickle                   # Auth token (auto-generated)
└── README.md                      # This file
```

## Advanced Configuration

### Customizing QA Tolerances

Edit `src/qa/verifier.py` to adjust tolerance levels:

```python
# Character count tolerance (default 5%)
tolerance = 0.05

# Summarization threshold (default 85%)
if reduction_ratio < 0.85:
    # Flag as summarized
```

### Customizing Merge Strategy

Edit `src/merger/content_merger.py` to change how sections are merged:

```python
def merge(self, all_content, sample_analysis):
    # Custom merge logic here
    pass
```

### Adding New File Types

1. Create parser in `src/parsers/new_parser.py`
2. Implement `parse()` method
3. Add to `parser_map` in `main.py`

## Best Practices

1. **Test with small dataset first**: Run on 2-3 files before processing hundreds
2. **Review QA output**: Always check QA verification results
3. **Keep backups**: Don't delete original files until you verify the merged document
4. **Use specific keywords**: More specific keywords reduce false matches
5. **Check formatting**: Review Google Doc formatting, adjust markdown if needed
6. **Monitor quotas**: Google Docs API has rate limits

## Security & Privacy

- Credentials stored locally in `credentials.json`
- Token cached in `token.pickle` (local only)
- No content sent to third parties except Google Docs
- All processing happens locally
- Google Docs created in your Google account

## License

MIT License - Free to use and modify

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review error messages in console output
3. Verify Google API setup
4. Check source file format compatibility

---

**Built with Python, Google Docs API, and Rich terminal UI**

Designed for merging multi-source content with complete accuracy and professional output.
