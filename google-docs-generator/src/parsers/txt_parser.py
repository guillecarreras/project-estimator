"""
Text Parser

Extracts content from plain text files while preserving structure.
"""

from typing import Dict, List
import re


class TxtParser:
    """Parse plain text documents and extract content"""

    def __init__(self, console):
        """
        Initialize text parser

        Args:
            console: Rich console for output
        """
        self.console = console

    def parse(self, file_path: str) -> Dict:
        """
        Parse a text file and extract its content

        Args:
            file_path: Path to text file

        Returns:
            dict: Parsed content with structure
        """
        self.console.print(f"[cyan]Parsing Text: {file_path}[/cyan]")

        try:
            content = {
                'file_path': file_path,
                'file_type': 'TXT',
                'text': '',
                'lines': [],
                'sections': [],
                'metadata': {}
            }

            with open(file_path, 'r', encoding='utf-8', errors='ignore') as file:
                text = file.read()
                content['text'] = text
                content['lines'] = text.split('\n')

                # Try to detect sections
                content['sections'] = self.extract_sections(text)

            self.console.print(f"[green]✓ Extracted {len(content['lines'])} lines[/green]")
            if content['sections']:
                self.console.print(f"[green]✓ Detected {len(content['sections'])} sections[/green]")

            return content

        except Exception as e:
            self.console.print(f"[red]Error parsing text: {str(e)}[/red]")
            raise

    def extract_sections(self, text: str) -> List[Dict]:
        """
        Extract sections from text based on common patterns

        Args:
            text: Raw text

        Returns:
            List of sections with their content
        """
        sections = []
        current_section = None
        lines = text.split('\n')

        for i, line in enumerate(lines):
            stripped = line.strip()

            # Detect section headers:
            # 1. All caps lines
            # 2. Lines followed by === or ---
            # 3. Numbered sections (1. Section Title)
            is_header = False
            header_title = None

            # All caps (min 3 chars, max 100 chars)
            if stripped.isupper() and 3 <= len(stripped) <= 100:
                is_header = True
                header_title = stripped

            # Check for underline style headers
            elif i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line and all(c in '=-' for c in next_line) and len(next_line) >= 3:
                    is_header = True
                    header_title = stripped

            # Numbered sections
            elif re.match(r'^\d+\.?\s+[A-Z]', stripped):
                is_header = True
                header_title = stripped

            if is_header and header_title:
                if current_section:
                    sections.append(current_section)

                current_section = {
                    'title': header_title,
                    'content': []
                }
            elif current_section:
                # Skip underline markers
                if not (stripped and all(c in '=-' for c in stripped)):
                    current_section['content'].append(line)

        if current_section:
            sections.append(current_section)

        # Join content
        for section in sections:
            section['content'] = '\n'.join(section['content']).strip()

        return sections
