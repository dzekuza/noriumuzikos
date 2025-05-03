import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateEventQrCodeUrl } from '@/lib/qr-generator';

interface QRCodeDisplayProps {
  eventId: number;
  eventName: string;
}

export default function QRCodeDisplay({ eventId, eventName }: QRCodeDisplayProps) {
  const { toast } = useToast();
  const qrCodeUrl = generateEventQrCodeUrl(eventId);
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Request songs for ${eventName}`,
          text: `Scan this QR code to request songs at ${eventName}`,
          url: qrCodeUrl,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(qrCodeUrl);
        toast({
          title: "Link copied to clipboard",
          description: "Share it with your friends!",
        });
      } catch (error) {
        toast({
          title: "Failed to copy link",
          description: "Please try again",
          variant: "destructive",
        });
      }
    }
  };
  
  return (
    <Card className="bg-secondary border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-white">Event QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-white p-4 rounded-lg text-center">
          <div className="w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center">
            <QRCodeSVG 
              value={qrCodeUrl}
              size={200}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="H"
              includeMargin={false}
            />
          </div>
        </div>
        
        <div className="flex justify-center mt-4 space-x-2">
          <Button 
            onClick={handlePrint}
            className="py-2 px-4 bg-primary rounded-lg text-white font-semibold"
          >
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button 
            onClick={handleShare}
            variant="secondary"
            className="py-2 px-4 rounded-lg text-white font-semibold"
          >
            <Share2 className="mr-2 h-4 w-4" /> Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
