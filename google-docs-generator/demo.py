#!/usr/bin/env python3
"""
Demo Script - Google Docs Content Generator
Shows the workflow without requiring Google API setup
"""

from rich.console import Console
from rich.table import Table
from rich.panel import Panel

console = Console()

# Banner
console.print("\n╔═══════════════════════════════════════════════════╗", style="bold cyan")
console.print("║   [bold white]Google Docs Content Generator[/bold white]            ║", style="bold cyan")
console.print("║   [italic yellow]Merge & Verify Content with Precision[/italic yellow]    ║", style="bold cyan")
console.print("╚═══════════════════════════════════════════════════╝\n", style="bold cyan")

# Step 1: Configuration
console.print("[bold blue]Step 1:[/bold blue] Configuration Setup\n")
console.print("[cyan]Enter keyword to match files:[/cyan]")
console.print("  Keyword [default: Contenido Consolidado]: [bold]Contenido Consolidado[/bold]\n")

console.print("[cyan]Enter the path to search for files:[/cyan]")
console.print("  Path [default: current]: [bold]D:\\Gen AI\\Claude - SprintHealth Artifacts[/bold]\n")

console.print("[cyan]Select file type:[/cyan]")
file_types = Table(show_header=True, header_style="bold magenta")
file_types.add_column("Option", style="cyan", width=10)
file_types.add_column("File Type", style="green")
file_types.add_row("1", "PDF")
file_types.add_row("2", "MD")
file_types.add_row("3", "TXT")
file_types.add_row("4", "DOC")
file_types.add_row("5", "DOCX")
console.print(file_types)
console.print("  Select option: [bold]5[/bold]\n")

console.print("[cyan]Enter document title:[/cyan]")
console.print("  Title: [bold]SprintHealth Consolidated Content[/bold]\n")

console.print("=" * 60)
console.print("[bold cyan]Configuration Summary[/bold cyan]")
console.print("=" * 60)
console.print("  Keyword:      Contenido Consolidado")
console.print("  Path:         D:\\Gen AI\\Claude - SprintHealth Artifacts")
console.print("  File Type:    DOCX")
console.print("  Doc Title:    SprintHealth Consolidated Content")
console.print("=" * 60 + "\n")

# Step 2: Sample Analysis
console.print("\n[bold blue]Step 2:[/bold blue] Sample Document Analysis\n")
console.print("[yellow]Skipping sample analysis.[/yellow]\n")

# Step 3: File Discovery
console.print("\n[bold blue]Step 3:[/bold blue] File Discovery\n")
console.print("[cyan]Searching for files...[/cyan]")
console.print("  Path: D:\\Gen AI\\Claude - SprintHealth Artifacts")
console.print("  Keyword: 'Contenido Consolidado'")
console.print("  Type: DOCX\n")

files = [
    "Contenido_Consolidado_Sprint1.docx",
    "Contenido_Consolidado_Sprint2.docx",
    "Contenido_Consolidado_Sprint3.docx"
]

for f in files:
    console.print(f"  [green]✓[/green] Found: {f}")

console.print(f"\n[green]Found {len(files)} file(s) to process[/green]\n")

# Step 4: File Ordering (NEW!)
console.print("\n[bold blue]Step 4:[/bold blue] File Ordering\n")
console.print("[bold cyan]File Ordering[/bold cyan]")
console.print("The files will be merged in the order you specify.\n")

order_table = Table(show_header=True, header_style="bold magenta", title="Found Files (Current Order)")
order_table.add_column("#", style="cyan", width=6, justify="center")
order_table.add_column("File Name", style="green", width=50)
order_table.add_column("Path", style="blue")

for i, f in enumerate(files, 1):
    order_table.add_row(str(i), f, "D:\\...\\SprintHealth Artifacts")

console.print(order_table)
console.print()

console.print("[cyan]Would you like to change the order of files?[/cyan] [yellow](Y/n)[/yellow]: [bold]y[/bold]\n")

console.print("[yellow]Instructions:[/yellow]")
console.print("  - Enter the numbers in the order you want the files merged")
console.print("  - Separate numbers with spaces or commas")
console.print("  - Example: 3 1 2  or  3, 1, 2  (to merge file #3 first, then #1, then #2)\n")

console.print(f"  Enter order (numbers 1-{len(files)}): [bold]3 1 2[/bold]\n")

