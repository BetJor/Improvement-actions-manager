
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { toggleFollowAction } from "@/lib/data";
import type { ImprovementAction } from "@/lib/types";
import React from "react";

export function useFollowAction(
    actions: ImprovementAction[], 
    setActions: React.Dispatch<React.SetStateAction<ImprovementAction[]>>
) {
    const { user } = useAuth();
    const { toast } = useToast();

    const handleToggleFollow = async (actionId: string, e?: React.MouseEvent) => {
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
            // Optionally, show a toast on error
             toast({
                variant: "destructive",
                title: "Error",
                description: "No s'ha pogut actualitzar l'estat de seguiment.",
            });
            // Revert optimistic update on error
            setActions(prevActions => 
                prevActions.map(action => {
                    if (action.id === actionId) {
                        // Revert to the original follower state by finding it in the initial actions array
                        return { ...action, followers: actions.find(a => a.id === actionId)?.followers };
                    }
                    return action;
                })
            );
        }
    };
    
    const isFollowing = (actionId: string): boolean => {
        if (!user) return false;
        return actions.find(a => a.id === actionId)?.followers?.includes(user.id) ?? false;
    };

    return { handleToggleFollow, isFollowing };
}
