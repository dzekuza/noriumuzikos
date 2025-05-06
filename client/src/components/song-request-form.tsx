import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { type Event } from '@shared/schema';
import { hasMadeFreeRequest, markFreeRequestMade } from '@/lib/request-tracker';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { insertSongRequestSchema } from '@shared/schema';
import PaymentModal from './payment-modal';
import ConfirmationModal from './confirmation-modal';

const formSchema = z.object({
  songName: z.string().min(2, { message: "Song name must be at least 2 characters" }),
  artistName: z.string().min(2, { message: "Artist name must be at least 2 characters" }),
  requesterName: z.string().min(2, { message: "Your name must be at least 2 characters" }),
  wishes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface SongRequestFormProps {
  eventId: number;
}

export default function SongRequestForm({ eventId }: SongRequestFormProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<FormValues | null>(null);
  const [requestPrice, setRequestPrice] = useState(500); // Default €5.00 in cents
  const [isFreeRequest, setIsFreeRequest] = useState(false); // Track if this is a free request
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch the event data to get the custom price
  const { data: event } = useQuery<Event>({
    queryKey: [`/api/events/${eventId}`],
  });
  
  // Check if this is a free request
  useEffect(() => {
    const hasAlreadyMadeFreeRequest = hasMadeFreeRequest(eventId);
    setIsFreeRequest(!hasAlreadyMadeFreeRequest);
    console.log(`Free request status for event ${eventId}: ${!hasAlreadyMadeFreeRequest}`);
  }, [eventId]);
  
  // Update the request price when the event data is loaded
  useEffect(() => {
    if (event && event.requestPrice) {
      setRequestPrice(event.requestPrice);
      console.log(`Using custom price ${event.requestPrice} cents for event ID: ${eventId}`);
    }
  }, [event, eventId]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      songName: '',
      artistName: '',
      requesterName: '',
      wishes: '',
    },
  });
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      console.log('Submitting song request for event ID:', eventId, 'with data:', data);
      // For free requests, set amount to 0
      const amount = isFreeRequest ? 0 : requestPrice;
      console.log('Using price:', amount, 'cents (Free request:', isFreeRequest, ')');
      
      const response = await apiRequest('POST', `/api/events/${eventId}/song-requests`, {
        ...data,
        amount, // 0 for free, regular price for paid
        eventId,
      });
      const responseData = await response.json();
      console.log('Song request API response:', responseData);
      return responseData;
    },
    onSuccess: (data) => {
      console.log('Song request created successfully:', data);
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/song-requests`] });
      setIsPaymentModalOpen(false);
      setIsConfirmationModalOpen(true);
      form.reset();
    },
    onError: (error) => {
      console.error('Error creating song request:', error);
      toast({
        title: "Error",
        description: "Failed to submit song request. Please try again.",
        variant: "destructive",
      });
      setIsPaymentModalOpen(false);
    },
  });
  
  const onSubmit = (data: FormValues) => {
    setCurrentRequest(data);
    
    if (isFreeRequest) {
      // For free requests, skip payment and submit directly
      console.log('This is a free first request - skipping payment');
      mutate(data);
      // Mark that this user has used their free request for this event
      markFreeRequestMade(eventId);
      // Update UI state
      setIsFreeRequest(false);
    } else {
      // For paid requests, show payment modal
      setIsPaymentModalOpen(true);
    }
  };
  
  const handlePayment = () => {
    if (currentRequest) {
      mutate(currentRequest);
    }
  };
  
  return (
    <>
      <div className="w-full max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-white mb-2 sm:mb-4">Užsakyti dainą</h2>
        <p className="text-white/60 text-sm mb-4 sm:mb-6">Užpildykite išsamią informaciją apie norimą dainą</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-zinc-900 rounded-md p-4 sm:p-8 shadow-lg border border-zinc-800">
            <FormField
              control={form.control}
              name="artistName"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Atlikėjas" 
                      className="bg-zinc-800 border-zinc-700 text-white focus:ring-primary py-5 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="songName"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Dainos pavadinimas" 
                      className="bg-zinc-800 border-zinc-700 text-white focus:ring-primary py-5 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="requesterName"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Jūsų vardas" 
                      className="bg-zinc-800 border-zinc-700 text-white focus:ring-primary py-5 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="wishes"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel className="text-white/70 mb-1 block">Palinkėjimas</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Jūsų palinkėjimas arba žinutė DJ" 
                      className="bg-zinc-800 border-zinc-700 text-white focus:ring-primary py-5 text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-4 px-4 rounded-md transition-all text-base"
            >
              {isFreeRequest ? (
                'Užsakyti dainą nemokamai' 
              ) : (
                `Sumokėti €${(requestPrice / 100).toFixed(2)} ir užsakyti dainą`
              )}
            </Button>
            
            <div className="flex items-center justify-center mt-4">
              {isFreeRequest ? (
                <span className="text-xs text-white/40">Jūsų pirmas užsakymas nemokamas!</span>
              ) : (
                <>
                  <Lock className="text-white/40 mr-1 h-3 w-3" />
                  <span className="text-xs text-white/40">Saugus mokėjimas per Stripe</span>
                </>
              )}
            </div>
          </form>
        </Form>
      </div>
      
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        onPay={handlePayment}
        songData={currentRequest}
        isPending={isPending}
        paymentAmount={requestPrice}
      />
      
      <ConfirmationModal 
        isOpen={isConfirmationModalOpen} 
        onClose={() => setIsConfirmationModalOpen(false)}
        onRequestAnother={() => setIsConfirmationModalOpen(false)}
        songData={currentRequest ? { 
          ...currentRequest, 
          isFree: isFreeRequest,
          amount: requestPrice
        } : null}
      />
    </>
  );
}

function Lock(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
