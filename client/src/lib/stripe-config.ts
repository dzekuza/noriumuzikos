import { loadStripe } from '@stripe/stripe-js';

// Get the Stripe public key from the environment variables
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Check if we need to fallback to directly read keys from the window object 
// which might be injected by our server
const getStripePublicKey = () => {
  // First try the environment variable
  if (stripePublicKey) {
    return stripePublicKey;
  }
  
  // Fallback to window object (injected by server)
  if (window.__STRIPE_PUBLIC_KEY) {
    return window.__STRIPE_PUBLIC_KEY;
  }
  
  // Finally try a hardcoded live key as a last resort
  return 'pk_live_51Qi27rG3BtAgoCPDVQrSmY22zj6xHhoYsEU534e7b9ajebbNlKbOD3sBRl7nwqtlVGHhtyV8M5FxwiwfzoIQBy8300auYOEHqW';
};

// Always use the live key regardless of the environment
const publicKey = getStripePublicKey();

// Ensure we're using a live key to match the server-side configuration
// This fixes the key mismatch issues causing Stripe API errors
window.__STRIPE_PUBLIC_KEY = 'pk_live_51Qi27rG3BtAgoCPDVQrSmY22zj6xHhoYsEU534e7b9ajebbNlKbOD3sBRl7nwqtlVGHhtyV8M5FxwiwfzoIQBy8300auYOEHqW';

// Log the chosen key without revealing too much detail
const keyToUse = window.__STRIPE_PUBLIC_KEY || publicKey;
const keyType = keyToUse && keyToUse.startsWith('pk_live_') ? 'LIVE' : 'TEST';
console.log(`Stripe configured in ${keyType} mode`);

// Load Stripe outside of component render to avoid recreating Stripe instance
// Always use window.__STRIPE_PUBLIC_KEY if it exists (which we ensure above)
const finalKey = window.__STRIPE_PUBLIC_KEY || publicKey;
export const stripePromise = finalKey 
  ? loadStripe(finalKey) 
  : null;

// Augment the window object type
declare global {
  interface Window {
    __STRIPE_PUBLIC_KEY?: string;
  }
}