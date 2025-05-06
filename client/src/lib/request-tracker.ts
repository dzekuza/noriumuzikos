/**
 * Utility to track if a user has already made a free song request for an event
 */

// Local storage key format
const FREE_REQUEST_KEY_PREFIX = 'free-request-made-';

/**
 * Checks if the user has already made a free song request for the specified event
 * @param eventId The ID of the event
 * @returns true if a free request has been made, false otherwise
 */
export function hasMadeFreeRequest(eventId: number): boolean {
  const key = `${FREE_REQUEST_KEY_PREFIX}${eventId}`;
  return localStorage.getItem(key) === 'true';
}

/**
 * Marks that the user has made a free song request for the specified event
 * @param eventId The ID of the event
 */
export function markFreeRequestMade(eventId: number): void {
  const key = `${FREE_REQUEST_KEY_PREFIX}${eventId}`;
  localStorage.setItem(key, 'true');
}

/**
 * Clears the free request status for the specified event
 * @param eventId The ID of the event
 */
export function clearFreeRequestStatus(eventId: number): void {
  const key = `${FREE_REQUEST_KEY_PREFIX}${eventId}`;
  localStorage.removeItem(key);
}
