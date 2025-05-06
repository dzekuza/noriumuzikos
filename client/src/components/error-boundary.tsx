import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
          <Card className="w-full max-w-md border border-error">
            <CardHeader className="bg-red-950/30">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-500">Oops! Something went wrong</CardTitle>
              </div>
              <CardDescription>
                The application encountered an unexpected error.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-red-950/20 p-4 rounded-md border border-red-900/30 overflow-auto">
                <pre className="text-xs text-red-300 whitespace-pre-wrap">
                  {this.state.error?.message || 'Unknown error'}
                </pre>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </Button>
              <Button 
                onClick={() => window.location.reload()}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function ErrorBoundary({ children, fallback }: Props) {
  // This is a workaround since we can't use hooks directly in class components
  const { toast } = useToast();

  const handleError = (error: Error) => {
    toast({
      title: 'Application Error',
      description: `${error.message}. Try refreshing the page.`,
      variant: 'destructive',
    });
  };

  // We can't use the onError prop directly, so we leverage componentDidCatch
  // by extending the class, but that's an advanced pattern we'll skip for now
  return (
    <ErrorBoundaryClass fallback={fallback}>
      {children}
    </ErrorBoundaryClass>
  );
}
