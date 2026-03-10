"""
Progress Tracker

Real-time progress tracking with table display for file processing status.
"""

from rich.table import Table
from rich.live import Live
from rich.panel import Panel
from typing import Dict
import time


class ProgressTracker:
    """Tracks and displays real-time progress of file processing"""

    def __init__(self, console, total_files: int):
        """
        Initialize progress tracker

        Args:
            console: Rich console for output
            total_files: Total number of files to process
        """
        self.console = console
        self.total_files = total_files
        self.file_status = {}
        self.processed_count = 0
        self.live = None

    def start(self):
        """Start the progress tracking display"""
        self.console.print("[cyan]Initializing progress tracker...[/cyan]\n")

    def update_file(self, file_name: str, processed: bool, merged: bool, qa_passed: bool):
        """
        Update the status of a file

        Args:
            file_name: Name of the file
            processed: Whether file has been processed
            merged: Whether file content has been merged
            qa_passed: Whether QA verification passed
        """
        self.file_status[file_name] = {
            'processed': processed,
            'merged': merged,
            'qa_passed': qa_passed
        }

        if processed and file_name not in [f for f, s in self.file_status.items() if s['processed']]:
            self.processed_count += 1

        self._display_progress()

    def _display_progress(self):
        """Display the current progress table"""
        table = Table(show_header=True, header_style="bold magenta", title="Processing Progress")

        table.add_column("File Name", style="cyan", width=40)
        table.add_column("Processed", justify="center", style="green", width=10)
        table.add_column("Merged", justify="center", style="blue", width=10)
        table.add_column("QA Passed", justify="center", style="yellow", width=10)

        for file_name, status in self.file_status.items():
            # Truncate long filenames
            display_name = file_name if len(file_name) <= 40 else file_name[:37] + "..."

            processed_icon = "[green]Y[/green]" if status['processed'] else "[red]N[/red]"
            merged_icon = "[green]Y[/green]" if status['merged'] else "[red]N[/red]"
            qa_icon = "[green]Y[/green]" if status['qa_passed'] else "[red]N[/red]"

            table.add_row(display_name, processed_icon, merged_icon, qa_icon)

        # Add summary row
        table.add_row("", "", "", "")
        processed_total = sum(1 for s in self.file_status.values() if s['processed'])
        table.add_row(
            f"[bold]Total: {processed_total}/{self.total_files}[/bold]",
            "",
            "",
            "",
            style="bold cyan"
        )

        self.console.print("\n")
        self.console.print(table)
        self.console.print("\n")

    def display_final_summary(self):
        """Display final summary of processing"""
        processed = sum(1 for s in self.file_status.values() if s['processed'])
        merged = sum(1 for s in self.file_status.values() if s['merged'])
        qa_passed = sum(1 for s in self.file_status.values() if s['qa_passed'])

        summary = f"""
[bold cyan]Final Processing Summary[/bold cyan]

Total Files:     {self.total_files}
Processed:       {processed}/{self.total_files} ([green]{(processed/self.total_files*100):.1f}%[/green])
Merged:          {merged}/{self.total_files} ([blue]{(merged/self.total_files*100):.1f}%[/blue])
QA Passed:       {qa_passed}/{self.total_files} ([yellow]{(qa_passed/self.total_files*100):.1f}%[/yellow])
"""

        self.console.print(Panel(summary, title="[bold green]Summary[/bold green]", border_style="green"))

    def get_statistics(self) -> Dict:
        """
        Get current processing statistics

        Returns:
            dict: Statistics including counts and percentages
        """
        total = len(self.file_status)
        processed = sum(1 for s in self.file_status.values() if s['processed'])
        merged = sum(1 for s in self.file_status.values() if s['merged'])
        qa_passed = sum(1 for s in self.file_status.values() if s['qa_passed'])

        return {
            'total': total,
            'processed': processed,
            'merged': merged,
            'qa_passed': qa_passed,
            'processed_pct': (processed / total * 100) if total > 0 else 0,
            'merged_pct': (merged / total * 100) if total > 0 else 0,
            'qa_passed_pct': (qa_passed / total * 100) if total > 0 else 0
        }
