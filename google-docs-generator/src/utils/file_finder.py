"""
File Finder Utility

Discovers files matching specified criteria (keyword, path, file type).
"""

import os
from pathlib import Path
from typing import List


class FileFinder:
    """Finds files matching specified criteria"""

    def __init__(self, console):
        """
        Initialize file finder

        Args:
            console: Rich console for output
        """
        self.console = console

    def find_files(self, path: str, keyword: str, file_type: str) -> List[str]:
        """
        Find all files matching the criteria

        Args:
            path: Directory path to search
            keyword: Keyword to match in filename
            file_type: File extension (PDF, MD, TXT, DOC, DOCX)

        Returns:
            List of matching file paths
        """
        matching_files = []
        extension = f".{file_type.lower()}"

        self.console.print(f"[cyan]Searching for files...[/cyan]")
        self.console.print(f"  Path: {path}")
        self.console.print(f"  Keyword: '{keyword}'")
        self.console.print(f"  Type: {file_type}")

        try:
            # Walk through directory
            for root, dirs, files in os.walk(path):
                for filename in files:
                    # Check if file matches criteria
                    if keyword.lower() in filename.lower() and filename.lower().endswith(extension):
                        full_path = os.path.join(root, filename)
                        matching_files.append(full_path)
                        self.console.print(f"  [green]✓[/green] Found: {filename}")

            if not matching_files:
                self.console.print(f"[yellow]No files found matching criteria[/yellow]")

            return sorted(matching_files)

        except Exception as e:
            self.console.print(f"[red]Error searching for files: {str(e)}[/red]")
            return []

    def validate_file_access(self, file_path: str) -> bool:
        """
        Validate that a file exists and is readable

        Args:
            file_path: Path to file

        Returns:
            bool: True if file is accessible
        """
        try:
            if not os.path.exists(file_path):
                self.console.print(f"[red]File not found: {file_path}[/red]")
                return False

            if not os.path.isfile(file_path):
                self.console.print(f"[red]Not a file: {file_path}[/red]")
                return False

            if not os.access(file_path, os.R_OK):
                self.console.print(f"[red]File not readable: {file_path}[/red]")
                return False

            return True

        except Exception as e:
            self.console.print(f"[red]Error validating file: {str(e)}[/red]")
            return False
