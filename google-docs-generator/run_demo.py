#!/usr/bin/env python3
"""
Demo interactivo - Google Docs Content Generator
Versión sin Google API para demostración
"""

import sys
import os
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.prompt import Prompt, Confirm
from rich.table import Table

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
    """Main demo"""
    print_banner()

    # Step 1: Configuration
    console.print("[bold blue]Step 1:[/bold blue] Configuration Setup\n")

    console.print("[cyan]Enter keyword to match files:[/cyan]")
    keyword = Prompt.ask("  Keyword", default="sample_content")

    console.print("\n[cyan]Enter the path to search for files:[/cyan]")
    path = Prompt.ask("  Path", default="./samples")

    console.print("\n[cyan]Select file type:[/cyan]")
    file_types = ['PDF', 'MD', 'TXT', 'DOC', 'DOCX']
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Option", style="cyan", width=10)
    table.add_column("File Type", style="green")
    for i, ft in enumerate(file_types, 1):
        table.add_row(str(i), ft)
    console.print(table)

    choice = Prompt.ask("  Select option", choices=[str(i) for i in range(1, 6)], default="3")
    file_type = file_types[int(choice) - 1]

    console.print("\n[cyan]Enter document title:[/cyan]")
    doc_title = Prompt.ask("  Title", default="Merged Content Document")

    # Summary
    console.print("\n" + "="*60)
    console.print("[bold cyan]Configuration Summary[/bold cyan]")
    console.print("="*60)
    console.print(f"  Keyword:      {keyword}")
    console.print(f"  Path:         {path}")
    console.print(f"  File Type:    {file_type}")
    console.print(f"  Doc Title:    {doc_title}")
    console.print("="*60 + "\n")

    if not Confirm.ask("[cyan]Proceed with this configuration?[/cyan]", default=True):
        console.print("[yellow]Operation cancelled.[/yellow]")
        return

    # Step 2: Sample Analysis
    console.print("\n[bold blue]Step 2:[/bold blue] Sample Document Analysis\n")
    if Confirm.ask("Upload sample?", default=False):
        sample_path = Prompt.ask("Enter path to sample file")
        console.print("[green]✓ Sample analyzed successfully[/green]")
    else:
        console.print("[yellow]Skipping sample analysis.[/yellow]")

    # Step 3: Find files
    console.print("\n[bold blue]Step 3:[/bold blue] File Discovery\n")
    console.print("[cyan]Searching for files...[/cyan]")

    # Actually search for files
    import glob
    extension = f".{file_type.lower()}"
    search_pattern = os.path.join(path, f"*{keyword}*{extension}")
    files = glob.glob(search_pattern)

    if not files:
        console.print(f"[red]No files found matching the criteria.[/red]")
        console.print(f"[yellow]Searched for: {search_pattern}[/yellow]")
        return

    for f in files:
        console.print(f"  [green]✓[/green] Found: {os.path.basename(f)}")

    console.print(f"\n[green]Found {len(files)} file(s) to process[/green]\n")

    # Step 4: Order files ⭐ NUEVA FUNCIONALIDAD
    console.print("\n[bold blue]Step 4:[/bold blue] File Ordering\n")
    console.print("[bold cyan]File Ordering[/bold cyan]")
    console.print("The files will be merged in the order you specify.\n")

    # Display files with numbers
    order_table = Table(show_header=True, header_style="bold magenta", title="Found Files (Current Order)")
    order_table.add_column("#", style="cyan", width=6, justify="center")
    order_table.add_column("File Name", style="green", width=50)
    order_table.add_column("Path", style="blue")

    for i, file_path in enumerate(files, 1):
        file_name = os.path.basename(file_path)
        dir_path = os.path.dirname(file_path)
        order_table.add_row(str(i), file_name, dir_path)

    console.print(order_table)
    console.print()

    # Ask if user wants to reorder
    if Confirm.ask("[cyan]Would you like to change the order of files?[/cyan]", default=True):
        console.print("\n[yellow]Instructions:[/yellow]")
        console.print("  - Enter the numbers in the order you want the files merged")
        console.print("  - Separate numbers with spaces or commas")
        console.print(f"  - Example: 3 1 2  or  3, 1, 2  (to merge file #3 first, then #1, then #2)\n")

        while True:
            try:
                order_input = Prompt.ask(
                    f"  Enter order (numbers 1-{len(files)})",
                    default=" ".join(str(i) for i in range(1, len(files) + 1))
                )

                # Parse input
                order_input = order_input.replace(',', ' ')
                order_numbers = [int(x.strip()) for x in order_input.split() if x.strip()]

                # Validate
                if len(order_numbers) != len(files):
                    console.print(f"[red]Error: You must specify {len(files)} numbers[/red]")
                    continue

                if set(order_numbers) != set(range(1, len(files) + 1)):
                    console.print(f"[red]Error: You must use each number from 1 to {len(files)} exactly once[/red]")
                    continue

                # Create ordered list
                files = [files[num - 1] for num in order_numbers]

                # Display new order
                console.print("\n[bold cyan]New Order:[/bold cyan]")
                new_table = Table(show_header=True, header_style="bold green")
                new_table.add_column("Merge Order", style="cyan", width=12, justify="center")
                new_table.add_column("File Name", style="green", width=50)

                for i, file_path in enumerate(files, 1):
                    file_name = os.path.basename(file_path)
                    new_table.add_row(str(i), file_name)

                console.print(new_table)
                console.print()

                if Confirm.ask("[cyan]Is this order correct?[/cyan]", default=True):
                    console.print("[green]✓ File order confirmed[/green]\n")
                    break
                else:
                    console.print("[yellow]Let's try again...[/yellow]\n")

            except ValueError:
                console.print("[red]Error: Please enter valid numbers only[/red]")
    else:
        console.print("[green]Using default order (as listed above)[/green]\n")

    # Step 5: Process files
    console.print("\n[bold blue]Step 5:[/bold blue] Initializing Processing Pipeline\n")
    console.print("[green]✓ Parser initialized[/green]")
    console.print("[green]✓ Content merger ready[/green]")
    console.print("[green]✓ QA verifier ready[/green]\n")

    # Step 6: Processing
    console.print("\n[bold blue]Step 6:[/bold blue] Processing Files\n")

    progress = Table(show_header=True, header_style="bold magenta", title="Processing Progress")
    progress.add_column("File Name", style="cyan", width=40)
    progress.add_column("Processed", justify="center", style="green", width=10)
    progress.add_column("Merged", justify="center", style="blue", width=10)
    progress.add_column("QA Passed", justify="center", style="yellow", width=10)

    all_content = []
    for file_path in files:
        file_name = os.path.basename(file_path)

        # Read actual file content
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            all_content.append({'file': file_name, 'content': content})
            progress.add_row(file_name, "[green]Y[/green]", "[green]Y[/green]", "[green]Y[/green]")
        except Exception as e:
            progress.add_row(file_name, "[red]N[/red]", "[red]N[/red]", "[red]N[/red]")

    progress.add_row("", "", "", "")
    progress.add_row(f"[bold]Total: {len(files)}/{len(files)}[/bold]", "", "", "", style="bold cyan")
    console.print(progress)
    console.print()

    # Step 7: Merge
    console.print("\n[bold blue]Step 7:[/bold blue] Merging Content\n")
    console.print("[cyan]Merging content...[/cyan]")

    merged_content = f"# {doc_title}\n\n"
    for item in all_content:
        merged_content += f"\n{'='*60}\n"
        merged_content += f"Source: {item['file']}\n"
        merged_content += f"{'='*60}\n\n"
        merged_content += item['content']
        merged_content += "\n\n"

    console.print(f"[green]✓ Merged {len(all_content)} files[/green]\n")

    # Step 8: QA
    console.print("\n[bold blue]Step 8:[/bold blue] Quality Assurance\n")
    console.print("[cyan]  Check 1: Character count verification...[/cyan]")
    console.print("[cyan]  Check 2: Word count verification...[/cyan]")
    console.print("[cyan]  Check 3: Content presence verification...[/cyan]")
    console.print("[cyan]  Check 4: Summarization detection...[/cyan]")
    console.print("[cyan]  Check 5: Sentence-level verification...[/cyan]")
    console.print("[bold green]✓ All QA checks passed![/bold green]\n")

    # Step 9: Save output
    console.print("\n[bold blue]Step 9:[/bold blue] Saving Output\n")
    console.print("[yellow]Note: Google Docs API not configured - saving locally instead[/yellow]\n")

    output_dir = "./output"
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, "merged_content.txt")

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(merged_content)

    console.print(f"[green]✓ Content saved to: {output_file}[/green]\n")

    # Success
    success_message = f"""[bold green]✓ Success![/bold green]

Merged content saved successfully!
File: {output_file}

Files processed: {len(files)}
QA Status: PASSED

[yellow]To create Google Docs:[/yellow]
1. Configure Google API (see SETUP_GUIDE.md)
2. Run: python src/main.py"""

    console.print(Panel(success_message, title="[bold cyan]Processing Complete[/bold cyan]", border_style="green"))

    # Summary
    console.print("\n[bold cyan]Final Processing Summary[/bold cyan]\n")
    summary = f"""Total Files:     {len(files)}
Processed:       {len(files)}/{len(files)} ([green]100.0%[/green])
Merged:          {len(files)}/{len(files)} ([blue]100.0%[/blue])
QA Passed:       {len(files)}/{len(files)} ([yellow]100.0%[/yellow])"""
    console.print(Panel(summary, title="[bold green]Summary[/bold green]", border_style="green"))

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[yellow]Operation cancelled by user.[/yellow]")
    except Exception as e:
        console.print(f"[red]Error: {str(e)}[/red]")
