import { addDays, isWeekend, format, parse } from 'date-fns';

// Brazilian National Holidays (fixed and movable)
// Note: Some holidays like Easter vary by year, so we include common dates
export function getBrazilianHolidays(year: number): Date[] {
  const holidays: Date[] = [
    // Fixed holidays
    new Date(year, 0, 1), // New Year's Day
    new Date(year, 3, 21), // Tiradentes' Day
    new Date(year, 4, 1), // Labor Day
    new Date(year, 8, 7), // Independence Day
    new Date(year, 9, 12), // Our Lady of Aparecida
    new Date(year, 10, 2), // All Souls' Day
    new Date(year, 10, 15), // Republic Day
    new Date(year, 11, 25), // Christmas Day
  ];

  // Add movable holidays (Easter-based) - simplified for common years
  // In production, use a proper Easter calculation library
  const easterDates: Record<number, string> = {
    2024: '2024-03-31',
    2025: '2025-04-20',
    2026: '2026-04-05',
    2027: '2027-03-28',
    2028: '2028-04-16',
  };

  if (easterDates[year]) {
    const easter = parse(easterDates[year], 'yyyy-MM-dd', new Date());
    holidays.push(addDays(easter, -47)); // Carnival (47 days before Easter)
    holidays.push(addDays(easter, -2)); // Good Friday
    holidays.push(easter); // Easter Sunday
    holidays.push(addDays(easter, 60)); // Corpus Christi
  }

  return holidays;
}

// Check if a date is a working day (not weekend or holiday)
export function isWorkingDay(date: Date, year: number): boolean {
  if (isWeekend(date)) {
    return false;
  }

  const holidays = getBrazilianHolidays(year);
  const dateStr = format(date, 'yyyy-MM-dd');

  for (const holiday of holidays) {
    if (format(holiday, 'yyyy-MM-dd') === dateStr) {
      return false;
    }
  }

  return true;
}

// Calculate working days between two dates
export function calculateWorkingDays(startDate: Date, endDate: Date): number {
  let workingDays = 0;
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate, currentDate.getFullYear())) {
      workingDays++;
    }
    currentDate = addDays(currentDate, 1);
  }

  return workingDays;
}

// Add working days to a start date (excluding weekends and holidays)
export function addWorkingDays(startDate: Date, daysToAdd: number): Date {
  let currentDate = new Date(startDate);
  let addedDays = 0;

  while (addedDays < daysToAdd) {
    currentDate = addDays(currentDate, 1);
    if (isWorkingDay(currentDate, currentDate.getFullYear())) {
      addedDays++;
    }
  }

  return currentDate;
}

// Get next working day
export function getNextWorkingDay(date: Date): Date {
  let nextDay = addDays(date, 1);
  while (!isWorkingDay(nextDay, nextDay.getFullYear())) {
    nextDay = addDays(nextDay, 1);
  }
  return nextDay;
}

