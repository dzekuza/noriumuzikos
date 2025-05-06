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

// Check if we're using a test key and log a warning if so
const publicKey = getStripePublicKey();
if (publicKey && publicKey.startsWith('pk_test_')) {
  console.warn('Using TEST mode Stripe key. For production payments, use a LIVE key.');
} else if (publicKey && publicKey.startsWith('pk_live_')) {
  console.log('Using LIVE mode Stripe key for production payments.');
} else {
  console.error('Invalid or missing Stripe public key');
}

// Load Stripe outside of component render to avoid recreating Stripe instance
export const stripePromise = publicKey 
  ? loadStripe(publicKey) 
  : null;

// Augment the window object type
declare global {
  interface Window {
    __STRIPE_PUBLIC_KEY?: string;
  }
}