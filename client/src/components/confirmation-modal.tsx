import { CheckCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestAnother: () => void;
  songData: {
    songName: string;
    artistName: string;
    requesterName: string;
  } | null;
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onRequestAnother,
  songData 
}: ConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-secondary text-white max-w-lg">
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-[#00F5A0] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Song Request Confirmed!</h2>
          <p className="text-gray-300 mt-2">Your song has been successfully added to the DJ's queue.</p>
        </div>
        
        <div className="bg-background rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-white text-lg">{songData?.songName || "Your song"}</h3>
          <p className="text-gray-300">{songData?.artistName || "Artist"}</p>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-400">
              Requested by: <span>{songData?.requesterName || "You"}</span>
            </span>
            <span className="text-accent font-bold">€5.00</span>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <div className="inline-block bg-background rounded-full px-4 py-2 text-sm text-gray-300">
            <Spinner className="inline-block mr-2 text-primary animate-spin" />
            <span>Estimated wait time: <span className="font-semibold text-white">15 minutes</span></span>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col space-y-3">
          <Button 
            onClick={onClose}
            className="w-full py-3 bg-primary rounded-lg text-white font-semibold hover:bg-primary/90 transition-all"
          >
            Done
          </Button>
          <Button 
            onClick={onRequestAnother}
            variant="outline"
            className="w-full py-3 bg-background rounded-lg text-white font-semibold hover:bg-background/90 transition-all"
          >
            Request Another Song
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Spinner(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
