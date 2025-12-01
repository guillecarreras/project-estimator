#!/usr/bin/env python3
"""
Google Docs Content Generator - Main Entry Point

A tool to merge content from multiple source files into professional Google Docs
with character-by-character verification.
"""

import sys
import os
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from cli.interactive import InteractiveCLI
from utils.progress_tracker import ProgressTracker
from utils.file_finder import FileFinder
from parsers.pdf_parser import PDFParser
from parsers.markdown_parser import MarkdownParser
from parsers.txt_parser import TxtParser
from parsers.doc_parser import DocParser
from merger.content_merger import ContentMerger
from google_docs.docs_creator import GoogleDocsCreator
from qa.verifier import QAVerifier

console = Console()


def print_banner():
    """Display application banner"""
    banner = Text()
    banner.append("╔═══════════════════════════════════════════════════╗\n", style="bold cyan")
    banner.append("║                                                   ║\n", style="bold cyan")
    banner.append("║   ", style="bold cyan")
    banner.append("Google Docs Content Generator", style="bold white")
    banner.append("            ║\n", style="bold cyan")
    banner.append("║   ", style="bold cyan")
    banner.append("Merge & Verify Content with Precision", style="italic yellow")
    banner.append("    ║\n", style="bold cyan")
    banner.append("║                                                   ║\n", style="bold cyan")
    banner.append("╚═══════════════════════════════════════════════════╝", style="bold cyan")

    console.print(banner)
    console.print()


def main():
    """Main application entry point"""
    try:
        # Display banner
        print_banner()

        # Initialize interactive CLI
        cli = InteractiveCLI(console)

        # Step 1: Collect user inputs
        console.print("[bold blue]Step 1:[/bold blue] Configuration Setup\n")
        config = cli.collect_inputs()

        if not config:
            console.print("[yellow]Operation cancelled by user.[/yellow]")
            return

        # Step 2: Analyze sample document
        console.print("\n[bold blue]Step 2:[/bold blue] Sample Document Analysis\n")
        sample_analysis = cli.analyze_sample(config['file_type'])

        if not sample_analysis:
            console.print("[yellow]Skipping sample analysis.[/yellow]")

        # Step 3: Find matching files
        console.print("\n[bold blue]Step 3:[/bold blue] File Discovery\n")
        finder = FileFinder(console)
        files = finder.find_files(
            config['path'],
            config['keyword'],
            config['file_type']
        )

        if not files:
            console.print("[red]No files found matching the criteria.[/red]")
            return

        console.print(f"[green]Found {len(files)} file(s) to process[/green]\n")

        # Step 4: Initialize components
        console.print("[bold blue]Step 4:[/bold blue] Initializing Processing Pipeline\n")

        # Select appropriate parser
        parser_map = {
            'PDF': PDFParser,
            'MD': MarkdownParser,
            'TXT': TxtParser,
            'DOC': DocParser,
            'DOCX': DocParser
        }

        ParserClass = parser_map.get(config['file_type'].upper())
        if not ParserClass:
            console.print(f"[red]Unsupported file type: {config['file_type']}[/red]")
            return

        parser = ParserClass(console)
        merger = ContentMerger(console)
        docs_creator = GoogleDocsCreator(console)
        qa_verifier = QAVerifier(console)
        progress_tracker = ProgressTracker(console, len(files))

        # Step 5: Process files
        console.print("\n[bold blue]Step 5:[/bold blue] Processing Files\n")
        progress_tracker.start()

        all_content = []
        processing_results = []

        for file_path in files:
            file_name = os.path.basename(file_path)

            # Update progress: Processing
            progress_tracker.update_file(file_name, processed=False, merged=False, qa_passed=False)

            try:
                # Parse file
                content = parser.parse(file_path)
                progress_tracker.update_file(file_name, processed=True, merged=False, qa_passed=False)

                # Add to merger
                all_content.append({
                    'file': file_name,
                    'path': file_path,
                    'content': content
                })

            except Exception as e:
                console.print(f"[red]Error processing {file_name}: {str(e)}[/red]")
                progress_tracker.update_file(file_name, processed=False, merged=False, qa_passed=False)
                continue

        # Step 6: Merge content
        console.print("\n[bold blue]Step 6:[/bold blue] Merging Content\n")

        try:
            merged_content = merger.merge(all_content, sample_analysis)

            # Update merge status for all files
            for item in all_content:
                file_name = item['file']
                progress_tracker.update_file(file_name, processed=True, merged=True, qa_passed=False)

        except Exception as e:
            console.print(f"[red]Error merging content: {str(e)}[/red]")
            return

        # Step 7: QA Verification
        console.print("\n[bold blue]Step 7:[/bold blue] Quality Assurance\n")

        qa_results = qa_verifier.verify(all_content, merged_content)

        # Update QA status
        if qa_results['passed']:
            console.print("[green]✓ QA Verification PASSED[/green]")
            for item in all_content:
                file_name = item['file']
                progress_tracker.update_file(file_name, processed=True, merged=True, qa_passed=True)
        else:
            console.print("[red]✗ QA Verification FAILED[/red]")
            console.print(f"[yellow]Issues found: {len(qa_results['issues'])}[/yellow]")
            for issue in qa_results['issues'][:5]:  # Show first 5 issues
                console.print(f"  - {issue}")

            response = cli.ask_continue_after_qa_failure()
            if not response:
                console.print("[yellow]Operation cancelled due to QA failure.[/yellow]")
                return

        # Step 8: Create Google Doc
        console.print("\n[bold blue]Step 8:[/bold blue] Creating Google Doc\n")

        try:
            doc_url = docs_creator.create_document(
                merged_content,
                config.get('doc_title', 'Merged Content Document')
            )

            console.print(Panel(
                f"[bold green]✓ Success![/bold green]\n\n"
                f"Google Doc created successfully!\n"
                f"URL: [link]{doc_url}[/link]\n\n"
                f"Files processed: {len(files)}\n"
                f"QA Status: {'PASSED' if qa_results['passed'] else 'PASSED WITH WARNINGS'}",
                title="[bold cyan]Processing Complete[/bold cyan]",
                border_style="green"
            ))

        except Exception as e:
            console.print(f"[red]Error creating Google Doc: {str(e)}[/red]")
            console.print("[yellow]Content was merged successfully but Google Doc creation failed.[/yellow]")

            # Offer to save locally
            save_local = cli.ask_save_locally()
            if save_local:
                output_path = os.path.join(
                    os.path.dirname(__file__),
                    '../output',
                    'merged_content.txt'
                )
                os.makedirs(os.path.dirname(output_path), exist_ok=True)

                with open(output_path, 'w', encoding='utf-8') as f:
                    f.write(merged_content)

                console.print(f"[green]Content saved to: {output_path}[/green]")

        # Final progress display
        progress_tracker.display_final_summary()

    except KeyboardInterrupt:
        console.print("\n[yellow]Operation cancelled by user.[/yellow]")
        sys.exit(0)
    except Exception as e:
        console.print(f"[red]Unexpected error: {str(e)}[/red]")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
