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
      <DialogContent className="bg-zinc-900 text-white max-w-lg border border-zinc-800">
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white">Dainos užsakymas patvirtintas!</h2>
          <p className="text-white/70 mt-2">Jūsų daina sėkmingai pridėta į DJ eilę.</p>
        </div>
        
        <div className="bg-zinc-800/50 rounded-md p-4 mb-6 border border-zinc-700">
          <h3 className="font-semibold text-white text-lg">{songData?.songName || "Jūsų daina"}</h3>
          <p className="text-white/70">{songData?.artistName || "Atlikėjas"}</p>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-white/50">
              Užsakė: <span className="text-white/70">{songData?.requesterName || "Jūs"}</span>
            </span>
            <span className="text-primary font-bold">€5.00</span>
          </div>
        </div>
        
        <div className="text-center mb-6">
          <div className="inline-block bg-zinc-800 rounded-full px-4 py-2 text-sm text-white/70">
            <Spinner className="inline-block mr-2 text-primary animate-spin" />
            <span>Numatomas laukimo laikas: <span className="font-semibold text-white">15 minučių</span></span>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col space-y-3">
          <Button 
            onClick={onClose}
            className="w-full py-3 bg-primary rounded-md text-black font-semibold hover:bg-primary/90 transition-all"
          >
            Baigta
          </Button>
          <Button 
            onClick={onRequestAnother}
            variant="outline"
            className="w-full py-3 bg-zinc-800 border-zinc-700 rounded-md text-white font-semibold hover:bg-zinc-700 transition-all"
          >
            Užsakyti kitą dainą
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
