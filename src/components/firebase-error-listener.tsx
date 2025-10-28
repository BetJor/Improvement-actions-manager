
'use client';

import React, { useEffect, useState } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './ui/button';

export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    const handleError = (e: FirestorePermissionError) => {
      console.warn(
        'A Firestore security rule permission error was caught. This is expected during development and is being displayed in the dev overlay.',
        e
      );
      setError(e);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  if (!error) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-4xl mx-4">
        <Alert variant="destructive" className="shadow-2xl">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            Firestore: Permisos insuficientes
          </AlertTitle>
          <AlertDescription>
            <div className="mt-4 space-y-4 text-sm">
              <p>
                La següent petició ha estat denegada per les regles de seguretat de Firestore. Revisa les teves regles i la lògica de l'aplicació.
              </p>
              <div className="bg-gray-800 text-white font-mono p-4 rounded-md overflow-x-auto text-xs">
                <pre>{error.toDebugString()}</pre>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setError(null)}>
                  <X className="mr-2 h-4 w-4" />
                  Tancar
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
