# Sample Files

This directory contains sample files for testing the Google Docs Content Generator.

## Available Samples

### sample_content_1.txt
- First test document
- Contains 5 sections: Introduction, Project Overview, Technical Requirements, Implementation Details, Conclusion
- Plain text format with section headers

### sample_content_2.txt
- Second test document
- Contains same 5 sections as first document
- Provides complementary information
- Demonstrates section-based merging

## How to Test

1. **Run the tool**:
   ```bash
   cd ..
   python src/main.py
   ```

2. **Enter test configuration**:
   - Keyword: `sample_content`
   - Path: `./samples` (or full path to samples directory)
   - File Type: `TXT`
   - Document Title: `Test Merge - Sample Content`

3. **Expected Result**:
   - 2 files found
   - Both files processed successfully
   - Content merged by section
   - QA verification passes
   - Google Doc created with all content

## Merged Document Structure

The resulting Google Doc should have:

```
INTRODUCTION
  Content from sample_content_1.txt
  Content from sample_content_2.txt

PROJECT OVERVIEW
  Content from sample_content_1.txt
  Content from sample_content_2.txt

TECHNICAL REQUIREMENTS
  Content from sample_content_1.txt
  Content from sample_content_2.txt

IMPLEMENTATION DETAILS
  Content from sample_content_1.txt
  Content from sample_content_2.txt

CONCLUSION
  Content from sample_content_1.txt
  Content from sample_content_2.txt
```

## Verification

After merging, verify:
- [ ] All sections present
- [ ] Content from both files included
- [ ] No content loss (check QA report)
- [ ] Professional formatting in Google Doc
- [ ] Section headers properly styled

## Creating Your Own Samples

To create additional test files:

1. Create a text file in this directory
2. Use consistent section headers (ALL CAPS or underlined)
3. Include the keyword in the filename
4. Run the tool with your keyword

Example filename: `sample_content_3.txt`

This allows you to test with 3 files instead of 2.
