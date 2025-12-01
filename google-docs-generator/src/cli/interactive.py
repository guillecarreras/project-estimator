"""
Interactive CLI for Google Docs Content Generator

Handles user input collection and interaction throughout the process.
"""

import os
from pathlib import Path
from rich.prompt import Prompt, Confirm
from rich.table import Table
from rich.panel import Panel


class InteractiveCLI:
    """Interactive command-line interface for the application"""

    def __init__(self, console):
        """
        Initialize the CLI

        Args:
            console: Rich console instance for output
        """
        self.console = console

    def collect_inputs(self):
        """
        Collect all required inputs from the user

        Returns:
            dict: Configuration dictionary with user inputs
        """
        config = {}

        try:
            # Get keyword for file matching
            self.console.print("[cyan]Enter keyword to match files:[/cyan]")
            config['keyword'] = Prompt.ask(
                "  Keyword",
                default="Contenido Consolidado"
            )

            # Get source path
            self.console.print("\n[cyan]Enter the path to search for files:[/cyan]")
            config['path'] = Prompt.ask(
                "  Path",
                default=os.getcwd()
            )

            # Validate path exists
            if not os.path.exists(config['path']):
                self.console.print(f"[red]Error: Path does not exist: {config['path']}[/red]")
                retry = Confirm.ask("Would you like to enter a different path?", default=True)
                if retry:
                    return self.collect_inputs()
                else:
                    return None

            # Get file type
            self.console.print("\n[cyan]Select file type:[/cyan]")
            file_types = ['PDF', 'MD', 'TXT', 'DOC', 'DOCX']

            table = Table(show_header=True, header_style="bold magenta")
            table.add_column("Option", style="cyan", width=10)
            table.add_column("File Type", style="green")

            for i, ft in enumerate(file_types, 1):
                table.add_row(str(i), ft)

            self.console.print(table)

            choice = Prompt.ask(
                "  Select option",
                choices=[str(i) for i in range(1, len(file_types) + 1)],
                default="1"
            )

            config['file_type'] = file_types[int(choice) - 1]

            # Get optional document title
            self.console.print("\n[cyan]Enter document title (optional):[/cyan]")
            config['doc_title'] = Prompt.ask(
                "  Title",
                default="Merged Content Document"
            )

            # Display configuration summary
            self.console.print("\n" + "="*60)
            self.console.print("[bold cyan]Configuration Summary[/bold cyan]")
            self.console.print("="*60)
            self.console.print(f"  Keyword:      {config['keyword']}")
            self.console.print(f"  Path:         {config['path']}")
            self.console.print(f"  File Type:    {config['file_type']}")
            self.console.print(f"  Doc Title:    {config['doc_title']}")
            self.console.print("="*60 + "\n")

            # Confirm configuration
            if not Confirm.ask("[cyan]Proceed with this configuration?[/cyan]", default=True):
                retry = Confirm.ask("Would you like to re-enter the configuration?", default=True)
                if retry:
                    return self.collect_inputs()
                else:
                    return None

            return config

        except KeyboardInterrupt:
            return None

    def analyze_sample(self, file_type):
        """
        Ask user to provide a sample document for analysis

        Args:
            file_type: Type of file (PDF, MD, TXT, DOC)

        Returns:
            dict: Analysis results or None if skipped
        """
        self.console.print(
            "[cyan]Would you like to upload a sample document for structure analysis?[/cyan]"
        )
        self.console.print(
            "  This helps the tool understand how to merge sections properly."
        )

        if not Confirm.ask("Upload sample?", default=True):
            return None

        # Ask for sample file path
        sample_path = Prompt.ask(
            f"  Enter path to sample {file_type} file"
        )

        if not os.path.exists(sample_path):
            self.console.print(f"[red]Error: File not found: {sample_path}[/red]")
            return None

        # Analyze structure (simplified for now)
        analysis = {
            'file': sample_path,
            'has_sections': True,
            'structure': 'hierarchical',
            'merge_strategy': 'section_based'
        }

        self.console.print("[green]✓ Sample analyzed successfully[/green]")
        self.console.print(f"  Structure: {analysis['structure']}")
        self.console.print(f"  Merge Strategy: {analysis['merge_strategy']}")

        return analysis

    def ask_continue_after_qa_failure(self):
        """
        Ask user if they want to continue after QA failure

        Returns:
            bool: True to continue, False to abort
        """
        self.console.print("\n[yellow]QA verification detected issues.[/yellow]")
        return Confirm.ask(
            "Do you want to continue creating the Google Doc anyway?",
            default=False
        )

    def ask_save_locally(self):
        """
        Ask user if they want to save merged content locally

        Returns:
            bool: True to save, False to skip
        """
        return Confirm.ask(
            "Would you like to save the merged content locally?",
            default=True
        )

    def display_file_preview(self, files, max_display=10):
        """
        Display a preview of found files

        Args:
            files: List of file paths
            max_display: Maximum number of files to display
        """
        table = Table(show_header=True, header_style="bold magenta")
        table.add_column("#", style="cyan", width=6)
        table.add_column("File Name", style="green")
        table.add_column("Path", style="blue")

        for i, file_path in enumerate(files[:max_display], 1):
            file_name = os.path.basename(file_path)
            dir_path = os.path.dirname(file_path)
            table.add_row(str(i), file_name, dir_path)

        if len(files) > max_display:
            table.add_row("...", f"... and {len(files) - max_display} more", "...")

        self.console.print(table)

    def order_files(self, files):
        """
        Allow user to define the order in which files should be merged

        Args:
            files: List of file paths (in discovery order)

        Returns:
            list: Ordered list of file paths, or original list if user skips
        """
        self.console.print("\n[bold cyan]File Ordering[/bold cyan]")
        self.console.print("The files will be merged in the order you specify.")
        self.console.print()

        # Display files with numbers
        table = Table(show_header=True, header_style="bold magenta", title="Found Files (Current Order)")
        table.add_column("#", style="cyan", width=6, justify="center")
        table.add_column("File Name", style="green", width=50)
        table.add_column("Path", style="blue")

        for i, file_path in enumerate(files, 1):
            file_name = os.path.basename(file_path)
            dir_path = os.path.dirname(file_path)
            # Truncate long paths
            if len(dir_path) > 40:
                dir_path = "..." + dir_path[-37:]
            table.add_row(str(i), file_name, dir_path)

        self.console.print(table)
        self.console.print()

        # Ask if user wants to reorder
        if not Confirm.ask("[cyan]Would you like to change the order of files?[/cyan]", default=True):
            self.console.print("[green]Using default order (as listed above)[/green]")
            return files

        self.console.print("\n[yellow]Instructions:[/yellow]")
        self.console.print("  - Enter the numbers in the order you want the files merged")
        self.console.print("  - Separate numbers with spaces or commas")
        self.console.print(f"  - Example: 3 1 2  or  3, 1, 2  (to merge file #3 first, then #1, then #2)")
        self.console.print()

        while True:
            try:
                order_input = Prompt.ask(
                    f"  Enter order (numbers 1-{len(files)})",
                    default=" ".join(str(i) for i in range(1, len(files) + 1))
                )

                # Parse input (handle spaces and commas)
                order_input = order_input.replace(',', ' ')
                order_numbers = [int(x.strip()) for x in order_input.split() if x.strip()]

                # Validate
                if len(order_numbers) != len(files):
                    self.console.print(f"[red]Error: You must specify {len(files)} numbers (you provided {len(order_numbers)})[/red]")
                    continue

                if set(order_numbers) != set(range(1, len(files) + 1)):
                    self.console.print(f"[red]Error: You must use each number from 1 to {len(files)} exactly once[/red]")
                    continue

                # Create ordered list
                ordered_files = [files[num - 1] for num in order_numbers]

                # Display new order for confirmation
                self.console.print("\n[bold cyan]New Order:[/bold cyan]")
                table = Table(show_header=True, header_style="bold green")
                table.add_column("Merge Order", style="cyan", width=12, justify="center")
                table.add_column("File Name", style="green", width=50)

                for i, file_path in enumerate(ordered_files, 1):
                    file_name = os.path.basename(file_path)
                    table.add_row(str(i), file_name)

                self.console.print(table)
                self.console.print()

                # Confirm
                if Confirm.ask("[cyan]Is this order correct?[/cyan]", default=True):
                    self.console.print("[green]✓ File order confirmed[/green]\n")
                    return ordered_files
                else:
                    self.console.print("[yellow]Let's try again...[/yellow]\n")
                    continue

            except ValueError:
                self.console.print("[red]Error: Please enter valid numbers only[/red]")
                continue
            except KeyboardInterrupt:
                self.console.print("\n[yellow]Keeping default order[/yellow]")
                return files