new_order_table = Table(show_header=True, header_style="bold green")
new_order_table.add_column("Merge Order", style="cyan", width=12, justify="center")
new_order_table.add_column("File Name", style="green", width=50)

ordered = [files[2], files[0], files[1]]  # 3 1 2
for i, f in enumerate(ordered, 1):
    new_order_table.add_row(str(i), f)

console.print("[bold cyan]New Order:[/bold cyan]")
console.print(new_order_table)
console.print()

console.print("[cyan]Is this order correct?[/cyan] [yellow](Y/n)[/yellow]: [bold]y[/bold]")
console.print("[green]✓ File order confirmed[/green]\n")

# Step 5: Initialize
console.print("\n[bold blue]Step 5:[/bold blue] Initializing Processing Pipeline\n")
console.print("[green]✓ Parser initialized: DocParser[/green]")
console.print("[green]✓ Content merger ready[/green]")
console.print("[green]✓ QA verifier ready[/green]")
console.print("[green]✓ Google Docs creator ready[/green]\n")

# Step 6: Processing
console.print("\n[bold blue]Step 6:[/bold blue] Processing Files\n")
console.print("[cyan]Initializing progress tracker...[/cyan]\n")

progress = Table(show_header=True, header_style="bold magenta", title="Processing Progress")
progress.add_column("File Name", style="cyan", width=40)
progress.add_column("Processed", justify="center", style="green", width=10)
progress.add_column("Merged", justify="center", style="blue", width=10)
progress.add_column("QA Passed", justify="center", style="yellow", width=10)

for f in ordered:
    progress.add_row(f, "[green]Y[/green]", "[green]Y[/green]", "[green]Y[/green]")

progress.add_row("", "", "", "")
progress.add_row(f"[bold]Total: {len(ordered)}/{len(ordered)}[/bold]", "", "", "", style="bold cyan")

console.print(progress)
console.print()

# Step 7: Merge
console.print("\n[bold blue]Step 7:[/bold blue] Merging Content\n")
console.print("[cyan]Merging Word documents by sections...[/cyan]")
console.print("[green]✓ Merged 15 sections[/green]\n")

# Step 8: QA
console.print("\n[bold blue]Step 8:[/bold blue] Quality Assurance\n")
console.print("[bold cyan]Running QA Verification...[/bold cyan]")
console.print("[cyan]  Check 1: Character count verification...[/cyan]")
console.print("[cyan]  Check 2: Word count verification...[/cyan]")
console.print("[cyan]  Check 3: Content presence verification...[/cyan]")
console.print("[cyan]  Check 4: Summarization detection...[/cyan]")
console.print("[cyan]  Check 5: Sentence-level verification...[/cyan]")
console.print("[bold green]✓ All QA checks passed![/bold green]\n")

# Step 9: Create Google Doc
console.print("\n[bold blue]Step 9:[/bold blue] Creating Google Doc\n")
console.print("[cyan]Authenticating with Google Docs API...[/cyan]")
console.print("[green]✓ Authentication successful[/green]")
console.print("[cyan]Creating Google Doc: 'SprintHealth Consolidated Content'...[/cyan]")
console.print("[green]✓ Document created with ID: abc123xyz789[/green]")
console.print("[cyan]Inserting content...[/cyan]")
console.print("[green]✓ Content inserted[/green]")
console.print("[cyan]Applying formatting...[/cyan]")
console.print("[green]✓ Applied 42 formatting changes[/green]")
console.print("[green]✓ Formatting complete[/green]\n")

# Success Panel
success_message = """[bold green]✓ Success![/bold green]

Google Doc created successfully!
URL: [link]https://docs.google.com/document/d/abc123xyz789/edit[/link]

Files processed: 3
QA Status: PASSED"""

console.print(Panel(success_message, title="[bold cyan]Processing Complete[/bold cyan]", border_style="green"))

console.print("\n[bold cyan]Final Processing Summary[/bold cyan]\n")
summary = """Total Files:     3
Processed:       3/3 ([green]100.0%[/green])
Merged:          3/3 ([blue]100.0%[/blue])
QA Passed:       3/3 ([yellow]100.0%[/yellow])"""
console.print(Panel(summary, title="[bold green]Summary[/bold green]", border_style="green"))

console.print("\n[bold green]¡Proceso completado exitosamente![/bold green] 🎉\n")
