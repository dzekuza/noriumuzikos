/**
 * Generates a URL for a DJ event that can be encoded in a QR code
 * 
 * @param eventId The ID of the event
 * @returns A URL that can be used to request songs for this event
 */
export function generateEventQrCodeUrl(eventId: number): string {
  // Get the base URL from the current window
  const baseUrl = window.location.origin;
  
  // Create a URL for the event request page
  return `${baseUrl}/event/${eventId}/request`;
}
