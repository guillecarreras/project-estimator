"""
Content Merger

Merges content from multiple sources while preserving exact character-by-character accuracy.
"""

from typing import List, Dict, Optional
import hashlib


class ContentMerger:
    """Merges content from multiple parsed documents"""

    def __init__(self, console):
        """
        Initialize content merger

        Args:
            console: Rich console for output
        """
        self.console = console

    def merge(self, all_content: List[Dict], sample_analysis: Optional[Dict] = None) -> str:
        """
        Merge content from multiple sources

        Args:
            all_content: List of parsed content dictionaries
            sample_analysis: Optional sample analysis for merge strategy

        Returns:
            str: Merged content
        """
        self.console.print("[cyan]Merging content from all sources...[/cyan]")

        if not all_content:
            self.console.print("[yellow]No content to merge[/yellow]")
            return ""

        # Determine merge strategy based on file type and structure
        file_type = all_content[0]['content'].get('file_type', 'TXT')

        if file_type in ['DOC', 'DOCX']:
            return self._merge_word_documents(all_content)
        elif file_type == 'MD':
            return self._merge_markdown_documents(all_content)
        elif file_type == 'PDF':
            return self._merge_pdf_documents(all_content)
        else:
            return self._merge_text_documents(all_content)

    def _merge_word_documents(self, all_content: List[Dict]) -> str:
        """
        Merge Word documents by sections

        Args:
            all_content: List of parsed Word documents

        Returns:
            str: Merged content
        """
        self.console.print("[cyan]Merging Word documents by sections...[/cyan]")

        merged_sections = {}

        # Group content by section titles
        for item in all_content:
            content = item['content']
            sections = content.get('sections', [])

            for section in sections:
                title = section['title']
                if title not in merged_sections:
                    merged_sections[title] = {
                        'title': title,
                        'level': section.get('level', 1),
                        'subsections': []
                    }

                merged_sections[title]['subsections'].append({
                    'source_file': item['file'],
                    'content': section['content'],
                    'paragraphs': section.get('paragraphs', [])
                })

        # Build merged document
        result = []

        for title, section_data in merged_sections.items():
            # Add section title
            level = section_data['level']
            heading_prefix = '#' * level
            result.append(f"{heading_prefix} {title}\n")

            # Add all subsections content
            for subsection in section_data['subsections']:
                result.append(subsection['content'])
                result.append('\n')

        merged_text = '\n'.join(result)
        self.console.print(f"[green]✓ Merged {len(merged_sections)} sections[/green]")

        return merged_text

    def _merge_markdown_documents(self, all_content: List[Dict]) -> str:
        """
        Merge Markdown documents by sections

        Args:
            all_content: List of parsed Markdown documents

        Returns:
            str: Merged content
        """
        self.console.print("[cyan]Merging Markdown documents by sections...[/cyan]")

        merged_sections = {}

        # Group content by section titles
        for item in all_content:
            content = item['content']
            sections = content.get('sections', [])

            for section in sections:
                title = section['title']
                if title not in merged_sections:
                    merged_sections[title] = {
                        'title': title,
                        'level': section.get('level', 1),
                        'subsections': []
                    }

                merged_sections[title]['subsections'].append({
                    'source_file': item['file'],
                    'content': section['content']
                })

        # Build merged document
        result = []

        for title, section_data in merged_sections.items():
            # Add section title with proper markdown heading
            level = section_data['level']
            heading_prefix = '#' * level
            result.append(f"{heading_prefix} {title}\n")

            # Add all subsections content
            for subsection in section_data['subsections']:
                result.append(subsection['content'])
                result.append('\n')

        merged_text = '\n'.join(result)
        self.console.print(f"[green]✓ Merged {len(merged_sections)} sections[/green]")

        return merged_text

    def _merge_pdf_documents(self, all_content: List[Dict]) -> str:
        """
        Merge PDF documents

        Args:
            all_content: List of parsed PDF documents

        Returns:
            str: Merged content
        """
        self.console.print("[cyan]Merging PDF documents...[/cyan]")

        result = []

        for item in all_content:
            content = item['content']
            file_name = item['file']

            # Add file separator
            result.append(f"\n{'='*80}")
            result.append(f"Source: {file_name}")
            result.append(f"{'='*80}\n")

            # Add all text
            result.append(content.get('text', ''))
            result.append('\n')

        merged_text = '\n'.join(result)
        self.console.print(f"[green]✓ Merged {len(all_content)} PDF documents[/green]")

        return merged_text

    def _merge_text_documents(self, all_content: List[Dict]) -> str:
        """
        Merge plain text documents

        Args:
            all_content: List of parsed text documents

        Returns:
            str: Merged content
        """
        self.console.print("[cyan]Merging text documents...[/cyan]")

        result = []

        for item in all_content:
            content = item['content']
            file_name = item['file']
            sections = content.get('sections', [])

            if sections:
                # Merge by sections
                result.append(f"\n{'='*80}")
                result.append(f"Source: {file_name}")
                result.append(f"{'='*80}\n")

                for section in sections:
                    result.append(f"\n{section['title']}\n")
                    result.append(section['content'])
                    result.append('\n')
            else:
                # No sections detected, merge as-is
                result.append(f"\n{'='*80}")
                result.append(f"Source: {file_name}")
                result.append(f"{'='*80}\n")
                result.append(content.get('text', ''))
                result.append('\n')

        merged_text = '\n'.join(result)
        self.console.print(f"[green]✓ Merged {len(all_content)} text documents[/green]")

        return merged_text

    def calculate_content_hash(self, content: str) -> str:
        """
        Calculate hash of content for verification

        Args:
            content: Content string

        Returns:
            str: SHA256 hash of content
        """
        return hashlib.sha256(content.encode('utf-8')).hexdigest()
