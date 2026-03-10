# Usage Examples

This document provides real-world examples of using the Google Docs Content Generator.

## Example 1: Merging Sprint Documentation

### Scenario
You have multiple sprint documents that need to be consolidated into a single Google Doc.

### Files
```
D:\Projects\SprintHealth\
├── Contenido_Consolidado_Sprint1.docx
├── Contenido_Consolidado_Sprint2.docx
├── Contenido_Consolidado_Sprint3.docx
└── Contenido_Consolidado_Sprint4.docx
```

### Steps

1. **Run the tool**
   ```bash
   python src/main.py
   ```

2. **Enter configuration**
   ```
   Keyword: Contenido Consolidado
   Path: D:\Projects\SprintHealth
   File Type: DOCX
   Document Title: SprintHealth Complete Documentation
   ```

3. **Skip sample analysis** (or provide one file as sample)

4. **Review discovered files**
   ```
   Found 4 file(s) to process
   ✓ Found: Contenido_Consolidado_Sprint1.docx
   ✓ Found: Contenido_Consolidado_Sprint2.docx
   ✓ Found: Contenido_Consolidado_Sprint3.docx
   ✓ Found: Contenido_Consolidado_Sprint4.docx
   ```

5. **Order the files** (new feature!)
   ```
   Found Files (Current Order):
   #  File Name
   1  Contenido_Consolidado_Sprint1.docx
   2  Contenido_Consolidado_Sprint2.docx
   3  Contenido_Consolidado_Sprint3.docx
   4  Contenido_Consolidado_Sprint4.docx

   Would you like to change the order of files? (Y/n): n
   Using default order (as listed above)
   ```

   Or if you want to merge them in a different order (e.g., Sprint 4, 3, 2, 1):
   ```
   Would you like to change the order of files? (Y/n): y
   Enter order (numbers 1-4): 4 3 2 1

   New Order:
   1  Contenido_Consolidado_Sprint4.docx
   2  Contenido_Consolidado_Sprint3.docx
   3  Contenido_Consolidado_Sprint2.docx
   4  Contenido_Consolidado_Sprint1.docx

   Is this order correct? (Y/n): y
   ✓ File order confirmed
   ```

6. **Watch processing**
   ```
   | File Name                          | Processed | Merged | QA Passed |
   |------------------------------------|-----------|--------|-----------|
   | Contenido_Consolidado_Sprint1.docx | Y         | Y      | Y         |
   | Contenido_Consolidado_Sprint2.docx | Y         | Y      | Y         |
   | Contenido_Consolidado_Sprint3.docx | Y         | Y      | Y         |
   | Contenido_Consolidado_Sprint4.docx | Y         | Y      | Y         |
   ```

7. **QA Results**
   ```
   ✓ Check 1: Character count verification... PASSED
   ✓ Check 2: Word count verification... PASSED
   ✓ Check 3: Content presence verification... PASSED
   ✓ Check 4: Summarization detection... PASSED
   ✓ Check 5: Sentence-level verification... PASSED

   ✓ All QA checks passed!
   ```

8. **Result**
   ```
   ✓ Success!

   Google Doc created successfully!
   URL: https://docs.google.com/document/d/abc123xyz.../edit

   Files processed: 4
   QA Status: PASSED
   ```

### Expected Output Document Structure

The Google Doc will have:
- All sections merged by title
- Content from all 4 sprints under each section
- Professional formatting with headings
- No content loss or summarization

---

## Example 2: Merging Markdown Documentation Files

### Scenario
You have README files from multiple repositories that need to be combined.

### Files
```
/home/user/docs/
├── project-A-README.md
├── project-B-README.md
└── project-C-README.md
```

### Steps

1. **Run the tool**
   ```bash
   python src/main.py
   ```

2. **Enter configuration**
   ```
   Keyword: README
   Path: /home/user/docs
   File Type: MD
   Document Title: Combined Project Documentation
   ```

