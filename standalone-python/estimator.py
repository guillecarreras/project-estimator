#!/usr/bin/env python3
"""
Project Estimation Tool - Standalone Python Version
No Node.js required - works with Python 3.7+
"""

import json
import csv
import argparse
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from pathlib import Path


# ============================================================================
# CONFIGURATION
# ============================================================================

TSHIRT_HOURS = {
    'XS': 9,
    'S': 18,
    'M': 36,
    'L': 72,
    'XL': 108,
    'XXL': 144,
    'XXXL': 189,
}

ROLE_RATES = {
    'Fullstack': 85,
    'QA': 60,
    'DevOps': 90,
    'BA': 70,
    'SM': 75,
    'UX': 80,
}

DEFAULT_CONFIG = {
    'hoursPerDay': 6,
    'sprintLengthWeeks': 2,
    'unitTestingPercentage': 15,
    'bugFixingPercentage': 20,
    'documentationPercentage': 10,
    'contingencyPercentage': 15,
    'startDate': datetime.now().strftime('%Y-%m-%d'),
}

QA_RATIO = 1 / 3  # 1 QA per 3 Developers

ROLE_ALLOCATION_PATTERN = {
    'Fullstack': 'per-task',
    'QA': 'ratio-based',
    'DevOps': 'per-task',
    'BA': 'full-project',
    'SM': 'full-project',
    'UX': 'full-project',
}


# ============================================================================
# HOLIDAY UTILITIES
# ============================================================================

def get_brazilian_holidays(year: int) -> List[datetime]:
    """Get Brazilian national holidays for a given year."""
    holidays = [
        datetime(year, 1, 1),   # New Year's Day
        datetime(year, 4, 21),  # Tiradentes' Day
        datetime(year, 5, 1),   # Labor Day
        datetime(year, 9, 7),   # Independence Day
        datetime(year, 10, 12), # Our Lady of Aparecida
        datetime(year, 11, 2),  # All Souls' Day
        datetime(year, 11, 15), # Republic Day
        datetime(year, 12, 25), # Christmas Day
    ]
    
    # Easter-based holidays (simplified)
    easter_dates = {
        2024: '2024-03-31',
        2025: '2025-04-20',
        2026: '2026-04-05',
        2027: '2027-03-28',
        2028: '2028-04-16',
    }
    
    if year in easter_dates:
        easter = datetime.strptime(easter_dates[year], '%Y-%m-%d')
        holidays.append(easter - timedelta(days=47))  # Carnival
        holidays.append(easter - timedelta(days=2))   # Good Friday
        holidays.append(easter)                        # Easter Sunday
        holidays.append(easter + timedelta(days=60))  # Corpus Christi
    
    return holidays


def is_working_day(date: datetime, holidays: List[datetime]) -> bool:
    """Check if a date is a working day (not weekend or holiday)."""
    if date.weekday() >= 5:  # Saturday = 5, Sunday = 6
        return False
    
    date_str = date.strftime('%Y-%m-%d')
    for holiday in holidays:
        if holiday.strftime('%Y-%m-%d') == date_str:
            return False
    
    return True


def add_working_days(start_date: datetime, days_to_add: int, holidays: List[datetime]) -> datetime:
    """Add working days to a start date, excluding weekends and holidays."""
    current_date = start_date
    added_days = 0
    
    while added_days < days_to_add:
        current_date += timedelta(days=1)
        if is_working_day(current_date, holidays):
            added_days += 1
    
    return current_date


# ============================================================================
# ESTIMATION ENGINE
# ============================================================================

