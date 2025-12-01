"""
Markdown Parser

Extracts content from Markdown files while preserving structure and formatting.
"""

import markdown
from typing import Dict, List
import re


class MarkdownParser:
    """Parse Markdown documents and extract content"""

    def __init__(self, console):
        """
        Initialize Markdown parser

        Args:
            console: Rich console for output
        """
        self.console = console

    def parse(self, file_path: str) -> Dict:
        """
        Parse a Markdown file and extract its content

        Args:
            file_path: Path to Markdown file

        Returns:
            dict: Parsed content with structure
        """
        self.console.print(f"[cyan]Parsing Markdown: {file_path}[/cyan]")

        try:
            content = {
                'file_path': file_path,
                'file_type': 'MD',
                'raw_text': '',
                'html': '',
                'sections': [],
                'metadata': {}
            }

            with open(file_path, 'r', encoding='utf-8') as file:
                raw_text = file.read()
                content['raw_text'] = raw_text

                # Convert to HTML for formatting
                content['html'] = markdown.markdown(
                    raw_text,
                    extensions=['extra', 'codehilite', 'tables']
                )

                # Extract sections
                content['sections'] = self.extract_sections(raw_text)

            self.console.print(f"[green]✓ Extracted {len(content['sections'])} sections[/green]")
            return content

        except Exception as e:
            self.console.print(f"[red]Error parsing Markdown: {str(e)}[/red]")
            raise

    def extract_sections(self, text: str) -> List[Dict]:
        """
        Extract sections from Markdown based on headers

        Args:
            text: Raw markdown text

        Returns:
            List of sections with their content
        """
        sections = []
        current_section = None
        lines = text.split('\n')

        for line in lines:
            # Detect markdown headers (# Header)
            header_match = re.match(r'^(#{1,6})\s+(.+)$', line)

            if header_match:
                if current_section:
                    sections.append(current_section)

                level = len(header_match.group(1))
                title = header_match.group(2).strip()

                current_section = {
                    'level': level,
                    'title': title,
                    'content': []
                }
            elif current_section:
                current_section['content'].append(line)
            else:
                # Content before first header
                if not sections:
                    sections.append({
                        'level': 0,
                        'title': 'Preamble',
                        'content': [line]
                    })

        if current_section:
            sections.append(current_section)

        # Join content lines
        for section in sections:
            section['content'] = '\n'.join(section['content']).strip()

        return sections

    def get_structure(self, sections: List[Dict]) -> Dict:
        """
        Build hierarchical structure from sections

        Args:
            sections: List of sections

        Returns:
            dict: Hierarchical structure
        """
        structure = {
            'type': 'document',
            'children': []
        }

        stack = [structure]

        for section in sections:
            level = section.get('level', 1)

            # Pop stack to appropriate level
            while len(stack) > level:
                stack.pop()

            section_node = {
                'type': 'section',
                'level': level,
                'title': section['title'],
                'content': section['content'],
                'children': []
            }

            stack[-1]['children'].append(section_node)
            stack.append(section_node)

        return structure
