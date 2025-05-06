/**
 * Formats a date to a human-readable time string using Lithuanian format
 * @param date The date to format
 * @returns Formatted time string (e.g. "15:00")
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('lt-LT', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

/**
 * Formats a date to a complete date and time string using Lithuanian format
 * @param date The date to format
 * @returns Formatted date and time string (e.g. "2025-05-06 15:00")
 */
export function formatDateTime(date: Date): string {
  const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
  
  const dateString = new Intl.DateTimeFormat('lt-LT', dateOptions).format(date);
  const timeString = new Intl.DateTimeFormat('lt-LT', timeOptions).format(date);
  
  return `${dateString} ${timeString}`;
}

/**
 * Calculates the time elapsed since a given date in Lithuanian
 * @param date The date to calculate from
 * @returns A string like "prieš 2 min" or "ką tik"
 */
export function timeElapsedSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  
  if (diffSec < 60) {
    return 'ką tik';
  } else if (diffMin < 60) {
    return `prieš ${diffMin} min`;
  } else {
    return `prieš ${diffHours} val`;
  }
}

/**
 * Calculates the estimated wait time for a song request in Lithuanian
 * @param position Position in queue (1-based)
 * @param avgSongLength Average song length in minutes
 * @returns Formatted wait time string in Lithuanian (e.g., "5 min" or "1 val 30 min")
 */
export function estimateWaitTime(position: number, avgSongLength: number = 3): string {
  const waitTimeMinutes = position * avgSongLength;
  
  if (waitTimeMinutes < 1) {
    return 'Greitai gros';
  } else if (waitTimeMinutes < 60) {
    return `${waitTimeMinutes} min`;
  } else {
    const hours = Math.floor(waitTimeMinutes / 60);
    const minutes = waitTimeMinutes % 60;
    return `${hours} val ${minutes > 0 ? `${minutes} min` : ''}`;
  }
}
