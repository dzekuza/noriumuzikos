import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950">
      <Card className="w-full max-w-md mx-4 bg-zinc-900 border-zinc-800 text-white">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-white">404 Puslapis nerastas</h1>
          </div>

          <p className="mt-4 text-sm text-white/70">
            Puslapis, kurio ieškote, neegzistuoja.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
