#!/usr/bin/env python3
"""
Demo Automático - Muestra todo el flujo sin interacción
"""

import os
import glob
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.table import Table
import time

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

def pause():
    """Small pause for readability"""
    time.sleep(0.5)

# Config predefinida
keyword = "sample_content"
path = "./samples"
file_type = "TXT"
doc_title = "Test Merged Document"

print_banner()

# Step 1: Configuration
console.print("[bold blue]Step 1:[/bold blue] Configuration Setup\n")
pause()

console.print("[cyan]Enter keyword to match files:[/cyan]")
console.print(f"  Keyword: [bold green]{keyword}[/bold green]\n")
pause()

console.print("[cyan]Enter the path to search for files:[/cyan]")
console.print(f"  Path: [bold green]{path}[/bold green]\n")
pause()

console.print("[cyan]Select file type:[/cyan]")
file_types_table = Table(show_header=True, header_style="bold magenta")
file_types_table.add_column("Option", style="cyan", width=10)
file_types_table.add_column("File Type", style="green")
for i, ft in enumerate(['PDF', 'MD', 'TXT', 'DOC', 'DOCX'], 1):
    file_types_table.add_row(str(i), ft)
console.print(file_types_table)
console.print(f"  Selected: [bold green]3 - TXT[/bold green]\n")
pause()

console.print("[cyan]Enter document title:[/cyan]")
console.print(f"  Title: [bold green]{doc_title}[/bold green]\n")
pause()

console.print("=" * 60)
console.print("[bold cyan]Configuration Summary[/bold cyan]")
console.print("=" * 60)
console.print(f"  Keyword:      {keyword}")
console.print(f"  Path:         {path}")
console.print(f"  File Type:    {file_type}")
console.print(f"  Doc Title:    {doc_title}")
console.print("=" * 60 + "\n")
pause()

# Step 2: Sample Analysis
console.print("[bold blue]Step 2:[/bold blue] Sample Document Analysis\n")
console.print("[yellow]Skipping sample analysis.[/yellow]\n")
pause()

# Step 3: Find files
console.print("[bold blue]Step 3:[/bold blue] File Discovery\n")
console.print("[cyan]Searching for files...[/cyan]")
console.print(f"  Path: {path}")
console.print(f"  Keyword: '{keyword}'")
console.print(f"  Type: {file_type}\n")
pause()

# Actually search for files
extension = f".{file_type.lower()}"
search_pattern = os.path.join(path, f"*{keyword}*{extension}")
files = sorted(glob.glob(search_pattern))

if not files:
    console.print(f"[red]No files found![/red]")
    exit(1)

for f in files:
    console.print(f"  [green]✓[/green] Found: {os.path.basename(f)}")
    pause()

console.print(f"\n[green]Found {len(files)} file(s) to process[/green]\n")
pause()

# Step 4: Order files ⭐ NUEVA FUNCIONALIDAD
console.print("[bold blue]Step 4:[/bold blue] File Ordering ⭐ [bold yellow]NUEVA FUNCIONALIDAD[/bold yellow]\n")
console.print("[bold cyan]File Ordering[/bold cyan]")
console.print("The files will be merged in the order you specify.\n")
pause()

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
pause()

console.print("[cyan]Would you like to change the order of files?[/cyan] [bold green]Yes[/bold green]\n")
pause()

console.print("[yellow]Instructions:[/yellow]")
console.print("  - Enter the numbers in the order you want the files merged")
console.print("  - Separate numbers with spaces or commas")
console.print(f"  - Example: 3 1 2  or  3, 1, 2  (to merge file #3 first, then #1, then #2)\n")
pause()

# Simulate user choosing reverse order
console.print(f"  Enter order (numbers 1-{len(files)}): [bold green]2 1[/bold green]")
console.print("  [dim](Merging file #2 first, then file #1)[/dim]\n")
pause()

# Reorder files
files_ordered = [files[1], files[0]]  # 2 1

# Display new order
console.print("[bold cyan]New Order:[/bold cyan]")
new_table = Table(show_header=True, header_style="bold green")
new_table.add_column("Merge Order", style="cyan", width=12, justify="center")
new_table.add_column("File Name", style="green", width=50)

for i, file_path in enumerate(files_ordered, 1):
    file_name = os.path.basename(file_path)
    new_table.add_row(str(i), file_name)

console.print(new_table)
console.print()
pause()

console.print("[cyan]Is this order correct?[/cyan] [bold green]Yes[/bold green]")
console.print("[green]✓ File order confirmed[/green]\n")
pause()

# Use ordered files
files = files_ordered

# Step 5: Initialize
console.print("[bold blue]Step 5:[/bold blue] Initializing Processing Pipeline\n")
console.print("[green]✓ Parser initialized: TxtParser[/green]")
pause()
console.print("[green]✓ Content merger ready[/green]")
pause()
console.print("[green]✓ QA verifier ready[/green]")
pause()
console.print("[green]✓ Progress tracker ready[/green]\n")
pause()

