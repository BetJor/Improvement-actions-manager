
"use client";

import { useAuth } from "@/hooks/use-auth";
import { toggleFollowAction } from "@/lib/data";
import type { ImprovementAction } from "@/lib/types";
import React, { useCallback } from "react";

export function useFollowAction(
    actions: ImprovementAction[], 
    setActions: React.Dispatch<React.SetStateAction<ImprovementAction[]>>
) {
    const { user } = useAuth();

    const handleToggleFollow = useCallback(async (actionId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!user) return;

        const isCurrentlyFollowing = actions.find(a => a.id === actionId)?.followers?.includes(user.id) ?? false;
        const isNowFollowing = !isCurrentlyFollowing;

        // Optimistically update the UI
        setActions(prevActions => 
            prevActions.map(action => {
                if (action.id === actionId) {
                    const currentFollowers = action.followers || [];
                    const newFollowers = isNowFollowing
                        ? [...currentFollowers, user.id]
                        : currentFollowers.filter(id => id !== user.id);
                    return { ...action, followers: newFollowers };
                }
                return action;
            })
        );
        
        try {
            await toggleFollowAction(actionId, user.id);
        } catch (error) {
            console.error("Failed to toggle follow status", error);
            // Revert optimistic update on error
            setActions(actions);
        }
    }, [actions, user, setActions]);
    
    const isFollowing = (actionId: string): boolean => {
        if (!user) return false;
        const action = actions.find(a => a.id === actionId);
        return action?.followers?.includes(user.id) ?? false;
    };

    return { handleToggleFollow, isFollowing };
}
