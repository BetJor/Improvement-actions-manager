
"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { ImprovementAction } from '@/lib/types';
import { getActions } from '@/lib/data';
import { useAuth } from './use-auth';

interface ActionStateContextType {
    actions: ImprovementAction[];
    isLoading: boolean;
    error: Error | null;
    setActionState: React.Dispatch<React.SetStateAction<ImprovementAction[]>>;
}

const ActionStateContext = createContext<ActionStateContextType | undefined>(undefined);

export function ActionStateProvider({ children }: { children: ReactNode }) {
    const [actions, setActions] = useState<ImprovementAction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        // Only fetch if there's a user and actions haven't been loaded yet.
        if (user && actions.length === 0) {
            setIsLoading(true);
            getActions()
                .then(fetchedActions => {
                    setActions(fetchedActions);
                    setError(null);
                })
                .catch(err => {
                    console.error("Failed to load actions:", err);
                    setError(err);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else if (!user) {
            // Clear actions on logout
            setActions([]);
            setIsLoading(false);
        } else {
             // Actions are already loaded, no need to fetch again, just stop loading.
             setIsLoading(false);
        }
    }, [user, actions.length]);

    return (
        <ActionStateContext.Provider value={{ actions, isLoading, error, setActionState: setActions }}>
            {children}
        </ActionStateContext.Provider>
    );
}

export function useActionState() {
    const context = useContext(ActionStateContext);
    if (context === undefined) {
        throw new Error('useActionState must be used within an ActionStateProvider');
    }
    return context;
}
