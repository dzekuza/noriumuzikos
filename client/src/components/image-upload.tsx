import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  existingImageUrl?: string;
  className?: string;
}

export default function ImageUpload({ onImageUploaded, existingImageUrl, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(existingImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "Error",
        description: "Image size exceeds 5MB limit",
        variant: "destructive"
      });
      return;
    }

    // Create a temporary preview URL
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    // Upload to server
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/upload/event-image', {
        method: 'POST',
        credentials: 'include', // needed for auth
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      setPreviewUrl(data.imageUrl);
      onImageUploaded(data.imageUrl);
      
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An error occurred during upload",
        variant: "destructive"
      });
      
      // Keep the local preview to avoid a jarring UX
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearImage = () => {
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageUploaded(''); // Clear the image URL in parent component
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="event-image" className="text-white/70">Event Image</Label>
      
      {previewUrl ? (
        <div className="relative w-full h-48 bg-zinc-800 rounded-md overflow-hidden">
          <img 
            src={previewUrl} 
            alt="Event preview" 
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive" 
            size="icon"
            className="absolute top-2 right-2 rounded-full w-8 h-8 bg-zinc-900/80 text-white hover:bg-red-700"
            onClick={handleClearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="w-full h-48 bg-zinc-800 border-2 border-dashed border-zinc-700 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}>
          <ImageIcon className="h-12 w-12 text-zinc-600 mb-2" />
          <p className="text-sm text-zinc-400">Click to upload event image</p>
          <p className="text-xs text-zinc-500 mt-1">Recommended size: 1200x630px</p>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        id="event-image"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />
      
      {!previewUrl && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-full bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
      )}
      
      <p className="text-xs text-white/50">Upload an image for your event (appears when sharing on social media)</p>
    </div>
  );
}