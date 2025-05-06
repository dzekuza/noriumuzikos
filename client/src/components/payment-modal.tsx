import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { X, CreditCard, ShieldCheck } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogHeader,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Load Stripe outside of component render to avoid recreating Stripe instance
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing Stripe public key. Set VITE_STRIPE_PUBLIC_KEY in environment variables');
}

const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) 
  : null;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPay: () => void;
  songData: {
    songName: string;
    artistName: string;
    requesterName: string;
    wishes?: string;
  } | null;
  isPending: boolean;
  paymentAmount?: number; // Optional amount in cents
}

export default function PaymentModal({ isOpen, onClose, onPay, songData, isPending, paymentAmount: customAmount }: PaymentModalProps) {
  const [clientSecret, setClientSecret] = useState('');
  const [isPaymentModalInitialized, setIsPaymentModalInitialized] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(500); // Default €5.00 in cents
  
  // Use the customAmount when provided
  useEffect(() => {
    if (customAmount) {
      console.log('Using custom payment amount:', customAmount);
      setPaymentAmount(customAmount);
    }
  }, [customAmount]);

  useEffect(() => {
    // Only fetch when the modal is open and we haven't already initialized
    if (isOpen && !isPaymentModalInitialized && !clientSecret) {
      const initializePayment = async () => {
        try {
          // Get the event ID from the URL
          const urlParts = window.location.pathname.split('/');
          const eventId = urlParts[2]; // From /event/:id/request
          
          console.log('Initializing payment for event ID:', eventId);
          const response = await apiRequest('POST', '/api/create-payment-intent', { 
            eventId,
            amount: customAmount // Pass the custom amount when available
          });
          const data = await response.json();
          setClientSecret(data.clientSecret);
          
          // Only set payment amount if no custom amount was provided
          if (!customAmount) {
            setPaymentAmount(data.amount || 500);
          }
          
          setIsPaymentModalInitialized(true);
        } catch (error) {
          console.error('Error initializing payment:', error);
        }
      };
      
      initializePayment();
    }
    
    // Reset when closed
    if (!isOpen) {
      setIsPaymentModalInitialized(false);
      setClientSecret('');
    }
  }, [isOpen, isPaymentModalInitialized, clientSecret, customAmount]);

  // If Stripe is not ready, we'll use a mock implementation for the payment
  const useMockImplementation = !stripePromise || !clientSecret;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 text-white p-0 max-w-lg max-h-[90vh] overflow-y-auto border border-zinc-800">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-xl font-bold text-white">Mokėjimas</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white bg-transparent">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="bg-zinc-800/50 rounded-lg p-4 mb-6 border border-zinc-700">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-white">{songData?.songName || 'Jūsų daina'}</h3>
                <p className="text-sm text-white/70">{songData?.artistName || 'Atlikėjas'}</p>
                {songData?.wishes && (
                  <p className="text-xs text-white/60 mt-2 italic">Palinkėjimas: {songData.wishes}</p>
                )}
              </div>
              <span className="text-primary font-bold">€{(paymentAmount / 100).toFixed(2)}</span>
            </div>
          </div>
        </DialogHeader>
        
        {useMockImplementation ? (
          // Mock payment form when Stripe is not configured
          <div className="px-6 pb-6">
            <MockPaymentForm onPay={onPay} isPending={isPending} paymentAmount={paymentAmount} />
          </div>
        ) : (
          // Real Stripe payment form
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm onPay={onPay} isPending={isPending} paymentAmount={paymentAmount} />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CheckoutForm({ onPay, isPending, paymentAmount = 500 }: { onPay: () => void, isPending: boolean, paymentAmount?: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [, setLocation] = useLocation();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setPaymentProcessing(true);
    
    try {
      // Determine if we're in test mode based on the Stripe public key
      const isTestMode = import.meta.env.VITE_STRIPE_PUBLIC_KEY?.startsWith('pk_test_');
      console.log(`Processing payment in ${isTestMode ? 'TEST' : 'LIVE'} mode...`);
      
      // CRITICAL CHANGE: Call onPay FIRST to ensure song request is created BEFORE payment processing
      console.log('Creating song request before payment processing');
      onPay();
      
      // Extract event ID from URL for the return_url
      const urlParts = window.location.pathname.split('/');
      const eventId = urlParts[2]; // From /event/:id/request
      
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/thank-you?eventId=${eventId}`
        }
      });
      
      if (error) {
        console.error('Stripe error:', error);
        toast({
          title: `${isTestMode ? 'Test ' : ''}Payment Failed`,
          description: error.message || (isTestMode ? "The test card was declined. Try 4242 4242 4242 4242." : "Your card was declined. Please try a different card."),
          variant: "destructive",
        });
        setPaymentProcessing(false);
      } else {
        toast({
          title: `${isTestMode ? 'Test ' : ''}Payment Successful`,
          description: isTestMode 
            ? "Your test song request is being processed! No real charge occurred." 
            : "Your song request is being processed! You'll be redirected shortly.",
        });
        
        // Note: Stripe will handle the redirect via the return_url
        // No need to setLocation here since Stripe redirects using the return_url
      }
    } catch (e) {
      console.error('Payment error:', e);
      const isTestMode = import.meta.env.VITE_STRIPE_PUBLIC_KEY?.startsWith('pk_test_');
      toast({
        title: `${isTestMode ? 'Test ' : ''}Payment Error`,
        description: isTestMode 
          ? "An unexpected error occurred in test mode. Please try again with a different card." 
          : "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
      setPaymentProcessing(false);
    }
  };
  
  // Determine if we're in test mode based on the Stripe public key
  const isTestMode = import.meta.env.VITE_STRIPE_PUBLIC_KEY?.startsWith('pk_test_');
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-6 pb-6">
      {isTestMode && (
        <div className="bg-amber-100 text-amber-800 p-3 rounded-md text-sm flex items-center mb-4 border-2 border-amber-400">
          <ShieldCheck className="h-5 w-5 mr-2" />
          <div>
            <strong className="font-bold block">TEST MODE ONLY</strong>
            <span>No real payments will be processed. This is a test environment.</span>
          </div>
        </div>
      )}
      
      <PaymentElement />
      
      <Button 
        type="submit" 
        disabled={!stripe || !elements || isPending || paymentProcessing}
        className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 px-4 rounded-md transition-all flex items-center justify-center"
      >
        {paymentProcessing ? (
          <>
            <span className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent"></span>
            Apdorojama...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-5 w-5" />
            Mokėti €{(paymentAmount / 100).toFixed(2)}
          </>
        )}
      </Button>
      
      {isTestMode && (
        <div className="text-sm text-white/80 mt-4 p-4 bg-zinc-800 rounded-md border border-zinc-700">
          <h4 className="font-bold mb-2">TEST CARD DETAILS</h4>
          <p className="mb-2">Card number: <code className="bg-zinc-900 p-1 rounded text-white">4242 4242 4242 4242</code></p>
          <p className="mb-1">Expiry: <code className="bg-zinc-900 p-1 rounded text-white">Any future date</code></p>
          <p className="mb-1">CVC: <code className="bg-zinc-900 p-1 rounded text-white">Any 3 digits</code></p>
          <p>ZIP: <code className="bg-zinc-900 p-1 rounded text-white">Any 5 digits</code></p>
        </div>
      )}
      
      <div className="flex items-center justify-center mt-2">
        <ShieldCheck className="text-white/40 mr-1 h-3 w-3" />
        <span className="text-xs text-white/40">Payments are secure and encrypted</span>
      </div>
    </form>
  );
}

function MockPaymentForm({ onPay, isPending, paymentAmount = 500 }: { onPay: () => void, isPending: boolean, paymentAmount?: number }) {
  const [, setLocation] = useLocation();
  
  const handlePay = () => {
    console.log('Mock payment: Creating song request before redirecting');
    onPay();
    
    // Extract event ID from URL
    const urlParts = window.location.pathname.split('/');
    const eventId = urlParts[2]; // From /event/:id/request
    
    // Redirect to thank you page
    console.log('Mock payment: Redirecting to thank-you page for event ID:', eventId);
    setLocation(`/thank-you?eventId=${eventId}`);
  };
  
  // Determine if we're in test mode based on the Stripe public key
  const isTestMode = import.meta.env.VITE_STRIPE_PUBLIC_KEY?.startsWith('pk_test_');
  
  return (
    <div className="space-y-4">
      {isTestMode && (
        <div className="bg-amber-100 text-amber-800 p-3 rounded-md text-sm flex items-center mb-4 border-2 border-amber-400">
          <ShieldCheck className="h-5 w-5 mr-2" />
          <div>
            <strong className="font-bold block">TEST MODE ONLY</strong>
            <span>No real payments will be processed. This is a test environment.</span>
          </div>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Card Information</label>
        <div className="bg-zinc-800 border border-zinc-700 rounded-md p-3">
          <div className="flex items-center">
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="1234 1234 1234 1234" 
                className="bg-transparent border-none w-full text-white focus:outline-none focus:ring-0"
              />
            </div>
            <div className="flex space-x-1 text-white/60">
              <svg viewBox="0 0 38 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" fillRule="evenodd">
                  <path d="M35 0H3C1.3 0 0 1.3 0 3v18c0 1.7 1.4 3 3 3h32c1.7 0 3-1.3 3-3V3c0-1.7-1.4-3-3-3z" fill="#000" opacity=".07"/>
                  <path d="M35 1c1.1 0 2 .9 2 2v18c0 1.1-.9 2-2 2H3c-1.1 0-2-.9-2-2V3c0-1.1.9-2 2-2h32" fill="#fff"/>
                  <path d="M15 12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2z" fill="#fff" stroke="#001B84"/>
                  <path d="M22 12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2z" fill="#fff" stroke="#001B84"/>
                </g>
              </svg>
            </div>
          </div>
          <div className="flex mt-2">
            <input 
              type="text" 
              placeholder="MM / YY" 
              className="bg-transparent border-none w-1/2 text-white focus:outline-none focus:ring-0"
            />
            <input 
              type="text" 
              placeholder="CVC" 
              className="bg-transparent border-none w-1/2 text-white focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Name on Card</label>
        <input 
          type="text" 
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white/70 mb-2">Email Receipt</label>
        <input 
          type="email" 
          className="w-full bg-zinc-800 border border-zinc-700 rounded-md py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <Button 
        onClick={handlePay}
        disabled={isPending}
        className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 px-4 rounded-md transition-all flex items-center justify-center"
      >
        <CreditCard className="mr-2 h-5 w-5" />
        Pay €{(paymentAmount / 100).toFixed(2)}
      </Button>
      
      <div className="flex items-center justify-center mt-2">
        <ShieldCheck className="text-white/40 mr-1 h-3 w-3" />
        <span className="text-xs text-white/40">Payments are secure and encrypted</span>
      </div>
    </div>
  );
}
