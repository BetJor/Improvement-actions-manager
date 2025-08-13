
"use client";

import { useAuth } from "@/hooks/use-auth";
import { toggleFollowAction } from "@/lib/data";
import type { ImprovementAction } from "@/lib/types";
import React, { useCallback } from "react";

type ActionOrActionList = ImprovementAction[] | ImprovementAction | null;
type SetLocalActionState = React.Dispatch<React.SetStateAction<ActionOrActionList>>;
type SetGlobalActionState = React.Dispatch<React.SetStateAction<ImprovementAction[]>>;

export function useFollowAction(
    localActions: ActionOrActionList, 
    setLocalActions: SetLocalActionState,
    setGlobalActions?: SetGlobalActionState
) {
    const { user } = useAuth();

    const handleToggleFollow = useCallback(async (actionId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!user) return;
        
        const isList = Array.isArray(localActions);
        
        const updateState = (updater: (action: ImprovementAction) => ImprovementAction) => {
            if (isList) {
                (setLocalActions as React.Dispatch<React.SetStateAction<ImprovementAction[]>>)(prev => 
                    prev.map(a => a.id === actionId ? updater(a) : a)
                );
                if (setGlobalActions) {
                     setGlobalActions(prev => prev.map(a => a.id === actionId ? updater(a) : a));
                }
            } else {
                (setLocalActions as React.Dispatch<React.SetStateAction<ImprovementAction | null>>)(prev =>
                    prev && prev.id === actionId ? updater(prev) : prev
                );
                 if (setGlobalActions) {
                     setGlobalActions(prev => prev.map(a => a.id === actionId ? updater(a) : a));
                }
            }
        };

        // Optimistic update
        updateState(action => {
            const isCurrentlyFollowing = action.followers?.includes(user.id) ?? false;
            const newFollowers = isCurrentlyFollowing
                ? (action.followers || []).filter(id => id !== user.id)
                : [...(action.followers || []), user.id];
            return { ...action, followers: newFollowers };
        });

        try {
            await toggleFollowAction(actionId, user.id);
        } catch (error) {
            console.error("Failed to toggle follow status", error);
            // Revert optimistic update on error
             updateState(action => {
                const isCurrentlyFollowing = action.followers?.includes(user.id) ?? false;
                const newFollowers = isCurrentlyFollowing
                    ? [...(action.followers || []), user.id] // Re-add if failed to remove
                    : (action.followers || []).filter(id => id !== user.id); // Remove if failed to add
                return { ...action, followers: newFollowers };
            });
        }
    }, [localActions, user, setLocalActions, setGlobalActions]);
    
    const isFollowing = (actionId: string): boolean => {
        if (!user) return false;
        const isList = Array.isArray(localActions);
        const action = isList ? (localActions as ImprovementAction[]).find(a => a.id === actionId) : localActions;
        return action?.followers?.includes(user.id) ?? false;
    };

    return { handleToggleFollow, isFollowing };
}
