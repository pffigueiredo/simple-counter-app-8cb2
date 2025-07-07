
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadCounter = useCallback(async () => {
    try {
      setError(null);
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
      setError('Failed to connect to the server. Using local counter instead.');
      // Fallback to local counter when backend is not available
      setCounter({
        id: 1,
        value: 0,
        updated_at: new Date()
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleOperation = async (operation: 'increment' | 'decrement') => {
    if (!counter) return;

    setIsUpdating(true);
    try {
      const updatedCounter = await trpc.updateCounter.mutate({ operation });
      setCounter(updatedCounter);
      setError(null);
    } catch (error) {
      console.error('Failed to update counter:', error);
      // Fallback to local update when backend is not available
      const newValue = operation === 'increment' ? counter.value + 1 : counter.value - 1;
      setCounter({
        ...counter,
        value: newValue,
        updated_at: new Date()
      });
      setError('Server unavailable. Changes are local only.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading counter...</p>
        </div>
      </div>
    );
  }

  if (!counter) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Unable to load counter. Please check your connection and try again.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={loadCounter} 
              className="w-full mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Counter App</CardTitle>
          <CardDescription>
            A simple counter application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert>
              <AlertDescription className="text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {counter.value}
            </div>
            <p className="text-sm text-gray-500">
              Last updated: {counter.updated_at.toLocaleString()}
            </p>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => handleOperation('decrement')}
              disabled={isUpdating}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              - Decrement
            </Button>
            <Button 
              onClick={() => handleOperation('increment')}
              disabled={isUpdating}
              size="lg"
              className="flex-1"
            >
              + Increment
            </Button>
          </div>
          
          {isUpdating && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-1">Updating...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