class ProjectEstimator:
    def __init__(self, backlog: List[Dict], config: Dict):
        self.backlog = backlog
        self.config = {**DEFAULT_CONFIG, **config}
        self.start_date = datetime.strptime(self.config['startDate'], '%Y-%m-%d')
        self.holidays = get_brazilian_holidays(self.start_date.year)
    
    def tshirt_to_hours(self, size: str) -> int:
        """Convert T-shirt size to hours."""
        return TSHIRT_HOURS.get(size, 0)
    
    def calculate_base_hours(self) -> Dict[str, float]:
        """Calculate base hours per role from backlog."""
        role_hours = {}
        
        for item in self.backlog:
            base_hours = self.tshirt_to_hours(item['tshirt_size'])
            hours_per_role = base_hours / len(item['roles'])
            
            for role in item['roles']:
                role_hours[role] = role_hours.get(role, 0) + hours_per_role
        
        return role_hours
    
    def apply_multipliers(self, base_hours: float) -> float:
        """Apply multipliers for testing, bugs, documentation."""
        testing = base_hours * (self.config['unitTestingPercentage'] / 100)
        bugs = base_hours * (self.config['bugFixingPercentage'] / 100)
        docs = base_hours * (self.config['documentationPercentage'] / 100)
        return base_hours + testing + bugs + docs
    
    def apply_contingency(self, hours: float) -> float:
        """Apply contingency buffer."""
        return hours * (1 + self.config['contingencyPercentage'] / 100)
    
    def calculate_role_efforts(self) -> List[Dict[str, Any]]:
        """Calculate effort per role."""
        base_hours = self.calculate_base_hours()
        role_efforts = []
        total_dev_hours = 0
        
        # Calculate for task-based roles
        for role, hours in base_hours.items():
            with_multipliers = self.apply_multipliers(hours)
            total_hours = self.apply_contingency(with_multipliers)
            
            role_efforts.append({
                'role': role,
                'baseHours': hours,
                'withMultipliers': with_multipliers,
                'totalHours': total_hours,
                'fte': total_hours / (self.config['hoursPerDay'] * 5 * self.config['sprintLengthWeeks']),
                'cost': total_hours * ROLE_RATES.get(role, 0),
            })
            
            if role in ['Fullstack', 'DevOps']:
                total_dev_hours += total_hours
        
        # Add QA based on dev ratio if not already present
        if 'QA' not in base_hours and total_dev_hours > 0:
            qa_hours = total_dev_hours * QA_RATIO
            role_efforts.append({
                'role': 'QA',
                'baseHours': qa_hours,
                'withMultipliers': qa_hours,
                'totalHours': qa_hours,
                'fte': qa_hours / (self.config['hoursPerDay'] * 5 * self.config['sprintLengthWeeks']),
                'cost': qa_hours * ROLE_RATES['QA'],
            })
        
        return role_efforts
    
    def calculate_duration(self, role_efforts: List[Dict]) -> Dict[str, int]:
        """Calculate project duration."""
        max_hours = max([r['totalHours'] for r in role_efforts])
        working_days = int(max_hours / self.config['hoursPerDay'])
        weeks = int(working_days / 5) + (1 if working_days % 5 else 0)
        sprints = int(weeks / self.config['sprintLengthWeeks']) + (1 if weeks % self.config['sprintLengthWeeks'] else 0)
        
        return {
            'days': int(working_days * 1.4),
            'weeks': weeks,
            'sprints': sprints,
            'workingDays': working_days,
        }
    
    def generate_gantt_data(self, working_days: int) -> List[Dict]:
        """Generate Gantt timeline data."""
        gantt_tasks = []
        current_date = self.start_date
        
        for item in self.backlog:
            base_hours = self.tshirt_to_hours(item['tshirt_size'])
            hours_per_role = base_hours / len(item['roles'])
            with_multipliers = self.apply_multipliers(hours_per_role)
            total_hours = self.apply_contingency(with_multipliers)
            task_days = int(total_hours / self.config['hoursPerDay']) + 1
            
            for role in item['roles']:
                task_end_date = add_working_days(current_date, task_days, self.holidays)
                
                gantt_tasks.append({
                    'epic': item['epic'],
                    'feature': item['feature'],
                    'role': role,
                    'startDate': current_date.strftime('%Y-%m-%d'),
                    'endDate': task_end_date.strftime('%Y-%m-%d'),
                    'hours': round(total_hours, 2),
                    'days': task_days,
                })
            
            current_date = add_working_days(current_date, task_days, self.holidays)
        
        return gantt_tasks
    
    def estimate(self) -> Dict[str, Any]:
        """Run complete estimation."""
        role_efforts = self.calculate_role_efforts()
        duration = self.calculate_duration(role_efforts)
        end_date = add_working_days(self.start_date, duration['workingDays'], self.holidays)
        gantt_data = self.generate_gantt_data(duration['workingDays'])
        
        # Team composition
        team_composition = []
        for effort in role_efforts:
            team_composition.append({
                'role': effort['role'],
                'count': max(1, int(effort['fte'] + 0.5)),
                'allocationPercentage': 100,
            })
        
        # Add full-project roles
        for role in ['BA', 'SM', 'UX']:
            if not any(e['role'] == role for e in role_efforts):
                estimated_hours = duration['workingDays'] * self.config['hoursPerDay'] * 0.5
                role_efforts.append({
                    'role': role,
                    'baseHours': estimated_hours,
                    'withMultipliers': estimated_hours,
                    'totalHours': estimated_hours,
                    'fte': 0.5,
                    'cost': estimated_hours * ROLE_RATES[role],
                })
                team_composition.append({
                    'role': role,
                    'count': 1,
                    'allocationPercentage': 50,
                })
        
        total_cost = sum(e['cost'] for e in role_efforts)
        total_base_hours = sum(e['baseHours'] for e in role_efforts)
        
        assumptions = [
            f"Working {self.config['hoursPerDay']} productive hours per day",
            f"Sprint length: {self.config['sprintLengthWeeks']} weeks",
            f"Contingency: {self.config['contingencyPercentage']}%",
            f"Bug fixing overhead: {self.config['bugFixingPercentage']}%",
            f"Documentation overhead: {self.config['documentationPercentage']}%",
            f"Unit testing overhead: {self.config['unitTestingPercentage']}%",
            "QA ratio: 1 QA per 3 Developers",
            "BA, SM, UX allocated throughout project at 50%",
            "Brazilian holidays excluded from working days",
            "Weekends excluded from working days",
        ]
        
        return {
            'backlogItemCount': len(self.backlog),
            'totalBaseHours': round(total_base_hours, 2),
            'roleEfforts': role_efforts,
            'teamComposition': team_composition,
            'totalCost': round(total_cost, 2),
            'durationDays': duration['days'],
            'durationWeeks': duration['weeks'],
            'durationSprints': duration['sprints'],
            'startDate': self.config['startDate'],
            'endDate': end_date.strftime('%Y-%m-%d'),
            'workingDays': duration['workingDays'],
            'assumptions': assumptions,
            'ganttData': gantt_data,
        }


