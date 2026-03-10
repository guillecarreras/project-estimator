"""
PDF Parser

Extracts content from PDF files while preserving structure and formatting.
"""

import PyPDF2
from typing import Dict, List


class PDFParser:
    """Parse PDF documents and extract content"""

    def __init__(self, console):
        """
        Initialize PDF parser

        Args:
            console: Rich console for output
        """
        self.console = console

    def parse(self, file_path: str) -> Dict:
        """
        Parse a PDF file and extract its content

        Args:
            file_path: Path to PDF file

        Returns:
            dict: Parsed content with structure
        """
        self.console.print(f"[cyan]Parsing PDF: {file_path}[/cyan]")

        try:
            content = {
                'file_path': file_path,
                'file_type': 'PDF',
                'pages': [],
                'text': '',
                'metadata': {}
            }

            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)

                # Extract metadata
                if pdf_reader.metadata:
                    content['metadata'] = {
                        'title': pdf_reader.metadata.get('/Title', ''),
                        'author': pdf_reader.metadata.get('/Author', ''),
                        'subject': pdf_reader.metadata.get('/Subject', ''),
                        'creator': pdf_reader.metadata.get('/Creator', '')
                    }

                # Extract text from each page
                full_text = []
                for page_num, page in enumerate(pdf_reader.pages, 1):
                    page_text = page.extract_text()
                    content['pages'].append({
                        'page_number': page_num,
                        'text': page_text
                    })
                    full_text.append(page_text)

                content['text'] = '\n'.join(full_text)

            self.console.print(f"[green]✓ Extracted {len(content['pages'])} pages[/green]")
            return content

        except Exception as e:
            self.console.print(f"[red]Error parsing PDF: {str(e)}[/red]")
            raise

    def extract_sections(self, content: Dict) -> List[Dict]:
        """
        Extract sections from PDF content based on headings

        Args:
            content: Parsed PDF content

        Returns:
            List of sections with their content
        """
        # Simple section detection based on common patterns
        sections = []
        current_section = None
        lines = content['text'].split('\n')

        for line in lines:
            line = line.strip()
            if not line:
                continue

            # Detect section headers (all caps, or numbered)
            if line.isupper() or (len(line) < 100 and line[0].isdigit()):
                if current_section:
                    sections.append(current_section)
                current_section = {
                    'title': line,
                    'content': []
                }
            elif current_section:
                current_section['content'].append(line)

        if current_section:
            sections.append(current_section)

        return sections
