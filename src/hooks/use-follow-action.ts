
"use client";

import { useAuth } from "@/hooks/use-auth";
import { toggleFollowAction } from "@/lib/data";
import type { ImprovementAction } from "@/lib/types";
import React, { useCallback } from "react";

type ActionOrActionList = ImprovementAction[] | ImprovementAction | null;
type SetActionState = React.Dispatch<React.SetStateAction<ImprovementAction[]>> | React.Dispatch<React.SetStateAction<ImprovementAction | null>>;

export function useFollowAction(
    actions: ActionOrActionList, 
    setActions: SetActionState
) {
    const { user } = useAuth();

    const handleToggleFollow = useCallback(async (actionId: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!user) return;
        
        const isList = Array.isArray(actions);
        const actionToCheck = isList ? actions.find(a => a.id === actionId) : actions;
        const isCurrentlyFollowing = actionToCheck?.followers?.includes(user.id) ?? false;
        const isNowFollowing = !isCurrentlyFollowing;

        // Optimistically update the UI
        if (isList) {
            (setActions as React.Dispatch<React.SetStateAction<ImprovementAction[]>>)(prevActions => 
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
        } else {
             (setActions as React.Dispatch<React.SetStateAction<ImprovementAction | null>>)(prevAction => {
                if (!prevAction) return null;
                 const currentFollowers = prevAction.followers || [];
                 const newFollowers = isNowFollowing
                     ? [...currentFollowers, user.id]
                     : currentFollowers.filter(id => id !== user.id);
                 return { ...prevAction, followers: newFollowers };
             });
        }
        
        try {
            await toggleFollowAction(actionId, user.id);
        } catch (error) {
            console.error("Failed to toggle follow status", error);
            // Revert optimistic update on error by re-setting the original state
            (setActions as any)(actions);
        }
    }, [actions, user, setActions]);
    
    const isFollowing = (actionId: string): boolean => {
        if (!user) return false;
        const isList = Array.isArray(actions);
        const action = isList ? actions.find(a => a.id === actionId) : actions;
        return action?.followers?.includes(user.id) ?? false;
    };

    return { handleToggleFollow, isFollowing };
}