# ============================================================================
# EXPORT UTILITIES
# ============================================================================

def export_to_json(result: Dict, filename: str = 'estimation.json'):
    """Export estimation to JSON file."""
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2)
    print(f"✅ Estimation exported to {filename}")


def export_to_csv(result: Dict, filename: str = 'estimation.csv'):
    """Export estimation to CSV file."""
    lines = []
    
    lines.append(['PROJECT ESTIMATION SUMMARY'])
    lines.append([])
    lines.append(['Backlog Items', result['backlogItemCount']])
    lines.append(['Total Base Hours', round(result['totalBaseHours'])])
    lines.append(['Total Cost', f"${result['totalCost']:,.2f}"])
    lines.append(['Duration (Weeks)', result['durationWeeks']])
    lines.append(['Duration (Sprints)', result['durationSprints']])
    lines.append(['Start Date', result['startDate']])
    lines.append(['End Date', result['endDate']])
    lines.append(['Working Days', result['workingDays']])
    lines.append([])
    
    lines.append(['ROLE EFFORTS'])
    lines.append(['Role', 'Base Hours', 'With Multipliers', 'Total Hours', 'FTE', 'Cost'])
    for effort in result['roleEfforts']:
        lines.append([
            effort['role'],
            round(effort['baseHours']),
            round(effort['withMultipliers']),
            round(effort['totalHours']),
            f"{effort['fte']:.2f}",
            f"${effort['cost']:,.0f}",
        ])
    lines.append([])
    
    lines.append(['TEAM COMPOSITION'])
    lines.append(['Role', 'Count', 'Allocation %'])
    for member in result['teamComposition']:
        lines.append([
            member['role'],
            member['count'],
            f"{member['allocationPercentage']}%",
        ])
    lines.append([])
    
    lines.append(['ASSUMPTIONS'])
    for assumption in result['assumptions']:
        lines.append([assumption])
    
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerows(lines)
    
    print(f"✅ Estimation exported to {filename}")


def export_gantt_csv(gantt_data: List[Dict], filename: str = 'gantt.csv'):
    """Export Gantt data to CSV."""
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['Epic', 'Feature', 'Role', 'Start Date', 'End Date', 'Hours', 'Days'])
        
        for task in gantt_data:
            writer.writerow([
                task['epic'],
                task['feature'],
                task['role'],
                task['startDate'],
                task['endDate'],
                round(task['hours']),
                task['days'],
            ])
    
    print(f"✅ Gantt data exported to {filename}")


def print_summary(result: Dict):
    """Print formatted console summary."""
    print('\n' + '=' * 60)
    print('PROJECT ESTIMATION SUMMARY')
    print('=' * 60)
    
    print(f"\n📊 Scope: {result['backlogItemCount']} backlog items")
    print(f"⏱️  Total Base Hours: {round(result['totalBaseHours'])} hours")
    print(f"📅 Duration: {result['durationWeeks']} weeks ({result['durationSprints']} sprints)")
    print(f"🗓️  Timeline: {result['startDate']} → {result['endDate']}")
    print(f"💼 Working Days: {result['workingDays']} days")
    print(f"💰 Total Cost: ${result['totalCost']:,.2f}")
    
    print('\n' + '-' * 60)
    print('ROLE EFFORTS')
    print('-' * 60)
    print(f"{'Role':<15} {'Hours':>10} {'FTE':>8} {'Cost':>15}")
    print('-' * 60)
    
    for effort in result['roleEfforts']:
        print(
            f"{effort['role']:<15} "
            f"{round(effort['totalHours']):>10} "
            f"{effort['fte']:>8.2f} "
            f"${round(effort['cost']):>14,}"
        )
    
    print('\n' + '-' * 60)
    print('TEAM COMPOSITION')
    print('-' * 60)
    print(f"{'Role':<15} {'Count':>10} {'Allocation':>15}")
    print('-' * 60)
    
    for member in result['teamComposition']:
        print(
            f"{member['role']:<15} "
            f"{member['count']:>10} "
            f"{member['allocationPercentage']:>14}%"
        )
    
    print('\n' + '-' * 60)
    print('ASSUMPTIONS')
    print('-' * 60)
    for assumption in result['assumptions']:
        print(f"  • {assumption}")
    print('=' * 60 + '\n')