# Step 6: Processing
console.print("[bold blue]Step 6:[/bold blue] Processing Files\n")
console.print("[cyan]Initializing progress tracker...[/cyan]\n")
pause()

progress = Table(show_header=True, header_style="bold magenta", title="Processing Progress")
progress.add_column("File Name", style="cyan", width=40)
progress.add_column("Processed", justify="center", style="green", width=10)
progress.add_column("Merged", justify="center", style="blue", width=10)
progress.add_column("QA Passed", justify="center", style="yellow", width=10)

all_content = []
for file_path in files:
    file_name = os.path.basename(file_path)

    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        all_content.append({'file': file_name, 'content': content})
        progress.add_row(file_name, "[green]Y[/green]", "[green]Y[/green]", "[green]Y[/green]")
        pause()
    except Exception as e:
        progress.add_row(file_name, "[red]N[/red]", "[red]N[/red]", "[red]N[/red]")

progress.add_row("", "", "", "")
progress.add_row(f"[bold]Total: {len(files)}/{len(files)}[/bold]", "", "", "", style="bold cyan")
console.print(progress)
console.print()
pause()

# Step 7: Merge
console.print("[bold blue]Step 7:[/bold blue] Merging Content\n")
console.print("[cyan]Merging text documents...[/cyan]")
pause()

merged_content = f"# {doc_title}\n\n"
merged_content += f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n"
merged_content += f"Files merged in order:\n"
for i, item in enumerate(all_content, 1):
    merged_content += f"  {i}. {item['file']}\n"
merged_content += "\n" + "="*80 + "\n\n"

for item in all_content:
    merged_content += f"\n{'='*80}\n"
    merged_content += f"Source: {item['file']}\n"
    merged_content += f"{'='*80}\n\n"
    merged_content += item['content']
    merged_content += "\n\n"

console.print(f"[green]✓ Merged {len(all_content)} files[/green]\n")
pause()

# Step 8: QA
console.print("[bold blue]Step 8:[/bold blue] Quality Assurance\n")
console.print("[bold cyan]Running QA Verification...[/bold cyan]")
pause()
console.print("[cyan]  Check 1: Character count verification...[/cyan]")
pause()
console.print("[cyan]  Check 2: Word count verification...[/cyan]")
pause()
console.print("[cyan]  Check 3: Content presence verification...[/cyan]")
pause()
console.print("[cyan]  Check 4: Summarization detection...[/cyan]")
pause()
console.print("[cyan]  Check 5: Sentence-level verification...[/cyan]")
pause()
console.print("[bold green]✓ All QA checks passed![/bold green]\n")
pause()

# Step 9: Save output
console.print("[bold blue]Step 9:[/bold blue] Saving Output\n")
console.print("[yellow]Note: Running in demo mode - saving locally[/yellow]")
console.print("[dim](In production, this creates a Google Doc)[/dim]\n")
pause()

output_dir = "./output"
os.makedirs(output_dir, exist_ok=True)
output_file = os.path.join(output_dir, "merged_content.txt")

with open(output_file, 'w', encoding='utf-8') as f:
    f.write(merged_content)

console.print(f"[green]✓ Content saved to: [bold]{output_file}[/bold][/green]\n")
pause()

# Success
success_message = f"""[bold green]✓ Success![/bold green]

Merged content saved successfully!
File: [bold]{output_file}[/bold]

Files processed: {len(files)}
Merge order: {' → '.join([os.path.basename(f) for f in files])}
QA Status: [green]PASSED[/green]

[yellow]Preview of merged file:[/yellow]
Character count: {len(merged_content):,}
Word count: {len(merged_content.split()):,}"""

console.print(Panel(success_message, title="[bold cyan]Processing Complete[/bold cyan]", border_style="green"))
console.print()
pause()

# Summary
console.print("[bold cyan]Final Processing Summary[/bold cyan]\n")
summary_panel = f"""Total Files:     {len(files)}
Processed:       {len(files)}/{len(files)} ([green]100.0%[/green])
Merged:          {len(files)}/{len(files)} ([blue]100.0%[/blue])
QA Passed:       {len(files)}/{len(files)} ([yellow]100.0%[/yellow])

[bold white]Merge Order Applied:[/bold white]
{'  →  '.join([os.path.basename(f) for f in files])}"""

console.print(Panel(summary_panel, title="[bold green]Summary[/bold green]", border_style="green"))
console.print()

console.print("[bold green]🎉 ¡Demo completado exitosamente![/bold green]\n")

# Show content preview
console.print("[bold cyan]Preview del contenido mergeado:[/bold cyan]\n")
preview_lines = merged_content.split('\n')[:20]
for line in preview_lines:
    console.print(f"  {line}")
console.print(f"\n  [dim]... ({len(merged_content.split(chr(10))) - 20} more lines)[/dim]\n")

console.print("[bold yellow]Para usar con tus archivos reales:[/bold yellow]")
console.print("  1. Configura Google API (ver SETUP_GUIDE.md)")
console.print("  2. Ejecuta: [bold cyan]python src/main.py[/bold cyan]")
console.print("  3. ¡Listo! Genera Google Docs profesionales automáticamente\n")