3. **Processing**
   - Tool detects markdown headers (# ## ###)
   - Merges sections with matching headers
   - Preserves markdown formatting

4. **Google Doc Result**
   - Headers converted to Heading 1, 2, 3 styles
   - Code blocks preserved as-is
   - Lists maintained
   - Links functional

---

## Example 3: Merging PDF Reports

### Scenario
Quarterly reports in PDF format need consolidation.

### Files
```
C:\Reports\2024\
├── Q1_Report_Consolidated.pdf
├── Q2_Report_Consolidated.pdf
├── Q3_Report_Consolidated.pdf
└── Q4_Report_Consolidated.pdf
```

### Steps

1. **Enter configuration**
   ```
   Keyword: Report_Consolidated
   Path: C:\Reports\2024
   File Type: PDF
   Document Title: 2024 Annual Report
   ```

2. **Special Considerations for PDF**
   - PDFs are merged sequentially
   - Page breaks preserved with separators
   - Metadata extracted if available
   - Tables extracted as text

3. **QA Note**
   - PDF extraction may have minor formatting differences
   - QA tolerance accounts for this
   - Review final document for table formatting

---

## Example 4: Merging Plain Text Meeting Notes

### Scenario
Consolidate meeting notes from text files.

### Files
```
~/meetings/
├── team-meeting-2024-01.txt
├── team-meeting-2024-02.txt
├── team-meeting-2024-03.txt
└── team-meeting-2024-04.txt
```

### Steps

1. **Enter configuration**
   ```
   Keyword: team-meeting
   Path: ~/meetings
   File Type: TXT
   Document Title: Q1 Team Meeting Notes
   ```

2. **Text File Processing**
   - Tool detects section headers (ALL CAPS lines, underlined headers)
   - Merges by detected sections
   - Preserves all content verbatim

3. **Result**
   - Chronological consolidation
   - All notes in single document
   - Section breaks for clarity

---

## Example 5: Handling QA Failures

### Scenario
Sometimes QA might fail due to encoding issues or duplicates.

### What Happens

```
Running QA Verification...
  ✓ Check 1: Character count verification... PASSED
  ✓ Check 2: Word count verification... PASSED
  ✗ Check 3: Content presence verification... FAILED
  ✓ Check 4: Summarization detection... PASSED
  ✓ Check 5: Sentence-level verification... PASSED

✗ QA checks failed with 1 issues

Issues found:
  - File 'document_3.pdf' has 15 potentially missing sentences

QA verification detected issues.
Do you want to continue creating the Google Doc anyway? (y/n):
```

### Options

**Option 1: Abort and investigate**
```
n
Operation cancelled due to QA failure.
```
Then manually check `document_3.pdf` for issues.

**Option 2: Proceed anyway**
```
y
Creating Google Doc...
✓ Success!
```
Then manually verify the Google Doc content.

**Option 3: Save locally first**
If Google Doc creation fails:
```
Error creating Google Doc: [error details]
Content was merged successfully but Google Doc creation failed.

Would you like to save the merged content locally? (y/n): y
Content saved to: google-docs-generator/output/merged_content.txt
```

---

## Example 6: Using Sample Analysis

### Scenario
Your documents have complex structure that you want the tool to understand.

### Steps

1. **Prepare a representative sample**
   - Choose one file that represents the structure
   - Place it in an accessible location

2. **When prompted for sample**
   ```
   Would you like to upload a sample document for structure analysis? (Y/n): Y
   Enter path to sample DOCX file: ./samples/sample_structure.docx

   ✓ Sample analyzed successfully
     Structure: hierarchical
     Merge Strategy: section_based
   ```

3. **Benefit**
   - Tool optimizes merge strategy
   - Better section detection
   - Improved output structure

---

## Tips for Best Results

### 1. File Naming
Use consistent keywords in filenames:
- ✓ Good: `Report_Q1_2024.pdf`, `Report_Q2_2024.pdf`
- ✗ Bad: `First Quarter.pdf`, `2024-Q2-final-v2.pdf`

### 2. File Structure
Maintain consistent structure across files:
- Use same heading levels
- Similar section names
- Consistent formatting

### 3. Keyword Selection
Choose specific keywords:
- ✓ Specific: `Consolidated_Report`
- ✗ Too broad: `Report`

### 4. Path Selection
Use absolute paths for reliability:
- ✓ Good: `/home/user/documents/project`
- ✓ Also good: `C:\Users\Name\Documents\Project`
- ⚠ Works but risky: `../documents` (relative)

### 5. Document Title
Use descriptive titles:
- ✓ Good: `Q1-Q4 2024 Consolidated Marketing Reports`
- ✗ Bad: `Merged Document`

### 6. Batch Size
Start small, then scale:
- First run: 2-3 files
- After verification: Full batch
- For 100+ files: Split into batches

### 7. QA Review
Always review QA output:
- Check percentages
- Review issues if any
- Spot-check final Google Doc

---

## Advanced Usage Patterns

### Pattern 1: Incremental Merging

If you have many files, merge in stages:

**Stage 1: Merge files 1-10**
```
Keyword: batch1_
Title: Consolidated Batch 1
```

**Stage 2: Merge files 11-20**
```
Keyword: batch2_
Title: Consolidated Batch 2
```

**Stage 3: Manually merge batches in Google Docs**

### Pattern 2: Department-Specific Merging

Organize by department:

```
Keyword: HR_Report
Title: HR Department Reports 2024

Keyword: Engineering_Report
Title: Engineering Department Reports 2024
```

### Pattern 3: Date-Range Filtering

Use date in keywords:

```
Keyword: 2024-Q1
Keyword: 2024-Q2
Keyword: 2024-Q3
Keyword: 2024-Q4
```

---

## Troubleshooting Common Scenarios

### Scenario: No files found

**Check:**
1. Keyword spelling
2. File extension
3. Path accuracy
4. Case sensitivity (though search is case-insensitive)

### Scenario: QA fails on character count

**Likely causes:**
- Duplicate content in source files
- Encoding differences (UTF-8 vs Latin1)
- Hidden characters

**Solution:**
- Review source files for duplicates
- Check file encodings
- Proceed if difference is acceptable

### Scenario: Google Doc missing formatting

**Likely causes:**
- Source files don't use standard heading styles
- Text files without clear section markers

**Solution:**
- Use Word/Markdown files with proper headings
- Manually add formatting to Google Doc after creation
- Or add markdown-style headers to text files before merging

---

## Performance Expectations

| Files | Size Each | Total Time | Notes |
|-------|-----------|------------|-------|
| 3 | 10 pages | 30 sec | Fast |
| 10 | 10 pages | 1-2 min | Normal |
| 25 | 10 pages | 3-5 min | Slower |
| 50 | 10 pages | 8-12 min | Consider batching |
| 100+ | Varies | 20+ min | Definitely batch |

*Times include parsing, merging, QA, and Google Doc creation*

---

## Success Metrics

After running the tool, you should see:

✅ **100% Processed**: All files successfully parsed
✅ **100% Merged**: All content combined
✅ **100% QA Passed**: No content loss detected
✅ **Google Doc Created**: Professional document ready
✅ **< 5 minutes**: For typical batch (5-10 files)

---

**Happy merging!** 🎉

For more details, see the main README.md.
