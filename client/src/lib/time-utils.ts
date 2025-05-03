/**
 * Formats a date to a human-readable time string 
 * @param date The date to format
 * @returns Formatted time string (e.g. "10:00 PM")
 */
export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Calculates the time elapsed since a given date
 * @param date The date to calculate from
 * @returns A string like "2 min ago" or "just now"
 */
export function timeElapsedSince(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  
  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} min ago`;
  } else {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
}

/**
 * Calculates the estimated wait time for a song request
 * @param position Position in queue (1-based)
 * @param avgSongLength Average song length in minutes
 * @returns Formatted wait time string
 */
export function estimateWaitTime(position: number, avgSongLength: number = 3): string {
  const waitTimeMinutes = position * avgSongLength;
  
  if (waitTimeMinutes < 1) {
    return 'Up next';
  } else if (waitTimeMinutes < 60) {
    return `${waitTimeMinutes} minutes`;
  } else {
    const hours = Math.floor(waitTimeMinutes / 60);
    const minutes = waitTimeMinutes % 60;
    return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes > 0 ? `${minutes} min` : ''}`;
  }
}
