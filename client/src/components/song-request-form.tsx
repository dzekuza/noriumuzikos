import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
});

type FormValues = z.infer<typeof formSchema>;

interface SongRequestFormProps {
  eventId: number;
}

export default function SongRequestForm({ eventId }: SongRequestFormProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState<FormValues | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      songName: '',
      artistName: '',
      requesterName: '',
    },
  });
  
  const { mutate, isPending } = useMutation({
    mutationFn: async (data: FormValues) => {
      const response = await apiRequest('POST', `/api/events/${eventId}/song-requests`, {
        ...data,
        amount: 500, // €5.00 in cents
        eventId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/song-requests`] });
      setIsPaymentModalOpen(false);
      setIsConfirmationModalOpen(true);
      form.reset();
    },
    onError: (error) => {
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
    setIsPaymentModalOpen(true);
  };
  
  const handlePayment = () => {
    if (currentRequest) {
      mutate(currentRequest);
    }
  };
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-secondary rounded-xl p-6 shadow-lg mb-8">
          <FormField
            control={form.control}
            name="songName"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-gray-300">Song Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter song name" 
                    className="bg-background border-gray-700 text-white focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="artistName"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-gray-300">Artist</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter artist name" 
                    className="bg-background border-gray-700 text-white focus:ring-primary"
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
                <FormLabel className="text-gray-300">Your Name</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="How should the DJ call you?" 
                    className="bg-background border-gray-700 text-white focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="mb-8 p-4 bg-background rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Request Fee</span>
              <span className="text-white font-bold">€5.00</span>
            </div>
            <div className="text-xs text-gray-400">
              Your song will be added to the DJ's queue after payment is confirmed.
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-7 px-4 rounded-lg transition-all shadow-lg glow flex items-center justify-center"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            Pay €5 and Request Song
          </Button>
          
          <div className="flex items-center justify-center mt-4">
            <Lock className="text-gray-400 mr-1 h-3 w-3" />
            <span className="text-xs text-gray-400">Secure payment via Stripe</span>
          </div>
        </form>
      </Form>
      
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        onPay={handlePayment}
        songData={currentRequest}
        isPending={isPending}
      />
      
      <ConfirmationModal 
        isOpen={isConfirmationModalOpen} 
        onClose={() => setIsConfirmationModalOpen(false)}
        onRequestAnother={() => setIsConfirmationModalOpen(false)}
        songData={currentRequest}
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