# ============================================================================
# CLI & MAIN
# ============================================================================

def generate_example_files():
    """Generate example backlog and config files."""
    example_backlog = [
        {'epic': 'Authentication', 'feature': 'User Login', 'tshirt_size': 'M', 'roles': ['Fullstack', 'QA']},
        {'epic': 'Authentication', 'feature': 'Password Reset', 'tshirt_size': 'S', 'roles': ['Fullstack', 'QA']},
        {'epic': 'Authentication', 'feature': 'OAuth Integration', 'tshirt_size': 'L', 'roles': ['Fullstack', 'DevOps', 'QA']},
        {'epic': 'User Profile', 'feature': 'Profile Page', 'tshirt_size': 'M', 'roles': ['Fullstack', 'UX', 'QA']},
        {'epic': 'User Profile', 'feature': 'Avatar Upload', 'tshirt_size': 'S', 'roles': ['Fullstack', 'QA']},
        {'epic': 'Dashboard', 'feature': 'Analytics Dashboard', 'tshirt_size': 'XL', 'roles': ['Fullstack', 'UX', 'QA']},
        {'epic': 'Dashboard', 'feature': 'Data Export', 'tshirt_size': 'M', 'roles': ['Fullstack', 'QA']},
        {'epic': 'Notifications', 'feature': 'Email Notifications', 'tshirt_size': 'L', 'roles': ['Fullstack', 'QA']},
        {'epic': 'Notifications', 'feature': 'Push Notifications', 'tshirt_size': 'XL', 'roles': ['Fullstack', 'DevOps', 'QA']},
        {'epic': 'Admin Panel', 'feature': 'User Management', 'tshirt_size': 'L', 'roles': ['Fullstack', 'QA']},
    ]
    
    example_config = {
        'hoursPerDay': 6,
        'sprintLengthWeeks': 2,
        'unitTestingPercentage': 15,
        'bugFixingPercentage': 20,
        'documentationPercentage': 10,
        'contingencyPercentage': 15,
        'startDate': '2025-11-03',
    }
    
    with open('backlog.json', 'w') as f:
        json.dump(example_backlog, f, indent=2)
    
    with open('config.json', 'w') as f:
        json.dump(example_config, f, indent=2)
    
    print('✅ Example files generated:')
    print('   - backlog.json (10 sample backlog items)')
    print('   - config.json (estimation parameters)')
    print('\n💡 Run "python estimator.py" to estimate the example backlog\n')


def main():
    parser = argparse.ArgumentParser(description='Project Estimation Tool - Standalone Python Version')
    parser.add_argument('-i', '--input', default='backlog.json', help='Input backlog JSON file')
    parser.add_argument('-c', '--config', help='Configuration JSON file')
    parser.add_argument('--csv', action='store_true', help='Export as CSV instead of JSON')
    parser.add_argument('--example', action='store_true', help='Generate example files')
    
    args = parser.parse_args()
    
    print('\n🚀 Project Estimation Tool (Python Standalone)\n')
    
    if args.example:
        generate_example_files()
        return
    
    # Load backlog
    if not Path(args.input).exists():
        print(f"❌ Error: Input file '{args.input}' not found.")
        print('\n💡 Run with --example to generate sample files\n')
        return
    
    with open(args.input, 'r') as f:
        backlog = json.load(f)
    
    print(f"📂 Loaded {len(backlog)} items from {args.input}")
    
    # Load config
    config = {}
    if args.config and Path(args.config).exists():
        with open(args.config, 'r') as f:
            config = json.load(f)
        print(f"⚙️  Loaded custom config from {args.config}")
    else:
        print(f"⚙️  Using default configuration")
    
    # Run estimation
    print('\n🔄 Running estimation...\n')
    estimator = ProjectEstimator(backlog, config)
    result = estimator.estimate()
    
    # Print summary
    print_summary(result)
    
    # Export results
    if args.csv:
        export_to_csv(result)
        export_gantt_csv(result['ganttData'])
    else:
        export_to_json(result)
    
    print('✨ Estimation complete!\n')


if __name__ == '__main__':
    main()






