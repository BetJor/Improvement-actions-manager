
"use client";

import { useAuth } from "@/hooks/use-auth";
import { toggleFollowAction } from "@/lib/data";
import type { ImprovementAction } from "@/lib/types";
import React, { useCallback } from "react";
import { useActionState } from "./use-action-state";

export function useFollowAction() {
    const { user } = useAuth();
    const { actions, setActions } = useActionState();

    const handleToggleFollow = useCallback(async (actionId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!user) return;

        const originalActions = [...actions];
        
        // Optimistic update
        setActions(prev => 
            prev.map(a => {
                if (a.id === actionId) {
                    const isCurrentlyFollowing = a.followers?.includes(user.id) ?? false;
                    const newFollowers = isCurrentlyFollowing
                        ? (a.followers || []).filter(id => id !== user.id)
                        : [...(a.followers || []), user.id];
                    return { ...a, followers: newFollowers };
                }
                return a;
            })
        );
        
        try {
            await toggleFollowAction(actionId, user.id);
        } catch (error) {
            console.error("Failed to toggle follow status", error);
            // Revert optimistic update on error
            setActions(originalActions);
        }
    }, [actions, user, setActions]);
    
    const isFollowing = useCallback((actionId: string): boolean => {
        if (!user) return false;
        const action = actions.find(a => a.id === actionId);
        return action?.followers?.includes(user.id) ?? false;
    }, [actions, user]);

    return { handleToggleFollow, isFollowing };
}
