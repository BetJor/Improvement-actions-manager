
"use client"

import { useTranslations } from "next-intl"
import { Button } from "./ui/button"
import { FilePlus, Plus } from "lucide-react"
import { useTabs } from "@/hooks/use-tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

export function FloatingActionButton() {
    const t = useTranslations("Actions.page");
    const { openTab } = useTabs();

    const handleNewAction = () => {
        openTab({
            path: '/actions/new',
            title: 'Nova Acció',
            icon: FilePlus,
            isClosable: true,
        });
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button 
                        onClick={handleNewAction}
                        className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
                        size="icon"
                        >
                        <Plus className="h-8 w-8" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>{t("createAction")}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
