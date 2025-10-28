
// This file defines a custom error class for Firestore permission errors.
// This allows us to create rich, contextual errors that provide developers
// with the necessary information to debug security rule violations.

import { auth } from '@/lib/firebase';

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const message = `FirestoreError: Missing or insufficient permissions.`;
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is for V8's stack trace API
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FirestorePermissionError);
    }
  }

  /**
   * Generates a detailed JSON string for debugging purposes, which will be
   * displayed in the developer overlay.
   */
  toDebugString(): string {
    const currentUser = auth.currentUser;
    const debugInfo = {
      message: this.message,
      context: {
        auth: currentUser
          ? {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              // Note: Custom claims are only available on the backend via Admin SDK
              // and won't be present on the client-side user object.
            }
          : null,
        operation: this.context.operation,
        path: this.context.path,
        requestData: this.context.requestResourceData,
        timestamp: new Date().toISOString(),
      },
    };

    return JSON.stringify(debugInfo, null, 2);
  }
}
