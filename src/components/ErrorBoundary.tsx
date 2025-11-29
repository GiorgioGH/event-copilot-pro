import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    console.error('Error stack:', error.stack);
    console.error('Error info:', errorInfo);
  }

  public render() {
    console.log('ErrorBoundary render - hasError:', this.state.hasError);
    
    if (this.state.hasError) {
      console.error('ErrorBoundary showing error:', this.state.error);
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{ 
            backgroundColor: 'hsl(220, 20%, 98%)',
            color: 'hsl(222, 47%, 11%)'
          }}
        >
          <Card className="max-w-2xl w-full" style={{ backgroundColor: 'white' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
                {this.state.error?.stack}
              </pre>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
              >
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

